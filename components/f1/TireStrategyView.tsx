'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Race, RaceResult } from '@/lib/f1/types';
import {
  Compound,
  COMPOUND_META,
  DriverTireStrategy,
  TireStrategyData,
  fetchTireStrategy,
  Stint,
} from '@/lib/f1/stints';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Timer,
  Wrench,
  Search,
  Sparkles,
  Flag,
  XCircle,
  HelpCircle,
} from 'lucide-react';

const TEAM_COLORS: Record<string, string> = {
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  aston_martin: '#229971',
  alpine: '#0090FF',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  sauber: '#52E252',
  audi: '#E21B23',
  cadillac: '#394F6E',
};

function getTeamColor(constructorId: string): string {
  if (TEAM_COLORS[constructorId]) return TEAM_COLORS[constructorId];
  const meta = getTeamMeta(constructorId);
  return meta?.color || '#888888';
}

// ── Compound Legend with Interactive Highlighting ───────────────────────────

interface TyreLegendProps {
  activeCompoundFilter: Compound | null;
  onToggleCompound: (c: Compound | null) => void;
  stats?: TireStrategyData['stats'] | null;
  isVerified: boolean;
}

function TyreLegend({
  activeCompoundFilter,
  onToggleCompound,
  stats,
  isVerified,
}: TyreLegendProps) {
  const compounds: Compound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];

  if (!isVerified) {
    return (
      <div className="flex items-center gap-2 text-xs font-hud text-[var(--text-muted)]">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span>Telemetry filtering disabled — strategy data unavailable for this session</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onToggleCompound(null)}
        className={`px-2.5 py-1 rounded text-[10px] font-hud uppercase tracking-wider transition-all duration-150 border ${
          activeCompoundFilter === null
            ? 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-dim)] shadow-sm'
            : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
        }`}
      >
        All Tyres
      </button>

      {compounds.map((c) => {
        const meta = COMPOUND_META[c];
        const isActive = activeCompoundFilter === c;
        const share = stats?.compoundShare?.[c] ?? 0;

        return (
          <button
            key={c}
            onClick={() => onToggleCompound(isActive ? null : c)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] uppercase font-hud tracking-wider transition-all duration-150 border ${
              isActive
                ? 'bg-[var(--bg-card)] border-current shadow-md'
                : 'border-transparent bg-[var(--bg-raised)]/60 hover:bg-[var(--bg-raised)] text-[var(--text-muted)]'
            }`}
            style={{
              color: isActive ? meta.color : undefined,
              borderColor: isActive ? meta.border : 'transparent',
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: meta.color }}
            />
            <span className="font-bold">{meta.label}</span>
            {share > 0 && (
              <span className="text-[9px] font-mono opacity-80 ml-0.5">({share}%)</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Stint Tooltip Popover ───────────────────────────────────────────────────

interface StintTooltipProps {
  stint: Stint;
  driverName: string;
}

function StintTooltip({ stint }: StintTooltipProps) {
  const meta = COMPOUND_META[stint.compound];
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/stint:flex flex-col z-40 pointer-events-none min-w-[210px] p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-2xl backdrop-blur-md animate-fade-in text-left">
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-dim)] pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
          <span className="text-xs font-hud font-black uppercase text-[var(--text-primary)]">
            {meta.label} Tyre
          </span>
        </div>
        <span
          className="text-[9px] font-mono px-1.5 py-0.5 rounded font-bold"
          style={{
            backgroundColor: stint.isNew ? 'rgba(39, 244, 210, 0.15)' : 'rgba(255, 140, 0, 0.15)',
            color: stint.isNew ? '#27F4D2' : '#FFA500',
          }}
        >
          {stint.isNew ? 'NEW SET' : `USED (+${stint.tyreAgeAtStart}L)`}
        </span>
      </div>

      <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
        <div className="flex justify-between">
          <span>Stint #{stint.stintNumber}:</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">
            Laps {stint.startLap} – {stint.endLap} ({stint.duration} laps)
          </span>
        </div>

        {stint.pitStop && (
          <div className="pt-1.5 mt-1 border-t border-[var(--border-dim)]/50">
            <div className="flex items-center gap-1 text-[10px] text-[var(--text-primary)] font-semibold mb-0.5">
              <Wrench className="w-3 h-3 text-[var(--red)]" />
              <span>Official Pit Stop · Lap {stint.pitStop.lap}</span>
            </div>
            {stint.pitStop.stationaryDuration && (
              <div className="flex justify-between text-[10px]">
                <span>Stationary Time:</span>
                <span className="font-mono text-[var(--red)] font-bold">
                  {stint.pitStop.stationaryDuration}
                </span>
              </div>
            )}
            {stint.pitStop.pitLaneDuration && (
              <div className="flex justify-between text-[10px]">
                <span>Pit Lane Time:</span>
                <span className="font-mono text-[var(--text-primary)]">
                  {stint.pitStop.pitLaneDuration}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Strategy Row (Strict FIA Classification & DNF Handling) ─────────────────

interface StrategyRowProps {
  strategy: DriverTireStrategy;
  maxLaps: number;
  activeCompoundFilter: Compound | null;
}

function StrategyRow({ strategy, maxLaps, activeCompoundFilter }: StrategyRowProps) {
  const teamColor = strategy.constructorColor || getTeamColor(strategy.constructorId);
  const totalStops = strategy.stints.filter((s) => s.pitStop !== null).length;

  // DNF parameters
  const isDNF = strategy.isDNF;
  const retirementLap = strategy.retirementLap ?? strategy.lapsCompleted;
  const dnfLeftPct = isDNF ? (retirementLap / maxLaps) * 100 : 100;
  const dnfWidthPct = isDNF ? Math.max(0, 100 - dnfLeftPct) : 0;

  // Lapped parameters (completed race under chequered flag, but fewer laps than leader)
  const isLapped = strategy.isLapped && !isDNF;
  const lappedLeftPct = isLapped ? (strategy.lapsCompleted / maxLaps) * 100 : 100;
  const lappedWidthPct = isLapped ? Math.max(0, 100 - lappedLeftPct) : 0;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border-dim)] last:border-0 group hover:bg-[var(--bg-highlight)]/70 transition-colors duration-100 px-4">
      {/* 1. Official FIA Classification Identity */}
      <div className="w-36 shrink-0 flex items-center gap-2.5">
        <span
          className="w-1.5 h-8 rounded-full shrink-0 shadow-sm"
          style={{ backgroundColor: teamColor }}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {/* Strict finishing position */}
            {isDNF ? (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                DNF
              </span>
            ) : (
              <span className="font-hud text-xs font-bold text-[var(--text-muted)]">
                P{strategy.position}
              </span>
            )}

            <span className="font-hud text-xs font-black uppercase tracking-tight text-[var(--text-primary)]">
              {strategy.driverCode}
            </span>

            <span className="text-[10px] font-mono text-[var(--text-muted)] opacity-70">
              #{strategy.driverNumber}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-muted)] mt-0.5 truncate">
            {strategy.gridPosition !== null && strategy.gridPosition !== strategy.position && (
              <span className="font-mono text-[8px] bg-[var(--bg-overlay)] px-1 py-0.2 rounded border border-[var(--border-dim)]">
                Grid: P{strategy.gridPosition}
              </span>
            )}

            {strategy.isPitLaneStart && (
              <span className="font-mono text-[8px] bg-amber-500/15 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30">
                Pit Start
              </span>
            )}

            {/* Quick sequence pills if verified */}
            {strategy.strategyAvailable && strategy.stints.length > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                {strategy.stints.map((st, i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full inline-block"
                    style={{ backgroundColor: COMPOUND_META[st.compound].color }}
                    title={`${COMPOUND_META[st.compound].label} (Laps ${st.startLap}-${st.endLap})`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Stint Timeline or Data-Missing State */}
      <div className="flex-1 flex gap-px items-center h-7 relative bg-[var(--bg-overlay)]/40 rounded overflow-visible border border-[var(--border-dim)]/50">
        {!strategy.strategyAvailable ? (
          /* Fail loudly: per-row explicit data unavailable state */
          <div className="w-full h-full flex items-center justify-between px-3 text-[10px] font-hud text-[var(--text-muted)] bg-[var(--bg-raised)]/50 rounded">
            <span className="flex items-center gap-1.5 text-amber-400/90">
              <HelpCircle className="w-3.5 h-3.5" />
              Strategy data unavailable (telemetry not recorded for this session)
            </span>
            <span className="font-mono text-[9px]">
              {isDNF ? `DNF (Lap ${retirementLap})` : `${strategy.lapsCompleted} laps completed`}
            </span>
          </div>
        ) : (
          <>
            {/* Active Stints (Strictly clamped to actual completed laps) */}
            {strategy.stints.map((stint, i) => {
              const leftPct = ((stint.startLap - 1) / maxLaps) * 100;
              const widthPct = Math.max((stint.duration / maxLaps) * 100, 1.2);
              const meta = COMPOUND_META[stint.compound];
              const isHighlighted =
                activeCompoundFilter === null || activeCompoundFilter === stint.compound;

              return (
                <div
                  key={i}
                  className={`absolute top-0 h-full rounded-sm flex items-center justify-center transition-all duration-200 group/stint cursor-pointer ${
                    isHighlighted ? 'opacity-100 ring-1 ring-black/20' : 'opacity-20 grayscale-[50%]'
                  }`}
                  style={{
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    backgroundColor: meta.color,
                    boxShadow: isHighlighted ? `0 0 10px ${meta.glow}` : 'none',
                  }}
                >
                  {/* Rich popover */}
                  <StintTooltip stint={stint} driverName={strategy.driverName} />

                  {/* Compound Letter & Age */}
                  {widthPct > 5 && (
                    <div className="flex items-center gap-0.5 select-none pointer-events-none">
                      <span
                        className="text-[9px] font-hud font-black"
                        style={{ color: meta.textColor }}
                      >
                        {meta.abbr}
                      </span>
                      {!stint.isNew && (
                        <span
                          className="w-1 h-1 rounded-full bg-black/70"
                          title="Used tyre set at stint start"
                        />
                      )}
                    </div>
                  )}

                  {/* Pit stop marker citing exact lap */}
                  {stint.pitStop && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-[2px] bg-black/60 z-10"
                      title={`Pit Stop at Lap ${stint.pitStop.lap} (${stint.pitStop.pitLaneDuration || 'Pit Stop'})`}
                    />
                  )}
                </div>
              );
            })}

            {/* DNF Terminal Region (Drivers who retired must NOT be shown as full-length) */}
            {isDNF && (
              <div
                className="absolute top-0 bottom-0 rounded-r flex items-center justify-center overflow-hidden border-l-2 border-rose-500 cursor-help group/dnf z-20"
                style={{
                  left: `${dnfLeftPct}%`,
                  width: `${dnfWidthPct}%`,
                  background:
                    'repeating-linear-gradient(45deg, rgba(232, 0, 45, 0.12), rgba(232, 0, 45, 0.12) 6px, rgba(20, 20, 25, 0.4) 6px, rgba(20, 20, 25, 0.4) 12px)',
                }}
              >
                <div className="flex items-center gap-1 px-2 select-none truncate">
                  <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className="text-[9px] font-hud font-bold text-rose-400 uppercase tracking-tight truncate">
                    DNF · {strategy.retirementReason || 'Retired'} (Lap {retirementLap})
                  </span>
                </div>

                {/* DNF Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/dnf:flex flex-col z-40 pointer-events-none min-w-[180px] p-2 rounded-lg bg-[var(--bg-card)] border border-rose-500/40 shadow-xl text-left">
                  <div className="text-xs font-hud font-black text-rose-400 uppercase">
                    Driver Retired (DNF)
                  </div>
                  <div className="text-[11px] text-[var(--text-primary)] mt-0.5">
                    Official Finish: P{strategy.position} ({strategy.driverName})
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">
                    Retired on <span className="font-mono text-rose-400 font-bold">Lap {retirementLap}</span> of {maxLaps}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    Reason: <span className="text-[var(--text-primary)]">{strategy.retirementReason || 'Incident / Failure'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lapped Finish Flag (Leader finished at maxLaps; driver flagged at completed lap) */}
            {isLapped && lappedWidthPct > 0 && (
              <div
                className="absolute top-0 bottom-0 rounded-r flex items-center justify-end pr-1 border-l border-[var(--border-dim)] z-10 opacity-70"
                style={{
                  left: `${lappedLeftPct}%`,
                  width: `${lappedWidthPct}%`,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
                title={`Classified finisher · Flagged on Lap ${strategy.lapsCompleted} (${strategy.status})`}
              >
                <Flag className="w-2.5 h-2.5 text-[var(--text-muted)]" />
              </div>
            )}
          </>
        )}
      </div>

      {/* 3. Stops Count / Status */}
      <div className="w-16 shrink-0 text-right">
        {strategy.strategyAvailable ? (
          <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">
            {totalStops}
            <span className="text-[9px] text-[var(--text-muted)] font-normal ml-0.5">
              {totalStops === 1 ? 'stop' : 'stops'}
            </span>
          </span>
        ) : (
          <span className="text-[10px] font-mono text-[var(--text-muted)]">—</span>
        )}
      </div>
    </div>
  );
}

// ── Lap Axis ────────────────────────────────────────────────────────────────

function LapAxis({ totalLaps }: { totalLaps: number }) {
  const ticks = [];
  const step = totalLaps <= 40 ? 5 : totalLaps <= 60 ? 10 : 15;
  for (let lap = step; lap <= totalLaps; lap += step) {
    ticks.push(lap);
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-dim)] bg-[var(--bg-card)]/50">
      <div className="w-36 shrink-0 text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">
        Classification
      </div>
      <div className="flex-1 relative h-4">
        {ticks.map((lap) => (
          <div
            key={lap}
            className="absolute top-0 transform -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${((lap - 1) / totalLaps) * 100}%` }}
          >
            <span className="text-[9px] font-mono text-[var(--text-muted)] font-semibold">
              L{lap}
            </span>
          </div>
        ))}
      </div>
      <div className="w-16 shrink-0 text-right text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">
        Stops
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

