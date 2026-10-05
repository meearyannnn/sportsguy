'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Tag, Loader2, Radio, MapPinned } from 'lucide-react';
import { LiveDriver, TrackPayload, makeProjector, fmtClock } from './shared';

type Sample = [number, number, number]; // t, x, y
type DriverSamples = Record<number, Sample[]>;

interface TrackMapProps {
  sessionKey: number;
  live: boolean;
  drivers: LiveDriver[];
  replay: { start: string; end: string } | null;
  totalLaps: number | null;
  selected: number | null;
  onSelect: (driver: number) => void;
  onTime?: (t: number) => void;
  lapAt: (t: number) => number | null;
  leaderAt: (t: number) => number | null;
}

const CHUNK_MS = 20_000;
const LIVE_LAG_MS = 2500;
const SPEEDS = [1, 5, 10, 20];

/** Linear interpolation between the two samples bracketing T. */
function interpolate(arr: Sample[] | undefined, T: number, before?: Sample, after?: Sample): [number, number] | null {
  if (!arr || arr.length === 0) {
    if (before && after) return lerp(before, after, T);
    return before ? [before[1], before[2]] : null;
  }
  let lo = 0, hi = arr.length - 1, idx = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid][0] <= T) { idx = mid; lo = mid + 1; } else hi = mid - 1;
  }
  const prev = idx >= 0 ? arr[idx] : before;
  const next = idx + 1 < arr.length ? arr[idx + 1] : after;
  if (prev && next) return lerp(prev, next, T);
  if (prev) return [prev[1], prev[2]];
  if (next) return [next[1], next[2]];
  return null;
}

function lerp(a: Sample, b: Sample, T: number): [number, number] {
  const span = b[0] - a[0];
  if (span <= 0 || span > 4000) return [a[1], a[2]]; // don't animate across data gaps
  const k = Math.min(1, Math.max(0, (T - a[0]) / span));
  return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
}

