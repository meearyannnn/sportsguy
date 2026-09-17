'use client';

import React, { useState } from 'react';
import { DriverStanding, ConstructorStanding } from '@/lib/f1/types';
import { getTeamMeta, DRIVER_DETAILS, getNationalityFlag } from '@/lib/f1/teams';
import PaceTrace from '@/components/f1/PaceTrace';
import DriverAvatar from '@/components/f1/DriverAvatar';
import DriverIdentityCard from '@/components/f1/DriverIdentityCard';
import FreshnessBadge from '@/components/f1/FreshnessBadge';
import ContextualExplainer from '@/components/f1/ContextualExplainer';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface StandingsViewProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  onSelectDriver?: (driverId: string) => void;
}

export default function StandingsView({
  driverStandings,
  constructorStandings,
  onSelectDriver,
}: StandingsViewProps) {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
  const [expandedConstructorId, setExpandedConstructorId] = useState<string | null>(null);

  // Max points for bar scaling
  const maxDriverPoints = driverStandings.length > 0 ? parseFloat(driverStandings[0].points) || 1 : 1;
  const maxConstructorPoints =
    constructorStandings.length > 0 ? parseFloat(constructorStandings[0].points) || 1 : 1;

  return (
    <div className="space-y-4">
      {/* Precision Header & Timing Segment Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-hud font-black text-xs uppercase tracking-widest text-[var(--accent-f1-red)]">
              FIA OFFICIAL CLASSIFICATION
            </span>
            <span className="text-[var(--text-muted)] text-xs">•</span>
            <span className="text-xs font-mono-num text-[var(--text-muted)]">
              2024 WORLD CHAMPIONSHIP
            </span>
            <span className="text-[var(--text-muted)] text-xs hidden sm:inline">•</span>
            <FreshnessBadge
              cadence="periodic"
              className="hidden sm:inline-flex"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)] mt-0.5">
            {tab === 'drivers' ? 'Drivers Championship' : 'Constructors Championship'}
          </h2>
        </div>

        {/* Tab Switcher: Segmented Flat Control */}
        <div className="flex items-center border border-[var(--border-subtle)] rounded p-0.5 bg-[var(--bg-secondary)]">
          <button
            onClick={() => setTab('drivers')}
            className={`px-3 py-1 rounded text-xs font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tab === 'drivers'
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Drivers
          </button>
          <button
            onClick={() => setTab('constructors')}
            className={`px-3 py-1 rounded text-xs font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              tab === 'constructors'
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Constructors
          </button>
        </div>
      </div>


      {/* DRIVERS STANDINGS TABLE */}
      {tab === 'drivers' ? (
        <div className="border border-[var(--border-subtle)] rounded bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)] overflow-hidden">
          {/* Table Header Bar */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-[var(--bg-primary)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
            <div className="col-span-2 sm:col-span-1 text-center">POS</div>
            <div className="col-span-6 sm:col-span-5">DRIVER / TEAM</div>
            <div className="col-span-2 hidden sm:block text-center">FORM</div>
            <div className="col-span-2 hidden sm:block text-right">GAP / WINS</div>
            <div className="col-span-4 sm:col-span-2 text-right pr-2">POINTS</div>
          </div>

          {/* Rows */}
          {driverStandings.map((standing, index) => {
            const team = standing.Constructors[0]
              ? getTeamMeta(standing.Constructors[0].constructorId)
              : getTeamMeta('ferrari');
            const driverId = standing.Driver.driverId;
            const extra = DRIVER_DETAILS[driverId];
            const points = parseFloat(standing.points) || 0;
            const gapToLeader = index === 0 ? 0 : points - maxDriverPoints;
            const percentOfLeader = Math.max(4, (points / maxDriverPoints) * 100);
            const isP1 = index === 0;
            const isExpanded = expandedDriverId === driverId;

            return (
              <div key={standing.Driver.driverId} className="flex flex-col border-b border-[var(--border-subtle)] last:border-b-0">
                <div
                  onClick={() => {
                    // On mobile, toggle expansion; on desktop, open profile directly
                    if (window.innerWidth < 640) {
                      setExpandedDriverId(isExpanded ? null : driverId);
                    } else if (onSelectDriver) {
                      onSelectDriver(driverId);
                    }
                  }}
                  className="group relative grid grid-cols-12 gap-2 items-center px-3 py-3 min-h-[50px] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none"
                  title={`Tap to view ${standing.Driver.givenName} ${standing.Driver.familyName}`}
                >
                  {/* Team Livery Color Left Border Accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: team.color }}
                  ></div>

                  {/* 1. POS & Permanent Number */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 font-mono-num font-black text-sm">
                    <span className={isP1 ? 'text-[var(--accent-f1-red)] font-black' : 'text-[var(--text-muted)]'}>
                      {standing.position}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1 rounded sm:hidden"
                      style={{ color: team.color, backgroundColor: `${team.color}15` }}
                    >
                      #{extra?.number || standing.Driver.permanentNumber || standing.position}
                    </span>
                  </div>

                  {/* 2. DRIVER / TEAM WITH DRIVER AVATAR */}
                  <div className="col-span-6 sm:col-span-5 min-w-0 pr-1 flex items-center gap-2">
                    <DriverAvatar
                      driverId={driverId}
                      driverName={`${standing.Driver.givenName} ${standing.Driver.familyName}`}
                      permanentNumber={extra?.number || standing.position}
                      teamColor={team.color}
                      size="sm"
                      mode="photo"
                      className="hidden sm:flex shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-hud font-bold uppercase text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-white truncate">
                          {standing.Driver.givenName}{' '}
                          <span className="font-black">{standing.Driver.familyName}</span>
                        </span>
                        <span className="text-xs shrink-0">
                          {getNationalityFlag(standing.Driver.nationality) || extra?.countryFlag || '🏁'}
                        </span>
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-medium truncate">
                        {team.name}
                      </div>
                    </div>
                  </div>

                  {/* 3. RECENT FORM (Hidden on small mobile, visible in expanded drawer or sm+) */}
                  <div className="col-span-2 hidden sm:flex items-center justify-center">
                    <PaceTrace driverId={driverId} width={42} height={12} />
                  </div>

                  {/* 4. GAP / WINS (Hidden on small mobile, visible in expanded drawer or sm+) */}
                  <div className="col-span-2 hidden sm:block text-right font-mono-num text-xs">
                    <div className="font-bold text-[var(--text-secondary)]">
                      {isP1 ? (
                        <span className="text-[var(--accent-f1-red)] font-hud uppercase tracking-wider text-[11px]">
                          LEADER
                        </span>
                      ) : (
                        <span>{gapToLeader.toFixed(0)} PTS</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {standing.wins} {standing.wins === '1' ? 'WIN' : 'WINS'}
                    </div>
                  </div>

                  {/* 5. POINTS & Mobile Expand Indicator */}
                  <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5 pr-2">
                    <span className="font-mono-num font-black text-base sm:text-xl text-[var(--text-primary)]">
                      {standing.points}
                    </span>
                    <div className="sm:hidden text-[var(--text-muted)]">
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>

                  {/* Thin Sub-bar for Relative Scale */}
                  <div className="col-span-12 h-0.5 bg-[var(--bg-primary)] rounded-full overflow-hidden mt-1 opacity-60">
                    <div
                      className="h-full"
                      style={{
                        width: `${percentOfLeader}%`,
                        backgroundColor: isP1 ? 'var(--accent-f1-red)' : team.color,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Mobile Tap-To-Expand Telemetry Drawer (Zero Horizontal Scroll) */}
                {isExpanded && (
                  <div className="sm:hidden bg-[var(--bg-primary)]/90 border-t border-[var(--border-subtle)] p-3 space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                          Gap to Leader
                        </span>
                        <span className="font-mono-num font-bold text-sm text-[var(--text-primary)]">
                          {isP1 ? 'CHAMPIONSHIP LEADER' : `${gapToLeader.toFixed(0)} PTS`}
                        </span>
                      </div>
                      <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                        <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                          Season Wins
                        </span>
                        <span className="font-mono-num font-bold text-sm text-[var(--text-primary)]">
                          {standing.wins} {standing.wins === '1' ? 'Win' : 'Wins'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold">
                        Rolling 5-Race Pace Form
                      </span>
                      <PaceTrace driverId={driverId} width={64} height={16} />
                    </div>

                    {onSelectDriver && (
                      <button
                        onClick={() => onSelectDriver(driverId)}
                        className="w-full min-h-[44px] py-2 px-3 rounded-lg bg-[var(--accent-f1-red)] text-white text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
                      >
                        <span>Open Full Driver Dossier</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* CONSTRUCTORS STANDINGS TABLE */
        <div className="border border-[var(--border-subtle)] rounded bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[var(--bg-primary)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] select-none">
            <div className="col-span-1 text-center">POS</div>
            <div className="col-span-6 sm:col-span-5">CONSTRUCTOR / ENGINE</div>
            <div className="col-span-2 hidden sm:block text-center">RECENT FORM</div>
            <div className="col-span-3 sm:col-span-2 text-right">GAP / WINS</div>
            <div className="col-span-2 sm:col-span-2 text-right">POINTS</div>
          </div>

          {/* Rows */}
          {constructorStandings.map((standing, index) => {
            const team = getTeamMeta(standing.Constructor.constructorId);
            const points = parseFloat(standing.points) || 0;
            const gapToLeader = index === 0 ? 0 : points - maxConstructorPoints;
            const percentOfLeader = Math.max(4, (points / maxConstructorPoints) * 100);
            const isP1 = index === 0;

            return (
              <div
                key={standing.Constructor.constructorId}
                className="group relative grid grid-cols-12 gap-2 items-center px-3 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                {/* 3px Team Livery Color Left Border Accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: team.color }}
                ></div>

                {/* POS */}
                <div className="col-span-1 text-center font-mono-num font-black text-sm sm:text-base">
                  <span className={isP1 ? 'text-[var(--accent-f1-red)] font-black' : 'text-[var(--text-muted)]'}>
                    {standing.position}
                  </span>
                </div>

                {/* CONSTRUCTOR */}
                <div className="col-span-6 sm:col-span-5 min-w-0 pr-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 border border-black/30"
                      style={{ backgroundColor: team.color }}
                    ></span>
                    <span className="font-hud font-bold uppercase text-xs sm:text-base text-[var(--text-primary)] group-hover:text-white truncate">
                      {standing.Constructor.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate pl-4">
                    {team.powerUnit} • {team.base}
                  </div>
                </div>

                {/* FORM */}
                <div className="col-span-2 hidden sm:flex items-center justify-center">
                  <PaceTrace width={42} height={12} color={team.color} />
                </div>

                {/* GAP / WINS */}
                <div className="col-span-3 sm:col-span-2 text-right font-mono-num text-xs">
                  <div className="font-bold text-[var(--text-secondary)]">
                    {isP1 ? (
                      <span className="text-[var(--accent-f1-red)] font-hud uppercase tracking-wider text-[11px]">
                        LEADER
                      </span>
                    ) : (
                      <span>{gapToLeader.toFixed(0)} PTS</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {standing.wins} WINS
                  </div>
                </div>

                {/* POINTS */}
                <div className="col-span-2 sm:col-span-2 text-right">
                  <span className="font-mono-num font-black text-base sm:text-xl text-[var(--text-primary)]">
                    {standing.points}
                  </span>
                </div>

                {/* Relative Visual Scale Bar */}
                <div className="col-span-12 h-0.5 bg-[var(--bg-primary)] rounded-full overflow-hidden mt-1 opacity-60">
                  <div
                    className="h-full"
                    style={{
                      width: `${percentOfLeader}%`,
                      backgroundColor: isP1 ? 'var(--accent-f1-red)' : team.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