interface TireStrategyViewProps {
  currentRace: Race | null;
  results: RaceResult[];
  availableRaces: Race[];
  selectedRound: string;
  selectedSeason: string;
  onSelectRound: (round: string) => void;
  onSelectSeason: (season: string) => void;
}

export default function TireStrategyView({
  currentRace,
  availableRaces,
  selectedRound,
  selectedSeason,
  onSelectRound,
  onSelectSeason,
}: TireStrategyViewProps) {
  const [strategyData, setStrategyData] = useState<TireStrategyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCompoundFilter, setActiveCompoundFilter] = useState<Compound | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayFilter, setDisplayFilter] = useState<'top10' | 'all'>('top10');

  const loadStrategy = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchTireStrategy(selectedSeason, selectedRound);
      setStrategyData(data);
    } catch (err) {
      console.error('Failed to load strategy data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedRound]);

  useEffect(() => {
    loadStrategy();
  }, [loadStrategy]);

  // Final strategies strictly adhering to official FIA classification order
  const finalStrategies = useMemo(() => {
    return strategyData?.strategies || [];
  }, [strategyData]);

  // Filtered strategies
  const visibleStrategies = useMemo(() => {
    let list = finalStrategies;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.driverCode.toLowerCase().includes(q) ||
          s.driverName.toLowerCase().includes(q) ||
          s.constructorName.toLowerCase().includes(q)
      );
    }

    if (displayFilter === 'top10') {
      list = list.slice(0, 10);
    }

    return list;
  }, [finalStrategies, searchQuery, displayFilter]);

  const maxLaps = strategyData?.maxLaps || (finalStrategies.length > 0
    ? Math.max(...finalStrategies.map((s) => s.totalLaps))
    : 57);

  const SEASONS = ['current', '2025', '2024', '2023', '2022', '2021'];

  const stats = strategyData?.stats;
  const isVerified = Boolean(strategyData?.isVerified);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
              Tire Strategy
            </h2>

            {/* Verification Status Badge */}
            {isVerified ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-hud uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified FIA & Pirelli Telemetry · OpenF1 #{strategyData?.sessionKey}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-hud uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <AlertTriangle className="w-3.5 h-3.5" />
                Telemetry Unavailable · Synthetic Guessing Disabled
              </span>
            )}
          </div>

          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Official FIA classification · Stint timeline · Pit stop telemetry
          </p>
        </div>

        {/* Season & Round Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-lg border bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border-dim)] outline-none cursor-pointer focus:border-[var(--red)] transition-colors"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>
                {s === 'current' ? '2026' : s}
              </option>
            ))}
          </select>

          <select
            value={selectedRound}
            onChange={(e) => onSelectRound(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-lg border bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border-dim)] outline-none cursor-pointer focus:border-[var(--red)] transition-colors"
          >
            <option value="last">Latest Race</option>
            {availableRaces.map((r) => (
              <option key={r.round} value={r.round}>
                R{r.round} – {r.raceName.replace(' Grand Prix', ' GP')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Race Information Banner */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 rounded-full bg-[var(--red)]" />
          <div>
            <div className="font-hud text-base font-bold uppercase tracking-wide text-[var(--text-primary)]">
              {strategyData?.race?.raceName || currentRace?.raceName || 'Grand Prix'}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Round {strategyData?.race?.round || currentRace?.round} ·{' '}
              {strategyData?.race?.circuitName || currentRace?.Circuit?.circuitName || 'Circuit'}
              {strategyData?.race?.locality ? ` (${strategyData.race.locality})` : ''}
              {strategyData?.race?.date ? ` · ${strategyData.race.date}` : ''}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-lg border border-[var(--border-dim)]">
            <Gauge className="w-3.5 h-3.5 text-[var(--red)]" />
            <span>{maxLaps} Total Laps</span>
          </div>

          {isVerified && strategyData?.totalStops !== undefined && strategyData.totalStops > 0 && (
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-3 py-1.5 rounded-lg border border-[var(--border-dim)]">
              <Wrench className="w-3.5 h-3.5 text-[var(--text-primary)]" />
              <span>{strategyData.totalStops} Pit Stops</span>
            </div>
          )}
        </div>
      </div>

      {/* Fail Loudly Warning Banner if Verified Telemetry is Missing */}
      {!loading && !isVerified && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-hud font-bold text-amber-300 uppercase">
              Official Tyre Compound Telemetry Unavailable For This Session
            </div>
            <div className="text-[var(--text-muted)]">
              Official live tyre stint telemetry (Pirelli compound usage and degradation) is only available for modern sessions with FIA sensor timing feeds (2023–2026). In accordance with strict data integrity rules, synthetic compounds will not be fabricated. Official finishing classification is preserved below.
            </div>
          </div>
        </div>
      )}

      {/* Analytics KPI Cards (Rendered ONLY when verified telemetry exists) */}
      {isVerified && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Compound Share Distribution */}
          <div className="p-3.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] space-y-2">
            <div className="flex items-center justify-between text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
              <span>Compound Distance Share</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-[var(--bg-overlay)]">
              {(['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'] as Compound[]).map((c) => {
                const pct = stats.compoundShare[c] || 0;
                if (pct <= 0) return null;
                return (
                  <div
                    key={c}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: COMPOUND_META[c].color,
                    }}
                    title={`${COMPOUND_META[c].label}: ${pct}%`}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)] flex-wrap">
              {stats.compoundShare.HARD > 0 && <span>Hard: {stats.compoundShare.HARD}%</span>}
              {stats.compoundShare.MEDIUM > 0 && (
                <span>Medium: {stats.compoundShare.MEDIUM}%</span>
              )}
              {stats.compoundShare.SOFT > 0 && <span>Soft: {stats.compoundShare.SOFT}%</span>}
            </div>
          </div>

          {/* Average Stint Lengths */}
          <div className="p-3.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] space-y-2">
            <div className="flex items-center justify-between text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
              <span>Avg Stint Length</span>
              <Timer className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[var(--text-primary)]">
              {stats.avgStintLength.HARD > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFFFFF]" />
                  <span>Hard: {stats.avgStintLength.HARD}L</span>
                </div>
              )}
              {stats.avgStintLength.MEDIUM > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFF200]" />
                  <span>Med: {stats.avgStintLength.MEDIUM}L</span>
                </div>
              )}
              {stats.avgStintLength.SOFT > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E8002D]" />
                  <span>Soft: {stats.avgStintLength.SOFT}L</span>
                </div>
              )}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Mean laps run per tyre set across all stints
            </div>
          </div>

          {/* Fastest Pit Stop */}
          {stats.fastestStop && (
            <div className="p-3.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
                <span>Fastest Pit Lane Duration</span>
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-mono font-black text-emerald-400">
                  {stats.fastestStop.durationStr}
                </span>
                {stats.fastestStop.stationaryStr && (
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    ({stats.fastestStop.stationaryStr} stationary)
                  </span>
                )}
              </div>
              <div className="text-xs text-[var(--text-primary)] font-semibold truncate">
                {stats.fastestStop.driverName} ({stats.fastestStop.constructorName}) · Lap{' '}
                {stats.fastestStop.lap}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Controls & Legend Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-[var(--bg-raised)]/70 p-3 rounded-xl border border-[var(--border-dim)]">
        <TyreLegend
          activeCompoundFilter={activeCompoundFilter}
          onToggleCompound={setActiveCompoundFilter}
          stats={stats}
          isVerified={isVerified}
        />

        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Driver Search */}
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search driver…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-[var(--bg-card)] border border-[var(--border-dim)] rounded-lg pl-7 pr-3 py-1 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--red)] w-36 transition-all"
            />
          </div>

          {/* Top 10 vs All Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--border-dim)] bg-[var(--bg-card)] p-0.5">
            <button
              onClick={() => setDisplayFilter('top10')}
              className={`px-2.5 py-1 text-[10px] font-hud uppercase rounded transition-colors ${
                displayFilter === 'top10'
                  ? 'bg-[var(--red)] text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setDisplayFilter('all')}
              className={`px-2.5 py-1 text-[10px] font-hud uppercase rounded transition-colors ${
                displayFilter === 'all'
                  ? 'bg-[var(--red)] text-white font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Grid ({finalStrategies.length})
            </button>
          </div>
        </div>
      </div>

      {/* Strategy Chart */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <span className="text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
            Loading official race telemetry…
          </span>
        </div>
      ) : visibleStrategies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2 text-[var(--text-muted)] rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)]">
          <div className="text-sm font-hud uppercase tracking-wider">
            No race classification data found
          </div>
          <div className="text-xs">Try selecting a different round or season</div>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden shadow-lg"
          style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
        >
          <LapAxis totalLaps={maxLaps} />
          <div className="divide-y divide-[var(--border-dim)]/40">
            {visibleStrategies.map((strategy) => (
              <StrategyRow
                key={strategy.driverId}
                strategy={strategy}
                maxLaps={maxLaps}
                activeCompoundFilter={activeCompoundFilter}
              />
            ))}
          </div>

          {displayFilter === 'top10' && finalStrategies.length > 10 && !searchQuery && (
            <div className="px-4 py-3 border-t border-[var(--border-dim)] bg-[var(--bg-card)]/40 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">
                Showing top 10 finishers of {finalStrategies.length} classified drivers
              </span>
              <button
                onClick={() => setDisplayFilter('all')}
                className="text-xs font-hud uppercase tracking-widest text-[var(--red)] hover:underline font-bold"
              >
                Show All {finalStrategies.length} Drivers →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
