/**
 * Live Center data layer — 100% real data.
 *
 * Sources:
 *   - OpenF1 (https://openf1.org): sessions, drivers, results, laps, car GPS
 *     location, car telemetry, stints, pits, race control, weather, positions.
 *   - Jolpica / Ergast (https://api.jolpi.ca): season calendar, grid slots,
 *     official finishing status, winners per round.
 *
 * OpenF1 rate-limits to 3 requests / second, so every call goes through a
 * single throttled queue plus a TTL cache with in-flight de-duplication.
 * Optional: set OPENF1_ACCESS_TOKEN to use an OpenF1 sponsor token for
 * real-time data during live sessions.
 */

const OPENF1 = 'https://api.openf1.org/v1';
const JOLPICA = 'https://api.jolpi.ca/ergast/f1';

/* ───────────────────────── cache + throttle ───────────────────────── */

interface CacheEntry {
  expires: number;
  value: unknown;
}

interface LiveStore {
  cache: Map<string, CacheEntry>;
  inflight: Map<string, Promise<unknown>>;
  queue: Promise<void>;
  lastCall: number;
}

const g = globalThis as unknown as { __apexLiveStore?: LiveStore };
const store: LiveStore =
  g.__apexLiveStore ??
  (g.__apexLiveStore = { cache: new Map(), inflight: new Map(), queue: Promise.resolve(), lastCall: 0 });

const MIN_GAP_MS = 380; // ≈ 2.6 req/s, safely under OpenF1's 3 req/s cap

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function throttled<T>(task: () => Promise<T>): Promise<T> {
  const run = store.queue.then(async () => {
    const wait = store.lastCall + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    store.lastCall = Date.now();
  });
  store.queue = run.catch(() => undefined);
  return run.then(task);
}

