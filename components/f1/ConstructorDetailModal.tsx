'use client';

import React, { useEffect, useState } from 'react';
import { getTeamMeta, DRIVER_DETAILS } from '@/lib/f1/teams';
import { ConstructorStanding } from '@/lib/f1/types';
import { getSeason2026Metrics } from '@/lib/f1/season2026Data';
import DriverAvatar from '@/components/f1/DriverAvatar';
import PaceTrace from '@/components/f1/PaceTrace';
import {
  X,
  Trophy,
  Shield,
  Wrench,
  Building2,
  UserCheck,
  Cpu,
  Calendar,
  Users,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ConstructorDetailModalProps {
  constructorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectDriver?: (driverId: string) => void;
  constructorStandings?: ConstructorStanding[];
}

export default function ConstructorDetailModal({
  constructorId,
  isOpen,
  onClose,
  onSelectDriver,
  constructorStandings = [],
}: ConstructorDetailModalProps) {
  const [liveStandings, setLiveStandings] = useState<ConstructorStanding[]>(constructorStandings);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (constructorStandings && constructorStandings.length > 0) {
      setLiveStandings(constructorStandings);
    } else if (isOpen) {
      fetch('/api/f1/standings?year=2026')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.constructors?.length > 0) {
            const mapped: ConstructorStanding[] = data.constructors.map((c: any) => ({
              position: String(c.pos),
              positionText: String(c.pos),
              points: String(c.points),
              wins: '0',
              Constructor: {
                constructorId: c.team.toLowerCase().replace(/[\s-]+/g, '_'),
                name: c.team,
                nationality: '',
              },
            }));
            setLiveStandings(mapped);
          }
        })
        .catch(() => {});
    }
  }, [constructorStandings, isOpen]);

  if (!isOpen || !constructorId) return null;

  const team = getTeamMeta(constructorId);
  const activeStandings = liveStandings.length > 0 ? liveStandings : constructorStandings;
  const standing = activeStandings.find(
    (s) =>
      s.Constructor.constructorId.toLowerCase() === constructorId.toLowerCase() ||
      getTeamMeta(s.Constructor.constructorId).id === team.id ||
      s.Constructor.name.toLowerCase().includes(team.name.toLowerCase()) ||
      team.name.toLowerCase().includes(s.Constructor.name.toLowerCase())
  );

  const teamDriverWins = team.drivers.reduce((acc, driverId) => {
    const metric = getSeason2026Metrics(driverId);
    return acc + (metric?.seasonWins || 0);
  }, 0);
  const teamDriverPoints = team.drivers.reduce((acc, driverId) => {
    const metric = getSeason2026Metrics(driverId);
    return acc + (metric?.seasonPoints || 0);
  }, 0);

  const CONSTRUCTOR_RANKS_2026: Record<string, { rank: number; points: number; wins: number }> = {
    mercedes: { rank: 1, points: 468, wins: 9 },
    ferrari: { rank: 2, points: 340, wins: 3 },
    mclaren: { rank: 3, points: 306, wins: 2 },
    red_bull: { rank: 4, points: 216, wins: 0 },
    rb: { rank: 5, points: 62, wins: 0 },
    alpine: { rank: 6, points: 51, wins: 0 },
    haas: { rank: 7, points: 40, wins: 0 },
    aston_martin: { rank: 8, points: 30, wins: 0 },
    sauber: { rank: 9, points: 22, wins: 0 },
    audi: { rank: 9, points: 22, wins: 0 },
    williams: { rank: 10, points: 16, wins: 0 },
    cadillac: { rank: 11, points: 0, wins: 0 },
  };

  const defaultMeta = CONSTRUCTOR_RANKS_2026[team.id] || { rank: 1, points: teamDriverPoints, wins: teamDriverWins };
  const displayRank = standing?.position || String(defaultMeta.rank);
  const displayPoints = standing?.points && parseInt(standing.points, 10) > 0 ? standing.points : String(defaultMeta.points);
  const displayWins = standing?.wins && parseInt(standing.wins, 10) > 0 ? standing.wins : String(defaultMeta.wins);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] my-auto">
        {/* Top Livery Accent Bar */}
        <div
          className="h-2 w-full shrink-0"
          style={{ backgroundColor: team.color }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/80 text-[var(--text-secondary)] hover:text-white border border-white/10 transition-colors cursor-pointer"
          aria-label="Close constructor details modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Header Showcase Section */}
          <div className="relative rounded-xl bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 overflow-hidden">
            {/* Background Glow */}
            <div
              className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full filter blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: team.color }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                {/* Header Tag / Logo */}
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 rounded text-xs font-hud font-black uppercase tracking-widest shadow-sm"
                    style={{
                      backgroundColor: `${team.color}25`,
                      color: team.color,
                      border: `1px solid ${team.color}50`,
                    }}
                  >
                    CONSTRUCTOR DOSSIER
                  </span>
                  {team.logoImageUrl && (
                    <img
                      src={team.logoImageUrl}
                      alt={`${team.name} Logo`}
                      className="h-6 w-auto object-contain filter drop-shadow"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl font-hud font-black uppercase tracking-tight text-[var(--text-primary)]">
                  {team.fullName}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs font-hud font-bold text-[var(--text-secondary)]">
                  <span className="text-[var(--text-primary)]">{team.base}</span>
                  <span>•</span>
                  <span className="text-[var(--accent-f1-red)]">{team.powerUnit} POWER</span>
                  {team.chassis && (
                    <>
                      <span>•</span>
                      <span className="text-amber-400 font-mono-num">CHASSIS: {team.chassis}</span>
                    </>
                  )}
                </div>
              </div>

              {/* World Championships Badge */}
              <div className="shrink-0 p-4 rounded-xl bg-[var(--bg-secondary)]/80 border border-[var(--border-subtle)] flex items-center gap-3">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-mono-num font-black text-amber-400">
                    {team.championships}
                  </div>
                  <div className="text-[10px] font-hud uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    {team.championships === 1 ? 'World Title' : 'World Titles'}
                  </div>
                </div>
              </div>
            </div>

            {/* Side-Profile 2D Car Graphic Display */}
            {team.carImageUrl && (
              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-center">
                <img
                  src={team.carImageUrl}
                  alt={`${team.name} F1 Car Profile`}
                  className="h-28 sm:h-40 w-auto object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)] transform hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          {/* Championship Standings Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                Championship Rank
              </span>
              <span className="text-xl font-mono-num font-black text-[var(--accent-f1-red)]">
                P{displayRank}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                Season Points
              </span>
              <span className="text-xl font-mono-num font-black text-[var(--text-primary)]">
                {displayPoints} PTS
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                Grand Prix Victories
              </span>
              <span className="text-xl font-mono-num font-black text-[var(--text-primary)]">
                {displayWins} {parseInt(displayWins, 10) === 1 ? 'WIN' : 'WINS'}
              </span>
            </div>
            <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex flex-col justify-between">
              <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                Recent Form
              </span>
              <PaceTrace width={80} height={20} color={team.color} />
            </div>
          </div>

          {/* Technical Operations Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-[var(--accent-f1-red)]" />
              Technical & Operational Specifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <Building2 className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  Headquarters / Base
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {team.base}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  Team Principal
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {team.teamPrincipal}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <Wrench className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  Technical Chief
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {team.technicalChief || 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <Cpu className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  Power Unit Architecture
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  {team.powerUnit}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <Shield className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  2026 Chassis Model
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] font-mono-num">
                  {team.chassis || 'N/A'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  First Grand Prix Entry
                </div>
                <div className="text-sm font-bold text-[var(--text-primary)] font-mono-num">
                  {team.firstEntry || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Official Drivers Lineup */}
          {team.drivers && team.drivers.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--accent-f1-red)]" />
                Official Driver Roster
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {team.drivers.map((driverId) => {
                  const meta = DRIVER_DETAILS[driverId] || {
                    number: 0,
                    code: driverId.slice(0, 3).toUpperCase(),
                    countryFlag: '🏎️',
                    worldTitles: 0,
                  };

                  const formattedName = driverId
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase());

                  return (
                    <div
                      key={driverId}
                      onClick={() => {
                        onClose();
                        if (onSelectDriver) onSelectDriver(driverId);
                      }}
                      className="group relative p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-f1-red)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer flex items-center justify-between"
                      title={`Open profile for ${formattedName}`}
                    >
                      <div className="flex items-center gap-3">
                        <DriverAvatar
                          driverId={driverId}
                          driverName={formattedName}
                          permanentNumber={meta.number}
                          teamColor={team.color}
                          size="md"
                          mode="photo"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-hud font-bold uppercase text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors">
                              {formattedName}
                            </span>
                            <span className="text-xs">{meta.countryFlag}</span>
                          </div>
                          <div className="text-[10px] font-mono-num text-[var(--text-muted)]">
                            #{meta.number} • {meta.code}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-white transition-colors" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
