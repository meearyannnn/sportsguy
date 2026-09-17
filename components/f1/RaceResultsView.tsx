'use client';

import React, { useState } from 'react';
import { Race, RaceResult } from '@/lib/f1/types';
import { getTeamMeta, DRIVER_DETAILS } from '@/lib/f1/teams';
import {
  Flag,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Timer,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react';
import PaceTrace from '@/components/f1/PaceTrace';

interface RaceResultsViewProps {
  currentRace: Race | null;
  results: RaceResult[];
  availableRaces: Race[];
  selectedRound: string;
  selectedSeason: string;
  onSelectRound: (round: string) => void;
  onSelectSeason: (season: string) => void;
  onSelectDriver?: (driverId: string) => void;
}

export default function RaceResultsView({
  currentRace,
  results,
  availableRaces,
  selectedRound,
  selectedSeason,
  onSelectRound,
  onSelectSeason,
  onSelectDriver,
}: RaceResultsViewProps) {
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const seasons = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];

  return (
    <div className="space-y-6">
      {/* Header & Season / Round Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <Flag className="w-3.5 h-3.5" />
            <span>OFFICIAL GRAND PRIX CLASSIFICATION</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            {currentRace?.raceName || 'Grand Prix Results Archive'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {currentRace?.Circuit?.circuitName} • {currentRace?.date}
          </p>
        </div>

        {/* Season & Round Selectors */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Season Dropdown */}
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] font-hud uppercase font-semibold">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => onSelectSeason(e.target.value)}
              aria-label="Filter results by F1 season"
              className="bg-transparent text-[var(--text-primary)] font-hud font-bold text-sm focus:outline-none cursor-pointer"
            >
              {seasons.map((yr) => (
                <option key={yr} value={yr} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  {yr} F1 Season
                </option>
              ))}
            </select>
          </div>

          {/* Round Dropdown */}
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] font-hud uppercase font-semibold">Grand Prix:</span>
            <select
              value={selectedRound}
              onChange={(e) => onSelectRound(e.target.value)}
              aria-label="Filter results by Grand Prix round"
              className="bg-transparent text-[var(--text-primary)] font-hud font-bold text-sm focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[220px] truncate"
            >
              <option value="last" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                Most Recent GP
              </option>
              {availableRaces.map((r) => (
                <option key={r.round} value={r.round} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  R{r.round}: {r.raceName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
          <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-hud font-bold text-[var(--text-primary)] uppercase">
            No Race Results Registered For This Round Yet
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            This Grand Prix is upcoming or live data is still undergoing official FIA stewards verification. Select another round or season to view historical results.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mobile Accordion Card View (< sm) — Zero Horizontal Scroll, 48px Touch Targets */}
          <div className="sm:hidden border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)] overflow-hidden">
            {results.map((res) => {
              const team = getTeamMeta(res.Constructor?.constructorId || '');
              const gridPos = parseInt(res.grid, 10) || 0;
              const finishPos = parseInt(res.position, 10) || 0;
              const delta = gridPos > 0 && finishPos > 0 ? gridPos - finishPos : 0;
              const isFastestLap = res.FastestLap?.rank === '1';
              const isDNF = res.status !== 'Finished' && !res.status.includes('Lap');
              const isExpanded = expandedDriverId === res.Driver.driverId;

              return (
                <div key={res.Driver.driverId} className="flex flex-col">
                  <div
                    onClick={() => setExpandedDriverId(isExpanded ? null : res.Driver.driverId)}
                    className="p-3.5 min-h-[50px] flex items-center justify-between gap-3 hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`font-hud font-black text-sm w-5 text-center font-mono-num ${
                          finishPos === 1 ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {res.positionText || res.position}
                      </span>
                      <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                      <div className="min-w-0">
                        <div className="font-hud font-bold uppercase text-xs truncate text-[var(--text-primary)]">
                          {res.Driver.givenName} <span className="font-black">{res.Driver.familyName}</span>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] truncate">{res.Constructor.name}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right font-mono-num">
                        <div className={`text-xs font-bold ${isDNF ? 'text-rose-400' : 'text-[var(--text-primary)]'}`}>
                          {isDNF ? res.status : res.Time?.time || 'Finished'}
                        </div>
                        <div className="text-[10px] text-[var(--accent-f1-red)] font-hud font-black">
                          {res.points !== '0' ? `+${res.points} PTS` : '0 PTS'}
                        </div>
                      </div>
                      <div className="text-[var(--text-muted)]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Secondary Telemetry Drawer */}
                  {isExpanded && (
                    <div className="bg-[var(--bg-primary)]/90 border-t border-[var(--border-subtle)] p-3 space-y-3 animate-fadeIn">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                            Grid Delta
                          </span>
                          <span className="font-mono-num font-bold text-sm">
                            {gridPos === 0 ? 'Pitlane' : `P${gridPos}`} → P{finishPos}{' '}
                            {delta > 0 ? (
                              <span className="text-emerald-400 text-xs">(+{delta})</span>
                            ) : delta < 0 ? (
                              <span className="text-rose-400 text-xs">({delta})</span>
                            ) : (
                              <span className="text-zinc-400 text-xs">(=)</span>
                            )}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                          <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                            Fastest Lap
                          </span>
                          <span className="font-mono-num font-bold text-sm text-[var(--text-primary)]">
                            {res.FastestLap?.Time?.time || '—'}{' '}
                            {isFastestLap && (
                              <span className="px-1.5 py-0.5 rounded-sm bg-[var(--accent-f1-red)]/20 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/40 text-[10px] font-hud font-bold">
                                [FASTEST LAP]
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {onSelectDriver && (
                        <button
                          onClick={() => onSelectDriver(res.Driver.driverId)}
                          className="w-full min-h-[44px] py-2 px-3 rounded-sm bg-[var(--accent-f1-red)] text-white text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
                        >
                          <span>OPEN DRIVER DOSSIER</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Full Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)] font-hud uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">Pos</th>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4 hidden sm:table-cell">Car / Team</th>
                <th className="py-3 px-3 text-center">Grid</th>
                <th className="py-3 px-3 text-center">Gained</th>
                <th className="py-3 px-4">Time / Status</th>
                <th className="py-3 px-4 hidden md:table-cell">Fastest Lap</th>
                <th className="py-3 px-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {results.map((res) => {
                const team = getTeamMeta(res.Constructor?.constructorId || '');
                const gridPos = parseInt(res.grid, 10) || 0;
                const finishPos = parseInt(res.position, 10) || 0;
                const delta = gridPos > 0 && finishPos > 0 ? gridPos - finishPos : 0;
                const isFastestLap = res.FastestLap?.rank === '1';
                const isDNF = res.status !== 'Finished' && !res.status.includes('Lap');

                return (
                  <tr
                    key={res.Driver.driverId}
                    onClick={() => onSelectDriver && onSelectDriver(res.Driver.driverId)}
                    className="hover:bg-[var(--bg-tertiary)] transition-colors group cursor-pointer"
                    title={`Click to view ${res.Driver.givenName} ${res.Driver.familyName} full dossier`}
                  >
                    {/* Position */}
                    <td className="py-3 px-4 text-center font-hud font-black text-sm sm:text-base font-mono-num">
                      <span
                        className={
                          finishPos === 1
                            ? 'text-[var(--accent-f1-red)] font-black'
                            : 'text-[var(--text-primary)]'
                        }
                      >
                        {res.positionText || res.position}
                      </span>
                    </td>

                    {/* Driver Number */}
                    <td className="py-3 px-3 text-center font-hud font-bold font-mono-num">
                      <span
                        className="px-1.5 py-0.5 rounded text-[11px]"
                        style={{
                          backgroundColor: `${team.color}15`,
                          color: team.color,
                          border: `1px solid ${team.color}35`,
                        }}
                      >
                        {res.number}
                      </span>
                    </td>

                    {/* Driver Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1 h-5 rounded-full shrink-0"
                          style={{ backgroundColor: team.color }}
                        ></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-hud font-bold uppercase text-sm text-[var(--text-primary)] group-hover:text-white">
                              {res.Driver.givenName}{' '}
                              <span className="font-black">{res.Driver.familyName}</span>
                            </span>
                            <PaceTrace driverId={res.Driver.driverId} width={34} height={10} />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] block sm:hidden">
                            {res.Constructor.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Constructor / Team */}
                    <td className="py-3 px-4 hidden sm:table-cell font-medium text-[var(--text-secondary)]">
                      {res.Constructor.name}
                    </td>

                    {/* Starting Grid */}
                    <td className="py-3 px-3 text-center font-mono-num text-[var(--text-muted)] font-semibold">
                      {res.grid === '0' ? 'Pit' : `P${res.grid}`}
                    </td>

                    {/* Positions Gained / Lost */}
                    <td className="py-3 px-3 text-center font-mono-num font-bold">
                      {delta > 0 ? (
                        <span className="inline-flex items-center text-emerald-400 gap-0.5 text-[11px] bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          <ArrowUp className="w-2.5 h-2.5" />+{delta}
                        </span>
                      ) : delta < 0 ? (
                        <span className="inline-flex items-center text-rose-400 gap-0.5 text-[11px] bg-rose-950/30 px-1.5 py-0.5 rounded border border-rose-800/40">
                          <ArrowDown className="w-2.5 h-2.5" />
                          {delta}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">
                          <Minus className="w-3 h-3 inline" />
                        </span>
                      )}
                    </td>

                    {/* Time / Gap or DNF */}
                    <td className="py-3 px-4 font-mono-num">
                      {isDNF ? (
                        <span className="text-rose-400 text-[11px] font-semibold bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                          DNF ({res.status})
                        </span>
                      ) : (
                        <span className="text-[var(--text-primary)] font-medium">
                          {res.Time?.time || res.status}
                        </span>
                      )}
                    </td>

                    {/* Fastest Lap */}
                    <td className="py-3 px-4 hidden md:table-cell font-mono-num">
                      {res.FastestLap?.Time?.time ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] ${
                              isFastestLap
                                ? 'text-purple-400 font-bold px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 flex items-center gap-1'
                                : 'text-[var(--text-muted)]'
                            }`}
                          >
                            {isFastestLap && <Zap className="w-2.5 h-2.5 fill-current" />}
                            {res.FastestLap.Time.time}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)]">—</span>
                      )}
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 text-right font-hud font-black text-sm sm:text-base text-[var(--text-primary)] font-mono-num">
                      {res.points !== '0' ? (
                        <span className="text-[var(--accent-f1-red)] font-bold">
                          +{res.points}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
  );
}
