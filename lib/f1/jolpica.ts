import {
  JolpicaResponse,
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
  Driver,
  Constructor,
} from './types';

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

// In-memory & localStorage cache for API resilience and sub-50ms instant client-side loads
const memoryCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

function getStoredCache<T>(key: string, ttl: number): T | null {
  const mem = memoryCache.get(key);
  const now = Date.now();
  if (mem && now - mem.timestamp < ttl) {
    return mem.data as T;
  }
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const item = localStorage.getItem(`apex_cache_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (now - parsed.timestamp < ttl * 3) {
          memoryCache.set(key, parsed);
          return parsed.data as T;
        }
      }
    } catch {}
  }
  return null;
}

function setStoredCache(key: string, data: any): void {
  const now = Date.now();
  memoryCache.set(key, { timestamp: now, data });
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(`apex_cache_${key}`, JSON.stringify({ timestamp: now, data }));
    } catch {}
  }
}

async function fetchWithCache<T>(url: string, ttl = CACHE_TTL_MS): Promise<T | null> {
  const cached = getStoredCache<T>(url, ttl);
  if (cached) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      next: { revalidate: ttl > 3600000 ? 86400 : 600 },
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Jolpica API notice (${res.status}): ${url}`);
      if (cached) return cached;
      return null;
    }

    const json = (await res.json()) as T;
    setStoredCache(url, json);
    return json;
  } catch (err) {
    console.warn(`Jolpica network notice:`, err);
    if (cached) return cached;
    return null;
  }
}

function resolveSeason(season: string | number = 'current'): string {
  const s = String(season).toLowerCase().trim();
  if (!s || s === 'current') return 'current';
  return s;
}

export async function getCalendar(season: string | number = 'current'): Promise<Race[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<Race>>(
      `${JOLPICA_BASE}/${targetSeason}.json?limit=35`
    );
    return res?.MRData?.RaceTable?.Races || [];
  } catch (err) {
    console.error('Failed to get calendar:', err);
    return [];
  }
}

export async function getDriverStandings(
  season: string | number = 'current'
): Promise<DriverStanding[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<DriverStanding>>(
      `${JOLPICA_BASE}/${targetSeason}/driverstandings.json?limit=30`
    );
    const lists = res?.MRData?.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].DriverStandings || [] : [];
  } catch (err) {
    console.error('Failed to get driver standings:', err);
    return [];
  }
}

export async function getConstructorStandings(
  season: string | number = 'current'
): Promise<ConstructorStanding[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<ConstructorStanding>>(
      `${JOLPICA_BASE}/${targetSeason}/constructorstandings.json?limit=15`
    );
    const lists = res?.MRData?.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].ConstructorStandings || [] : [];
  } catch (err) {
    console.error('Failed to get constructor standings:', err);
    return [];
  }
}

export async function getRaceResults(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<{ race: Race | null; results: RaceResult[] }> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<RaceResult>>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/results.json?limit=30`
    );
    const races = res?.MRData?.RaceTable?.Races;
    if (races && races.length > 0) {
      return {
        race: races[0],
        results: races[0].Results || [],
      };
    }
    return { race: null, results: [] };
  } catch (err) {
    console.error(`Failed to get race results for ${season} round ${round}:`, err);
    return { race: null, results: [] };
  }
}

export async function getQualifyingResults(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<any[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<any>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/qualifying.json?limit=30`
    );
    const races = res?.MRData?.RaceTable?.Races;
    if (races && races.length > 0 && races[0].QualifyingResults) {
      return races[0].QualifyingResults;
    }
    return [];
  } catch (err) {
    console.error(`Failed to get qualifying for ${season} round ${round}:`, err);
    return [];
  }
}

export async function getDriverStandingsByRound(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<DriverStanding[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<DriverStanding>>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/driverstandings.json?limit=30`
    );
    const lists = res?.MRData?.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].DriverStandings || [] : [];
  } catch (err) {
    console.error(`Failed to get driver standings for round ${round}:`, err);
    return [];
  }
}

export async function getConstructorStandingsByRound(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<ConstructorStanding[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<ConstructorStanding>>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/constructorstandings.json?limit=15`
    );
    const lists = res?.MRData?.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].ConstructorStandings || [] : [];
  } catch (err) {
    console.error(`Failed to get constructor standings for round ${round}:`, err);
    return [];
  }
}

