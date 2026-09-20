'use client';

import React, { useState } from 'react';
import {
  DHL_PIT_STOP_STANDINGS,
  OFFICIAL_GP_PIT_STOP_RECORDS,
  GrandPrixPitStopRecord,
  PitStopEntry,
} from '@/lib/f1/pitstops';
import { getTeamMeta, DRIVER_DETAILS } from '@/lib/f1/teams';
import DriverAvatar from '@/components/f1/DriverAvatar';
import {
  Wrench,
  Timer,
  Trophy,
  Zap,
  MapPin,
  Calendar,
  CheckCircle2,
  Flag,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface PitCrewLeaderboardProps {
  onSelectDriver?: (driverId: string) => void;
  onSelectConstructor?: (constructorId: string) => void;
}

const AVAILABLE_ROUNDS = [
  { round: 14, name: 'Round 14 • Italian GP (Monza)', short: 'R14 Monza' },
  { round: 12, name: 'Round 12 • British GP (Silverstone)', short: 'R12 Silverstone' },
  { round: 11, name: 'Round 11 • Hungarian GP (Hungaroring)', short: 'R11 Hungary' },
  { round: 9, name: 'Round 9 • Spanish GP (Madrid)', short: 'R9 Spain' },
  { round: 8, name: 'Round 8 • Monaco GP (Monte Carlo)', short: 'R8 Monaco' },
  { round: 6, name: 'Round 6 • Miami GP (Miami)', short: 'R6 Miami' },
  { round: 1, name: 'Round 1 • Australian GP (Melbourne)', short: 'R1 Australia' },
];

export default function PitCrewLeaderboard({
  onSelectDriver,
  onSelectConstructor,
}: PitCrewLeaderboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'standings' | 'logs'>('standings');
  const [selectedRound, setSelectedRound] = useState<number>(14);

  const currentGpRecord: GrandPrixPitStopRecord =
    OFFICIAL_GP_PIT_STOP_RECORDS[selectedRound] || OFFICIAL_GP_PIT_STOP_RECORDS[14];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Precision Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Wrench className="w-4 h-4" />
              <span>OFFICIAL PIT STOP TELEMETRY INTELLIGENCE</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>OFFICIAL FIA TIMING ARCHIVE</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Pit Crew Telemetry & Stationary Times
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Official pit stop stationary durations and DHL Fastest Pit Stop Award standings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase shrink-0">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'standings'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>DHL Pit Championship</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>Pit Stop Telemetry Logs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DHL FASTEST PIT STOP CHAMPIONSHIP */}
      {activeTab === 'standings' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[var(--bg-primary)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
              <div className="col-span-1 text-center">POS</div>
              <div className="col-span-6 sm:col-span-5">CONSTRUCTOR / PIT CREW</div>
              <div className="col-span-3 sm:col-span-3 text-center">SEASON FASTEST STOP</div>
              <div className="col-span-2 sm:col-span-3 text-right pr-2">POINTS</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[var(--border-subtle)]">
              {DHL_PIT_STOP_STANDINGS.map((team) => {
                const isP1 = team.position === 1;

                return (
                  <div
                    key={team.teamId}
                    onClick={() => onSelectConstructor && onSelectConstructor(team.teamId)}
                    className="group relative grid grid-cols-12 gap-2 items-center px-4 py-3.5 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none"
                    title={`View ${team.teamName} constructor dossier`}
                  >
                    {/* Livery Accent Bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: team.color }}
                    />

                    {/* POS */}
                    <div className="col-span-1 text-center font-mono-num font-black text-sm sm:text-base">
                      <span className={isP1 ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'}>
                        P{team.position}
                      </span>
                    </div>

                    {/* CONSTRUCTOR DETAILS */}
                    <div className="col-span-6 sm:col-span-5 min-w-0 pr-1 flex items-center gap-3">
                      <span
                        className="w-2.5 h-8 rounded-full shrink-0 border border-black/30 shadow-sm"
                        style={{ backgroundColor: team.color }}
                      />
                      {team.carImageUrl && (
                        <img
                          src={team.carImageUrl}
                          alt={team.teamName}
                          className="h-6 w-auto object-contain shrink-0 hidden md:block filter drop-shadow-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-hud font-extrabold uppercase text-xs sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors truncate">
                            {team.fullName}
                          </span>
                          {team.logoImageUrl && (
                            <img
                              src={team.logoImageUrl}
                              alt={team.teamName}
                              className="h-3.5 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity hidden sm:block"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          )}
                        </div>

                        {/* Round Wins List */}
                        {team.roundWins > 0 ? (
                          <div className="text-[10px] text-amber-400 font-mono-num flex items-center gap-1.5 mt-0.5 truncate">
                            <span className="font-bold">🏆 {team.roundWins} Round {team.roundWins === 1 ? 'Win' : 'Wins'}:</span>
                            <span className="text-[var(--text-muted)] truncate">{team.winsList.join(' • ')}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-[var(--text-muted)] font-mono-num mt-0.5">
                            RECORD STATIONARY STOP: {team.fastestStop}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* FASTEST STOP BADGE */}
                    <div className="col-span-3 sm:col-span-3 flex items-center justify-center">
                      <div className="px-3 py-1 rounded bg-[var(--bg-primary)] border border-amber-500/30 flex items-center gap-1.5 text-amber-400 font-mono-num font-bold text-xs shadow-sm">
                        <Zap className="w-3.5 h-3.5 shrink-0 fill-amber-400/20" />
                        <span>{team.fastestStop}</span>
                      </div>
                    </div>

                    {/* POINTS */}
                    <div className="col-span-2 sm:col-span-3 text-right pr-2">
                      <span className="font-mono-num font-black text-base sm:text-xl text-[var(--text-primary)]">
                        {team.points} <span className="text-xs text-[var(--text-muted)]">PTS</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRAND PRIX PIT STOP TELEMETRY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Round Selector Bar */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-x-auto touch-scroll">
            <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] shrink-0 hidden sm:inline">
              Select Grand Prix:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {AVAILABLE_ROUNDS.map((r) => (
                <button
                  key={r.round}
                  onClick={() => setSelectedRound(r.round)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-hud font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    selectedRound === r.round
                      ? 'bg-[var(--accent-f1-red)] text-white shadow-sm'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-white border border-[var(--border-subtle)]'
                  }`}
                >
                  {r.short}
                </button>
              ))}
            </div>
          </div>

          {/* Grand Prix Telemetry Dossier Header */}
          <div className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold uppercase tracking-wider bg-[var(--accent-f1-red)]/15 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/30">
                    Round {currentGpRecord.round} of 24
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {currentGpRecord.status}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-black font-hud uppercase tracking-tight text-[var(--text-primary)]">
                  {currentGpRecord.officialTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                    {currentGpRecord.circuitName} ({currentGpRecord.location})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentGpRecord.date}
                  </span>
                  <span>•</span>
                  <span>{currentGpRecord.lapsTotal} Laps</span>
                </div>
              </div>

              {/* Winning Stop Metric Badge */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-amber-500/30 shrink-0 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase tracking-wider text-amber-400">
                  <Zap className="w-3.5 h-3.5 fill-amber-400/20" />
                  <span>DHL Fastest Pit Stop of the GP</span>
                </div>
                <div className="text-xl font-mono-num font-black text-amber-400">
                  {currentGpRecord.winningStop}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono truncate max-w-[220px]">
                  {currentGpRecord.winningTeam} • {currentGpRecord.winningDriver}
                </div>
              </div>
            </div>
          </div>

          {/* Pit Stop Logs Table */}
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="p-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
              <span>Grand Prix Official Pit Lane Records ({currentGpRecord.stops.length} Stops Logged)</span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                STATIONARY VS PIT LANE TRANSIT
              </span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {currentGpRecord.stops.map((ps) => {
                const meta = DRIVER_DETAILS[ps.driverId] || {
                  number: ps.driverNumber,
                  countryFlag: '🏁',
                  code: ps.driverCode,
                };
                const isWinner = ps.isFastest;

                return (
                  <div
                    key={`${ps.driverId}-${ps.lap}-${ps.stop}`}
                    onClick={() => onSelectDriver && onSelectDriver(ps.driverId)}
                    className={`p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer group relative ${
                      isWinner ? 'bg-amber-500/[0.04]' : ''
                    }`}
                  >
                    {/* Position and Driver Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="font-mono-num font-black text-sm w-6 text-center shrink-0 text-[var(--text-muted)]">
                        {isWinner ? '⚡' : `#${ps.rank}`}
                      </div>

                      <DriverAvatar
                        driverId={ps.driverId}
                        driverName={ps.driverName}
                        permanentNumber={ps.driverNumber}
                        teamColor={ps.teamColor}
                        size="sm"
                        mode="photo"
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-hud font-bold uppercase text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors truncate">
                            {ps.driverName}
                          </span>
                          <span className="text-xs shrink-0">{meta.countryFlag}</span>
                          <span className="text-[10px] font-hud font-bold px-1.5 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0">
                            LAP {ps.lap}
                          </span>
                          {ps.tyresFitted && (
                            <span
                              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                ps.tyresFitted === 'Soft'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                  : ps.tyresFitted === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-white/10 text-white border border-white/20'
                              }`}
                            >
                              {ps.tyresFitted}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-[var(--text-muted)] font-mono-num mt-0.5">
                          {ps.teamName} • Stop #{ps.stop}
                        </div>
                      </div>
                    </div>

                    {/* Timing Metrics */}
                    <div className="flex items-center gap-5 text-xs font-mono-num shrink-0 w-full sm:w-auto justify-end">
                      <div className="text-right">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block font-bold">
                          Stationary Time
                        </span>
                        <span
                          className={`font-black text-sm ${
                            isWinner
                              ? 'text-amber-400 font-extrabold flex items-center justify-end gap-1'
                              : ps.stationaryTime <= 2.2
                              ? 'text-emerald-400'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {isWinner && <Zap className="w-3 h-3 fill-amber-400" />}
                          {ps.stationaryDuration}
                        </span>
                      </div>

                      <div className="text-right border-l border-[var(--border-subtle)] pl-4">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block font-bold">
                          Pit Lane Transit
                        </span>
                        <span className="font-bold text-xs text-[var(--text-secondary)]">
                          {ps.pitLaneDuration}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
