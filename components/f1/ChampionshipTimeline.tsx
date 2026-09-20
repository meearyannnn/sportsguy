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
  hoverRound,
  onHoverRound,
}: {
  timeline: SeasonTimeline;
  animateToRound: number;
  selectedDrivers: Set<string>;
  gapMode: boolean;
  hoverRound: number | null;
  onHoverRound: (round: number | null) => void;
}) {
  const WIDTH = 760;
  const HEIGHT = 320;
  const PAD = { top: 20, right: 96, bottom: 36, left: 52 };
  const chartW = WIDTH - PAD.left - PAD.right;
  const chartH = HEIGHT - PAD.top - PAD.bottom;

  // 1. Filter out any round with no results before drawing the chart
  const heldRounds = timeline.rounds.filter((r) => {
    if (!r.driverPoints) return false;
    const scores = Object.values(r.driverPoints).filter(
      (v): v is number => typeof v === 'number' && !isNaN(v) && v > 0
    );
    return scores.length > 0;
  });

  const visibleRounds = heldRounds.slice(0, Math.min(animateToRound, heldRounds.length));
  if (visibleRounds.length === 0) return null;

  const leaderPoints = (round: (typeof timeline.rounds)[0]) => {
    const pts = timeline.driverIds
      .map((id) => round.driverPoints[id])
      .filter((v): v is number => typeof v === 'number' && !isNaN(v));
    return Math.max(...pts, 1);
  };

  // Compute Y values; return null if missing or undefined
  function getY(round: (typeof timeline.rounds)[0], driverId: string): number | null {
    const raw = round.driverPoints[driverId];
    if (raw === null || raw === undefined || typeof raw !== 'number' || isNaN(raw)) {
      return null;
    }
    if (gapMode) {
      const leader = leaderPoints(round);
      return Math.max(0, leader - raw); // gap to leader (0 = leader, higher = further behind)
    }
    return raw;
  }

  const allY = visibleRounds.flatMap((r) =>
    timeline.driverIds
      .filter((id) => selectedDrivers.has(id))
      .map((id) => getY(r, id))
      .filter((v): v is number => v !== null)
  );
  const maxY = Math.max(...allY, 1);
  const minY = 0;

  const xScale = (roundIdx: number) =>
    PAD.left + (roundIdx / Math.max(visibleRounds.length - 1, 1)) * chartW;

  const yScale = (val: number) => {
    if (gapMode) {
      // 0 at top (leader), higher gaps go down
      return PAD.top + (val / Math.max(maxY, 1)) * chartH;
    }
    return PAD.top + chartH - ((val - minY) / Math.max(maxY - minY, 1)) * chartH;
  };

  // Y grid lines
  const yTicks = [];
  const yStep = gapMode ? Math.max(10, Math.ceil(maxY / 4 / 10) * 10) : Math.max(25, Math.ceil(maxY / 5 / 25) * 25);
  for (let v = 0; v <= maxY; v += yStep) yTicks.push(v);
  if (!yTicks.includes(0)) yTicks.unshift(0);

  const activeDriverIds = timeline.driverIds.filter((id) => selectedDrivers.has(id));

  // Build each driver's valid points series — stops at last real round
  const driverData = new Map<
    string,
    {
      points: { x: number; y: number; pts: number; roundIdx: number }[];
      last: { x: number; y: number; pts: number; roundIdx: number };
    }
  >();

  activeDriverIds.forEach((driverId) => {
    const points: { x: number; y: number; pts: number; roundIdx: number }[] = [];
    visibleRounds.forEach((r, i) => {
      const yVal = getY(r, driverId);
      const rawPts = r.driverPoints[driverId];
      if (yVal !== null && typeof rawPts === 'number' && !isNaN(rawPts)) {
        points.push({
          x: xScale(i),
          y: yScale(yVal),
          pts: rawPts,
          roundIdx: i,
        });
      }
    });

    if (points.length > 0) {
      driverData.set(driverId, {
        points,
        last: points[points.length - 1],
      });
    }
  });

  // Anti-collision label positioning for the end of each driver's real line
  const labels = activeDriverIds
    .filter((id) => driverData.has(id))
    .map((id) => {
      const d = driverData.get(id)!;
      return {
        id,
        code: timeline.driverCodes[id] ?? id.slice(0, 3).toUpperCase(),
        color: timeline.constructorColors[id] ?? '#888888',
        pts: d.last.pts,
        rawY: d.last.y,
        y: d.last.y,
        x: d.last.x,
      };
    })
    .sort((a, b) => a.rawY - b.rawY);

  // Anti-overlap relaxation algorithm
  const MIN_SPACING = 12;
  for (let i = 1; i < labels.length; i++) {
    if (labels[i].y - labels[i - 1].y < MIN_SPACING) {
      labels[i].y = labels[i - 1].y + MIN_SPACING;
    }
  }
  for (let i = labels.length - 2; i >= 0; i--) {
    if (labels[i + 1].y - labels[i].y < MIN_SPACING) {
      labels[i].y = labels[i + 1].y - MIN_SPACING;
    }
  }

  const labelMap = new Map(labels.map((l) => [l.id, l]));
  const activeHoverIdx = hoverRound !== null ? visibleRounds.findIndex((r) => r.round === hoverRound) : -1;

  return (
    <div className="w-full overflow-x-auto select-none touch-scroll">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full min-w-[540px]"
        style={{ fontFamily: 'var(--font-mono)' }}
        onMouseLeave={() => onHoverRound(null)}
      >
        {/* Y Grid lines */}
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
              x={PAD.left - 8}
              y={yScale(v)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="8"
              fill="rgba(255,255,255,0.30)"
            >
              {gapMode ? (v === 0 ? 'Leader' : `+${v}`) : v}
            </text>
          </g>
        ))}

        {/* Round labels (x-axis) */}
        {visibleRounds.map((r, i) => {
          const step = Math.max(1, Math.ceil(visibleRounds.length / 12));
          if (i % step !== 0 && i !== visibleRounds.length - 1) return null;
          return (
            <text
              key={r.round}
              x={xScale(i)}
              y={PAD.top + chartH + 16}
              textAnchor="middle"
              fontSize="7.5"
              fill="rgba(255,255,255,0.35)"
            >
              R{r.round}
            </text>
          );
        })}

        {/* Hover vertical line */}
        {activeHoverIdx >= 0 && (
          <line
            x1={xScale(activeHoverIdx)}
            y1={PAD.top}
            x2={xScale(activeHoverIdx)}
            y2={PAD.top + chartH}
            stroke="var(--red)"
            strokeWidth="1.5"
            strokeDasharray="2,2"
            opacity={0.7}
          />
        )}

        {/* Driver lines */}
        {activeDriverIds.map((driverId) => {
          const d = driverData.get(driverId);
          if (!d || d.points.length === 0) return null;

          const color = timeline.constructorColors[driverId] ?? '#888888';
          const pathD = d.points
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
            .join(' ');

          const last = d.last;
          const labelInfo = labelMap.get(driverId);
          const labelY = labelInfo ? labelInfo.y : last.y;

          return (
            <g key={driverId}>
              {/* Path */}
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.88}
              />
              {/* Point on last round */}
              <circle cx={last.x} cy={last.y} r="3" fill={color} />

              {/* Connecting leader line if label was adjusted */}
              {Math.abs(labelY - last.y) > 2 && (
                <line
                  x1={last.x}
                  y1={last.y}
                  x2={last.x + 8}
                  y2={labelY}
                  stroke={color}
                  strokeWidth="0.8"
                  opacity={0.4}
                />
              )}

              {/* Anti-collision label */}
              <text
                x={last.x + 10}
                y={labelY}
                dominantBaseline="middle"
                fontSize="8"
                fill={color}
                fontFamily="var(--font-display)"
                fontWeight="800"
                letterSpacing="0.4"
              >
                {timeline.driverCodes[driverId]}{' '}
                <tspan fontSize="7" opacity="0.85" fontFamily="var(--font-mono)">
                  {gapMode
                    ? `+${Math.max(0, leaderPoints(visibleRounds[last.roundIdx]) - last.pts)}`
                    : last.pts}
                </tspan>
              </text>
            </g>
          );
        })}

        {/* Invisible hit targets for round hovering */}
        {visibleRounds.map((r, i) => (
          <rect
            key={r.round}
            x={xScale(i) - (chartW / visibleRounds.length) / 2}
            y={PAD.top}
            width={chartW / visibleRounds.length}
            height={chartH}
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => onHoverRound(r.round)}
            onClick={() => onHoverRound(r.round)}
          />
        ))}
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
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[10px] font-hud uppercase tracking-wider transition-all duration-150 cursor-pointer"
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
  const [hoverRound, setHoverRound] = useState<number | null>(null);
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

          {/* Active / Hovered Round HUD */}
          {(() => {
            const activeRoundObj = timeline.rounds.find(
              (r) => r.round === (hoverRound ?? animateToRound)
            ) ?? timeline.rounds[timeline.rounds.length - 1];

            if (!activeRoundObj) return null;

            const sortedStanding = timeline.driverIds
              .filter((id) => selectedDrivers.has(id))
              .map((id) => ({
                id,
                code: timeline.driverCodes[id] ?? id,
                color: timeline.constructorColors[id] ?? '#888',
                pts: activeRoundObj.driverPoints[id] ?? 0,
              }))
              .sort((a, b) => b.pts - a.pts);

            return (
              <div
                className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border flex-wrap text-xs"
                style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--red)]/15 text-[var(--red)] font-bold">
                    Round {activeRoundObj.round}
                  </span>
                  <span className="font-hud font-bold text-[var(--text-primary)]">
                    {activeRoundObj.raceName}
                  </span>
                  {hoverRound && (
                    <span className="text-[10px] font-mono text-[var(--text-muted)] italic">
                      (hovering)
                    </span>
                  )}
                </div>

                {/* Micro standings badges for this round */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5">
                  {sortedStanding.slice(0, 6).map((d, rank) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-dim)] font-mono text-[10px] shrink-0"
                    >
                      <span className="text-[var(--text-muted)]">{rank + 1}.</span>
                      <span className="font-bold" style={{ color: d.color }}>{d.code}</span>
                      <span className="text-[var(--text-primary)] font-semibold">{d.pts} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

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
              hoverRound={hoverRound}
              onHoverRound={setHoverRound}
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