async function rawFetch(url: string, openf1: boolean): Promise<unknown> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (openf1 && process.env.OPENF1_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.OPENF1_ACCESS_TOKEN}`;
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    const exec = () => fetch(url, { headers, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const res = openf1 ? await throttled(exec) : await exec();
    if (res.status === 429) {
      await sleep(700 * (attempt + 1));
      continue;
    }
    if (res.status === 404) return []; // OpenF1 uses 404 for "no results"
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  }
  throw new Error(`Rate limited: ${url}`);
}

async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = store.cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value as T;
  const pending = store.inflight.get(key);
  if (pending) return pending as Promise<T>;

  const p = loader()
    .then((value) => {
      store.cache.set(key, { value, expires: Date.now() + ttlMs });
      return value;
    })
    .catch((err) => {
      if (hit) return hit.value as T; // serve stale on failure
      throw err;
    })
    .finally(() => store.inflight.delete(key));
  store.inflight.set(key, p);
  return p;
}

export function openf1<T = any[]>(path: string, ttlMs: number): Promise<T> {
  const url = `${OPENF1}/${path}`;
  return cached(url, ttlMs, () => rawFetch(url, true) as Promise<T>);
}

export function jolpica<T = any>(path: string, ttlMs: number): Promise<T> {
  const url = `${JOLPICA}/${path}`;
  return cached(url, ttlMs, () => rawFetch(url, false) as Promise<T>);
}

const MIN = 60_000;
const HOUR = 60 * MIN;

/* ───────────────────────── types ───────────────────────── */

export type SessionStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface SeasonRound {
  round: number;
  name: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string; // race start ISO
  status: SessionStatus;
  winner: string | null;
  meetingKey: number | null;
}

export interface WeekendSession {
  sessionKey: number;
  name: string;
  type: string;
  start: string;
  end: string;
  status: SessionStatus;
}

export interface LiveDriver {
  number: number;
  code: string;
  fullName: string;
  team: string;
  color: string;
  headshot: string | null;
}

export interface TowerRow {
  position: number | null;
  driver: number;
  laps: number;
  gap: number | string | null; // seconds, or text (e.g. "+1 LAP", "DNF")
  interval: number | string | null;
  bestLap: number | null;
  lastLap: number | null;
  q: Array<number | null> | null; // qualifying Q1/Q2/Q3
  status: 'RUNNING' | 'FINISHED' | 'DNF' | 'DNS' | 'DSQ' | 'PIT';
  statusText: string | null;
  points: number | null;
  grid: number | null;
  compound: string | null;
  tyreAge: number | null;
  pits: number;
  fastestLap: boolean;
  sectors: [number | null, number | null, number | null];
}

/* ───────────────────────── helpers ───────────────────────── */

export function statusFor(start: string, end: string, type: string, hasResult = false): SessionStatus {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now < s) return 'UPCOMING';
  if (hasResult && now > e) return 'COMPLETED';
  // Races can overrun heavily (red flags / delayed starts) — allow a larger grace window.
  const grace = type === 'Race' ? 3 * HOUR : 20 * MIN;
  if (now <= e + (hasResult ? 0 : grace)) return 'LIVE';
  return 'COMPLETED';
}

const lastBy = <T, K>(rows: T[], key: (r: T) => K): Map<K, T> => {
  const m = new Map<K, T>();
  for (const r of rows) m.set(key(r), r);
  return m;
};

/* ───────────────────────── season + weekend ───────────────────────── */

export async function getSeason(): Promise<SeasonRound[]> {
  const [cal, winners, meetings] = await Promise.all([
    jolpica<any>('current.json', HOUR),
    jolpica<any>('current/results/1.json?limit=40', 15 * MIN).catch(() => null),
    openf1<any[]>(`meetings?year=${new Date().getFullYear()}`, HOUR).catch(() => []),
  ]);
  const races: any[] = cal?.MRData?.RaceTable?.Races ?? [];
  const winnerByRound = new Map<number, string>();
  for (const r of winners?.MRData?.RaceTable?.Races ?? []) {
    const d = r.Results?.[0]?.Driver;
    if (d) winnerByRound.set(Number(r.round), d.code || d.familyName);
  }

  return races.map((r) => {
    const raceStart = `${r.date}T${r.time || '13:00:00Z'}`;
    const raceMs = new Date(raceStart).getTime();
    // Match the OpenF1 meeting whose weekend window contains this race date.
    const meeting = (meetings as any[]).find((m) => {
      const ms = new Date(m.date_start).getTime();
      return !/testing/i.test(m.meeting_name) && raceMs >= ms - 6 * HOUR && raceMs <= ms + 4 * 24 * HOUR;
    });
    const round = Number(r.round);
    const winner = winnerByRound.get(round) ?? null;
    return {
      round,
      name: r.raceName,
      circuitId: r.Circuit.circuitId,
      circuitName: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      date: raceStart,
      status: winner ? 'COMPLETED' : statusFor(raceStart, new Date(raceMs + 2 * HOUR).toISOString(), 'Race'),
      winner,
      meetingKey: meeting?.meeting_key ?? null,
    } satisfies SeasonRound;
  });
}

export async function getWeekend(roundParam: number | null) {
  const season = await getSeason();
  let round =
    (roundParam && season.find((r) => r.round === roundParam)) ||
    season.find((r) => r.status === 'LIVE') ||
    null;

  if (!round) {
    // Default: the current race weekend (from FP1 ≈ 3 days before) if one is underway, else the most recent completed round.
    const now = Date.now();
    const upcoming = season.find((r) => r.status === 'UPCOMING');
    const inWeekend = upcoming && new Date(upcoming.date).getTime() - now < 3 * 24 * HOUR;
    round = (inWeekend ? upcoming : [...season].reverse().find((r) => r.status === 'COMPLETED')) || season[0];
  }

  let sessions: WeekendSession[] = [];
  if (round.meetingKey) {
    const raw = await openf1<any[]>(`sessions?meeting_key=${round.meetingKey}`, 10 * MIN);
    sessions = raw
      .sort((a, b) => a.date_start.localeCompare(b.date_start))
      .map((s) => ({
        sessionKey: s.session_key,
        name: s.session_name,
        type: s.session_type,
        start: s.date_start,
        end: s.date_end,
        status: round!.status === 'COMPLETED' ? 'COMPLETED' : statusFor(s.date_start, s.date_end, s.session_type),
      }));
  }

  const live = sessions.find((s) => s.status === 'LIVE');
  const lastDone = [...sessions].reverse().find((s) => s.status === 'COMPLETED');
  const defaultSessionKey = (live || lastDone || sessions[0])?.sessionKey ?? null;

  return { season, round, sessions, defaultSessionKey };
}

/* ───────────────────────── session timing ───────────────────────── */

export async function getSessionDetail(sessionKey: number, round: number | null) {
  const meta = (await openf1<any[]>(`sessions?session_key=${sessionKey}`, 10 * MIN))[0];
  if (!meta) throw new Error('Unknown session');

  const result = await openf1<any[]>(`session_result?session_key=${sessionKey}`, 30 * 1000);
  const status = statusFor(meta.date_start, meta.date_end, meta.session_type, result.length > 0);
  const live = status === 'LIVE';
  const ttl = live ? 4000 : status === 'COMPLETED' ? 6 * HOUR : MIN;

  if (status === 'UPCOMING') {
    return { meta: shapeMeta(meta, status), drivers: [], tower: [], raceControl: [], weather: null, stints: [], pits: [], lapPositions: {}, positionsTimeline: [], laps: {}, replay: null, totalLaps: null };
  }

  const [driversRaw, laps, stints, pits, raceControl, weather, positions] = await Promise.all([
    openf1<any[]>(`drivers?session_key=${sessionKey}`, live ? MIN : 6 * HOUR),
    openf1<any[]>(`laps?session_key=${sessionKey}`, live ? 8000 : ttl),
    openf1<any[]>(`stints?session_key=${sessionKey}`, live ? 8000 : ttl),
    openf1<any[]>(`pit?session_key=${sessionKey}`, live ? 8000 : ttl),
    openf1<any[]>(`race_control?session_key=${sessionKey}`, live ? 5000 : ttl),
    openf1<any[]>(`weather?session_key=${sessionKey}`, live ? MIN : ttl),
    openf1<any[]>(`position?session_key=${sessionKey}`, ttl),
  ]);

  // Live gaps — only the last minute of interval data to keep payloads small.
  let intervals: any[] = [];
  if (live && meta.session_type === 'Race') {
    const since = new Date(Date.now() - 60_000).toISOString().slice(0, 19);
    intervals = await openf1<any[]>(`intervals?session_key=${sessionKey}&date>${since}`, 4000).catch(() => []);
  }

  // Official race classification extras (grid, status text) from Jolpica.
  let jolpicaResults: any[] = [];
  if (meta.session_type === 'Race' && round && /^Race$/i.test(meta.session_name)) {
    const jr = await jolpica<any>(`current/${round}/results.json`, live ? MIN : 6 * HOUR).catch(() => null);
    jolpicaResults = jr?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
  }

  const drivers: LiveDriver[] = driversRaw.map((d) => ({
    number: d.driver_number,
    code: d.name_acronym,
    fullName: `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim() || d.full_name,
    team: d.team_name ?? '—',
    color: d.team_colour ? `#${d.team_colour}` : '#888888',
    headshot: d.headshot_url ?? null,
  }));

  /* per-driver lap stats */
  const lapsByDriver = new Map<number, any[]>();
  for (const l of laps) {
    if (!lapsByDriver.has(l.driver_number)) lapsByDriver.set(l.driver_number, []);
    lapsByDriver.get(l.driver_number)!.push(l);
  }
  let overallBest: { driver: number; time: number } | null = null;
  const lapStats = new Map<number, { best: number | null; last: number | null; count: number; sectors: [number | null, number | null, number | null] }>();
  for (const [num, list] of lapsByDriver) {
    list.sort((a, b) => a.lap_number - b.lap_number);
    const valid = list.filter((l) => l.lap_duration && !l.is_pit_out_lap);
    const best = valid.length ? Math.min(...valid.map((l) => l.lap_duration)) : null;
    const minOf = (k: string) => {
      const v = list.map((l) => l[k]).filter((x: number | null) => typeof x === 'number' && x > 0);
      return v.length ? Math.min(...v) : null;
    };
    const completed = list.filter((l) => l.lap_duration);
    lapStats.set(num, {
      best,
      last: completed.length ? completed[completed.length - 1].lap_duration : null,
      count: completed.length,
      sectors: [minOf('duration_sector_1'), minOf('duration_sector_2'), minOf('duration_sector_3')],
    });
    if (best && (!overallBest || best < overallBest.time)) overallBest = { driver: num, time: best };
  }

  /* tyres + pits */
  const lastStint = lastBy([...stints].sort((a, b) => a.stint_number - b.stint_number), (s) => s.driver_number);
  const pitCount = new Map<number, number>();
  for (const p of pits) pitCount.set(p.driver_number, (pitCount.get(p.driver_number) ?? 0) + 1);

  /* order */
  const latestPos = lastBy([...positions].sort((a, b) => a.date.localeCompare(b.date)), (p) => p.driver_number);
  const latestInt = lastBy([...intervals].sort((a, b) => a.date.localeCompare(b.date)), (p) => p.driver_number);
  const resultByDriver = new Map<number, any>(result.map((r) => [r.driver_number, r]));
  const jolByNumber = new Map<number, any>(jolpicaResults.map((r) => [Number(r.number), r]));

  const isQuali = /qualifying|shootout/i.test(meta.session_type) || /qualifying|shootout/i.test(meta.session_name);
  const isRace = meta.session_type === 'Race';

  const tower: TowerRow[] = drivers.map((d) => {
    const r = resultByDriver.get(d.number);
    const j = jolByNumber.get(d.number);
    const ls = lapStats.get(d.number);
    const stint = lastStint.get(d.number);
    const maxLap = ls?.count ?? 0;

    let gap: TowerRow['gap'] = null;
    let interval: TowerRow['interval'] = null;
    let q: TowerRow['q'] = null;
    let st: TowerRow['status'] = live ? 'RUNNING' : 'FINISHED';
    let statusText: string | null = null;

    if (r) {
      if (Array.isArray(r.duration)) {
        q = r.duration;
        const gaps: Array<number | null> = r.gap_to_leader ?? [];
        const lastIdx = [...(q ?? [])].map((x, i) => (x ? i : -1)).filter((i) => i >= 0).pop();
        gap = lastIdx !== undefined ? gaps[lastIdx] : null;
      } else {
        gap = r.gap_to_leader;
      }
      if (r.dsq) { st = 'DSQ'; statusText = 'DSQ'; }
      else if (r.dns) { st = 'DNS'; statusText = 'DNS'; }
      else if (r.dnf) { st = 'DNF'; statusText = j?.status && j.status !== 'Retired' ? j.status : 'DNF'; }
      if (isRace && j?.status && /lap/i.test(j.status)) statusText = j.status;
    } else if (live) {
      const iv = latestInt.get(d.number);
      if (iv) {
        gap = iv.gap_to_leader;
        interval = iv.interval;
      }
      const inPit = pits.some((p) => p.driver_number === d.number && p.lap_number === maxLap + 1);
      if (inPit) st = 'PIT';
    }

    return {
      position: r?.position ?? latestPos.get(d.number)?.position ?? null,
      driver: d.number,
      laps: r?.number_of_laps ?? maxLap,
      gap,
      interval,
      bestLap: ls?.best ?? null,
      lastLap: ls?.last ?? null,
      q,
      status: st,
      statusText,
      points: typeof r?.points === 'number' ? r.points : null,
      grid: j ? Number(j.grid) || null : null,
      compound: stint?.compound ?? null,
      tyreAge: stint ? (stint.tyre_age_at_start ?? 0) + Math.max(0, (maxLap || stint.lap_end || 0) - stint.lap_start + 1) : null,
      pits: pitCount.get(d.number) ?? 0,
      fastestLap: overallBest?.driver === d.number,
      sectors: ls?.sectors ?? [null, null, null],
    };
  });

  tower.sort((a, b) => (a.position ?? 99) - (b.position ?? 99));
  // Compute race intervals from gap-to-leader when only the result is available.
  if (!live) {
    for (let i = 1; i < tower.length; i++) {
      const a = tower[i - 1].gap, b = tower[i].gap;
      if (typeof a === 'number' && typeof b === 'number') tower[i].interval = +(b - a).toFixed(3);
    }
  }

  /* replay window + timelines */
  const lapStarts = laps.filter((l) => l.date_start).map((l) => new Date(l.date_start).getTime());
  const lapEnds = laps
    .filter((l) => l.date_start && l.lap_duration)
    .map((l) => new Date(l.date_start).getTime() + l.lap_duration * 1000);
  const replay =
    lapStarts.length > 0
      ? { start: new Date(Math.min(...lapStarts)).toISOString(), end: new Date(Math.max(...lapEnds, ...lapStarts)).toISOString() }
      : null;

  const positionsTimeline: Array<[number, number, number]> = positions
    .map((p) => [new Date(p.date).getTime(), p.driver_number, p.position] as [number, number, number])
    .sort((a, b) => a[0] - b[0]);

  // Position of each driver at the start of each lap (for the race story chart).
  const lapPositions: Record<number, Array<number | null>> = {};
  if (isRace) {
    const timelineByDriver = new Map<number, Array<[number, number]>>();
    for (const [t, dn, pos] of positionsTimeline) {
      if (!timelineByDriver.has(dn)) timelineByDriver.set(dn, []);
      timelineByDriver.get(dn)!.push([t, pos]);
    }
    for (const [num, list] of lapsByDriver) {
      const tl = timelineByDriver.get(num) ?? [];
      const arr: Array<number | null> = [];
      for (const l of list) {
        if (!l.date_start) continue;
        const t = new Date(l.date_start).getTime() + (l.lap_duration ?? 0) * 1000;
        let pos: number | null = null;
        for (const [pt, pp] of tl) {
          if (pt <= t) pos = pp;
          else break;
        }
        arr[l.lap_number - 1] = pos;
      }
      lapPositions[num] = arr;
    }
    // Lap 0 = starting grid
    for (const t of tower) if (t.grid && lapPositions[t.driver]) lapPositions[t.driver].unshift(t.grid);
  }

  // Compact per-driver lap list (lap number, start ms, duration) for replay lap counters + telemetry lap picker.
  const lapsCompact: Record<number, Array<[number, number, number | null]>> = {};
  for (const [num, list] of lapsByDriver) {
    lapsCompact[num] = list
      .filter((l) => l.date_start)
      .map((l) => [l.lap_number, new Date(l.date_start).getTime(), l.lap_duration ?? null]);
  }

  const w = weather.length ? weather[weather.length - 1] : null;

  return {
    meta: shapeMeta(meta, status),
    drivers,
    tower,
    totalLaps: isRace ? Math.max(0, ...tower.map((t) => t.laps)) : null,
    raceControl: raceControl
      .filter((m) => m.category !== 'Other' || /penalty|investigation|deleted|noted|red flag/i.test(m.message))
      .slice(-80)
      .reverse()
      .map((m) => ({ date: m.date, lap: m.lap_number, category: m.category, flag: m.flag, message: m.message, driver: m.driver_number })),
    weather: w
      ? { air: w.air_temperature, track: w.track_temperature, humidity: w.humidity, wind: w.wind_speed, rain: w.rainfall > 0 }
      : null,
    stints: stints.map((s) => ({ driver: s.driver_number, n: s.stint_number, compound: s.compound, from: s.lap_start, to: s.lap_end, age: s.tyre_age_at_start })),
    pits: pits.map((p) => ({ driver: p.driver_number, lap: p.lap_number, duration: p.stop_duration ?? p.pit_duration ?? null })),
    lapPositions,
    positionsTimeline,
    laps: lapsCompact,
    replay,
  };
}

