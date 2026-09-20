'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getPitStops, ErgastPitStop } from '@/lib/f1/jolpica';
import { Race, RaceResult } from '@/lib/f1/types';

// ── Tire compound data ─────────────────────────────────────────────────────────

type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';

const COMPOUND_COLOR: Record<Compound, string> = {
  SOFT: '#E8002D',
  MEDIUM: '#FFF200',
  HARD: '#FFFFFF',
  INTERMEDIATE: '#39B54A',
  WET: '#0072CE',
  UNKNOWN: '#555566',
};

const COMPOUND_ABBR: Record<Compound, string> = {
  SOFT: 'S', MEDIUM: 'M', HARD: 'H', INTERMEDIATE: 'I', WET: 'W', UNKNOWN: '?',
};

interface Stint {
  compound: Compound;
  startLap: number;
  endLap: number;
  duration: number;
}

interface DriverStrategy {
  driverId: string;
  driverCode: string;
  driverName: string;
  constructorColor: string;
  stints: Stint[];
  totalLaps: number;
  position: number | null;
}

// ── Team color lookup ──────────────────────────────────────────────────────────

const TEAM_COLORS: Record<string, string> = {
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  aston_martin: '#358C75',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  haas: '#B6BABD',
  sauber: '#52E252',
};

// ── Compound inference from lap number ────────────────────────────────────────
// Without scraped compound data, we use a heuristic based on race length and stint
// ordering. Clearly marked as "Estimated" in the UI.

function inferCompound(stintIndex: number, totalStints: number, startLap: number, totalLaps: number): Compound {
  const raceProgress = startLap / totalLaps;
  if (totalStints === 1) return 'HARD';
  if (stintIndex === 0) {
    if (raceProgress < 0.05) return 'SOFT';
    return 'MEDIUM';
  }
  if (stintIndex === totalStints - 1) {
    if (totalLaps - startLap < 20) return 'SOFT';
    return 'HARD';
  }
  return 'MEDIUM';
}

function buildDriverStrategy(
  driverId: string,
  result: RaceResult,
  pitStops: ErgastPitStop[],
  totalLaps: number
): DriverStrategy {
  const driverPits = pitStops
    .filter((p) => p.driverId === driverId)
    .sort((a, b) => parseInt(a.lap, 10) - parseInt(b.lap, 10));

  const breakpoints = [0, ...driverPits.map((p) => parseInt(p.lap, 10)), totalLaps];
  const stints: Stint[] = [];

  for (let i = 0; i < breakpoints.length - 1; i++) {
    const startLap = breakpoints[i] + (i > 0 ? 1 : 1);
    const endLap = breakpoints[i + 1];
    const compound = inferCompound(i, breakpoints.length - 1, startLap, totalLaps);
    stints.push({ compound, startLap, endLap, duration: endLap - startLap + 1 });
  }

  const constructorId = result.Constructor.constructorId;
  const pos = parseInt(result.positionText, 10);

  return {
    driverId,
    driverCode: result.Driver.code ?? result.Driver.familyName.slice(0, 3).toUpperCase(),
    driverName: `${result.Driver.givenName} ${result.Driver.familyName}`,
    constructorColor: TEAM_COLORS[constructorId] ?? '#888888',
    stints,
    totalLaps,
    position: isNaN(pos) ? null : pos,
  };
}

// ── Tire Legend ────────────────────────────────────────────────────────────────

function TyreLegend() {
  const compounds: Compound[] = ['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'];
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {compounds.map((c) => (
        <div key={c} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: COMPOUND_COLOR[c] }}
          />
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-hud">{c}</span>
        </div>
      ))}
    </div>
  );
}

// ── Strategy Row ──────────────────────────────────────────────────────────────

