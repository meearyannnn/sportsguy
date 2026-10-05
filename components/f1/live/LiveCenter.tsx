'use client';

/**
 * Live Center — full-screen race weekend dashboard.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  Weekend header  (race name / round selector / session  │
 *   │                   pill tabs)                            │
 *   ├──────────┬──────────────────────────┬───────────────────┤
 *   │ Timing   │     Track Map (SVG GPS)  │  Telemetry HUD   │
 *   │ Tower    │                          │                   │
 *   │          │                          │                   │
 *   └──────────┴──────────────────────────┴───────────────────┘
 *
 * On small screens the three panels stack vertically with a tab
 * switcher so users can focus on one panel at a time.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronLeft, ChevronRight, Radio, Loader2,
  LayoutList, MapPin, Gauge, RefreshCw,
} from 'lucide-react';

import {
  WeekendPayload, SessionPayload, LiveDriver, TowerRow,
  shortSession, fmtLap,
} from './shared';

const TrackMap = dynamic(() => import('./TrackMap'), { ssr: false, loading: () => <MapFallback /> });
const TimingTower = dynamic(() => import('./TimingTower'), { ssr: false });
const TelemetryHUD = dynamic(() => import('./TelemetryHUD'), { ssr: false });

const MapFallback = () => (
  <div className="flex flex-col items-center justify-center h-full gap-2" style={{ color: 'var(--text-muted)' }}>
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="text-[10px] font-mono">Loading map…</span>
  </div>
);

/* ────────────────────────── polling hook ──────────────────────────── */

function usePoll<T>(
  url: string | null,
  intervalMs: number,
  live: boolean,
): { data: T | null; loading: boolean; error: string | null; refresh: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetch_ = useCallback(async (quiet = false) => {
    if (!url) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    if (!quiet) setLoading(true);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      const json = await r.json();
      if (!r.ok) { setError(json.error || 'Error'); return; }
      setData(json);
      setError(null);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message ?? 'Network error');
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetch_(false);
    if (!live) return;
    const schedule = () => {
      timerRef.current = setTimeout(() => {
        fetch_(true).then(() => schedule());
      }, intervalMs);
    };
    schedule();
    return () => {
      abortRef.current?.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetch_, live, intervalMs]);

  return { data, loading, error, refresh: () => fetch_(false) };
}

/* ────────────────────────── helpers ──────────────────────────── */

type MobilePanel = 'tower' | 'map' | 'telemetry';

function StatusPill({ status, live }: { status: string; live: boolean }) {
  if (live) {
    return (
      <span
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest"
        style={{ background: 'var(--red)', color: '#fff' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" />
        LIVE
      </span>
    );
  }
  if (status === 'COMPLETED') {
    return (
      <span
        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest"
        style={{ background: 'var(--green-subtle)', color: 'var(--green)' }}
      >
        FINISHED
      </span>
    );
  }
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest"
      style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)', border: '1px solid var(--border-dim)' }}
    >
      UPCOMING
    </span>
  );
}

/* ────────────────────────── main component ──────────────────────────── */

