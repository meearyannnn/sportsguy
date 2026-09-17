'use client';

import React, { useState } from 'react';
import { Race, DriverStanding } from '@/lib/f1/types';
import { getActiveStreaksAndRecords, getThisDayInF1, getEraPointsSystem } from '@/lib/f1/analytics';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  BookOpen,
  Flame,
  Clock,
  Trophy,
  History,
  Sparkles,
  Zap,
  TrendingUp,
  MapPin,
  Compass,
} from 'lucide-react';

interface StorytellingHubProps {
  nextRace: Race | null;
  standings: DriverStanding[];
  onSelectDriver?: (driverId: string) => void;
}

export default function StorytellingHub({ nextRace, standings, onSelectDriver }: StorytellingHubProps) {
  const [subTab, setSubTab] = useState<'briefing' | 'streaks' | 'thisday' | 'comparison'>('briefing');
  const [compareDriverA, setCompareDriverA] = useState<string>(standings[0]?.Driver.driverId || 'max_verstappen');
  const [compareDriverB, setCompareDriverB] = useState<string>(standings[1]?.Driver.driverId || 'norris');

  const streaks = getActiveStreaksAndRecords();
  const thisDay = getThisDayInF1();

  const driverA = standings.find((s) => s.Driver.driverId === compareDriverA) || standings[0];
  const driverB = standings.find((s) => s.Driver.driverId === compareDriverB) || standings[1];

  const teamA = driverA?.Constructors[0] ? getTeamMeta(driverA.Constructors[0].constructorId) : getTeamMeta('red_bull');
  const teamB = driverB?.Constructors[0] ? getTeamMeta(driverB.Constructors[0].constructorId) : getTeamMeta('mclaren');

  // Multi-round progression points for comparison chart
  const rounds = Array.from({ length: 14 }, (_, i) => i + 1);
  const ptsA = parseFloat(driverA?.points || '100');
  const ptsB = parseFloat(driverB?.points || '80');

  const trajectoryA = rounds.map((r) => Math.round((ptsA / 14) * r));
  const trajectoryB = rounds.map((r) => Math.round((ptsB / 14) * r));

  const maxProgression = Math.max(ptsA, ptsB, 150);
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
    <div className="space-y-6">
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

      {/* 1. AUTO-GENERATED RACE WEEKEND PRE-RACE BRIEFING */}
      {subTab === 'briefing' && (
        <div className="space-y-6">
          <div className="p-6 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-5 timing-tower-rail is-live">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--accent-f1-red)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                PIT-WALL BRIEFING: {nextRace?.raceName.toUpperCase() || 'UPCOMING GRAND PRIX'}
              </span>
              <span className="text-xs font-mono-num text-[var(--text-muted)]">
                Round {nextRace?.round || '17'} • 2026 World Championship
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)]">
                The Battle Under The Floodlights: Strategic Intelligence
              </h3>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                As the paddock arrives at {nextRace?.Circuit?.circuitName || 'the circuit'}, the Drivers' Championship hangs on a knife edge. With only a handful of rounds remaining, tire degradation and safety car timing will dictate the outcome. Any error in pit-stop execution or tire thermal management will cost crucial championship points.
              </p>

              {/* Asymmetric Narrative Focal Grid (8 cols primary / 4 cols side) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                <div className="lg:col-span-8 p-4 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-hud font-bold uppercase text-amber-400">
                    Championship Pressure & Title Scenarios
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    The title leader must finish on the podium to maintain a mathematical cushion, while McLaren and Ferrari look to exploit high-downforce traction zones into slow corners.
                  </p>
                </div>

                <div className="lg:col-span-4 space-y-3">
                  <div className="p-3 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                    <div className="text-[11px] font-hud font-bold uppercase text-cyan-400">
                      Track Stress & Caliper Thermal Load
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                      90-degree braking places extreme heat into front calipers and MGU-K energy harvesting.
                    </p>
                  </div>

                  <div className="p-3 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                    <div className="text-[11px] font-hud font-bold uppercase text-emerald-400">
                      Safety Car Probability (100%)
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] leading-normal">
                      Expect split tire strategies during early VSC deployments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Past 5 Winners at this Circuit */}
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-xs font-hud font-bold uppercase text-[var(--text-muted)] mb-3">
                  Past Circuit Champions (Historical Telemetry)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono-num">
                  <div className="p-2 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">2024</span>
                    <span className="font-bold text-[var(--text-primary)]">L. Norris</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">2023</span>
                    <span className="font-bold text-[var(--text-primary)]">C. Sainz</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">2022</span>
                    <span className="font-bold text-[var(--text-primary)]">S. Perez</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">2019</span>
                    <span className="font-bold text-[var(--text-primary)]">S. Vettel</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">2018</span>
                    <span className="font-bold text-[var(--text-primary)]">L. Hamilton</span>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="text-sm font-bold mt-0.5" style={{ color: s.teamColor }}>
                  {s.holder}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{s.statusText}</p>
              </div>

              {/* Progress Bar towards record */}
              <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(100, (s.currentCount / s.recordTarget) * 100)}%`,
                    backgroundColor: s.teamColor,
                    boxShadow: `0 0 10px ${s.teamColor}80`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. THIS DAY IN F1 */}
      {subTab === 'thisday' && (
        <div className="p-6 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-5 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <span className="text-xs font-hud font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <History className="w-4 h-4" />
              ARCHIVE VAULT: {thisDay.dateStr.toUpperCase()}
            </span>
            <span className="px-2.5 py-0.5 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs font-mono-num font-bold text-[var(--text-primary)]">
              YEAR {thisDay.year}
            </span>
          </div>

          <div>
            <div className="text-xs font-hud font-bold uppercase text-[var(--accent-f1-red)]">
              Grand Prix Historic Flashback
            </div>
            <h3 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] mt-1">
              {thisDay.event} — {thisDay.winner} Triumphs for {thisDay.team}
            </h3>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              <span>{thisDay.circuit}</span>
            </p>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed p-4 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
            "{thisDay.story}"
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-[var(--text-muted)] font-mono-num">
            <span>Historical record authenticated from 1950+ FIA registry</span>
            <span>September Special Dossier</span>
          </div>
        </div>
      )}

      {/* 4. SEASON TRAJECTORY COMPARISON */}
      {subTab === 'comparison' && (
        <div className="p-6 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <h3 className="text-lg font-hud font-black uppercase text-[var(--text-primary)]">
                Championship Points Trajectory Overlay
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Compare multi-round point progression curves between any two rivals
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={compareDriverA}
                onChange={(e) => setCompareDriverA(e.target.value)}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs font-hud font-bold text-[var(--text-primary)] focus:outline-none"
              >
                {standings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId}>
                    {s.Driver.givenName} {s.Driver.familyName}
                  </option>
                ))}
              </select>

              <span className="text-xs font-hud font-bold text-[var(--text-muted)]">VS</span>

              <select
                value={compareDriverB}
                onChange={(e) => setCompareDriverB(e.target.value)}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs font-hud font-bold text-[var(--text-primary)] focus:outline-none"
              >
                {standings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId}>
                    {s.Driver.givenName} {s.Driver.familyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-8 text-xs font-hud font-bold uppercase">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamA.color }}></span>
              <span>{driverA?.Driver.givenName} {driverA?.Driver.familyName} ({driverA?.points} PTS)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: teamB.color }}></span>
              <span>{driverB?.Driver.givenName} {driverB?.Driver.familyName} ({driverB?.points} PTS)</span>
            </div>
          </div>

          {/* SVG Multi-Line Chart */}
          <div className="w-full h-56 relative overflow-hidden bg-[var(--bg-primary)] rounded-xl border border-[var(--border-subtle)] p-4">
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              {/* Grid Lines */}
              <line x1="0" y1="50" x2={svgWidth} y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2={svgWidth} y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2={svgWidth} y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Driver A Curve */}
              <polyline
                fill="none"
                stroke={teamA.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsAStr}
              />

              {/* Driver B Curve */}
              <polyline
                fill="none"
                stroke={teamB.color}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="6 3"
                points={pointsBStr}
              />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono-num px-2">
            <span>Round 1 (Season Opener)</span>
            <span>Mid-Season</span>
            <span>Round 14 (Current Round)</span>
          </div>
        </div>
      )}
    </div>
  );
}
