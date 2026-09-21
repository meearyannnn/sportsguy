import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Flame,
  Award,
  Flag,
} from 'lucide-react';

interface ConstructorDetailModalProps {
  constructorId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectDriver?: (driverId: string) => void;
  constructorStandings?: ConstructorStanding[];
}

const DRIVER_FULL_NAMES: Record<string, string> = {
  max_verstappen: 'Max Verstappen',
  verstappen: 'Max Verstappen',
  isack_hadjar: 'Isack Hadjar',
  hadjar: 'Isack Hadjar',
  norris: 'Lando Norris',
  piastri: 'Oscar Piastri',
  leclerc: 'Charles Leclerc',
  hamilton: 'Lewis Hamilton',
  russell: 'George Russell',
  antonelli: 'Andrea Kimi Antonelli',
  alonso: 'Fernando Alonso',
  stroll: 'Lance Stroll',
  gasly: 'Pierre Gasly',
  colapinto: 'Franco Colapinto',
  albon: 'Alexander Albon',
  sainz: 'Carlos Sainz',
  lawson: 'Liam Lawson',
  lindblad: 'Arvid Lindblad',
  arvid_lindblad: 'Arvid Lindblad',
  bearman: 'Oliver Bearman',
  ocon: 'Esteban Ocon',
  hulkenberg: 'Nico Hülkenberg',
  bortoleto: 'Gabriel Bortoleto',
  perez: 'Sergio Perez',
  sergio_perez: 'Sergio Perez',
  bottas: 'Valtteri Bottas',
  valtteri_bottas: 'Valtteri Bottas',
};

