'use client';

import React, { useState } from 'react';
import {
  PRESEASON_TESTING_SESSIONS,
  PRESEASON_TEAM_MILEAGE,
  TestingDriverResult,
  TestingTeamMileage,
} from '@/lib/f1/preSeasonTesting';
import { getTeamMeta, DRIVER_DETAILS } from '@/lib/f1/teams';
import DriverAvatar from '@/components/f1/DriverAvatar';
import {
  Gauge,
  Timer,
  Zap,
  ShieldCheck,
  Activity,
  Layers,
  Flame,
  ChevronRight,
  TrendingUp,
  Award,
} from 'lucide-react';

interface PreSeasonTestingViewProps {
  onSelectDriver?: (driverId: string) => void;
  onSelectConstructor?: (constructorId: string) => void;
}

export default function PreSeasonTestingView({
  onSelectDriver,
  onSelectConstructor,
}: PreSeasonTestingViewProps) {
  const [subTab, setSubTab] = useState<'laps' | 'mileage' | 'insights'>('laps');
  const sessionData = PRESEASON_TESTING_SESSIONS[0];

  return (
    <div className="space-y-6">
      {/* Precision Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 sm:p-6 rounded-xl bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-subtle)] relative overflow-hidden">
        {/* Subtle Accent Glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--accent-f1-red)]/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-hud font-black uppercase tracking-wider bg-[var(--accent-f1-red)]/20 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/40">
              OFFICIAL FIA TESTING BENCHMARKS
            </span>
            <span className="text-[var(--text-muted)] text-xs">•</span>
            <span className="text-xs font-mono-num text-[var(--text-secondary)]">
              {sessionData.date}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-hud font-black uppercase tracking-tight text-[var(--text-primary)]">
            {sessionData.sessionName}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs font-hud font-bold text-[var(--text-muted)]">
            <span>{sessionData.trackName}</span>
            <span>•</span>
            <span>{sessionData.location}</span>
            <span>•</span>
            <span className="text-amber-400 font-mono-num">{sessionData.weatherTemp}</span>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase relative z-10 shrink-0">
          <button
            onClick={() => setSubTab('laps')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'laps'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Fastest Laps</span>
          </button>

          <button
            onClick={() => setSubTab('mileage')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'mileage'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Team Mileage</span>
          </button>

          <button
            onClick={() => setSubTab('insights')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'insights'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Stint Insights</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: FASTEST LAPS CLASSIFICATION */}
      {subTab === 'laps' && (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[var(--bg-primary)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
            <div className="col-span-1 text-center">POS</div>
            <div className="col-span-5 sm:col-span-4">DRIVER / TEAM</div>
            <div className="col-span-3 text-center">BEST LAP / GAP</div>
            <div className="col-span-1 sm:col-span-2 text-center">TYRE</div>
            <div className="col-span-2 text-right pr-2">LAPS / SPEED</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--border-subtle)]">
            {sessionData.results.map((r) => {
              const team = getTeamMeta(r.teamId);
              const meta = DRIVER_DETAILS[r.driverId] || { number: r.driverNumber, countryFlag: '🏁' };
              const isP1 = r.rank === 1;

              return (
                <div
                  key={r.driverId}
                  onClick={() => onSelectDriver && onSelectDriver(r.driverId)}
                  className="group relative grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none"
                  title={`View ${r.driverName} profile`}
                >
                  {/* Livery Border Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* POS */}
                  <div className="col-span-1 text-center font-mono-num font-black text-sm sm:text-base">
                    <span className={isP1 ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'}>
                      P{r.rank}
                    </span>
                  </div>

                  {/* DRIVER / TEAM */}
                  <div className="col-span-5 sm:col-span-4 min-w-0 flex items-center gap-3 pr-1">
                    <DriverAvatar
                      driverId={r.driverId}
                      driverName={r.driverName}
                      permanentNumber={r.driverNumber}
                      teamColor={team.color}
                      size="sm"
                      mode="photo"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-hud font-bold uppercase text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors truncate">
                          {r.driverName}
                        </span>
                        <span className="text-xs shrink-0">{meta.countryFlag}</span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate font-medium">
                        {team.name}
                      </div>
                    </div>
                  </div>

                  {/* BEST LAP & GAP */}
                  <div className="col-span-3 text-center font-mono-num">
                    <div className="font-black text-sm sm:text-base text-[var(--text-primary)]">
                      {r.bestLapTime}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] font-bold">
                      {r.gapToLeader}
                    </div>
                  </div>

                  {/* TYRE COMPOUND BADGE */}
                  <div className="col-span-1 sm:col-span-2 flex items-center justify-center">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-num font-black tracking-wider text-white shadow-sm border border-white/20"
                      style={{ backgroundColor: r.compoundColor }}
                    >
                      {r.compound}
                    </span>
                  </div>

                  {/* LAPS & SPEED */}
                  <div className="col-span-2 text-right font-mono-num pr-2">
                    <div className="font-bold text-xs text-[var(--text-primary)]">
                      {r.lapsCompleted} <span className="text-[10px] text-[var(--text-muted)] font-hud">LAPS</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 font-bold">
                      {r.topSpeedKm} KM/H
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: TEAM MILEAGE & RELIABILITY */}
      {subTab === 'mileage' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESEASON_TEAM_MILEAGE.map((tm) => {
              const team = getTeamMeta(tm.teamId);
              const maxLaps = PRESEASON_TEAM_MILEAGE[0].totalLaps;
              const percent = Math.max(10, (tm.totalLaps / maxLaps) * 100);

              return (
                <div
                  key={tm.teamId}
                  onClick={() => onSelectConstructor && onSelectConstructor(tm.teamId)}
                  className="relative p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                    style={{ backgroundColor: team.color }}
                  />

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2.5 py-0.5 rounded text-xs font-hud font-black uppercase tracking-wider"
                          style={{
                            backgroundColor: `${team.color}20`,
                            color: team.color,
                            border: `1px solid ${team.color}40`,
                          }}
                        >
                          P{tm.rank} • {team.name}
                        </span>
                        {tm.logoImageUrl && (
                          <img
                            src={tm.logoImageUrl}
                            alt={team.name}
                            className="h-4 w-auto object-contain opacity-80"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <span className="text-xs font-mono-num font-bold text-emerald-400">
                        {tm.reliabilityScore}% Reliability
                      </span>
                    </div>

                    <h3 className="text-base font-hud font-black uppercase text-[var(--text-primary)]">
                      {tm.fullName}
                    </h3>

                    {/* Mileage Progress Scale */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs font-mono-num">
                        <span className="text-[var(--text-muted)] font-hud font-bold uppercase text-[10px]">
                          Total Laps Completed
                        </span>
                        <span className="font-black text-[var(--text-primary)]">
                          {tm.totalLaps} LAPS ({tm.totalKm} KM)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: team.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 3: STINT INSIGHTS & DEVELOPMENT */}
      {subTab === 'insights' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-hud font-black uppercase text-[var(--text-primary)]">
              Long-Run Race Pace Stint
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ferrari & Red Bull demonstrated the lowest lap-time degradation during 20-lap race simulations on C3 Medium tyres.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-hud font-black uppercase text-[var(--text-primary)]">
              Speed Trap Top Speeds
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Ferrari engine customer cars recorded the highest top speeds on Sakhir main straight, peaking at 332.6 km/h.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-hud font-black uppercase text-[var(--text-primary)]">
              Chassis Reliability Benchmark
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Scuderia Ferrari HP completed 418 flawless laps with zero red-flag stoppages across 3 winter testing days.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
