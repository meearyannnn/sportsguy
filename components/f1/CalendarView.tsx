'use client';

import React, { useState, useEffect } from 'react';
import { Race } from '@/lib/f1/types';
import { getDriverHeadshot } from '@/lib/f1/teams';
import GrandPrixDetailModal from './GrandPrixDetailModal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  Zap,
  ArrowRight,
  Trophy,
  ChevronRight,
  Flag,
  Gauge,
  Info,
} from 'lucide-react';
import DriverAvatar from '@/components/f1/DriverAvatar';

interface CalendarViewProps {
  races: Race[];
  useLocalTime: boolean;
  onSelectRace?: (race: Race) => void;
  onViewResults?: (round: string) => void;
}

// Fallback podium mock data for past 2026 races
const MOCK_PAST_PODIUMS: Record<string, Array<{ pos: number; code: string; name: string; teamColor: string; gap: string }>> = {
  '1': [
    { pos: 1, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '1:31:44.742' },
    { pos: 2, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '+2.456s' },
    { pos: 3, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '+5.129s' },
  ],
  '2': [
    { pos: 1, code: 'HAM', name: 'Lewis Hamilton', teamColor: '#E8002D', gap: '1:28:22.418' },
    { pos: 2, code: 'PIA', name: 'Oscar Piastri', teamColor: '#FF8000', gap: '+1.189s' },
    { pos: 3, code: 'RUS', name: 'George Russell', teamColor: '#27F4D2', gap: '+4.321s' },
  ],
  '3': [
    { pos: 1, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '1:34:01.290' },
    { pos: 2, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '+0.892s' },
    { pos: 3, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '+3.441s' },
  ],
  '4': [
    { pos: 1, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '1:29:10.501' },
    { pos: 2, code: 'SAI', name: 'Carlos Sainz', teamColor: '#64C4FF', gap: '+2.110s' },
    { pos: 3, code: 'HAM', name: 'Lewis Hamilton', teamColor: '#E8002D', gap: '+6.782s' },
  ],
  '5': [
    { pos: 1, code: 'PIA', name: 'Oscar Piastri', teamColor: '#FF8000', gap: '1:25:34.908' },
    { pos: 2, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '+1.450s' },
    { pos: 3, code: 'RUS', name: 'George Russell', teamColor: '#27F4D2', gap: '+8.102s' },
  ],
  '6': [
    { pos: 1, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '1:39:15.820' },
    { pos: 2, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '+3.291s' },
    { pos: 3, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '+4.901s' },
  ],
  '7': [
    { pos: 1, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '1:41:20.109' },
    { pos: 2, code: 'HAM', name: 'Lewis Hamilton', teamColor: '#E8002D', gap: '+0.540s' },
    { pos: 3, code: 'PIA', name: 'Oscar Piastri', teamColor: '#FF8000', gap: '+2.301s' },
  ],
  '8': [
    { pos: 1, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '1:30:45.210' },
    { pos: 2, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '+1.982s' },
    { pos: 3, code: 'RUS', name: 'George Russell', teamColor: '#27F4D2', gap: '+7.410s' },
  ],
  '9': [
    { pos: 1, code: 'HAM', name: 'Lewis Hamilton', teamColor: '#E8002D', gap: '1:22:46.882' },
    { pos: 2, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '+1.312s' },
    { pos: 3, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '+3.090s' },
  ],
  '10': [
    { pos: 1, code: 'RUS', name: 'George Russell', teamColor: '#27F4D2', gap: '1:24:19.450' },
    { pos: 2, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '+0.910s' },
    { pos: 3, code: 'SAI', name: 'Carlos Sainz', teamColor: '#64C4FF', gap: '+4.120s' },
  ],
  '11': [
    { pos: 1, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '1:27:09.112' },
    { pos: 2, code: 'PIA', name: 'Oscar Piastri', teamColor: '#FF8000', gap: '+2.880s' },
    { pos: 3, code: 'NOR', name: 'Lando Norris', teamColor: '#FF8000', gap: '+3.990s' },
  ],
  '12': [
    { pos: 1, code: 'HAM', name: 'Lewis Hamilton', teamColor: '#E8002D', gap: '1:21:52.309' },
    { pos: 2, code: 'LEC', name: 'Charles Leclerc', teamColor: '#E8002D', gap: '+1.102s' },
    { pos: 3, code: 'VER', name: 'Max Verstappen', teamColor: '#3671C6', gap: '+5.412s' },
  ]
};