export default function ConstructorDetailModal({
  constructorId,
  isOpen,
  onClose,
  onSelectDriver,
  constructorStandings = [],
}: ConstructorDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [liveStandings, setLiveStandings] = useState<any[]>(constructorStandings);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        .then((res) => res.json())
        .then((data) => {
          const list = data.constructors || data.standings || [];
          if (Array.isArray(list) && list.length > 0) {
            setLiveStandings(list);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, constructorStandings]);

  if (!isOpen || !constructorId || !mounted) return null;

  const team = getTeamMeta(constructorId);
  if (!team) return null;

  // Find this constructor's official standing if available
  const standing = liveStandings.find((s: any) => {
    const sId = (s.Constructor?.constructorId || s.teamId || s.team || '').toLowerCase();
    const tId = team.id.toLowerCase();
    const tName = team.name.toLowerCase();
    return (
      sId === tId ||
      sId === tName ||
      sId.includes(tId) ||
      tId.includes(sId) ||
      sId.includes(tName) ||
      tName.includes(sId)
    );
  });

  // Fallback points and wins from drivers if standing is 0
  const teamDriverPoints = team.drivers.reduce((acc, driverId) => {
    const metric = getSeason2026Metrics(driverId);
    return acc + (metric?.seasonPoints || 0);
  }, 0);
  const teamDriverWins = team.drivers.reduce((acc, driverId) => {
    const metric = getSeason2026Metrics(driverId);
    return acc + (metric?.seasonWins || 0);
  }, 0);

  // 2026 Canonical constructor rankings fallback
  const CONSTRUCTOR_RANKS_2026: Record<string, { rank: number; points: number; wins: number }> = {
    mercedes: { rank: 1, points: 503, wins: 10 },
    ferrari: { rank: 2, points: 358, wins: 2 },
    mclaren: { rank: 3, points: 306, wins: 1 },
    red_bull: { rank: 4, points: 230, wins: 1 },
    rb: { rank: 5, points: 77, wins: 0 },
    alpine: { rank: 6, points: 68, wins: 0 },
    haas: { rank: 7, points: 21, wins: 0 },
    audi: { rank: 8, points: 17, wins: 0 },
    williams: { rank: 9, points: 11, wins: 0 },
    aston_martin: { rank: 10, points: 3, wins: 0 },
    cadillac: { rank: 11, points: 0, wins: 0 },
  };

  const defaultMeta = CONSTRUCTOR_RANKS_2026[team.id] || { rank: 1, points: teamDriverPoints, wins: teamDriverWins };
  const displayRank = standing?.pos ? String(standing.pos) : standing?.position || String(defaultMeta.rank);
  const displayPoints = standing?.points && parseInt(String(standing.points), 10) >= 0 ? String(standing.points) : String(defaultMeta.points);
  const displayWins = standing?.wins && parseInt(String(standing.wins), 10) >= 0 ? String(standing.wins) : String(defaultMeta.wins);

  return createPortal(
    <div
      className="fixed inset-0 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Centering wrapper */}
      <div className="flex min-h-screen sm:min-h-full items-center justify-center p-3 sm:p-4 md:p-6 w-full">
        {/* Modal Panel */}
        <div
          className="relative w-full max-w-4xl shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-in my-auto"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-dim)',
            borderTop: `3px solid ${team.color}`,
            borderRadius: 'var(--r-lg)',
            maxHeight: '90vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
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
                      OFFICIAL CONSTRUCTOR PROFILE
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

            {/* 2026 Championship Season Performance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  2026 Championship Campaign Performance
                </span>
                <span className="text-[10px] font-mono text-[var(--accent-f1-red)] font-semibold">
                  LIVE FIA CLASSIFICATION
                </span>
              </div>

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
                    2026 Race Victories
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
            </div>

            {/* All-Time Historical Record (Official FIA & Formula1.com Heritage) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  All-Time Formula 1 Heritage & Records
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  FORMULA1.COM ARCHIVES
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                    World Titles
                  </span>
                  <span className="text-xl font-mono-num font-black text-amber-400">
                    {team.championships} {team.championships === 1 ? 'TITLE' : 'TITLES'}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                    All-Time GP Wins
                  </span>
                  <span className="text-xl font-mono-num font-black text-[var(--text-primary)]">
                    {team.allTimeWins ?? '0'} {team.allTimeWins === 1 ? 'WIN' : 'WINS'}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                    Pole Positions
                  </span>
                  <span className="text-xl font-mono-num font-black text-[var(--text-primary)]">
                    {team.allTimePoles ?? '0'} {team.allTimePoles === 1 ? 'POLE' : 'POLES'}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                    Highest Finish
                  </span>
                  <span className="text-base sm:text-lg font-mono-num font-black text-emerald-400 truncate block">
                    {team.highestRaceFinish || 'P1'}
                  </span>
                </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {team.drivers.map((driverId) => {
                    const meta = DRIVER_DETAILS[driverId] || {
                      number: 0,
                      code: driverId.slice(0, 3).toUpperCase(),
                      countryFlag: '🏎️',
                      worldTitles: 0,
                    };

                    const fullName = DRIVER_FULL_NAMES[driverId] || driverId
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase());

                    return (
                      <div
                        key={driverId}
                        onClick={() => {
                          onClose();
                          if (onSelectDriver) onSelectDriver(driverId);
                        }}
                        className="group relative p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-f1-red)] hover:bg-[var(--bg-tertiary)] transition-all cursor-pointer flex items-center justify-between"
                        title={`Open profile for ${fullName}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <DriverAvatar
                            driverId={driverId}
                            driverName={fullName}
                            permanentNumber={meta.number}
                            teamColor={team.color}
                            size="md"
                            mode="photo"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-hud font-bold uppercase text-base text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors">
                                {fullName}
                              </span>
                              <span className="text-sm">{meta.countryFlag}</span>
                              {meta.worldTitles > 0 && (
                                <span className="text-[10px] font-hud font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  {meta.worldTitles}x WDC
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-mono-num text-[var(--text-muted)] flex items-center gap-2 mt-0.5">
                              <span className="font-black text-[var(--text-primary)]">#{meta.number}</span>
                              <span>•</span>
                              <span>{meta.code}</span>
                              <span>•</span>
                              <span>{team.name}</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-white transition-colors shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
