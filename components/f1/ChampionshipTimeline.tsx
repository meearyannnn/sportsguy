'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { buildSeasonTimeline, SeasonTimeline } from '@/lib/f1/championshipChart';
import { Play, Pause, RotateCcw, TrendingUp } from 'lucide-react';

interface ChampionshipTimelineProps {
  season?: string;
}

// ── SVG Line Chart ─────────────────────────────────────────────────────────────

function TimelineChart({
  timeline,
  animateToRound,
  selectedDrivers,
  gapMode,
}: {
  timeline: SeasonTimeline;
  animateToRound: number;
  selectedDrivers: Set<string>;
  gapMode: boolean;
}) {
  const WIDTH = 680;
  const HEIGHT = 300;
  const PAD = { top: 16, right: 80, bottom: 32, left: 52 };
  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  const visibleRounds = timeline.rounds.slice(0, animateToRound);
  if (visibleRounds.length === 0) return null;

  const leaderPoints = (round: (typeof timeline.rounds)[0]) =>
    Math.max(...timeline.driverIds.map((id) => round.driverPoints[id] ?? 0), 1);

  // Compute Y values
  function getY(round: (typeof timeline.rounds)[0], driverId: string): number {
    const raw = round.driverPoints[driverId] ?? 0;
    if (gapMode) {
      const leader = leaderPoints(round);
      return leader - raw; // gap to leader (0 = leader, higher = further behind)
    }
    return raw;
  }

  const allY = visibleRounds.flatMap((r) =>
    timeline.driverIds
      .filter((id) => selectedDrivers.has(id))
      .map((id) => getY(r, id))
  );
  const maxY = Math.max(...allY, 1);
  const minY = gapMode ? 0 : 0;

  const xScale = (roundIdx: number) =>
    PAD.left + (roundIdx / Math.max(visibleRounds.length - 1, 1)) * chartW;

  const yScale = (val: number) => {
    if (gapMode) {
      // 0 at top (leader), positive values go down
      return PAD.top + (val / Math.max(maxY, 1)) * chartH;
    }
    return PAD.top + chartH - ((val - minY) / Math.max(maxY - minY, 1)) * chartH;
  };

  // Y grid lines
  const yTicks = [];
  const yStep = gapMode ? Math.ceil(maxY / 4 / 10) * 10 : Math.ceil(maxY / 5 / 25) * 25;
  for (let v = 0; v <= maxY; v += yStep) yTicks.push(v);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[400px]"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {/* Grid lines */}
        {yTicks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yScale(v)}
              x2={PAD.left + chartW}
              y2={yScale(v)}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
              strokeDasharray="3,4"
            />
            <text
              x={PAD.left - 6}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.25)"
            >
              {gapMode ? (v === 0 ? 'Leader' : `+${v}`) : v}
            </text>
          </g>
        ))}

        {/* Round labels (x-axis) */}
        {visibleRounds.map((r, i) => {
          if (i % Math.ceil(visibleRounds.length / 10) !== 0 && i !== visibleRounds.length - 1) return null;
          return (
            <text
              key={r.round}
              x={xScale(i)}
              y={PAD.top + chartH + 14}
              textAnchor="middle"
              fontSize="7.5"
              fill="rgba(255,255,255,0.30)"
            >
              R{r.round}
            </text>
          );
        })}

        {/* Driver lines */}
        {timeline.driverIds
          .filter((id) => selectedDrivers.has(id))
          .map((driverId) => {
            const color = timeline.constructorColors[driverId] ?? '#888888';
            const points = visibleRounds.map((r, i) => ({
              x: xScale(i),
              y: yScale(getY(r, driverId)),
            }));
            const pathD = points
              .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
              .join(' ');

            const last = points[points.length - 1];
            const lastRound = visibleRounds[visibleRounds.length - 1];
            const lastPts = getY(lastRound, driverId);

            return (
              <g key={driverId}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.85}
                />
                {/* End dot */}
                <circle cx={last.x} cy={last.y} r="3" fill={color} />
                {/* Label */}
                <text
                  x={last.x + 5}
                  y={last.y}
                  dominantBaseline="middle"
                  fontSize="8"
                  fill={color}
                  fontFamily="var(--font-display)"
                  fontWeight="700"
                  letterSpacing="0.5"
                >
                  {timeline.driverCodes[driverId]}
                </text>
              </g>
            );
          })}
      </svg>
    </div>
  );
}