export default function CalendarView({
  races,
  useLocalTime,
  onSelectRace,
  onViewResults,
}: CalendarViewProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'sprint'>('all');
  const [search, setSearch] = useState('');
  const [selectedModalRace, setSelectedModalRace] = useState<Race | null>(null);

  const now = new Date().getTime();

  // Sort & categorise races
  const categorizedRaces = races.map((race) => {
    const raceIso = race.time ? `${race.date}T${race.time}` : `${race.date}T13:00:00Z`;
    const raceTime = new Date(raceIso).getTime();
    const isPast = raceTime < now;
    const isSprint = Boolean(race.Sprint || race.SprintQualifying);
    return {
      ...race,
      isPast,
      isSprint,
      raceTime,
    };
  });

  // Next upcoming race
  const nextRace = categorizedRaces.find((r) => !r.isPast) || categorizedRaces[0];

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number; secs: number }>({
    days: 8,
    hours: 14,
    mins: 29,
    secs: 12,
  });

  useEffect(() => {
    if (!nextRace) return;
    const target = nextRace.raceTime;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60),
          secs: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  const filteredRaces = categorizedRaces.filter((race) => {
    if (filter === 'upcoming' && race.isPast) return false;
    if (filter === 'completed' && !race.isPast) return false;
    if (filter === 'sprint' && !race.isSprint) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = race.raceName.toLowerCase().includes(q);
      const matchCircuit = race.Circuit.circuitName.toLowerCase().includes(q);
      const matchCountry = race.Circuit.Location.country.toLowerCase().includes(q);
      const matchLocality = race.Circuit.Location.locality.toLowerCase().includes(q);
      return matchName || matchCircuit || matchCountry || matchLocality;
    }
    return true;
  });

  const formatDateRange = (raceDateStr: string) => {
    try {
      const d = new Date(`${raceDateStr}T12:00:00Z`);
      const start = new Date(d);
      start.setDate(d.getDate() - 2);
      
      const startMonth = start.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const endMonth = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      const startDay = start.getDate();
      const endDay = d.getDate();

      if (startMonth === endMonth) {
        return `${startDay} - ${endDay} ${endMonth}`;
      }
      return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
    } catch (e) {
      return raceDateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ==================== HERO HEADER (MATCHES DASHBOARD SLEEK TELEMETRY UI) ==================== */}
      {nextRace && (
        <div className="relative rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 space-y-6 overflow-hidden">
          {/* Signal Red Left Border Accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-f1-red)]" />

          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-hud font-bold text-xs uppercase tracking-wider">
                • ROUND {nextRace.round} • 2026 CHAMPIONSHIP
              </span>
              <span className="text-xs font-hud text-[var(--text-muted)] uppercase tracking-wider">
                FIA SCHEDULE
              </span>
            </div>
            {nextRace.isSprint && (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20">
                ⚡ SPRINT WEEKEND
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* GP Title & Countdown */}
            <div className="lg:col-span-8 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-hud font-bold text-amber-500 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black font-hud uppercase tracking-tight text-[var(--text-primary)]">
                  {nextRace.raceName}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {nextRace.Circuit.circuitName} — Official Formula 1 World Championship weekend.
                </p>
              </div>

              {/* Lights Out Countdown Box */}
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]/60 border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5 text-amber-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>LIGHTS OUT COUNTDOWN</span>
                  </span>
                  <span className="font-mono text-[11px]">Local Sync</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">DAYS</div>
                    <div className="text-xl sm:text-3xl font-black font-mono-num text-[var(--text-primary)]">
                      {String(timeLeft.days).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">HOURS</div>
                    <div className="text-xl sm:text-3xl font-black font-mono-num text-[var(--text-primary)]">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">MIN</div>
                    <div className="text-xl sm:text-3xl font-black font-mono-num text-[var(--text-primary)]">
                      {String(timeLeft.mins).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] border-amber-500/30">
                    <div className="text-[10px] font-hud uppercase text-amber-500">SEC</div>
                    <div className="text-xl sm:text-3xl font-black font-mono-num text-amber-400">
                      {String(timeLeft.secs).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuit Telemetry Spec & Timetable Side Panel */}
            <div className="lg:col-span-4 space-y-4">
              <div className="p-4 rounded-lg bg-[var(--bg-tertiary)]/60 border border-[var(--border-subtle)] space-y-3">
                <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  CIRCUIT TELEMETRY SPEC
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">LENGTH</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)]">6.003 KM</div>
                  </div>
                  <div className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">CORNERS</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)]">20 TURNS</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectRace) onSelectRace(nextRace);
                  setSelectedModalRace(nextRace);
                }}
                className="w-full py-3 px-4 rounded-lg bg-[var(--accent-f1-red)] hover:bg-[var(--accent-f1-red)]/90 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <span>OPEN FULL WEEKEND SCHEDULE & HUB</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PRECISION FILTER & SEARCH BAR ==================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All 24 Rounds' },
            { id: 'upcoming', label: 'Upcoming Races' },
            { id: 'completed', label: 'Completed' },
            { id: 'sprint', label: 'Sprint Weekends ⚡' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                filter === item.id
                  ? 'bg-[var(--accent-f1-red)] text-white shadow-sm'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GP, circuit, or country..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-f1-red)]"
          />
        </div>
      </div>

      {/* ==================== ROUND CARDS GRID ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRaces.map((race) => {
          const mockPodium = MOCK_PAST_PODIUMS[race.round];

          return (
            <div
              key={race.round}
              className="group relative rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden"
            >
              {/* Left Accent Bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${
                  race.isPast ? 'bg-[var(--border-subtle)] group-hover:bg-[var(--text-muted)]' : 'bg-[var(--accent-f1-red)]'
                }`}
              />

              <div className="space-y-4">
                {/* Header Row: Round Badge & Date */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg-tertiary)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase">
                    ROUND {race.round}
                  </span>

                  <span className="text-xs font-mono font-bold text-[var(--accent-f1-red)]">
                    📅 {formatDateRange(race.date)}
                  </span>
                </div>

                {/* Grand Prix & Circuit Details */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{race.Circuit.Location.country === 'USA' ? '🇺🇸' : '🏎️'}</span>
                    <h3 className="font-hud font-black text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors line-clamp-1">
                      {race.raceName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                    <MapPin className="w-3 h-3 text-[var(--text-muted)] shrink-0" />
                    <span className="line-clamp-1">{race.Circuit.circuitName}</span>
                  </div>
                </div>

                {/* ================= COMPACT PODIUM STRIP ================= */}
                {race.isPast ? (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Trophy className="w-3 h-3" />
                        <span>RACE PODIUM</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">CLASSIFICATION</span>
                    </div>

                    {mockPodium ? (
                      <div className="grid grid-cols-3 gap-2 bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                        {mockPodium.map((p) => {
                          const posBadgeBg = p.pos === 1 ? 'bg-amber-400 text-black font-black' : p.pos === 2 ? 'bg-slate-300 text-black font-black' : 'bg-amber-700 text-white font-black';

                          return (
                            <div key={p.pos} className="flex flex-col items-center text-center p-1 rounded bg-[var(--bg-primary)]/50 relative">
                              <span className={`w-3.5 h-3.5 rounded ${posBadgeBg} text-[8px] font-mono absolute -top-1 -left-1 flex items-center justify-center`}>
                                P{p.pos}
                              </span>

                              <DriverAvatar
                                driverId={p.code.toLowerCase()}
                                driverName={p.name}
                                permanentNumber={p.pos}
                                teamColor={p.teamColor}
                                size="sm"
                                mode="photo"
                                className="mb-1 shrink-0"
                              />

                              <div className="font-hud font-bold text-xs text-[var(--text-primary)]">{p.code}</div>
                              <div className="text-[9px] font-mono text-[var(--text-muted)] truncate w-full">{p.gap}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded bg-[var(--bg-tertiary)] text-center text-xs font-mono text-emerald-400">
                        Official Results Homologated ✓
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upcoming Sessions Badge Strip */
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[var(--accent-f1-red)]">
                        <Clock className="w-3 h-3" />
                        <span>SESSION SCHEDULE</span>
                      </span>
                      <span className="text-[10px] font-mono text-amber-400">SCHEDULED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px] font-mono bg-[var(--bg-tertiary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex justify-between items-center p-1 rounded bg-[var(--bg-primary)]">
                        <span className="text-[var(--text-muted)]">QUALIFYING</span>
                        <span className="font-bold text-[var(--text-primary)]">{race.Qualifying?.date?.slice(5) || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between items-center p-1 rounded bg-[var(--bg-primary)]">
                        <span className="text-[var(--accent-f1-red)] font-bold">RACE</span>
                        <span className="font-bold text-[var(--text-primary)]">{race.date.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  onClick={() => {
                    if (onSelectRace) onSelectRace(race);
                    setSelectedModalRace(race);
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>{race.isPast ? 'View Full Race Results' : 'Grand Prix Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRaces.length === 0 && (
        <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
          No Grand Prix rounds match your search query.
        </div>
      )}

      {/* Grand Prix Detail Modal */}
      {selectedModalRace && (
        <GrandPrixDetailModal
          race={selectedModalRace}
          isOpen={true}
          useLocalTime={useLocalTime}
          onClose={() => setSelectedModalRace(null)}
          onViewResults={onViewResults}
        />
      )}
    </div>
  );
}
