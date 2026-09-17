'use client';

import React, { useState } from 'react';
import {
  JUNIOR_SERIES_DATABASE,
  JuniorDriver,
  JuniorSeriesData,
} from '@/lib/f1/juniorSeries';
import { F1_TEAMS } from '@/lib/f1/teams';
import {
  Trophy,
  Flag,
  Calendar,
  Layers,
  GraduationCap,
  ExternalLink,
  Zap,
  Medal,
  Award,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface JuniorSeriesViewProps {
  initialSeries?: 'f2' | 'f3' | 'academy';
  onNavigateToTeam?: (teamId: string) => void;
}

export default function JuniorSeriesView({
  initialSeries = 'f2',
}: JuniorSeriesViewProps) {
  const [selectedSeries, setSelectedSeries] = useState<'f2' | 'f3' | 'academy'>(initialSeries);
  const [activeTab, setActiveTab] = useState<'standings' | 'calendar' | 'pipeline'>('standings');
  const [selectedDriver, setSelectedDriver] = useState<JuniorDriver | null>(null);

  const data: JuniorSeriesData = JUNIOR_SERIES_DATABASE[selectedSeries];

  return (
    <div className="space-y-6">
      {/* Header & Series Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>OFFICIAL FIA ROAD TO F1 PYRAMID</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            {data.seriesName}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5 max-w-2xl">
            {data.description} • {data.championshipYear}
          </p>
        </div>

        {/* Series Switcher Pills */}
        <div className="flex items-center p-1 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)]">
          {(['f2', 'f3', 'academy'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSelectedSeries(s);
                setSelectedDriver(null);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedSeries === s
                  ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {s === 'f2' ? 'FIA F2' : s === 'f3' ? 'FIA F3' : 'F1 ACADEMY'}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tabs: Standings | Calendar & Results | F1 Pipeline */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded text-xs font-hud font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'standings'
                ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Standings
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded text-xs font-hud font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'calendar'
                ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Calendar & Results
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded text-xs font-hud font-bold uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === 'pipeline'
                ? 'text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            F1 Team Pipeline
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono-num text-[var(--text-muted)]">
          <span>{data.regulations}</span>
        </div>
      </div>

      {/* VIEW: STANDINGS */}
      {activeTab === 'standings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Drivers Table (8 Cols) */}
          <div className="lg:col-span-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                  Driver Standings
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase">
                {data.drivers.length} Entrants Ranked
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]/50">
                    <th className="py-2.5 px-3 w-10 text-center">POS</th>
                    <th className="py-2.5 px-3">DRIVER</th>
                    <th className="py-2.5 px-3">TEAM</th>
                    <th className="py-2.5 px-3">F1 PIPELINE</th>
                    <th className="py-2.5 px-3 text-center">W</th>
                    <th className="py-2.5 px-3 text-center">POD</th>
                    <th className="py-2.5 px-3 text-right">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {data.drivers.map((d, index) => {
                    const parentTeam = d.f1Academy ? F1_TEAMS[d.f1Academy] : null;

                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDriver(d)}
                        className={`hover:bg-[var(--bg-tertiary)]/60 cursor-pointer transition-colors ${
                          selectedDriver?.id === d.id ? 'bg-[var(--bg-tertiary)]' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-hud font-bold text-sm">
                          {index === 0 ? (
                            <span className="text-amber-400">P1</span>
                          ) : index === 1 ? (
                            <span className="text-slate-300">P2</span>
                          ) : index === 2 ? (
                            <span className="text-amber-600">P3</span>
                          ) : (
                            <span className="text-[var(--text-muted)]">{d.position}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{d.countryFlag}</span>
                            <div>
                              <div className="font-hud font-black text-sm text-[var(--text-primary)]">
                                {d.name}
                              </div>
                              <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                                #{d.number} • {d.code}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[var(--text-secondary)] font-medium">
                          {d.team}
                        </td>
                        <td className="py-3 px-3">
                          {parentTeam ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-hud font-bold uppercase tracking-wider"
                              style={{
                                backgroundColor: `${parentTeam.color}22`,
                                color: parentTeam.color === '#000000' ? 'var(--text-primary)' : parentTeam.color,
                                border: `1px solid ${parentTeam.color}55`,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: parentTeam.color }}
                              />
                              {parentTeam.name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                              Independent
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center font-mono-num font-bold text-[var(--text-primary)]">
                          {d.wins}
                        </td>
                        <td className="py-3 px-3 text-center font-mono-num text-[var(--text-secondary)]">
                          {d.podiums}
                        </td>
                        <td className="py-3 px-3 text-right font-mono-num font-black text-sm text-[var(--accent-f1-red)]">
                          {d.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Teams Table & Driver Spotlight (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Teams Standings */}
            <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[var(--accent-f1-red)]" />
                  <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                    Team Championship
                  </h3>
                </div>
                <span className="text-[10px] font-mono-num text-[var(--text-muted)]">POINTS</span>
              </div>

              <div className="space-y-2">
                {data.teams.map((t, idx) => (
                  <div
                    key={t.name}
                    className="flex items-center justify-between p-2.5 rounded bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-hud font-bold text-xs text-[var(--text-muted)] w-4">
                        P{idx + 1}
                      </span>
                      <span className="font-hud font-bold text-[var(--text-primary)]">{t.name}</span>
                    </div>
                    <span className="font-mono-num font-black text-sm text-[var(--accent-f1-red)]">
                      {t.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Driver Spotlight Card */}
            {selectedDriver && (
              <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedDriver.countryFlag}</span>
                    <div>
                      <h4 className="font-hud font-black text-base text-[var(--text-primary)]">
                        {selectedDriver.name}
                      </h4>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {selectedDriver.team} • #{selectedDriver.number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-hud font-black text-lg text-[var(--accent-f1-red)]">
                      {selectedDriver.points} PTS
                    </div>
                    <span className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">
                      Championship P{selectedDriver.position}
                    </span>
                  </div>
                </div>

                {selectedDriver.bio && (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--border-subtle)] pt-3">
                    {selectedDriver.bio}
                  </p>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-subtle)] text-center text-xs">
                  <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                    <div className="text-[10px] font-hud uppercase font-bold text-[var(--text-muted)]">Wins</div>
                    <div className="font-mono-num font-black text-sm text-[var(--text-primary)] mt-0.5">
                      {selectedDriver.wins}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                    <div className="text-[10px] font-hud uppercase font-bold text-[var(--text-muted)]">Podiums</div>
                    <div className="font-mono-num font-black text-sm text-[var(--text-primary)] mt-0.5">
                      {selectedDriver.podiums}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-[var(--bg-tertiary)]">
                    <div className="text-[10px] font-hud uppercase font-bold text-[var(--text-muted)]">Poles</div>
                    <div className="font-mono-num font-black text-sm text-[var(--text-primary)] mt-0.5">
                      {selectedDriver.poles}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: CALENDAR & RESULTS */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.calendar.map((race) => (
            <div
              key={race.round}
              className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{race.countryFlag}</span>
                  <div>
                    <span className="text-[10px] font-hud uppercase tracking-wider font-bold text-[var(--accent-f1-red)]">
                      ROUND {race.round}
                    </span>
                    <h4 className="font-hud font-black text-sm uppercase text-[var(--text-primary)]">
                      {race.gpName}
                    </h4>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-hud font-bold uppercase tracking-wider ${
                    race.isCompleted
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                  }`}
                >
                  {race.isCompleted ? 'COMPLETED' : 'UPCOMING'}
                </span>
              </div>

              <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 font-mono-num">
                <span>{race.circuit}</span>
                <span>{race.date}</span>
              </div>

              {race.isCompleted ? (
                <div className="space-y-1.5 pt-1 text-xs">
                  {race.featureWinner && (
                    <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-tertiary)]">
                      <span className="text-[10px] font-hud font-bold uppercase text-amber-400">
                        Feature Winner
                      </span>
                      <span className="font-hud font-black text-[var(--text-primary)]">
                        {race.featureWinner}
                      </span>
                    </div>
                  )}
                  {race.sprintWinner && (
                    <div className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-tertiary)]/70">
                      <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                        Sprint Winner
                      </span>
                      <span className="font-hud font-bold text-[var(--text-secondary)]">
                        {race.sprintWinner}
                      </span>
                    </div>
                  )}
                  {race.polePosition && (
                    <div className="flex items-center justify-between text-[11px] px-1 text-[var(--text-muted)]">
                      <span>Pole Position:</span>
                      <span className="font-hud font-bold text-[var(--text-primary)]">{race.polePosition}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded bg-[var(--bg-tertiary)]/40 text-center text-xs text-[var(--text-muted)]">
                  Session times synchronizing with FIA race direction
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* VIEW: F1 PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <h3 className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
              Formula 1 Driver Development Pipelines
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Explore how each parent Formula 1 team invests in feeder formula talent across FIA Formula 2, FIA Formula 3, and F1 Academy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(F1_TEAMS).map((team) => (
              <div
                key={team.id}
                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3"
                style={{ borderTop: `4px solid ${team.color}` }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
                    {team.name}
                  </h4>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                </div>

                <div className="text-[11px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Academy Roster ({team.academyDrivers?.length || 0} Drivers)
                </div>

                <div className="space-y-1.5">
                  {team.academyDrivers && team.academyDrivers.length > 0 ? (
                    team.academyDrivers.map((drvStr) => (
                      <div
                        key={drvStr}
                        className="flex items-center justify-between p-2 rounded bg-[var(--bg-tertiary)] text-xs"
                      >
                        <span className="font-hud font-bold text-[var(--text-primary)]">
                          {drvStr.split(' (')[0]}
                        </span>
                        <span className="text-[10px] font-hud uppercase px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--accent-f1-red)] font-bold">
                          {drvStr.includes('(') ? drvStr.split('(')[1].replace(')', '') : 'ACADEMY'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] italic">
                      No junior pipeline drivers declared
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
