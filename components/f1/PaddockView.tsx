'use client';

import React, { useState } from 'react';
import { DriverStanding, ConstructorStanding } from '@/lib/f1/types';
import { F1_TEAMS, DRIVER_DETAILS, getTeamMeta } from '@/lib/f1/teams';
import {
  Users,
  Swords,
  Shield,
  Trophy,
  Award,
  Zap,
  Check,
  ChevronRight,
  GraduationCap,
  Wrench,
} from 'lucide-react';
import DriverAvatar from '@/components/f1/DriverAvatar';
import { NavTab } from './Navbar';

interface PaddockViewProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  onSelectDriver?: (driverId: string) => void;
  onNavigateTab?: (tab: NavTab) => void;
  initialSubTab?: 'h2h' | 'constructors' | 'drivers';
}

export default function PaddockView({
  driverStandings,
  constructorStandings,
  onSelectDriver,
  onNavigateTab,
  initialSubTab = 'drivers',
}: PaddockViewProps) {
  const [subTab, setSubTab] = useState<'h2h' | 'constructors' | 'drivers'>(initialSubTab);

  // Head to Head Driver selection
  const [driverAId, setDriverAId] = useState<string>(
    driverStandings[0]?.Driver.driverId || 'max_verstappen'
  );
  const [driverBId, setDriverBId] = useState<string>(
    driverStandings[1]?.Driver.driverId || 'norris'
  );

  const standingA = driverStandings.find((s) => s.Driver.driverId === driverAId) || driverStandings[0];
  const standingB = driverStandings.find((s) => s.Driver.driverId === driverBId) || driverStandings[1];

  const teamA = standingA?.Constructors[0]
    ? getTeamMeta(standingA.Constructors[0].constructorId)
    : getTeamMeta('red_bull');
  const teamB = standingB?.Constructors[0]
    ? getTeamMeta(standingB.Constructors[0].constructorId)
    : getTeamMeta('mclaren');

  const metaA = DRIVER_DETAILS[standingA?.Driver.driverId || ''] || {
    number: 1,
    code: 'VER',
    countryFlag: '🇳🇱',
    worldTitles: 4,
    bio: 'Formula 1 elite champion.',
  };

  const metaB = DRIVER_DETAILS[standingB?.Driver.driverId || ''] || {
    number: 4,
    code: 'NOR',
    countryFlag: '🇬🇧',
    worldTitles: 0,
    bio: 'Championship contender with blistering pace.',
  };

  const ptsA = parseFloat(standingA?.points || '0');
  const ptsB = parseFloat(standingB?.points || '0');
  const winsA = parseInt(standingA?.wins || '0', 10);
  const winsB = parseInt(standingB?.wins || '0', 10);
  const posA = parseInt(standingA?.position || '1', 10);
  const posB = parseInt(standingB?.position || '2', 10);

  return (
    <div className="space-y-6">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase flex items-center gap-2 text-[var(--text-primary)]">
            <Users className="w-5 h-5 text-[var(--accent-f1-red)]" />
            F1 Paddock & Drivers
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Compare drivers side-by-side, inspect constructors, and view the driver grid.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-xl border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase">
          <button
            onClick={() => setSubTab('h2h')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'h2h'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Head to Head</span>
          </button>
          <button
            onClick={() => setSubTab('constructors')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'constructors'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Constructors</span>
          </button>
          <button
            onClick={() => setSubTab('drivers')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'drivers'
                ? 'bg-[var(--accent-f1-red)] text-white shadow-md shadow-red-950/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Driver Grid</span>
          </button>
        </div>
      </div>

      {/* HEAD TO HEAD COMPARATOR */}
      {subTab === 'h2h' && (
        <div className="space-y-6">
          {/* Driver Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <label className="block text-xs font-hud font-bold text-[var(--text-muted)] uppercase mb-2">
                Driver A (Select)
              </label>
              <select
                value={driverAId}
                onChange={(e) => setDriverAId(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-sm font-hud font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-f1-red)]"
              >
                {driverStandings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId} className="bg-[var(--bg-secondary)]">
                    P{s.position} • {s.Driver.givenName} {s.Driver.familyName} ({s.Constructors[0]?.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <label className="block text-xs font-hud font-bold text-[var(--text-muted)] uppercase mb-2">
                Driver B (Select)
              </label>
              <select
                value={driverBId}
                onChange={(e) => setDriverBId(e.target.value)}
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-lg p-2.5 text-sm font-hud font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-f1-red)]"
              >
                {driverStandings.map((s) => (
                  <option key={s.Driver.driverId} value={s.Driver.driverId} className="bg-[var(--bg-secondary)]">
                    P{s.position} • {s.Driver.givenName} {s.Driver.familyName} ({s.Constructors[0]?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Versus Visual Arena */}
          <div className="relative rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8 timing-tower-rail is-live">
            {/* Center VS Emblem */}
            <div className="absolute left-1/2 top-8 -translate-x-1/2 z-20 hidden sm:flex items-center justify-center px-3 py-1 rounded-sm bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs font-hud font-black text-amber-400">
              DRIVER COMPARISON
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
              {/* Driver A Card */}
              <div className="space-y-4 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center font-hud font-black text-2xl font-mono-num border"
                    style={{
                      borderColor: teamA.color,
                      color: teamA.color,
                      backgroundColor: `${teamA.color}15`,
                    }}
                  >
                    #{metaA.number}
                  </div>
                  <div>
                    <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 justify-center sm:justify-start">
                      <span>[{standingA?.Driver.nationality?.slice(0, 3).toUpperCase() || 'FIA'}]</span>
                      <span>{standingA?.Driver.nationality}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] leading-tight">
                      {standingA?.Driver.givenName}{' '}
                      <span style={{ color: teamA.color }}>{standingA?.Driver.familyName}</span>
                    </h3>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-sm text-xs font-hud font-semibold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  {teamA.fullName}
                </div>

                <p className="text-xs text-[var(--text-secondary)] italic">{metaA.bio}</p>

                {standingA?.Driver && (
                  <button
                    onClick={() => onSelectDriver && onSelectDriver(standingA.Driver.driverId)}
                    className="mt-3 px-3.5 py-1.5 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--accent-f1-red)] hover:text-white border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>VIEW DRIVER PROFILE</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Driver B Card */}
              <div className="space-y-4 text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end gap-3 flex-row-reverse sm:flex-row">
                  <div>
                    <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5 justify-center sm:justify-end">
                      <span>{standingB?.Driver.nationality}</span>
                      <span>[{standingB?.Driver.nationality?.slice(0, 3).toUpperCase() || 'FIA'}]</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] leading-tight">
                      {standingB?.Driver.givenName}{' '}
                      <span style={{ color: teamB.color }}>{standingB?.Driver.familyName}</span>
                    </h3>
                  </div>
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center font-hud font-black text-2xl font-mono-num border"
                    style={{
                      borderColor: teamB.color,
                      color: teamB.color,
                      backgroundColor: `${teamB.color}15`,
                    }}
                  >
                    #{metaB.number}
                  </div>
                </div>

                <div className="inline-block px-3 py-1 rounded-sm text-xs font-hud font-semibold uppercase tracking-wider text-[var(--text-secondary)] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
                  {teamB.fullName}
                </div>

                <p className="text-xs text-[var(--text-secondary)] italic">{metaB.bio}</p>

                {standingB?.Driver && (
                  <button
                    onClick={() => onSelectDriver && onSelectDriver(standingB.Driver.driverId)}
                    className="mt-3 px-3.5 py-1.5 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--accent-f1-red)] hover:text-white border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>VIEW DRIVER PROFILE</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Side-by-Side Stat Bars */}
            <div className="mt-8 pt-6 border-t border-[var(--border-subtle)] space-y-4">
              {/* Championship Standing */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                  <span className={posA < posB ? 'text-emerald-400' : ''}>P{posA}</span>
                  <span>Championship Rank</span>
                  <span className={posB < posA ? 'text-emerald-400' : ''}>P{posB}</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(posB / (posA + posB)) * 100}%`,
                      backgroundColor: teamA.color,
                    }}
                  ></div>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(posA / (posA + posB)) * 100}%`,
                      backgroundColor: teamB.color,
                    }}
                  ></div>
                </div>
              </div>

              {/* Season Points */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                  <span className={ptsA >= ptsB ? 'text-emerald-400' : ''}>{ptsA} PTS</span>
                  <span>Current Season Points</span>
                  <span className={ptsB >= ptsA ? 'text-emerald-400' : ''}>{ptsB} PTS</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${ptsA + ptsB === 0 ? 50 : (ptsA / (ptsA + ptsB)) * 100}%`,
                      backgroundColor: teamA.color,
                    }}
                  ></div>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${ptsA + ptsB === 0 ? 50 : (ptsB / (ptsA + ptsB)) * 100}%`,
                      backgroundColor: teamB.color,
                    }}
                  ></div>
                </div>
              </div>

              {/* Grand Prix Wins */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                  <span className={winsA >= winsB ? 'text-emerald-400' : ''}>{winsA} WINS</span>
                  <span>Season Grand Prix Victories</span>
                  <span className={winsB >= winsA ? 'text-emerald-400' : ''}>{winsB} WINS</span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${winsA + winsB === 0 ? 50 : (winsA / (winsA + winsB)) * 100}%`,
                      backgroundColor: teamA.color,
                    }}
                  ></div>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${winsA + winsB === 0 ? 50 : (winsB / (winsA + winsB)) * 100}%`,
                      backgroundColor: teamB.color,
                    }}
                  ></div>
                </div>
              </div>

              {/* World Championship Titles */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                  <span className={metaA.worldTitles >= metaB.worldTitles ? 'text-amber-400' : ''}>
                    {metaA.worldTitles} TITLES
                  </span>
                  <span>Career World Championships</span>
                  <span className={metaB.worldTitles >= metaA.worldTitles ? 'text-amber-400' : ''}>
                    {metaB.worldTitles} TITLES
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONSTRUCTORS SHOWCASE */}
      {subTab === 'constructors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(F1_TEAMS).map(([key, team]) => (
            <div
              key={key}
              className="relative rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-all p-5 overflow-hidden group"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                style={{ backgroundColor: team.color }}
              ></div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span
                    className="px-2.5 py-0.5 rounded text-xs font-hud font-black uppercase tracking-wider"
                    style={{
                      backgroundColor: `${team.color}20`,
                      color: team.color,
                      border: `1px solid ${team.color}40`,
                    }}
                  >
                    {team.name}
                  </span>
                  <span className="text-[11px] font-mono-num text-[var(--text-muted)]">
                    {team.championships} Titles
                  </span>
                </div>

                <h3 className="text-lg font-hud font-black uppercase text-[var(--text-primary)]">
                  {team.fullName}
                </h3>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)] border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Power Unit:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{team.powerUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Headquarters:</span>
                    <span>{team.base}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Team Principal:</span>
                    <span className="font-medium">{team.teamPrincipal}</span>
                  </div>
                </div>

                {/* Livery palette preview */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[10px] uppercase font-hud text-[var(--text-muted)] font-bold">
                    Official Livery:
                  </span>
                  <div className="flex items-center gap-1">
                    <span
                      className="w-4 h-4 rounded-full border border-black/30"
                      style={{ backgroundColor: team.color }}
                      title={`Primary: ${team.color}`}
                    ></span>
                    <span
                      className="w-4 h-4 rounded-full border border-black/30"
                      style={{ backgroundColor: team.secondaryColor }}
                      title={`Secondary: ${team.secondaryColor}`}
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DRIVER GRID */}
      {subTab === 'drivers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {driverStandings.map((s) => {
            const team = s.Constructors[0] ? getTeamMeta(s.Constructors[0].constructorId) : getTeamMeta('ferrari');
            const meta = DRIVER_DETAILS[s.Driver.driverId] || {
              number: s.position,
              code: s.Driver.code || 'DRV',
              worldTitles: 0,
            };

            const isLeaderP1 = s.position === '1';

            return (
              <div
                key={s.Driver.driverId}
                onClick={() => onSelectDriver && onSelectDriver(s.Driver.driverId)}
                className={`relative rounded border bg-[var(--bg-secondary)] hover:border-[var(--accent-f1-red)]/60 hover:bg-[var(--bg-tertiary)] transition-all p-4 overflow-hidden group cursor-pointer ${
                  isLeaderP1 ? 'border-[var(--accent-f1-red)]' : 'border-[var(--border-subtle)]'
                }`}
                title={`Click to view ${s.Driver.givenName} ${s.Driver.familyName}`}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: team.color }}
                ></div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <DriverAvatar
                      driverId={s.Driver.driverId}
                      driverName={`${s.Driver.givenName} ${s.Driver.familyName}`}
                      permanentNumber={meta.number}
                      teamColor={team.color}
                      size="md"
                      mode="photo"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono-num font-bold text-[var(--text-muted)] uppercase truncate">
                        [{s.Driver.nationality?.slice(0, 3).toUpperCase() || 'FIA'}] • {team.name}
                      </div>
                      <div className="text-sm font-hud font-black uppercase text-[var(--text-primary)] leading-snug truncate">
                        {s.Driver.givenName}{' '}
                        <span style={{ color: team.color }}>{s.Driver.familyName}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className="font-hud font-black text-xs px-2 py-0.5 rounded border font-mono-num shrink-0"
                    style={{
                      borderColor: team.color,
                      color: team.color,
                      backgroundColor: `${team.color}15`,
                    }}
                  >
                    #{meta.number}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-num">
                  <span className="text-[var(--text-muted)]">P{s.position} Rank</span>
                  <span className="font-bold text-[var(--text-primary)]">{s.points} PTS</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