function StrategyRow({
  strategy,
  maxLaps,
}: {
  strategy: DriverStrategy;
  maxLaps: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-[var(--border-dim)] last:border-0 group hover:bg-[var(--bg-highlight)] transition-colors duration-100 px-4">
      {/* Driver */}
      <div className="w-24 shrink-0 flex items-center gap-2">
        <span
          className="w-0.5 h-6 rounded-full shrink-0"
          style={{ backgroundColor: strategy.constructorColor }}
        />
        <div>
          <div className="font-hud text-xs font-bold uppercase text-[var(--text-primary)]">
            {strategy.driverCode}
          </div>
          {strategy.position !== null && (
            <div className="text-[9px] text-[var(--text-muted)]">P{strategy.position}</div>
          )}
        </div>
      </div>

      {/* Stint bars */}
      <div className="flex-1 flex gap-px items-center h-7 relative">
        {strategy.stints.map((stint, i) => {
          const leftPct = ((stint.startLap - 1) / maxLaps) * 100;
          const widthPct = (stint.duration / maxLaps) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 h-full rounded-sm flex items-center justify-center transition-opacity duration-150 hover:opacity-100 opacity-85 group/stint cursor-default"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundColor: COMPOUND_COLOR[stint.compound],
                minWidth: '8px',
              }}
              title={`${stint.compound} — Laps ${stint.startLap}–${stint.endLap} (${stint.duration} laps)`}
            >
              {widthPct > 8 && (
                <span
                  className="text-[8px] font-hud font-black select-none"
                  style={{ color: ['MEDIUM', 'HARD'].includes(stint.compound) ? '#111' : '#fff' }}
                >
                  {COMPOUND_ABBR[stint.compound]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Stops count */}
      <div className="w-10 shrink-0 text-right">
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {strategy.stints.length - 1}
          <span className="text-[9px] ml-0.5">stp</span>
        </span>
      </div>
    </div>
  );
}

// ── Lap axis ──────────────────────────────────────────────────────────────────

function LapAxis({ totalLaps, offset }: { totalLaps: number; offset: number }) {
  const ticks = [];
  const step = totalLaps <= 40 ? 10 : 20;
  for (let lap = step; lap <= totalLaps; lap += step) {
    ticks.push(lap);
  }
  return (
    <div className="flex items-center gap-3 px-4 pb-1">
      <div className="w-24 shrink-0" />
      <div className="flex-1 relative h-4">
        {ticks.map((lap) => (
          <div
            key={lap}
            className="absolute top-0 transform -translate-x-1/2 text-[8px] font-mono text-[var(--text-muted)]"
            style={{ left: `${((lap - 1) / totalLaps) * 100}%` }}
          >
            {lap}
          </div>
        ))}
      </div>
      <div className="w-10 shrink-0" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

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
  results,
  availableRaces,
  selectedRound,
  selectedSeason,
  onSelectRound,
  onSelectSeason,
}: TireStrategyViewProps) {
  const [pitStops, setPitStops] = useState<ErgastPitStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategies, setStrategies] = useState<DriverStrategy[]>([]);
  const [showTop, setShowTop] = useState(10);

  const fetchPitData = useCallback(async () => {
    if (!selectedSeason || !selectedRound) return;
    setLoading(true);
    try {
      const pits = await getPitStops(selectedSeason === 'current' ? 'current' : selectedSeason, selectedRound);
      setPitStops(pits);
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedRound]);

  useEffect(() => { fetchPitData(); }, [fetchPitData]);

  useEffect(() => {
    if (results.length === 0) { setStrategies([]); return; }
    const totalLaps = Math.max(...results.map((r) => parseInt(r.laps, 10) || 50));
    const sorted = [...results].sort((a, b) => {
      const pa = parseInt(a.positionText, 10) || 99;
      const pb = parseInt(b.positionText, 10) || 99;
      return pa - pb;
    });
    const built = sorted.map((r) =>
      buildDriverStrategy(r.Driver.driverId, r, pitStops, totalLaps)
    );
    setStrategies(built);
  }, [results, pitStops]);

  const maxLaps = strategies.length > 0
    ? Math.max(...strategies.map((s) => s.totalLaps))
    : 60;

  const SEASONS = ['current', '2025', '2024', '2023', '2022', '2021'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Tire Strategy
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Stint timeline · compound choices · pit windows
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Season selector */}
          <select
            value={selectedSeason}
            onChange={(e) => onSelectSeason(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-lg border bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border-dim)] outline-none cursor-pointer"
          >
            {SEASONS.map((s) => (
              <option key={s} value={s}>{s === 'current' ? '2026' : s}</option>
            ))}
          </select>

          {/* Round selector */}
          <select
            value={selectedRound}
            onChange={(e) => onSelectRound(e.target.value)}
            className="text-xs font-mono px-3 py-2 rounded-lg border bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border-dim)] outline-none cursor-pointer"
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

      {/* Race name */}
      {currentRace && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border-dim)] bg-[var(--bg-raised)]">
          <div className="w-1 h-8 rounded-full bg-[var(--red)]" />
          <div>
            <div className="font-hud text-sm font-bold uppercase tracking-wide text-[var(--text-primary)]">
              {currentRace.raceName}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              Round {currentRace.round} · {currentRace.Circuit?.circuitName}
            </div>
          </div>
          <div className="ml-auto text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)] bg-[var(--bg-overlay)] px-2 py-1 rounded">
            Estimated compounds
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TyreLegend />
        <div className="text-[9px] text-[var(--text-muted)] italic">
          Compound data estimated from stint structure
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Loading strategy data…</span>
        </div>
      ) : strategies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-[var(--text-muted)]">
          <div className="text-sm">No race data available for this selection</div>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
        >
          <LapAxis totalLaps={maxLaps} offset={100} />
          <div>
            {strategies.slice(0, showTop).map((strategy) => (
              <StrategyRow key={strategy.driverId} strategy={strategy} maxLaps={maxLaps} />
            ))}
          </div>

          {strategies.length > showTop && (
            <div className="px-4 py-3 border-t border-[var(--border-dim)]">
              <button
                onClick={() => setShowTop((n) => n + 10)}
                className="text-xs font-hud uppercase tracking-widest text-[var(--red)] hover:underline"
              >
                Show {Math.min(10, strategies.length - showTop)} more drivers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