export interface ErgastPitStop {
  driverId: string;
  lap: string;
  stop: string;
  time: string;
  duration: string;
}

export async function getPitStops(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<ErgastPitStop[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<any>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/pitstops.json?limit=60`
    );
    const races = res?.MRData?.RaceTable?.Races;
    if (races && races.length > 0 && races[0].PitStops) {
      return races[0].PitStops as ErgastPitStop[];
    }
    return [];
  } catch (err) {
    console.error(`Failed to get pit stops for ${season} round ${round}:`, err);
    return [];
  }
}

export async function getAllDrivers(season: string | number = 'current'): Promise<Driver[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<Driver>>(
      `${JOLPICA_BASE}/${targetSeason}/drivers.json?limit=40`
    );
    return res?.MRData?.DriverTable?.Drivers || [];
  } catch (err) {
    console.error('Failed to get drivers:', err);
    return [];
  }
}

export async function getAllConstructors(
  season: string | number = 'current'
): Promise<Constructor[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<Constructor>>(
      `${JOLPICA_BASE}/${targetSeason}/constructors.json?limit=20`
    );
    return res?.MRData?.ConstructorTable?.Constructors || [];
  } catch (err) {
    console.error('Failed to get constructors:', err);
    return [];
  }
}

export async function getDriverStandingsBySeason(
  season: string | number,
  driverId?: string
): Promise<DriverStanding | null> {
  const targetSeason = resolveSeason(season);
  try {
    const url = driverId
      ? `${JOLPICA_BASE}/${targetSeason}/drivers/${driverId}/driverstandings.json`
      : `${JOLPICA_BASE}/${targetSeason}/driverstandings.json?limit=30`;
    const res = await fetchWithCache<JolpicaResponse<DriverStanding>>(url);
    const lists = res?.MRData?.StandingsTable?.StandingsLists;
    if (lists && lists.length > 0 && lists[0].DriverStandings) {
      if (driverId) {
        return (
          lists[0].DriverStandings.find(
            (d) =>
              d.Driver.driverId.toLowerCase() === driverId.toLowerCase() ||
              d.Driver.code?.toLowerCase() === driverId.toLowerCase()
          ) || lists[0].DriverStandings[0] || null
        );
      }
      return lists[0].DriverStandings[0] || null;
    }
    return null;
  } catch (err) {
    console.error(`Failed to get driver standings for ${season} driver ${driverId}:`, err);
    return null;
  }
}

export async function getDriverRaceResults(
  season: string | number,
  driverId: string
): Promise<RaceResult[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<JolpicaResponse<RaceResult>>(
      `${JOLPICA_BASE}/${targetSeason}/drivers/${driverId}/results.json?limit=35`
    );
    const races = res?.MRData?.RaceTable?.Races || [];
    const results: RaceResult[] = [];
    races.forEach((r) => {
      if (r.Results) {
        results.push(...r.Results);
      }
    });
    return results;
  } catch (err) {
    console.error(`Failed to get race results for ${season} driver ${driverId}:`, err);
    return [];
  }
}

export async function getLapTimes(
  season: string | number = 'current',
  round: string | number = 'last',
  lap: string | number = 1
): Promise<any[]> {
  const targetSeason = resolveSeason(season);
  try {
    const res = await fetchWithCache<any>(
      `${JOLPICA_BASE}/${targetSeason}/${round}/laps/${lap}.json?limit=30`
    );
    const races = res?.MRData?.RaceTable?.Races;
    if (races && races.length > 0 && races[0].Laps && races[0].Laps.length > 0) {
      return races[0].Laps[0].Timings || [];
    }
    return [];
  } catch (err) {
    console.error(`Failed to get lap times:`, err);
    return [];
  }
}