function shapeMeta(m: any, status: SessionStatus) {
  return {
    sessionKey: m.session_key,
    meetingKey: m.meeting_key,
    name: m.session_name,
    type: m.session_type,
    start: m.date_start,
    end: m.date_end,
    circuit: m.circuit_short_name,
    country: m.country_name,
    location: m.location,
    status,
  };
}

/* ───────────────────────── track geometry ───────────────────────── */

export async function getTrack(sessionKey: number) {
  return cached(`track:${sessionKey}`, 12 * HOUR, async () => {
    const laps = await openf1<any[]>(`laps?session_key=${sessionKey}`, 10 * MIN);
    // Choose a clean, fast lap (not pit in/out) — prefer one close to median pace to avoid odd lines.
    const clean = laps
      .filter((l) => l.lap_duration && l.date_start && !l.is_pit_out_lap && l.lap_number > 1)
      .sort((a, b) => a.lap_duration - b.lap_duration);
    const pick = clean[Math.min(2, clean.length - 1)];
    if (!pick) return null;

    const from = new Date(pick.date_start);
    const to = new Date(from.getTime() + pick.lap_duration * 1000 + 400);
    const pts = await openf1<any[]>(
      `location?session_key=${sessionKey}&driver_number=${pick.driver_number}&date>${iso(from)}&date<${iso(to)}`,
      12 * HOUR
    );
    const path = pts.filter((p) => p.x !== 0 || p.y !== 0).map((p) => [p.x, p.y] as [number, number]);
    if (path.length < 20) return null;

    const xs = path.map((p) => p[0]);
    const ys = path.map((p) => p[1]);
    return {
      path,
      bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
    };
  });
}

