'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, RefreshCw, Minus, BarChart2, Activity } from 'lucide-react';
import { DRIVER_DETAILS, F1_TEAMS, getTeamMeta } from '@/lib/f1/teams';
import { getH2HStats, H2HStats, H2HSeasonSummary } from '@/lib/f1/battle';
import { DriverStanding } from '@/lib/f1/types';

interface BattleCenterProps {
  driverStandings: DriverStanding[];
}

// ── Utility ───────────────────────────────────────────────────────────────────

const AVAILABLE_SEASONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

function formatQualiDelta(ms: number | null): string {
  if (ms === null) return '—';
  const abs = Math.abs(ms);
  const sign = ms < 0 ? '-' : '+';
  if (abs < 1000) return `${sign}${abs}ms`;
  return `${sign}${(abs / 1000).toFixed(3)}s`;
}

// ── Radar Chart (pure SVG) ────────────────────────────────────────────────────

const RADAR_AXES = ['Qualifying', 'Race Pace', 'Podiums', 'Wins', 'Consistency', 'Fastest Laps'];
const RADAR_KEYS: (keyof H2HStats['radar'])[] = [
  'qualifying', 'racePace', 'podiums', 'wins', 'consistency', 'fastestLaps',
];

function RadarChart({
  radar,
  colorA,
  colorB,
}: {
  radar: H2HStats['radar'];
  colorA: string;
  colorB: string;
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 78;
  const n = RADAR_AXES.length;
  const angles = RADAR_AXES.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);

  function polar(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  function buildPath(scores: number[]) {
    return scores
      .map((s, i) => {
        const { x, y } = polar(angles[i], (s / 100) * r);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ') + 'Z';
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[220px]">
      {/* Grid rings */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={angles.map((angle) => {
            const { x, y } = polar(angle, r * level);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}

      {/* Spokes */}
      {angles.map((angle, i) => {
        const outer = polar(angle, r);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x.toFixed(1)}
            y2={outer.y.toFixed(1)}
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="1"
          />
        );
      })}

      {/* Driver B area */}
      <path
        d={buildPath(RADAR_KEYS.map((k) => radar[k][1]))}
        fill={`${colorB}22`}
        stroke={colorB}
        strokeWidth="1.5"
        strokeOpacity={0.7}
      />

      {/* Driver A area */}
      <path
        d={buildPath(RADAR_KEYS.map((k) => radar[k][0]))}
        fill={`${colorA}22`}
        stroke={colorA}
        strokeWidth="1.5"
        strokeOpacity={0.9}
      />

      {/* Labels */}
      {RADAR_AXES.map((label, i) => {
        const { x, y } = polar(angles[i], r + 14);
        return (
          <text
            key={i}
            x={x.toFixed(1)}
            y={y.toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="rgba(255,255,255,0.45)"
            fontFamily="var(--font-display)"
            letterSpacing="0.5"
          >
            {label.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

// ── Stat Row ──────────────────────────────────────────────────────────────────

function StatBar({
  label,
  aVal,
  bVal,
  colorA,
  colorB,
  suffix = '',
  lowerIsBetter = false,
}: {
  label: string;
  aVal: number;
  bVal: number;
  colorA: string;
  colorB: string;
  suffix?: string;
  lowerIsBetter?: boolean;
}) {
  const total = aVal + bVal;
  const aWidth = total > 0 ? (aVal / total) * 100 : 50;
  const bWidth = total > 0 ? (bVal / total) * 100 : 50;
  const aLeads = lowerIsBetter ? aVal < bVal : aVal > bVal;
  const bLeads = lowerIsBetter ? bVal < aVal : bVal > aVal;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: aLeads ? colorA : 'var(--text-secondary)' }}
        >
          {aVal}{suffix}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-hud">
          {label}
        </span>
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: bLeads ? colorB : 'var(--text-secondary)' }}
        >
          {bVal}{suffix}
        </span>
      </div>
      <div className="flex h-1 rounded-full overflow-hidden gap-px">
        <div
          className="rounded-l-full transition-all duration-700"
          style={{ width: `${aWidth}%`, backgroundColor: colorA, opacity: 0.8 }}
        />
        <div
          className="rounded-r-full transition-all duration-700"
          style={{ width: `${bWidth}%`, backgroundColor: colorB, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

// ── Driver Selector ───────────────────────────────────────────────────────────

function DriverSelector({
  selectedId,
  onSelect,
  excludeId,
  driverStandings,
  accentColor,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  excludeId: string | null;
  driverStandings: DriverStanding[];
  accentColor: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const detail = selectedId ? DRIVER_DETAILS[selectedId] : null;
  const team = detail ? getTeamMeta(detail.teamId) : null;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const options = driverStandings.filter(
    (ds) => ds.Driver.driverId !== excludeId
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150"
        style={{
          backgroundColor: 'var(--bg-raised)',
          borderColor: open ? accentColor : 'var(--border-dim)',
          boxShadow: open ? `0 0 0 1px ${accentColor}40` : 'none',
        }}
      >
        {detail && team ? (
          <>
            <span
              className="w-1 h-8 rounded-full shrink-0"
              style={{ backgroundColor: team.color }}
            />
            <div className="text-left min-w-0">
              <div className="font-hud text-sm font-bold text-[var(--text-primary)] uppercase tracking-wide">
                {detail.code}
              </div>
              <div className="text-xs text-[var(--text-muted)] truncate">{team.name}</div>
            </div>
          </>
        ) : (
          <span className="text-sm text-[var(--text-muted)]">Select Driver</span>
        )}
        <ChevronDown
          size={14}
          className="ml-auto shrink-0 text-[var(--text-muted)] transition-transform duration-150"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 top-full mt-1 w-full rounded-lg border shadow-lg overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-overlay)',
            borderColor: 'var(--border-mid)',
            boxShadow: 'var(--shadow-modal)',
            maxHeight: '220px',
            overflowY: 'auto',
          }}
        >
          {options.map((ds) => {
            const d = DRIVER_DETAILS[ds.Driver.driverId];
            const t = d ? getTeamMeta(d.teamId) : null;
            return (
              <button
                key={ds.Driver.driverId}
                onClick={() => { onSelect(ds.Driver.driverId); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-highlight)] transition-colors duration-100"
              >
                {t && <span className="w-0.5 h-6 rounded-full shrink-0" style={{ backgroundColor: t.color }} />}
                <div>
                  <div className="font-hud text-xs font-bold uppercase tracking-wide text-[var(--text-primary)]">
                    {ds.Driver.code ?? ds.Driver.familyName}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {ds.Driver.givenName} {ds.Driver.familyName}
                  </div>
                </div>
                <span className="ml-auto font-mono text-xs text-[var(--text-secondary)]">
                  P{ds.position}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function BattleCenter({ driverStandings }: BattleCenterProps) {
  const [driverAId, setDriverAId] = useState<string | null>('antonelli');
  const [driverBId, setDriverBId] = useState<string | null>('norris');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['2026', '2025']);
  const [stats, setStats] = useState<H2HStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'season'>('overview');

  const teamA = driverAId ? getTeamMeta(DRIVER_DETAILS[driverAId]?.teamId ?? '') : null;
  const teamB = driverBId ? getTeamMeta(DRIVER_DETAILS[driverBId]?.teamId ?? '') : null;
  const colorA = teamA?.color ?? '#27F4D2';
  const colorB = teamB?.color ?? '#FF8000';

  const detailA = driverAId ? DRIVER_DETAILS[driverAId] : null;
  const detailB = driverBId ? DRIVER_DETAILS[driverBId] : null;
  const standingA = driverStandings.find((ds) => ds.Driver.driverId === driverAId);
  const standingB = driverStandings.find((ds) => ds.Driver.driverId === driverBId);

  const run = useCallback(async () => {
    if (!driverAId || !driverBId || selectedSeasons.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getH2HStats(driverAId, driverBId, selectedSeasons);
      setStats(result);
    } catch {
      setError('Failed to load battle data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [driverAId, driverBId, selectedSeasons]);

  // Auto-run whenever drivers or seasons change
  useEffect(() => {
    run();
  }, [run]);

  const toggleSeason = (s: string) => {
    setSelectedSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Battle Center
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Head-to-head driver comparison across seasons
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {['overview', 'season'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as any)}
              className="px-3 py-1.5 text-[10px] uppercase tracking-widest font-hud font-bold rounded transition-all duration-150"
              style={{
                backgroundColor: activeView === view ? 'var(--red)' : 'var(--bg-raised)',
                color: activeView === view ? '#fff' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: activeView === view ? 'var(--red)' : 'var(--border-dim)',
              }}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Driver Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
            Driver A
          </label>
          <DriverSelector
            selectedId={driverAId}
            onSelect={setDriverAId}
            excludeId={driverBId}
            driverStandings={driverStandings}
            accentColor={colorA}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
            Driver B
          </label>
          <DriverSelector
            selectedId={driverBId}
            onSelect={setDriverBId}
            excludeId={driverAId}
            driverStandings={driverStandings}
            accentColor={colorB}
          />
        </div>
      </div>

      {/* Season Selector + Run */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)] shrink-0">
          Seasons
        </span>
        {AVAILABLE_SEASONS.map((s) => (
          <button
            key={s}
            onClick={() => toggleSeason(s)}
            className="px-2.5 py-1 text-[11px] font-mono rounded border transition-all duration-150"
            style={{
              backgroundColor: selectedSeasons.includes(s) ? 'var(--red-subtle)' : 'var(--bg-raised)',
              borderColor: selectedSeasons.includes(s) ? 'var(--red)' : 'var(--border-dim)',
              color: selectedSeasons.includes(s) ? 'var(--red)' : 'var(--text-muted)',
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={run}
          disabled={loading || !driverAId || !driverBId || selectedSeasons.length === 0}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-hud text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-40"
          style={{ backgroundColor: 'var(--red)', color: '#fff' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Loading...' : 'Compare'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {stats && !loading && (
        <>
          {/* Driver Header Cards */}
          <div className="grid grid-cols-2 gap-px rounded-xl overflow-hidden border border-[var(--border-dim)]">
            {[
              { id: driverAId!, detail: detailA, standing: standingA, color: colorA, team: teamA },
              { id: driverBId!, detail: detailB, standing: standingB, color: colorB, team: teamB },
            ].map((driver, idx) => (
              <div
                key={idx}
                className="px-5 py-4 flex flex-col gap-1"
                style={{ backgroundColor: 'var(--bg-raised)', borderTop: `2px solid ${driver.color}` }}
              >
                <div className="font-hud text-3xl font-black uppercase tracking-tight" style={{ color: driver.color }}>
                  {driver.detail?.code ?? '—'}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{driver.team?.fullName ?? ''}</div>
                <div className="font-mono text-xs text-[var(--text-muted)] mt-1">
                  P{driver.standing?.position ?? '—'} · {driver.standing?.points ?? '—'} pts
                </div>
              </div>
            ))}
          </div>

          {activeView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar */}
              <div
                className="rounded-xl border p-6 flex flex-col items-center gap-4"
                style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
              >
                <div className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                  Performance Radar
                </div>
                <RadarChart radar={stats.radar} colorA={colorA} colorB={colorB} />
                <div className="flex items-center gap-6 text-[10px] font-hud uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colorA }} />
                    <span style={{ color: colorA }}>{detailA?.code}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded" style={{ backgroundColor: colorB }} />
                    <span style={{ color: colorB }}>{detailB?.code}</span>
                  </span>
                </div>
              </div>

              {/* Stats Panel */}
              <div
                className="rounded-xl border p-6 space-y-4"
                style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
              >
                <div className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                  Head-to-Head Stats
                </div>

                <div className="grid grid-cols-3 gap-3 pb-4 border-b border-[var(--border-dim)]">
                  {[
                    { label: 'Quali Wins', a: stats.overall.driverAQualiWins, b: stats.overall.driverBQualiWins },
                    { label: 'Race Wins', a: stats.overall.driverARaceWins, b: stats.overall.driverBRaceWins },
                    { label: 'Podiums', a: stats.overall.driverAPodiums, b: stats.overall.driverBPodiums },
                  ].map((item) => (
                    <div key={item.label} className="text-center space-y-1">
                      <div className="flex justify-around items-center">
                        <span className="font-hud text-xl font-black" style={{ color: colorA }}>{item.a}</span>
                        <Minus size={10} className="text-[var(--text-muted)]" />
                        <span className="font-hud text-xl font-black" style={{ color: colorB }}>{item.b}</span>
                      </div>
                      <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-hud">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <StatBar label="Race Wins" aVal={stats.overall.driverARaceWins} bVal={stats.overall.driverBRaceWins} colorA={colorA} colorB={colorB} />
                  <StatBar label="Podiums" aVal={stats.overall.driverAPodiums} bVal={stats.overall.driverBPodiums} colorA={colorA} colorB={colorB} />
                  <StatBar label="Quali Wins" aVal={stats.overall.driverAQualiWins} bVal={stats.overall.driverBQualiWins} colorA={colorA} colorB={colorB} />
                  <StatBar label="DNFs" aVal={stats.overall.driverADNFs} bVal={stats.overall.driverBDNFs} colorA={colorA} colorB={colorB} lowerIsBetter />
                  <StatBar label="Total Points" aVal={stats.overall.driverATotalPoints} bVal={stats.overall.driverBTotalPoints} colorA={colorA} colorB={colorB} />
                </div>

                {/* Qualifying delta */}
                {stats.overall.avgQualiDeltaMs !== null && (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-overlay)' }}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                      Avg Quali Gap
                    </span>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{
                        color: stats.overall.avgQualiDeltaMs < 0 ? colorA : colorB,
                      }}
                    >
                      {formatQualiDelta(stats.overall.avgQualiDeltaMs)}
                      {' '}
                      <span className="text-[10px] text-[var(--text-muted)]">
                        ({stats.overall.avgQualiDeltaMs < 0 ? detailA?.code : detailB?.code} faster)
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'season' && (
            <div
              className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-overlay)', borderBottom: '1px solid var(--border-dim)' }}>
                    <th className="px-4 py-3 text-left font-hud uppercase tracking-widest text-[var(--text-muted)]">Season</th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest" style={{ color: colorA }}>
                      {detailA?.code}
                    </th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest text-[var(--text-muted)]">Quali</th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest text-[var(--text-muted)]">Wins</th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest text-[var(--text-muted)]">Podiums</th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest text-[var(--text-muted)]">Points</th>
                    <th className="px-4 py-3 text-center font-hud uppercase tracking-widest" style={{ color: colorB }}>
                      {detailB?.code}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.seasons.map((s: H2HSeasonSummary, i: number) => (
                    <tr
                      key={s.season}
                      className="border-b border-[var(--border-dim)] hover:bg-[var(--bg-highlight)] transition-colors duration-100"
                    >
                      <td className="px-4 py-3 font-hud font-bold text-[var(--text-primary)]">{s.season}</td>
                      <td className="px-4 py-3 text-center font-mono" style={{ color: colorA }}>{s.driverAPoints}</td>
                      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                        <span style={{ color: colorA }}>{s.driverAQualiWins}</span>
                        <span className="text-[var(--text-muted)] mx-1">–</span>
                        <span style={{ color: colorB }}>{s.driverBQualiWins}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                        <span style={{ color: colorA }}>{s.driverARaceWins}</span>
                        <span className="text-[var(--text-muted)] mx-1">–</span>
                        <span style={{ color: colorB }}>{s.driverBRaceWins}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                        <span style={{ color: colorA }}>{s.driverAPodiums}</span>
                        <span className="text-[var(--text-muted)] mx-1">–</span>
                        <span style={{ color: colorB }}>{s.driverBPodiums}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--text-secondary)]">
                        <span style={{ color: colorA }}>{s.driverAPoints.toFixed(0)}</span>
                        <span className="text-[var(--text-muted)] mx-1">–</span>
                        <span style={{ color: colorB }}>{s.driverBPoints.toFixed(0)}</span>
                      </td>
                      <td className="px-4 py-3 text-center font-mono" style={{ color: colorB }}>{s.driverBPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!stats && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text-muted)]">
          <BarChart2 size={32} className="opacity-30" />
          <p className="text-sm">Select two drivers and click Compare to see head-to-head stats</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <p className="text-sm text-[var(--text-muted)]">Fetching battle data across {selectedSeasons.length} season{selectedSeasons.length > 1 ? 's' : ''}…</p>
        </div>
      )}
    </div>
  );
}
