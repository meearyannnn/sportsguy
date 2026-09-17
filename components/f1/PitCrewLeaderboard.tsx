'use client';

import React, { useState } from 'react';
import {
  TOP_SEASON_PIT_STOPS,
  TEAM_PIT_CREW_STANDINGS,
  PitStopRecord,
  TeamPitCrewRanking,
} from '@/lib/f1/pitstops';
import {
  Wrench,
  Trophy,
  Zap,
  Timer,
  Award,
  ChevronRight,
  Sparkles,
  Flame,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface PitCrewLeaderboardProps {
  onSelectDriver?: (driverId: string) => void;
}

export default function PitCrewLeaderboard({ onSelectDriver }: PitCrewLeaderboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'teams' | 'stops'>('teams');
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<string>('all');

  const fastestSingleStop = TOP_SEASON_PIT_STOPS[0];

  const filteredStops =
    selectedRoundFilter === 'all'
      ? TOP_SEASON_PIT_STOPS
      : TOP_SEASON_PIT_STOPS.filter((s) => String(s.round) === selectedRoundFilter);

  return (
    <div className="space-y-6">
      {/* Hero Header & Season Benchmark Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Title and description (8 cols) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
              <Wrench className="w-4 h-4" />
              <span>OFFICIAL PIT STOP TELEMETRY INTELLIGENCE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
              Pit Crew World Championship
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Ranked by DHL Pit Stop Award points (25-18-15-12-10-8-6-4-2-1), median wheel-gun stationary time, and sub-2.5s consistency.
            </p>
          </div>

          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab('teams')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'teams'
                  ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Team Pit Crew Standings
            </button>
            <button
              onClick={() => setActiveTab('stops')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'stops'
                  ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Fastest Individual Stops
            </button>
          </div>
        </div>

        {/* Season Record Card (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--accent-f1-red)]/40 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-hud font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SEASON RECORD BENCHMARK
            </span>
            <span className="text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded bg-[var(--accent-f1-red)]/20 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/30">
              SUB-2.0s
            </span>
          </div>

          <div>
            <div className="font-mono-num font-black text-4xl text-[var(--text-primary)] tracking-tight">
              {fastestSingleStop.stationaryTime.toFixed(2)}s
            </div>
            <div className="font-hud font-bold text-sm text-[var(--text-primary)] mt-1">
              {fastestSingleStop.teamName} • {fastestSingleStop.driverName}
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-mono-num mt-0.5">
              {fastestSingleStop.gpName} (Lap {fastestSingleStop.lap})
            </p>
          </div>

          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono-num">
            <span>Total Lane: {fastestSingleStop.pitLaneTime}s</span>
            <span className="text-emerald-400 font-bold">Flawless 4-wheel swap</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: TEAM STANDINGS */}
      {activeTab === 'teams' && (
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                Team Pit Crew Championship
              </h3>
            </div>
            <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
              10 Constructors Ranked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]/50">
                  <th className="py-2.5 px-3 w-10 text-center">POS</th>
                  <th className="py-2.5 px-3">CONSTRUCTOR</th>
                  <th className="py-2.5 px-3 text-center">FASTEST STOP</th>
                  <th className="py-2.5 px-3 text-center">AVG STATIONARY</th>
                  <th className="py-2.5 px-3 text-center">SUB-2.5s STOPS</th>
                  <th className="py-2.5 px-3 text-center">TOTAL STOPS</th>
                  <th className="py-2.5 px-3 text-right">POINTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {TEAM_PIT_CREW_STANDINGS.map((t, index) => {
                  const sub25Percentage = Math.round((t.sub25StopsCount / t.totalStops) * 100);

                  return (
                    <tr
                      key={t.teamId}
                      className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                    >
                      <td className="py-3 px-3 text-center font-hud font-bold text-sm">
                        {index === 0 ? (
                          <span className="text-amber-400">P1</span>
                        ) : index === 1 ? (
                          <span className="text-slate-300">P2</span>
                        ) : index === 2 ? (
                          <span className="text-amber-600">P3</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">P{index + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: t.color }}
                          />
                          <span className="font-hud font-black text-sm text-[var(--text-primary)]">
                            {t.teamName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num font-black text-sm text-emerald-400">
                        {t.fastestStop.toFixed(2)}s
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num font-medium text-[var(--text-primary)]">
                        {t.averageStationaryTime.toFixed(2)}s
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num text-[var(--text-secondary)]">
                        {t.sub25StopsCount} ({sub25Percentage}%)
                      </td>
                      <td className="py-3 px-3 text-center font-mono-num text-[var(--text-muted)]">
                        {t.totalStops}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-num font-black text-base text-[var(--accent-f1-red)]">
                        {t.dhlPoints}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: FASTEST INDIVIDUAL STOPS */}
      {activeTab === 'stops' && (
        <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                Season Top 10 Fastest Stops
              </h3>
            </div>
            <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
              Stationary Wheel-Nut Duration (Seconds)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]/50">
                  <th className="py-2.5 px-3 w-10 text-center">RANK</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3">CONSTRUCTOR</th>
                  <th className="py-2.5 px-3">GRAND PRIX</th>
                  <th className="py-2.5 px-3 text-center">LAP</th>
                  <th className="py-2.5 px-3 text-right">STATIONARY</th>
                  <th className="py-2.5 px-3 text-right">LANE TIME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredStops.map((stop, rankIdx) => (
                  <tr
                    key={stop.id}
                    onClick={() => onSelectDriver && onSelectDriver(stop.driverId)}
                    className="hover:bg-[var(--bg-tertiary)]/50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 text-center font-hud font-bold text-xs">
                      {rankIdx === 0 ? (
                        <span className="text-amber-400 font-black">#1</span>
                      ) : rankIdx === 1 ? (
                        <span className="text-slate-300 font-bold">#2</span>
                      ) : rankIdx === 2 ? (
                        <span className="text-amber-600 font-bold">#3</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">#{rankIdx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-hud font-black text-sm text-[var(--text-primary)]">
                        {stop.driverName}
                      </div>
                      <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                        Stop {stop.stopNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-[var(--text-secondary)]">
                      {stop.teamName}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-primary)]">
                      {stop.gpName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono-num text-[var(--text-muted)]">
                      L{stop.lap}
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num font-black text-base text-emerald-400">
                      {stop.stationaryTime.toFixed(2)}s
                    </td>
                    <td className="py-3 px-3 text-right font-mono-num text-xs text-[var(--text-muted)]">
                      {stop.pitLaneTime.toFixed(2)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