export default function TrackMap({
  sessionKey, live, drivers, replay, totalLaps, selected, onSelect, onTime, lapAt, leaderAt,
}: TrackMapProps) {
  const [track, setTrack] = useState<TrackPayload | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [labels, setLabels] = useState(true);
  const [uiT, setUiT] = useState<number>(0);
  const [buffering, setBuffering] = useState(false);
  const [liveStale, setLiveStale] = useState(false);

  const start = replay ? new Date(replay.start).getTime() : 0;
  const end = replay ? new Date(replay.end).getTime() : 0;

  const playheadRef = useRef<number>(start);
  const playingRef = useRef(false);
  const speedRef = useRef(speed);
  const chunks = useRef(new Map<number, DriverSamples>());
  const loading = useRef(new Set<number>());
  const liveBuf = useRef<DriverSamples>({});
  const liveAnchor = useRef<{ t: number; client: number } | null>(null);
  const carRefs = useRef(new Map<number, SVGGElement>());
  const onTimeRef = useRef(onTime);
  onTimeRef.current = onTime;

  useEffect(() => { playingRef.current = playing; }, [playing]);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  /* track geometry */
  useEffect(() => {
    let alive = true;
    setTrack(null);
    setTrackError(null);
    fetch(`/api/f1/live/track?session_key=${sessionKey}`)
      .then(async (r) => {
        const d = await r.json();
        if (!alive) return;
        if (!r.ok) setTrackError(d.error || 'Track unavailable');
        else setTrack(d);
      })
      .catch(() => alive && setTrackError('Track unavailable'));
    return () => { alive = false; };
  }, [sessionKey]);

  /* reset buffers when the session changes */
  useEffect(() => {
    chunks.current.clear();
    loading.current.clear();
    liveBuf.current = {};
    liveAnchor.current = null;
    playheadRef.current = start;
    setUiT(start);
    setPlaying(false);
  }, [sessionKey, start]);

  /* live polling */
  useEffect(() => {
    if (!live) return;
    let alive = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/f1/live/locations?session_key=${sessionKey}&live=1`);
        const data: DriverSamples = await r.json();
        if (!alive) return;
        let latest = 0;
        for (const [k, arr] of Object.entries(data)) {
          const n = Number(k);
          const merged = [...(liveBuf.current[n] ?? []), ...arr].sort((a, b) => a[0] - b[0]);
          const dedup = merged.filter((s, i) => i === 0 || s[0] !== merged[i - 1][0]);
          const cutoff = (dedup[dedup.length - 1]?.[0] ?? 0) - 30_000;
          liveBuf.current[n] = dedup.filter((s) => s[0] >= cutoff);
          latest = Math.max(latest, dedup[dedup.length - 1]?.[0] ?? 0);
        }
        if (latest) {
          if (!liveAnchor.current || latest - LIVE_LAG_MS > liveAnchor.current.t + (Date.now() - liveAnchor.current.client) + 1500) {
            liveAnchor.current = { t: latest - LIVE_LAG_MS, client: Date.now() };
          }
          setLiveStale(false);
        } else {
          setLiveStale(true);
        }
      } catch {
        setLiveStale(true);
      }
    };
    poll();
    const iv = setInterval(poll, 2500);
    return () => { alive = false; clearInterval(iv); };
  }, [live, sessionKey]);

  /* replay chunk loader */
  const ensureChunks = (T: number) => {
    if (live || !replay) return;
    const base = Math.floor(T / CHUNK_MS) * CHUNK_MS;
    for (const c of [base, base + CHUNK_MS, base + 2 * CHUNK_MS]) {
      if (c > end || c + CHUNK_MS < start) continue;
      if (chunks.current.has(c) || loading.current.has(c)) continue;
      loading.current.add(c);
      fetch(`/api/f1/live/locations?session_key=${sessionKey}&from=${c}&to=${c + CHUNK_MS}`)
        .then((r) => r.json())
        .then((d: DriverSamples) => chunks.current.set(c, d))
        .catch(() => undefined)
        .finally(() => loading.current.delete(c));
    }
    // Drop chunks far from the playhead to bound memory.
    for (const k of chunks.current.keys()) if (Math.abs(k - base) > 6 * CHUNK_MS) chunks.current.delete(k);
  };

  const positionAt = (driver: number, T: number): [number, number] | null => {
    if (live) return interpolate(liveBuf.current[driver], T);
    const base = Math.floor(T / CHUNK_MS) * CHUNK_MS;
    const cur = chunks.current.get(base)?.[driver];
    const prevArr = chunks.current.get(base - CHUNK_MS)?.[driver];
    const nextArr = chunks.current.get(base + CHUNK_MS)?.[driver];
    return interpolate(cur, T, prevArr?.[prevArr.length - 1], nextArr?.[0]);
  };

  const proj = useMemo(() => (track ? makeProjector(track.bounds) : null), [track]);

  /* animation loop — writes transforms directly to the DOM for smooth 60fps motion */
  useEffect(() => {
    if (!proj) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      let T: number;
      if (live) {
        const a = liveAnchor.current;
        T = a ? a.t + (Date.now() - a.client) : 0;
      } else {
        if (playingRef.current) {
          playheadRef.current = Math.min(end, playheadRef.current + dt * speedRef.current);
          if (playheadRef.current >= end) setPlaying(false);
        }
        T = playheadRef.current;
        ensureChunks(T);
      }

      let missing = 0;
      for (const d of drivers) {
        const el = carRefs.current.get(d.number);
        if (!el) continue;
        const pos = T ? positionAt(d.number, T) : null;
        if (!pos) { el.style.opacity = '0'; missing++; continue; }
        const [px, py] = proj.p(pos[0], pos[1]);
        el.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)})`);
        el.style.opacity = '1';
      }

      if (now - lastUi > 250) {
        lastUi = now;
        setUiT(T);
        setBuffering(!live && missing === drivers.length && drivers.length > 0);
        if (T) onTimeRef.current?.(T);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proj, live, drivers, start, end, sessionKey]);

  const seek = (T: number) => {
    playheadRef.current = Math.min(end, Math.max(start, T));
    setUiT(playheadRef.current);
    ensureChunks(playheadRef.current);
  };

  const trackPoints = useMemo(() => {
    if (!track || !proj) return '';
    return track.path.map(([x, y]) => proj.p(x, y).map((v) => v.toFixed(1)).join(',')).join(' ');
  }, [track, proj]);

  const sf = useMemo(() => {
    if (!track || !proj || track.path.length < 3) return null;
    const [a, b] = [proj.p(...track.path[0]), proj.p(...track.path[2])];
    const ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
    return { x: a[0], y: a[1], ang };
  }, [track, proj]);

  const lap = uiT ? lapAt(uiT) : null;
  const leader = uiT ? leaderAt(uiT) : null;
  const orderedDrivers = useMemo(() => {
    // Selected driver is rendered last so it sits on top.
    return [...drivers].sort((a, b) => (a.number === selected ? 1 : 0) - (b.number === selected ? 1 : 0));
  }, [drivers, selected]);

  return (
    <div className="relative flex flex-col h-full" style={{ minHeight: 420 }}>
      {/* Top overlay: mode + lap */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {live ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest" style={{ background: 'var(--red)', color: '#fff' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-live-pulse" /> LIVE GPS
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-mid)', color: 'var(--text-secondary)' }}>
              <MapPinned className="w-3 h-3" /> SESSION REPLAY
            </span>
          )}
          {buffering && (
            <span className="flex items-center gap-1 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <Loader2 className="w-3 h-3 animate-spin" /> buffering GPS…
            </span>
          )}
        </div>
        {(lap || totalLaps) && (
          <div className="text-right pointer-events-auto px-3 py-1.5 rounded-lg" style={{ background: 'rgba(11,11,14,0.75)', border: '1px solid var(--border-dim)', backdropFilter: 'blur(6px)' }}>
            <div className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>LAP</div>
            <div className="font-display font-black text-2xl leading-none tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {lap ?? '—'}
              {totalLaps ? <span className="text-sm" style={{ color: 'var(--text-muted)' }}> / {totalLaps}</span> : null}
            </div>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative flex items-center justify-center">
        {!track && !trackError && (
          <div className="flex flex-col items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <Loader2 className="w-5 h-5 animate-spin" /> Tracing circuit from car GPS…
          </div>
        )}
        {trackError && (
          <div className="text-xs font-mono text-center px-6" style={{ color: 'var(--text-muted)' }}>
            {trackError}. The map appears once OpenF1 publishes car position data for this session.
          </div>
        )}
        {track && proj && (
          <svg viewBox={`0 0 ${proj.vbW.toFixed(0)} ${proj.vbH.toFixed(0)}`} className="w-full h-full" style={{ maxHeight: 560 }} role="img" aria-label="Circuit map with live car positions">
            <defs>
              <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <pattern id="chequer" width="8" height="8" patternUnits="userSpaceOnUse">
                <rect width="8" height="8" fill="#fff" />
                <rect width="4" height="4" fill="#111" />
                <rect x="4" y="4" width="4" height="4" fill="#111" />
              </pattern>
            </defs>
            <polygon points={trackPoints} fill="none" stroke="var(--red)" strokeOpacity="0.18" strokeWidth="34" filter="url(#trackGlow)" strokeLinejoin="round" />
            <polygon points={trackPoints} fill="none" stroke="#2A2A33" strokeWidth="26" strokeLinejoin="round" />
            <polygon points={trackPoints} fill="none" stroke="#3B3B46" strokeWidth="18" strokeLinejoin="round" />
            <polygon points={trackPoints} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeDasharray="10 14" strokeLinejoin="round" />
            {sf && (
              <g transform={`translate(${sf.x} ${sf.y}) rotate(${sf.ang + 90})`}>
                <rect x="-16" y="-4" width="32" height="8" fill="url(#chequer)" />
              </g>
            )}

            {orderedDrivers.map((d) => {
              const isSel = d.number === selected;
              const isLeader = d.number === leader;
              return (
                <g
                  key={d.number}
                  ref={(el) => { if (el) carRefs.current.set(d.number, el); else carRefs.current.delete(d.number); }}
                  style={{ opacity: 0, cursor: 'pointer', transition: 'opacity 300ms' }}
                  onClick={() => onSelect(d.number)}
                >
                  {isSel && <circle r="24" fill="none" stroke={d.color} strokeWidth="3" className="animate-live-pulse" />}
                  {isLeader && <circle r="18" fill="none" stroke="var(--amber)" strokeWidth="3" />}
                  <circle r={isSel ? 14 : 11} fill={d.color} stroke="#0B0B0E" strokeWidth="3" />
                  {(labels || isSel) && (
                    <g transform="translate(16 -14)">
                      <rect x="-3" y="-15" width={d.code.length * 12 + 8} height="21" rx="3" fill="rgba(11,11,14,0.85)" stroke={isSel ? d.color : 'transparent'} />
                      <text x="1" y="1" fontSize="17" fontWeight="800" fill="#F4F4F1" fontFamily="var(--font-mono)">{d.code}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        )}
        {live && liveStale && track && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono px-3 py-1.5 rounded-full flex items-center gap-1.5" style={{ background: 'var(--amber-subtle)', color: 'var(--amber)', border: '1px solid rgba(245,184,0,0.3)' }}>
            <Radio className="w-3 h-3" /> Waiting for OpenF1 GPS feed — retrying every 2.5s
          </div>
        )}
      </div>

      {/* Replay controls */}
      {!live && replay && track && (
        <div className="px-3 pb-3 pt-2 space-y-2" style={{ borderTop: '1px solid var(--border-dim)' }}>
          <input
            type="range"
            min={start}
            max={end}
            step={1000}
            value={uiT || start}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-full accent-[var(--red)] cursor-pointer"
            aria-label="Replay timeline"
            id="replay-scrubber"
          />
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button id="replay-start" onClick={() => seek(start)} className="btn-ghost p-1.5 rounded-md" title="Back to start"><SkipBack className="w-3.5 h-3.5" /></button>
              <button
                id="replay-play"
                onClick={() => { if (playheadRef.current >= end) seek(start); setPlaying((p) => !p); }}
                className="btn-red flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {playing ? 'Pause' : 'Play replay'}
              </button>
              <button id="replay-end" onClick={() => seek(end - 5000)} className="btn-ghost p-1.5 rounded-md" title="Jump to chequered flag"><SkipForward className="w-3.5 h-3.5" /></button>
              <span className="text-[11px] font-mono tabular-nums ml-1" style={{ color: 'var(--text-secondary)' }}>
                {fmtClock((uiT || start) - start)} <span style={{ color: 'var(--text-muted)' }}>/ {fmtClock(end - start)}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2 py-1 rounded text-[10px] font-mono font-bold"
                  style={{
                    background: speed === s ? 'var(--text-primary)' : 'var(--bg-overlay)',
                    color: speed === s ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-dim)',
                  }}
                >
                  {s}×
                </button>
              ))}
              <button
                onClick={() => setLabels((l) => !l)}
                className="ml-1 p-1.5 rounded"
                title="Toggle driver labels"
                style={{ background: labels ? 'var(--bg-highlight)' : 'transparent', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}
              >
                <Tag className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
