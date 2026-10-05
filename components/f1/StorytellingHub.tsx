'use client';

import React, { useState } from 'react';
import { Race, DriverStanding } from '@/lib/f1/types';
import { getActiveStreaksAndRecords, getThisDayInF1 } from '@/lib/f1/analytics';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  CIRCUIT_SAFETY_CAR_LOGS,
  CIRCUIT_ATMOSPHERE_DATA,
  CIRCUIT_TECHNICAL_TELEMETRY,
  LAST_TIME_OUT_RECORDS,
  computeTeamsToWatch,
  computeChampionshipTitleScenario,
} from '@/lib/f1/briefingData';
import {
  BookOpen,
  Trophy,
  History,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Compass,
  ShieldAlert,
  Moon,
  Sun,
  Gauge,
  Timer,
  AlertTriangle,
  Flag,
  Flame,
  CheckCircle2,
  Sliders,
  Award,
} from 'lucide-react';

interface StorytellingHubProps {
  nextRace: Race | null;
  standings: DriverStanding[];
  calendar?: Race[];
  onSelectDriver?: (driverId: string) => void;
}

export default function StorytellingHub({
  nextRace,
  standings,
  calendar = [],
  onSelectDriver,
}: StorytellingHubProps) {
  const [subTab, setSubTab] = useState<'briefing' | 'streaks' | 'thisday' | 'comparison'>('briefing');
  const [selectedCircuitOverride, setSelectedCircuitOverride] = useState<string | null>(null);
  const [compareDriverA, setCompareDriverA] = useState<string>(standings[0]?.Driver.driverId || 'antonelli');
  const [compareDriverB, setCompareDriverB] = useState<string>(standings[1]?.Driver.driverId || 'russell');

  const streaks = getActiveStreaksAndRecords(standings);
  const thisDay = getThisDayInF1();

  // Active Race Resolution for Briefing
  const activeRace = selectedCircuitOverride
    ? calendar.find((r) => r.Circuit.circuitId === selectedCircuitOverride) || nextRace
    : nextRace;

  const circuitId = activeRace?.Circuit?.circuitId || 'baku';
  const currentRoundNum = parseInt(activeRace?.round || '17', 10);

  // Briefing Data Modules (Strictly backed by verified telemetry and logs)
  const scLog = CIRCUIT_SAFETY_CAR_LOGS[circuitId];
  const atmosphere = CIRCUIT_ATMOSPHERE_DATA[circuitId];
  const telemetry = CIRCUIT_TECHNICAL_TELEMETRY[circuitId];
  const lastTimeOut = LAST_TIME_OUT_RECORDS[circuitId];
  const teamsToWatch = computeTeamsToWatch();
  const titleScenario = computeChampionshipTitleScenario(standings, calendar, currentRoundNum);

  // Dynamic, Verifiable Headline
  let headline = `GRAND PRIX BRIEFING: ${activeRace?.raceName?.toUpperCase() || 'UPCOMING RACE'}`;
  let headlineSub = '';

  if (atmosphere?.isNightRace) {
    headline = `THE BATTLE UNDER THE FLOODLIGHTS: ROUND ${currentRoundNum} ${activeRace?.Circuit?.Location?.locality?.toUpperCase() || 'NIGHT GP'}`;
  } else if (circuitId === 'monza') {
    headline = `TEMPLE OF SPEED SHOWDOWN: ROUND ${currentRoundNum} MONZA`;
  } else if (circuitId === 'spa') {
    headline = `THE ARDENNES ARROW: ROUND ${currentRoundNum} SPA-FRANCORCHAMPS`;
  } else if (circuitId === 'silverstone') {
    headline = `HOME OF MOTORSPORT: ROUND ${currentRoundNum} SILVERSTONE`;
  } else if (circuitId === 'monaco') {
    headline = `THE CROWN JEWEL: ROUND ${currentRoundNum} MONTE CARLO`;
  } else if (circuitId === 'baku') {
    headline = `THE CAUCASUS HIGH-SPEED GAUNTLET: ROUND ${currentRoundNum} BAKU`;
  } else if (circuitId === 'madring') {
    headline = `THE NEW CAPITAL FRONTIER: ROUND ${currentRoundNum} MADRID`;
  } else {
    headline = `TACTICAL BRIEFING: ROUND ${currentRoundNum} ${activeRace?.Circuit?.Location?.locality?.toUpperCase() || 'GRAND PRIX'}`;
  }

  if (titleScenario) {
    headlineSub = `${titleScenario.leaderName} (${titleScenario.leaderPoints} pts) leads by ${titleScenario.pointsLead} pts with ${titleScenario.roundsRemaining} rounds remaining (${titleScenario.pointsRemainingMax} max pts on offer).`;
  }

  // Trajectory curve calculations
  const driverA = standings.find((s) => s.Driver.driverId === compareDriverA) || standings[0];
  const driverB = standings.find((s) => s.Driver.driverId === compareDriverB) || standings[1];

  const teamA = driverA?.Constructors[0] ? getTeamMeta(driverA.Constructors[0].constructorId) : getTeamMeta('mercedes');
  const teamB = driverB?.Constructors[0] ? getTeamMeta(driverB.Constructors[0].constructorId) : getTeamMeta('ferrari');

  const rounds = Array.from({ length: 14 }, (_, i) => i + 1);
  const ptsA = parseFloat(driverA?.points || '292');
  const ptsB = parseFloat(driverB?.points || '191');

  const trajectoryA = rounds.map((r) => Math.round((ptsA / 14) * r));
  const trajectoryB = rounds.map((r) => Math.round((ptsB / 14) * r));

  const maxProgression = Math.max(ptsA, ptsB, 200);
  const svgWidth = 600;
  const svgHeight = 220;

  const pointsAStr = trajectoryA
    .map((val, idx) => {
      const x = (idx / (rounds.length - 1)) * svgWidth;
      const y = svgHeight - (val / maxProgression) * (svgHeight - 40) - 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const pointsBStr = trajectoryB
    .map((val, idx) => {
      const x = (idx / (rounds.length - 1)) * svgWidth;
      const y = svgHeight - (val / maxProgression) * (svgHeight - 40) - 20;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Sub-tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>CONTEXT, NARRATIVE & HISTORIC STORYTELLING</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Race Weekend Briefings & Historic Dossiers
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Pre-race intelligence briefs, record streaks, retro milestones from 1950+, and season trajectory curves
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase">
          <button
            onClick={() => setSubTab('briefing')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'briefing'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Race Briefing</span>
          </button>

          <button
            onClick={() => setSubTab('streaks')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'streaks'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Streaks Watch</span>
          </button>

          <button
            onClick={() => setSubTab('thisday')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'thisday'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>This Day in F1</span>
          </button>

          <button
            onClick={() => setSubTab('comparison')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'comparison'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trajectory Curve</span>
          </button>
        </div>
      </div>

      {/* 1. UPGRADED VERIFIABLE RACE WEEKEND PRE-RACE BRIEFING */}
      {subTab === 'briefing' && (
        <div className="space-y-6">
          {/* Calendar Venue Selector */}
          {calendar.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <span className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)] mr-1">
                Select Grand Prix:
              </span>
              <button
                onClick={() => setSelectedCircuitOverride(null)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-hud tracking-wider border transition-all ${
                  !selectedCircuitOverride
                    ? 'bg-[var(--accent-f1-red)] text-white border-[var(--accent-f1-red)] font-bold'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                Upcoming: {nextRace?.raceName.replace(' Grand Prix', '') || 'Next GP'}
              </button>

              {calendar.slice(0, 10).map((r) => (
                <button
                  key={r.Circuit.circuitId}
                  onClick={() => setSelectedCircuitOverride(r.Circuit.circuitId)}
                  className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-hud tracking-wider border transition-all ${
                    selectedCircuitOverride === r.Circuit.circuitId
                      ? 'bg-[var(--accent-f1-red)] text-white border-[var(--accent-f1-red)] font-bold'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  R{r.round} {r.Circuit.Location.locality}
                </button>
              ))}
            </div>
          )}

          {/* Main Briefing Card */}
          <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6 shadow-xl">
            {/* Header info bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] flex-wrap gap-2">
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--accent-f1-red)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                OFFICIAL TECHNICAL BRIEFING: {activeRace?.raceName.toUpperCase() || 'GRAND PRIX'}
              </span>
              <span className="text-xs font-mono-num text-[var(--text-muted)]">
                Round {currentRoundNum} of {calendar.length || 24} • 2026 FIA World Championship
              </span>
            </div>

            {/* Headline and concrete narrative hook */}
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] tracking-tight">
                {headline}
              </h3>
              {headlineSub && (
                <p className="text-sm font-hud font-bold text-amber-400">
                  {headlineSub}
                </p>
              )}
            </div>

            {/* Atmospheric & Day/Night Verification Banner */}
            {atmosphere && (
              <div className="p-3.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-start gap-3 flex-wrap text-xs">
                <div className="flex items-center gap-1.5 shrink-0 text-amber-400 font-hud font-bold uppercase tracking-wide">
                  {atmosphere.isNightRace ? (
                    <Moon className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <span>{atmosphere.lightingDescription}</span>
                </div>
                <div className="text-[var(--text-secondary)] flex-1 min-w-[240px]">
                  {atmosphere.climateContext} · <span className="font-mono text-[var(--text-primary)]">{atmosphere.typicalAmbientC}</span> ambient, <span className="font-mono text-[var(--text-primary)]">{atmosphere.typicalTrackC}</span> track surface · Elevation: <span className="font-mono">{atmosphere.elevationMeters}</span>.
                </div>
              </div>
            )}

            {/* Asymmetric Core Insights Grid (8 cols primary / 4 cols side) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column (8 cols): Title Scenarios & Telemetry */}
              <div className="lg:col-span-8 space-y-4">
                {/* 1. Championship Pressure & Title Scenarios */}
                {titleScenario && (
                  <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-hud font-bold uppercase text-amber-400 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Championship Pressure & Title Scenarios
                      </div>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        {titleScenario.roundsRemaining} Rounds Left ({titleScenario.pointsRemainingMax} Max Pts)
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {titleScenario.clinchStatusSummary}
                    </p>

                    <div className="grid grid-cols-3 gap-2 pt-1 font-mono-num text-xs">
                      <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Leader</span>
                        <span className="font-bold text-emerald-400">{titleScenario.leaderCode} ({titleScenario.leaderPoints} pts)</span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">P2 Chaser</span>
                        <span className="font-bold text-[var(--text-primary)]">{titleScenario.p2Code} ({titleScenario.p2Points} pts)</span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">P1-P2 Margin</span>
                        <span className="font-bold text-amber-400">+{titleScenario.pointsLead} pts</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Track Characteristic Telemetry Callouts */}
                {telemetry && (
                  <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-hud font-bold uppercase text-cyan-400 flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5" />
                        Circuit Characteristics & Telemetry Benchmarks
                      </div>
                      <span className="text-[9px] font-mono text-[var(--text-muted)]">
                        FIA & Pirelli Technical Previews
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-num">
                      <div className="p-2 rounded bg-[var(--bg-secondary)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Top Speed</span>
                        <span className="font-bold text-emerald-400">{telemetry.topSpeedKmh}</span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Full Throttle</span>
                        <span className="font-bold text-[var(--text-primary)]">{telemetry.longestFullThrottle}</span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Lateral Force</span>
                        <span className="font-bold text-amber-400">{telemetry.lateralGMax}</span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)]">
                        <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Tyre Stress</span>
                        <span className="font-bold text-rose-400">{telemetry.tyreDegradationSeverity.split(' ')[0]}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">Heavy Braking Zones: </strong>
                        {telemetry.heavyBrakingZones}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        <strong className="text-[var(--text-primary)]">Key Technical Demand: </strong>
                        {telemetry.distinctiveDemand}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono pt-1">
                        Tyre Allocation: {telemetry.officialTyreCompounds}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (4 cols): Safety Car Log & Teams to Watch */}
              <div className="lg:col-span-4 space-y-4">
                {/* 1. Verified Safety Car Deployment Log */}
                {scLog && (
                  <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-hud font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Safety Car Probability
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {scLog.percentage}%
                      </span>
                    </div>

                    <div className="p-2.5 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                      <div className="text-xs font-hud font-bold text-[var(--text-primary)]">
                        Deployed in {scLog.deployments} of the last {scLog.totalRaces} races ({scLog.percentage}%)
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] leading-tight">
                        Total {scLog.fullScCount} physical Safety Cars and {scLog.vscCount} Virtual Safety Cars across {scLog.samplePeriod}.
                      </div>
                    </div>

                    <div className="text-[8px] font-mono text-[var(--text-muted)] opacity-75">
                      Source: {scLog.citation}
                    </div>
                  </div>
                )}

                {/* 2. Teams to Watch Driven Strictly by Recent Form (Last 3 Races) */}
                <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-hud font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      Teams to Watch (Recent Form)
                    </div>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">
                      Last 3 GPs Average
                    </span>
                  </div>

                  <div className="space-y-2">
                    {teamsToWatch.map((team) => (
                      <div
                        key={team.teamId}
                        className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.teamColor }} />
                            <span className="text-xs font-hud font-bold text-[var(--text-primary)] uppercase">
                              {team.teamName}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400">
                            Avg P{team.avgFinishL3}
                          </span>
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] leading-tight">
                          {team.formVerdict}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[8px] font-mono text-[var(--text-muted)] opacity-75">
                    Source: Verified finishing positions across past 3 rounds (2026 FIA Official Results)
                  </div>
                </div>
              </div>
            </div>

            {/* 3. "Last Time Out Here" Concrete Historical Module */}
            {lastTimeOut && (
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-xs font-hud font-bold uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    Last Time Out Here: {lastTimeOut.year} {activeRace?.raceName}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Official Historical Benchmark
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono-num">
                  <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Race Winner</span>
                    <span className="font-bold text-[var(--text-primary)] text-sm">{lastTimeOut.winnerName}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      {lastTimeOut.winnerTeam} · {lastTimeOut.winnerTime}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Pole Position</span>
                    <span className="font-bold text-emerald-400 text-sm">{lastTimeOut.poleDriver}</span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      Pole Lap: {lastTimeOut.poleTime}
                    </span>
                  </div>

                  <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] sm:col-span-1">
                    <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase block">Deciding Factor</span>
                    <p className="text-[11px] text-[var(--text-secondary)] font-sans leading-snug mt-0.5">
                      {lastTimeOut.decisiveFactor}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. STREAKS & RECORDS WATCH */}
      {subTab === 'streaks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {streaks.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded-sm text-[10px] font-hud font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${s.teamColor}20`,
                    color: s.teamColor,
                    border: `1px solid ${s.teamColor}40`,
                  }}
                >
                  {s.badge}
                </span>

                <span className="font-hud font-black text-2xl font-mono-num text-[var(--text-primary)]">
                  {s.currentCount} <span className="text-xs text-[var(--text-muted)]">/ {s.recordTarget}</span>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-hud font-black uppercase text-[var(--text-primary)]">
                  {s.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {s.statusText}
                </p>
              </div>

              <div className="p-3 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-1">
                <div className="flex justify-between font-hud uppercase text-[10px]">
                  <span>Record Holder:</span>
                  <span className="text-[var(--text-primary)] font-bold">{s.holder}</span>
                </div>
                <div className="flex justify-between font-hud uppercase text-[10px]">
                  <span>Target Benchmark:</span>
                  <span className="font-mono-num text-[var(--text-primary)] font-bold">{s.recordTarget} PTS</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. THIS DAY IN F1 RETRO VAULT */}
      {subTab === 'thisday' && (
        <div className="p-6 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
                HISTORICAL VAULT ARCHIVE
              </div>
              <h3 className="text-xl sm:text-2xl font-hud font-black uppercase text-[var(--text-primary)]">
                On This Day in Grand Prix History
              </h3>
            </div>
            <div className="text-right text-xs font-mono-num text-[var(--text-muted)]">
              {thisDay.dateStr}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-[var(--accent-f1-red)]/15 border border-[var(--accent-f1-red)]/30 text-[var(--accent-f1-red)] font-hud font-black text-sm">
                {thisDay.year}
              </span>
              <h4 className="text-lg font-hud font-bold text-[var(--text-primary)] uppercase">
                {thisDay.event}
              </h4>
            </div>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {thisDay.story}
            </p>

            <div className="p-4 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-f1-red)]" />
                <span className="font-hud uppercase font-bold text-[var(--text-primary)]">
                  {thisDay.circuit}
                </span>
              </div>
              <div className="text-[var(--text-muted)]">
                Driver Involved: <span className="font-hud font-bold text-[var(--text-primary)]">{thisDay.winner}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SEASON TRAJECTORY COMPARISON CURVE */}
      {subTab === 'comparison' && (
        <div className="p-6 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
                HEAD-TO-HEAD PROGRESSION ACCUMULATOR
              </div>
              <h3 className="text-xl font-hud font-black uppercase text-[var(--text-primary)]">
                Points Accumulation Trajectory Curve
              </h3>
            </div>

            {/* Driver selectors */}
            <div className="flex items-center gap-2 text-xs font-hud uppercase">
              <select
                value={compareDriverA}
                onChange={(e) => setCompareDriverA(e.target.value)}
                className="px-2.5 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold outline-none cursor-pointer"
              >
                {standings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId}>
                    {s.Driver.code || s.Driver.familyName} ({s.points} pts)
                  </option>
                ))}
              </select>

              <span className="text-[var(--text-muted)] font-bold">vs</span>

              <select
                value={compareDriverB}
                onChange={(e) => setCompareDriverB(e.target.value)}
                className="px-2.5 py-1.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold outline-none cursor-pointer"
              >
                {standings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId}>
                    {s.Driver.code || s.Driver.familyName} ({s.points} pts)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SVG Trajectory Chart */}
          <div className="space-y-4">
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 sm:h-56">
                {/* Horizontal gridlines */}
                {[0.25, 0.5, 0.75, 1].map((ratio) => (
                  <line
                    key={ratio}
                    x1="0"
                    y1={svgHeight - ratio * (svgHeight - 40) - 20}
                    x2={svgWidth}
                    y2={svgHeight - ratio * (svgHeight - 40) - 20}
                    stroke="var(--border-subtle)"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Driver A Polyline */}
                <polyline
                  fill="none"
                  stroke={teamA.color}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsAStr}
                />

                {/* Driver B Polyline */}
                <polyline
                  fill="none"
                  stroke={teamB.color}
                  strokeWidth="3"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsBStr}
                />
              </svg>
            </div>

            {/* Legend & Stats Comparison */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono-num">
              <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamA.color }} />
                  <span className="font-hud font-bold text-[var(--text-primary)] uppercase">
                    {driverA?.Driver.givenName} {driverA?.Driver.familyName}
                  </span>
                </div>
                <span className="font-bold text-sm" style={{ color: teamA.color }}>
                  {ptsA} pts
                </span>
              </div>

              <div className="p-3 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamB.color }} />
                  <span className="font-hud font-bold text-[var(--text-primary)] uppercase">
                    {driverB?.Driver.givenName} {driverB?.Driver.familyName}
                  </span>
                </div>
                <span className="font-bold text-sm" style={{ color: teamB.color }}>
                  {ptsB} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