// ── Driver Toggle Pill ─────────────────────────────────────────────────────────

function DriverPill({
  driverId,
  name,
  color,
  selected,
  onToggle,
}: {
  driverId: string;
  name: string;
  color: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-hud uppercase tracking-wider transition-all duration-150"
      style={{
        backgroundColor: selected ? `${color}18` : 'var(--bg-raised)',
        borderColor: selected ? color : 'var(--border-dim)',
        color: selected ? color : 'var(--text-muted)',
        opacity: selected ? 1 : 0.6,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </button>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ChampionshipTimeline({ season = 'current' }: ChampionshipTimelineProps) {
  const [timeline, setTimeline] = useState<SeasonTimeline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animateToRound, setAnimateToRound] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [gapMode, setGapMode] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [selectedSeason, setSelectedSeason] = useState(season);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const SEASONS = ['current', '2025', '2024', '2023', '2022', '2021', '2020'];

  const load = useCallback(async (s: string) => {
    setLoading(true);
    setError(null);
    setPlaying(false);
    setAnimateToRound(0);
    try {
      const data = await buildSeasonTimeline(s, 8);
      if (!data) { setError('No completed race data found for this season.'); return; }
      setTimeline(data);
      setSelectedDrivers(new Set(data.driverIds));
      // Show all rounds at start
      setAnimateToRound(data.rounds.length);
    } catch {
      setError('Failed to load championship data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(selectedSeason); }, [selectedSeason]);

  // Animation controller
  useEffect(() => {
    if (!playing || !timeline) return;
    intervalRef.current = setInterval(() => {
      setAnimateToRound((prev) => {
        if (prev >= timeline.rounds.length) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, timeline]);

  const handlePlay = () => {
    if (!timeline) return;
    if (animateToRound >= timeline.rounds.length) {
      setAnimateToRound(1);
    }
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setAnimateToRound(timeline?.rounds.length ?? 0);
  };

  const toggleDriver = (id: string) => {
    setSelectedDrivers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Championship Timeline
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Points progression round by round
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-lg border bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border-dim)] outline-none cursor-pointer"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s === 'current' ? '2026' : s}</option>
            ))}
          </select>

          {/* Gap mode toggle */}
          <button
            onClick={() => setGapMode((g) => !g)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-hud uppercase tracking-wider transition-all duration-150"
            style={{
              backgroundColor: gapMode ? 'var(--red-subtle)' : 'var(--bg-raised)',
              borderColor: gapMode ? 'var(--red)' : 'var(--border-dim)',
              color: gapMode ? 'var(--red)' : 'var(--text-muted)',
            }}
          >
            <TrendingUp size={12} />
            Gap Mode
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Building season timeline…</span>
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {timeline && !loading && (
        <>
          {/* Driver toggles */}
          <div className="flex flex-wrap gap-2">
            {timeline.driverIds.map((id) => (
              <DriverPill
                key={id}
                driverId={id}
                name={timeline.driverCodes[id] ?? id}
                color={timeline.constructorColors[id] ?? '#888'}
                selected={selectedDrivers.has(id)}
                onToggle={() => toggleDriver(id)}
              />
            ))}
          </div>

          {/* Chart */}
          <div
            className="rounded-xl border overflow-hidden p-4"
            style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
          >
            <TimelineChart
              timeline={timeline}
              animateToRound={animateToRound}
              selectedDrivers={selectedDrivers}
              gapMode={gapMode}
            />
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={playing ? () => setPlaying(false) : handlePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-hud text-xs font-bold uppercase tracking-wider transition-all duration-150"
              style={{ backgroundColor: 'var(--red)', color: '#fff' }}
            >
              {playing ? <Pause size={12} /> : <Play size={12} />}
              {playing ? 'Pause' : 'Animate'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border font-hud text-xs uppercase tracking-wider transition-colors duration-150 text-[var(--text-muted)] border-[var(--border-dim)] hover:border-[var(--border-mid)]"
            >
              <RotateCcw size={12} />
              Reset
            </button>

            {/* Round scrubber */}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={timeline.rounds.length}
                value={animateToRound}
                onChange={(e) => {
                  setPlaying(false);
                  setAnimateToRound(parseInt(e.target.value, 10));
                }}
                className="flex-1 accent-[var(--red)]"
              />
              <span className="font-mono text-xs text-[var(--text-muted)] shrink-0">
                R{animateToRound} / {timeline.rounds.length}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