export default function LiveCenter() {
  const [weekendUrl, setWeekendUrl] = useState('/api/f1/live/weekend');
  const [activeSessionKey, setActiveSessionKey] = useState<number | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [selectedLap, setSelectedLap] = useState<number | null>(null);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('map');
  const [mapTime, setMapTime] = useState<number>(0);

  /* Weekend data (season rounds + sessions list) */
  const {
    data: weekend,
    loading: weekendLoading,
    error: weekendError,
    refresh: refreshWeekend,
  } = usePoll<WeekendPayload>(weekendUrl, 60_000, false);

  /* Set default session key once weekend loads */
  useEffect(() => {
    if (weekend?.defaultSessionKey && !activeSessionKey) {
      setActiveSessionKey(weekend.defaultSessionKey);
    }
  }, [weekend, activeSessionKey]);

  const currentSession = useMemo(
    () => weekend?.sessions.find((s) => s.sessionKey === activeSessionKey) ?? null,
    [weekend, activeSessionKey],
  );
  const isLive = currentSession?.status === 'LIVE';
  const isQuali = /qualifying|shootout/i.test(currentSession?.type ?? '');
  const isRace = currentSession?.type === 'Race';

  /* Session detail (tower, weather, race control, etc.) */
  const sessionApiUrl = activeSessionKey
    ? `/api/f1/live/session?session_key=${activeSessionKey}${weekend?.round ? `&round=${weekend.round.round}` : ''}`
    : null;

  const {
    data: session,
    loading: sessionLoading,
    error: sessionError,
    refresh: refreshSession,
  } = usePoll<SessionPayload>(sessionApiUrl, isLive ? 4_000 : 0, isLive);

  /* Current lap at a given replay time */
  const lapAt = useCallback(
    (t: number): number | null => {
      if (!session || !selectedDriver) return null;
      const driverLaps = session.laps[selectedDriver];
      if (!driverLaps) return null;
      let lap: number | null = null;
      for (const [ln, startMs] of driverLaps) {
        if (startMs <= t) lap = ln;
        else break;
      }
      return lap;
    },
    [session, selectedDriver],
  );

  /* Leader driver number at a given time */
  const leaderAt = useCallback(
    (t: number): number | null => {
      if (!session) return null;
      const tl = session.positionsTimeline;
      const pos1 = new Map<number, number>();
      for (const [ts, dn, p] of tl) {
        if (ts > t) break;
        pos1.set(dn, p);
      }
      for (const [dn, p] of pos1) if (p === 1) return dn;
      return session.tower[0]?.driver ?? null;
    },
    [session],
  );

  /* When selected driver changes, reset lap */
  useEffect(() => {
    setSelectedLap(null);
  }, [selectedDriver]);

  const availableLaps = selectedDriver && session?.laps[selectedDriver]
    ? session.laps[selectedDriver]
    : undefined;

  /* Round navigation */
  const roundIdx = useMemo(
    () => (weekend ? weekend.season.findIndex((r) => r.round === weekend.round.round) : -1),
    [weekend],
  );

  const goRound = (delta: number) => {
    if (!weekend) return;
    const next = weekend.season[roundIdx + delta];
    if (!next) return;
    setActiveSessionKey(null);
    setSelectedDriver(null);
    setWeekendUrl(`/api/f1/live/weekend?round=${next.round}`);
  };

  /* ── render ── */

  if (weekendLoading && !weekend) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--red)' }} />
        <span className="text-xs font-mono tracking-widest uppercase">Loading race weekend…</span>
      </div>
    );
  }

  if (weekendError && !weekend) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center px-6">
        <Radio className="w-7 h-7 opacity-40" style={{ color: 'var(--red)' }} />
        <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{weekendError}</p>
        <button onClick={refreshWeekend} className="btn-red px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!weekend) return null;

  const { round, season, sessions } = weekend;

  return (
    <div className="flex flex-col gap-0" style={{ minHeight: 0 }}>

      {/* ── Weekend header ── */}
      <div
        className="rounded-xl mb-3 overflow-hidden"
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Round nav */}
          <button
            onClick={() => goRound(-1)}
            disabled={roundIdx <= 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}
            aria-label="Previous round"
            id="live-prev-round"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded"
                style={{ background: 'var(--red-subtle)', color: 'var(--red)' }}
              >
                ROUND {round.round}
              </span>
              <StatusPill status={round.status} live={isLive} />
              {round.winner && (
                <span className="text-[10px] font-mono" style={{ color: 'var(--amber)' }}>
                  Winner: {round.winner}
                </span>
              )}
            </div>
            <h2
              className="font-display font-black text-xl tracking-tight mt-0.5 truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {round.name}
            </h2>
            <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              {round.circuitName} · {round.locality}, {round.country}
            </p>
          </div>

          <button
            onClick={() => goRound(1)}
            disabled={roundIdx >= season.length - 1}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
            style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}
            aria-label="Next round"
            id="live-next-round"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Session tabs */}
        {sessions.length > 0 && (
          <div
            className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto scrollbar-none"
          >
            {sessions.map((s) => {
              const isActive = s.sessionKey === activeSessionKey;
              return (
                <button
                  key={s.sessionKey}
                  onClick={() => { setActiveSessionKey(s.sessionKey); setSelectedDriver(null); }}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wide transition-all"
                  style={{
                    background: isActive ? 'var(--red)' : s.status === 'LIVE' ? 'var(--red-subtle)' : 'var(--bg-overlay)',
                    color: isActive ? '#fff' : s.status === 'LIVE' ? 'var(--red)' : 'var(--text-secondary)',
                    border: `1px solid ${isActive ? 'var(--red)' : s.status === 'LIVE' ? 'rgba(225,6,0,0.4)' : 'var(--border-dim)'}`,
                  }}
                  aria-label={`Session ${s.name}`}
                  id={`session-tab-${s.sessionKey}`}
                >
                  {shortSession(s.name)}
                  {s.status === 'LIVE' && (
                    <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-current animate-live-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Season round mini-strip ── */}
      <div
        className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2"
      >
        {season.map((r) => {
          const isActive = r.round === round.round;
          return (
            <button
              key={r.round}
              onClick={() => {
                setActiveSessionKey(null);
                setSelectedDriver(null);
                setWeekendUrl(`/api/f1/live/weekend?round=${r.round}`);
              }}
              className="flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg text-center transition-colors"
              style={{
                background: isActive ? 'var(--bg-overlay)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border-mid)' : 'transparent'}`,
                minWidth: 56,
              }}
              id={`season-round-${r.round}`}
            >
              <span
                className="text-[8px] font-mono tracking-widest"
                style={{
                  color: r.status === 'LIVE' ? 'var(--red)' : r.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-muted)',
                }}
              >
                R{r.round}
              </span>
              <span className="text-[9px] font-mono font-bold truncate max-w-[52px]" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                {r.country.slice(0, 3).toUpperCase()}
              </span>
              {r.status === 'LIVE' && (
                <span className="w-1 h-1 rounded-full mt-0.5" style={{ background: 'var(--red)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Session error ── */}
      {sessionError && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono mb-2"
          style={{ background: 'var(--red-subtle)', color: 'var(--red)', border: '1px solid rgba(225,6,0,0.3)' }}
        >
          <Radio className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{sessionError}</span>
          <button onClick={refreshSession} className="ml-auto flex-shrink-0 underline">retry</button>
        </div>
      )}

      {/* ── Mobile panel tabs ── */}
      <div className="flex lg:hidden items-center gap-1.5 mb-3">
        {(
          [
            { id: 'tower', label: 'Standings', icon: LayoutList },
            { id: 'map', label: 'Track Map', icon: MapPin },
            { id: 'telemetry', label: 'Telemetry', icon: Gauge },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMobilePanel(id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-mono font-bold transition-colors"
            style={{
              background: mobilePanel === id ? 'var(--bg-overlay)' : 'transparent',
              color: mobilePanel === id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: `1px solid ${mobilePanel === id ? 'var(--border-mid)' : 'transparent'}`,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Main three-panel grid ── */}
      {activeSessionKey && (
        <div className="grid gap-3" style={{ gridTemplateColumns: '1fr', minHeight: 520 }}>
          {/* Large screens: three columns */}
          <div
            className="hidden lg:grid gap-3"
            style={{
              gridTemplateColumns: '320px 1fr 300px',
              height: 640,
            }}
          >
            {/* Left: Timing Tower */}
            <div
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-card)' }}
            >
              {sessionLoading && !session ? (
                <div className="flex-1 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : session ? (
                <TimingTower
                  tower={session.tower}
                  drivers={session.drivers}
                  isQuali={isQuali}
                  isRace={isRace}
                  totalLaps={session.totalLaps}
                  selected={selectedDriver}
                  onSelect={setSelectedDriver}
                  currentLap={mapTime ? lapAt(mapTime) : null}
                  weather={session.weather}
                  raceControl={session.raceControl}
                />
              ) : null}
            </div>

            {/* Centre: Track Map */}
            <div
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-card)' }}
            >
              <TrackMap
                sessionKey={activeSessionKey}
                live={isLive}
                drivers={session?.drivers ?? []}
                replay={session?.replay ?? null}
                totalLaps={session?.totalLaps ?? null}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                onTime={setMapTime}
                lapAt={lapAt}
                leaderAt={leaderAt}
              />
            </div>

            {/* Right: Telemetry */}
            <div
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', boxShadow: 'var(--shadow-card)' }}
            >
              <TelemetryHUD
                sessionKey={activeSessionKey}
                driver={selectedDriver}
                drivers={session?.drivers ?? []}
                lapNumber={selectedLap}
                onChangeLap={setSelectedLap}
                availableLaps={availableLaps}
              />
            </div>
          </div>

          {/* Small screens: single panel at a time */}
          <div
            className="lg:hidden rounded-xl overflow-hidden flex flex-col"
            style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', minHeight: 520 }}
          >
            {mobilePanel === 'tower' && (
              sessionLoading && !session ? (
                <div className="flex-1 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : session ? (
                <TimingTower
                  tower={session.tower}
                  drivers={session.drivers}
                  isQuali={isQuali}
                  isRace={isRace}
                  totalLaps={session.totalLaps}
                  selected={selectedDriver}
                  onSelect={setSelectedDriver}
                  currentLap={null}
                  weather={session.weather}
                  raceControl={session.raceControl}
                />
              ) : null
            )}
            {mobilePanel === 'map' && (
              <TrackMap
                sessionKey={activeSessionKey}
                live={isLive}
                drivers={session?.drivers ?? []}
                replay={session?.replay ?? null}
                totalLaps={session?.totalLaps ?? null}
                selected={selectedDriver}
                onSelect={setSelectedDriver}
                onTime={setMapTime}
                lapAt={lapAt}
                leaderAt={leaderAt}
              />
            )}
            {mobilePanel === 'telemetry' && (
              <TelemetryHUD
                sessionKey={activeSessionKey}
                driver={selectedDriver}
                drivers={session?.drivers ?? []}
                lapNumber={selectedLap}
                onChangeLap={setSelectedLap}
                availableLaps={availableLaps}
              />
            )}
          </div>
        </div>
      )}

      {/* No session selected yet */}
      {!activeSessionKey && (
        <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ color: 'var(--text-muted)' }}>
          <Radio className="w-6 h-6 opacity-40" />
          <span className="text-xs font-mono">Select a session to view telemetry</span>
        </div>
      )}
    </div>
  );
}
