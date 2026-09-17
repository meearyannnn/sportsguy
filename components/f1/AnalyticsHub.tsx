'use client';

import React, { useState } from 'react';
import { DriverStanding, ConstructorStanding, Race, RaceResult } from '@/lib/f1/types';
import {
  calculateChampionshipPermutations,
  calculateFormIndex,
  calculateTeammateDuels,
  calculateBestSundayDrives,
  calculateReliabilityTracker,
  calculatePaceDivergence,
} from '@/lib/f1/analytics';
import {
  Calculator,
  TrendingUp,
  Swords,
  Gauge,
  Flame,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import FreshnessBadge from '@/components/f1/FreshnessBadge';
import ContextualExplainer from '@/components/f1/ContextualExplainer';

interface AnalyticsHubProps {
  standings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  calendar: Race[];
  recentResults: RaceResult[];
  recentRaceName?: string;
  onSelectDriver?: (driverId: string) => void;
}

export default function AnalyticsHub({
  standings,
  constructorStandings,
  calendar,
  recentResults,
  recentRaceName = 'Singapore Grand Prix',
  onSelectDriver,
}: AnalyticsHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'permutations' | 'form' | 'teammates' | 'overtakes' | 'reliability' | 'pace'
  >('permutations');

  const permutations = calculateChampionshipPermutations(standings, calendar);
  const formIndex = calculateFormIndex(standings);
  const teammateDuels = calculateTeammateDuels(standings);
  const sundayDrives = calculateBestSundayDrives(recentResults, recentRaceName);
  const reliability = calculateReliabilityTracker(recentResults);
  const paceDivergence = calculatePaceDivergence(recentResults);

  return (
    <div className="space-y-6">
      {/* Header & Sub-tab navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>PERFORMANCE & TITLE ANALYTICS</span>
            <span className="text-[var(--text-muted)]">•</span>
            <FreshnessBadge
              cadence="live"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Championship Scenarios & Driver Performance
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Title scenarios, rolling 5-race form ratings, teammate battles, and reliability stats
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase">
          <button
            onClick={() => setActiveSubTab('permutations')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'permutations'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Title Scenarios
          </button>
          <button
            onClick={() => setActiveSubTab('form')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'form'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Form Index
          </button>
          <button
            onClick={() => setActiveSubTab('teammates')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'teammates'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Teammate Duels
          </button>
          <button
            onClick={() => setActiveSubTab('overtakes')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'overtakes'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Sunday Drives
          </button>
          <button
            onClick={() => setActiveSubTab('reliability')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'reliability'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Reliability
          </button>
          <button
            onClick={() => setActiveSubTab('pace')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'pace'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Pace Divergence
          </button>
        </div>
      </div>

      {/* Contextual First-Time Explainers */}
      {activeSubTab === 'permutations' && (
        <ContextualExplainer
          conceptId="clinch_permutations"
          title="Championship Permutation Calculator"
          description="Every mathematical title scenario is computed in real-time from remaining rounds, sprint allocations, and maximum attainable points ceiling. Eliminates guesswork on clinch requirements."
          badge="MATHEMATICAL PERMUTATIONS"
        />
      )}

      {activeSubTab === 'form' && (
        <ContextualExplainer
          conceptId="form_index"
          title="Rolling 5-Race Form Index"
          description="Form rating (0-100) measures rolling five-race trajectory: qualifying teammate delta, points split, net Sunday positions gained, and DNF rate."
          badge="DERIVED TRAJECTORY"
        />
      )}

      {/* 1. CHAMPIONSHIP PERMUTATION CALCULATOR */}
      {activeSubTab === 'permutations' && permutations && (
        <div className="space-y-6">
          {/* Asymmetric Predictive Header: Leader Spotlight (5 cols) + Specs (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 p-4 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] timing-tower-rail is-live flex flex-col justify-between">
              <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider">
                CHAMPIONSHIP LEADER SPOTLIGHT
              </div>
              <div className="my-2">
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] uppercase truncate">
                  {permutations.leader.name}
                </div>
                <div className="text-xs font-mono-num font-bold text-amber-400 mt-0.5">
                  {permutations.leader.currentPoints} PTS • {permutations.leader.teamName}
                </div>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono-num border-t border-[var(--border-subtle)] pt-2 mt-1">
                Clinch threshold target active
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">
                  GPs Remaining
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num mt-1">
                  {permutations.remainingRaces}
                </div>
                <div className="text-[10px] text-amber-400 font-mono-num mt-0.5">
                  +{permutations.remainingSprints} Sprints
                </div>
              </div>

              <div className="p-3.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">
                  Max Available
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-emerald-400 font-mono-num mt-1">
                  {permutations.pointsAvailablePerDriver}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Driver ceiling
                </div>
              </div>

              <div className="p-3.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">
                  Earliest Clinch
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--accent-f1-red)] font-mono-num mt-1">
                  R{permutations.earliestClinchRound}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                  Target round
                </div>
              </div>
            </div>
          </div>

          {/* Championship Clinch Analysis Banner */}
          <div className="p-5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] timing-tower-rail is-live flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[var(--accent-f1-red)] shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--accent-f1-red)] mb-1">
                CHAMPIONSHIP CLINCH ANALYSIS
              </div>
              <p className="text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                {permutations.clinchAnalysis}
              </p>
            </div>
          </div>

          {/* Contender Breakdown Table */}
          <div className="overflow-x-auto rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 text-[var(--text-muted)] font-hud uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Driver & Team</th>
                  <th className="py-3 px-4 text-center">Current Points</th>
                  <th className="py-3 px-4 text-center">Max Possible Points</th>
                  <th className="py-3 px-4 text-center">Deficit to Leader</th>
                  <th className="py-3 px-4 text-right">Championship Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {permutations.contenders.map((c) => (
                  <tr
                    key={c.driverId}
                    onClick={() => onSelectDriver && onSelectDriver(c.driverId)}
                    className="hover:bg-[var(--bg-tertiary)]/70 transition-colors cursor-pointer"
                    title={`Click to view ${c.name} full profile`}
                  >
                    <td className="py-3 px-4 text-center font-hud font-black text-sm font-mono-num">
                      {c.currentPosition}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: c.teamColor }}></div>
                        <div>
                          <div className="font-hud font-bold uppercase text-sm text-[var(--text-primary)]">
                            {c.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">{c.teamName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-hud font-black text-base font-mono-num text-[var(--text-primary)]">
                      {c.currentPoints}
                    </td>
                    <td className="py-3 px-4 text-center font-hud font-bold text-sm font-mono-num text-emerald-400">
                      {c.maxPossiblePoints}
                    </td>
                    <td className="py-3 px-4 text-center font-mono-num font-semibold text-[var(--text-muted)]">
                      {c.pointsToLeader === 0 ? (
                        <span className="text-amber-400 font-bold">LEADER</span>
                      ) : (
                        `-${c.pointsToLeader.toFixed(0)} PTS`
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c.isMathematicallyEliminated ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-hud font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded border border-rose-800/40">
                          <XCircle className="w-3 h-3" />
                          ELIMINATED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-hud font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-800/40">
                          <CheckCircle2 className="w-3 h-3" />
                          IN CONTENTION
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ROLLING 5-RACE FORM INDEX */}
      {activeSubTab === 'form' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <span className="font-hud font-bold text-[var(--text-primary)] uppercase">How Form Index is calculated:</span>{' '}
            Rolling 5-race weighted efficiency factoring points scored, finishing stability relative to grid position, teammate battle outcome, and DNF mitigation on a 0–100 scale.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formIndex.map((f, idx) => (
              <div
                key={f.driverId}
                onClick={() => onSelectDriver && onSelectDriver(f.driverId)}
                className="p-5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-f1-red)]/60 hover:bg-[var(--bg-tertiary)] transition-all space-y-3 relative overflow-hidden cursor-pointer"
                title={`Click to view ${f.name} full profile`}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: f.teamColor }}></div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-hud font-black text-sm text-[var(--text-muted)] font-mono-num">
                      #{idx + 1}
                    </span>
                    <span className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
                      {f.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {f.trend === 'up' && <ArrowUp className="w-4 h-4 text-emerald-400" />}
                    {f.trend === 'down' && <ArrowDown className="w-4 h-4 text-rose-400" />}
                    {f.trend === 'steady' && <Minus className="w-4 h-4 text-amber-400" />}
                    <span
                      className={`font-hud font-black text-2xl font-mono-num ${
                        f.formScore >= 80
                          ? 'text-emerald-400'
                          : f.formScore >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {f.formScore}
                    </span>
                  </div>
                </div>

                {/* Score Visualizer */}
                <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${f.formScore}%`,
                      backgroundColor: f.teamColor,
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-subtle)] text-center text-xs font-mono-num">
                  <div className="p-1.5 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="text-[9px] text-[var(--text-muted)] uppercase">Avg Finish</div>
                    <div className="font-bold text-[var(--text-primary)]">P{f.avgFinish}</div>
                  </div>
                  <div className="p-1.5 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="text-[9px] text-[var(--text-muted)] uppercase">Podiums (L5)</div>
                    <div className="font-bold text-amber-400">{f.podiumCount}</div>
                  </div>
                  <div className="p-1.5 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="text-[9px] text-[var(--text-muted)] uppercase">Points (L5)</div>
                    <div className="font-bold text-[var(--accent-f1-red)]">{f.pointsScoredLast5}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEAMMATE DUELS */}
      {activeSubTab === 'teammates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teammateDuels.map((duel) => (
            <div
              key={duel.teamId}
              className="p-5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span
                  className="px-2.5 py-0.5 rounded text-xs font-hud font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${duel.teamColor}18`,
                    color: duel.teamColor,
                    border: `1px solid ${duel.teamColor}35`,
                  }}
                >
                  {duel.teamName}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono-num">
                  14 Races Compared
                </span>
              </div>

              {/* Drivers comparison grid */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1 text-left">
                  <div className="font-hud font-black text-lg uppercase text-[var(--text-primary)]">
                    {duel.driver1.name}
                  </div>
                  <div className="text-xs font-mono-num font-bold text-amber-400">
                    {duel.driver1.points} PTS ({duel.pointsSplitPercentage[0]}%)
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="font-hud font-black text-lg uppercase text-[var(--text-primary)]">
                    {duel.driver2.name}
                  </div>
                  <div className="text-xs font-mono-num font-bold text-amber-400">
                    {duel.driver2.points} PTS ({duel.pointsSplitPercentage[1]}%)
                  </div>
                </div>
              </div>

              {/* Points split visual bar */}
              <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                <div
                  className="h-full"
                  style={{
                    width: `${duel.pointsSplitPercentage[0]}%`,
                    backgroundColor: duel.teamColor,
                  }}
                ></div>
                <div
                  className="h-full opacity-50"
                  style={{
                    width: `${duel.pointsSplitPercentage[1]}%`,
                    backgroundColor: duel.teamColor,
                  }}
                ></div>
              </div>

              {/* Head to Head Duel Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
                <div className="p-2 rounded-lg bg-[var(--bg-primary)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Qualifying Battle:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {duel.driver1.qualiWins} — {duel.driver2.qualiWins}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-[var(--bg-primary)] flex items-center justify-between">
                  <span className="text-[var(--text-muted)]">Race Finish Battle:</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {duel.driver1.raceWins} — {duel.driver2.raceWins}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. OVERTAKES & BEST SUNDAY DRIVES */}
      {activeSubTab === 'overtakes' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <span className="font-hud font-bold text-[var(--text-primary)] uppercase">Best Sunday Drives:</span>{' '}
            Ranking the most extraordinary recoveries and positions gained from starting grid to checkered flag.
          </div>

          <div className="space-y-3">
            {sundayDrives.map((drive, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: drive.teamColor }}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
                        {drive.driverName}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">({drive.teamName})</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{drive.highlightText}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right text-xs font-mono-num">
                    <span className="text-[var(--text-muted)]">Started P{drive.startGrid} → </span>
                    <span className="text-emerald-400 font-bold">Finished P{drive.finishPos}</span>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 font-hud font-black text-sm font-mono-num flex items-center gap-1">
                    <ArrowUp className="w-3.5 h-3.5" />
                    +{drive.positionsGained} POS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TEAM RELIABILITY */}
      {activeSubTab === 'reliability' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <span className="font-hud font-bold text-[var(--text-primary)] uppercase">Reliability Index:</span>{' '}
            Official constructor mechanical finish rate, power unit failures, and retirement cause breakdowns across the season.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reliability.map((r) => (
              <div
                key={r.teamName}
                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.teamColor }}></div>
                    <span className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
                      {r.teamName}
                    </span>
                  </div>
                  <span className="font-hud font-black text-xl font-mono-num text-emerald-400">
                    {r.reliabilityRate}%
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${r.reliabilityRate}%`,
                      backgroundColor: r.reliabilityRate > 90 ? '#10B981' : '#F59E0B',
                    }}
                  ></div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono-num pt-1">
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <div className="text-[9px] text-[var(--text-muted)]">Starts</div>
                    <div className="font-bold">{r.totalStarts}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <div className="text-[9px] text-[var(--text-muted)]">Mechanical DNF</div>
                    <div className="font-bold text-amber-400">{r.mechanicalDNFs}</div>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-primary)]">
                    <div className="text-[9px] text-[var(--text-muted)]">Collision DNF</div>
                    <div className="font-bold text-rose-400">{r.collisionDNFs}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PACE DIVERGENCE */}
      {activeSubTab === 'pace' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)]">
            <span className="font-hud font-bold text-[var(--text-primary)] uppercase">Saturday vs Sunday Divergence:</span>{' '}
            Uncovering whether each car is built for one-lap qualifying magic or high-efficiency long-stint race pace.
          </div>

          <div className="space-y-3">
            {paceDivergence.map((p) => (
              <div
                key={p.teamName}
                className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: p.teamColor }}></div>
                  <div>
                    <span className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
                      {p.teamName}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">
                      {p.characterization}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center text-xs font-mono-num">
                  <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Avg Quali</span>
                    <span className="font-bold text-amber-400">P{p.avgQualiRank}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Avg Race</span>
                    <span className="font-bold text-emerald-400">P{p.avgRaceRank}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-[var(--bg-primary)] text-center">
                    <span className="text-[10px] text-[var(--text-muted)] block">Divergence</span>
                    <span className={`font-bold ${p.delta > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {p.delta > 0 ? `+${p.delta}` : p.delta}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