/* ───────────────────────── car positions (map) ───────────────────────── */

export async function getLocations(sessionKey: number, fromMs: number, toMs: number, live: boolean) {
  // Bucket to whole seconds so concurrent viewers share cache entries.
  const f = Math.floor(fromMs / 1000) * 1000;
  const t = Math.min(Math.ceil(toMs / 1000) * 1000, f + 30_000);
  const rows = await openf1<any[]>(
    `location?session_key=${sessionKey}&date>${iso(new Date(f))}&date<${iso(new Date(t))}`,
    live ? 3000 : 12 * HOUR
  );
  const out: Record<number, Array<[number, number, number]>> = {};
  for (const r of rows) {
    if (r.x === 0 && r.y === 0) continue;
    (out[r.driver_number] ??= []).push([new Date(r.date).getTime(), r.x, r.y]);
  }
  for (const k of Object.keys(out)) out[+k].sort((a, b) => a[0] - b[0]);
  return out;
}

/* ───────────────────────── lap telemetry ───────────────────────── */

export async function getLapTelemetry(sessionKey: number, driver: number, lapNumber: number | null) {
  const laps = await openf1<any[]>(`laps?session_key=${sessionKey}&driver_number=${driver}`, 10 * MIN);
  const candidates = laps.filter((l) => l.lap_duration && l.date_start && !l.is_pit_out_lap);
  const lap =
    (lapNumber && laps.find((l) => l.lap_number === lapNumber && l.date_start && l.lap_duration)) ||
    candidates.sort((a, b) => a.lap_duration - b.lap_duration)[0];
  if (!lap) return null;

  return cached(`lapTel:${sessionKey}:${driver}:${lap.lap_number}`, 12 * HOUR, async () => {
    const from = new Date(lap.date_start);
    const to = new Date(from.getTime() + lap.lap_duration * 1000);
    const range = `session_key=${sessionKey}&driver_number=${driver}&date>${iso(from)}&date<${iso(to)}`;
    const [car, loc] = await Promise.all([openf1<any[]>(`car_data?${range}`, 12 * HOUR), openf1<any[]>(`location?${range}`, 12 * HOUR)]);

    const t0 = from.getTime();
    const locs = loc.map((l) => ({ t: new Date(l.date).getTime() - t0, x: l.x, y: l.y }));
    let dist = 0;
    let prevT = 0;
    let li = 0;
    const samples = car
      .map((c) => ({ ...c, t: new Date(c.date).getTime() - t0 }))
      .sort((a, b) => a.t - b.t)
      .map((c) => {
        dist += ((c.speed / 3.6) * Math.max(0, c.t - prevT)) / 1000;
        prevT = c.t;
        while (li < locs.length - 1 && locs[li + 1].t <= c.t) li++;
        const L = locs[li];
        return {
          t: +(c.t / 1000).toFixed(3),
          d: Math.round(dist),
          speed: c.speed,
          throttle: Math.min(100, c.throttle),
          brake: c.brake > 0 ? 100 : 0,
          gear: c.n_gear,
          rpm: c.rpm,
          drs: typeof c.drs === 'number' && c.drs >= 10 ? 1 : 0,
          x: L?.x ?? null,
          y: L?.y ?? null,
        };
      });

    return {
      driver,
      lap: lap.lap_number,
      lapTime: lap.lap_duration,
      sectors: [lap.duration_sector_1, lap.duration_sector_2, lap.duration_sector_3],
      speedTrap: lap.st_speed ?? null,
      samples,
    };
  });
}

function iso(d: Date) {
  return d.toISOString().slice(0, 23);
}
