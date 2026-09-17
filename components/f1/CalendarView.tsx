'use client';

import React, { useState } from 'react';
import { Race } from '@/lib/f1/types';
import { getCircuitMedia } from '@/lib/f1/circuits';
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
  Sparkles,
} from 'lucide-react';
import { evaluateHonestSessionTime } from '@/lib/f1/timeHonesty';

interface CalendarViewProps {
  races: Race[];
  useLocalTime: boolean;
  onSelectRace?: (race: Race) => void;
  onViewResults?: (round: string) => void;
}

// Fallback podium mock data for past 2026 races where Ergast data is pending live results
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
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ==================== HERO BANNERS & NEXT GP COUNTDOWN ==================== */}
      {nextRace && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-secondary)] to-[#0A0B0E] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl">
          {/* Circuit background image overlay */}
          {(() => {
            const media = getCircuitMedia(nextRace.raceName);
            return (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity pointer-events-none scale-105 transform transition-transform duration-700 hover:scale-100"
                style={{ backgroundImage: `url(${media.imageUrl})` }}
              />
            );
          })()}

          {/* Dark gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B0E] via-[#0A0B0E]/90 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-hud font-bold tracking-widest uppercase bg-[var(--apex-crimson)] text-white shadow-md shadow-[var(--apex-crimson)]/20">
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>NEXT GRAND PRIX</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--apex-gold)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--apex-gold)] animate-ping" />
                  <span>ROUND {nextRace.round} OF 24</span>
                </span>
                {nextRace.isSprint && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-hud font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <span>⚡ SPRINT FORMAT</span>
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-3xl sm:text-4xl">{nextRace.Circuit.Location.country === 'USA' ? '🇺🇸' : '🏎️'}</span>
                  <h1 className="text-3xl sm:text-5xl font-black font-hud uppercase tracking-tight text-white drop-shadow-md">
                    {nextRace.raceName}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[var(--text-secondary)] font-medium pt-1">
                  <span className="flex items-center gap-1 text-white font-bold">
                    <MapPin className="w-4 h-4 text-[var(--apex-crimson)]" />
                    <span>{nextRace.Circuit.circuitName}</span>
                  </span>
                  <span>•</span>
                  <span>{nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-[var(--text-primary)]">
                <Calendar className="w-4 h-4 text-[var(--apex-crimson)]" />
                <span className="font-bold">{formatDateRange(nextRace.date)}</span>
              </div>
            </div>

            {/* Quick Action & Track Stats */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-3 shrink-0">
              <button
                onClick={() => {
                  if (onSelectRace) onSelectRace(nextRace);
                  setSelectedModalRace(nextRace);
                }}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[var(--apex-crimson)] hover:bg-[var(--apex-crimson-hover)] text-white font-hud font-extrabold text-sm uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[var(--apex-crimson)]/30 hover:scale-[1.02] cursor-pointer"
              >
                <span>Full Weekend Schedule & Hub</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/40 border border-white/10 text-center text-xs">
                <div>
                  <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Track Length</div>
                  <div className="font-mono font-bold text-white">{getCircuitMedia(nextRace.raceName).trackLength}</div>
                </div>
                <div>
                  <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Corners</div>
                  <div className="font-mono font-bold text-[var(--apex-gold)]">{getCircuitMedia(nextRace.raceName).turns} Turns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONTROLS & FILTER BAR ==================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All 24 Rounds' },
            { id: 'upcoming', label: 'Upcoming Races' },
            { id: 'completed', label: 'Completed' },
            { id: 'sprint', label: 'Sprint Weekends ⚡' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-hud font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                filter === item.id
                  ? 'bg-[var(--apex-crimson)] text-white shadow-md shadow-[var(--apex-crimson)]/20'
                  : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--border-subtle)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GP, circuit, or country..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--apex-crimson)] transition-colors"
          />
        </div>
      </div>

      {/* ==================== ROUND CARDS GRID ==================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRaces.map((race) => {
          const circuitMedia = getCircuitMedia(race.raceName);
          const mockPodium = MOCK_PAST_PODIUMS[race.round];

          return (
            <div
              key={race.round}
              className={`group relative rounded-2xl bg-[var(--bg-card)] border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:-translate-y-1 ${
                race.isPast
                  ? 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                  : 'border-[var(--apex-crimson)]/40 hover:border-[var(--apex-crimson)] shadow-lg shadow-[var(--apex-crimson)]/5'
              }`}
            >
              {/* Background Photographic Wallpaper */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-500 mix-blend-luminosity pointer-events-none"
                style={{ backgroundImage: `url(${circuitMedia.imageUrl})` }}
              />
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0B0E] via-[#0A0B0E]/90 to-[#0A0B0E]/40 pointer-events-none" />

              <div className="relative z-10 p-5 space-y-4">
                {/* Header Row: Round Badge & Date Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-extrabold uppercase bg-[var(--apex-crimson)]/20 text-[var(--apex-crimson)] border border-[var(--apex-crimson)]/40 backdrop-blur-md">
                    <span>ROUND {race.round}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-black/60 text-white border border-white/10 backdrop-blur-md">
                    <Calendar className="w-3 h-3 text-[var(--apex-crimson)]" />
                    <span>{formatDateRange(race.date)}</span>
                  </div>
                </div>

                {/* Grand Prix & Circuit Details */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{race.Circuit.Location.country === 'USA' ? '🇺🇸' : '🏎️'}</span>
                    <h3 className="font-hud font-black text-xl text-white uppercase tracking-tight group-hover:text-[var(--apex-crimson)] transition-colors line-clamp-1">
                      {race.raceName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    <span className="line-clamp-1">{race.Circuit.circuitName}</span>
                  </div>
                </div>

                {/* ================= COMPACT 3-ACROSS MINI-PODIUM STRIP ================= */}
                {race.isPast ? (
                  <div className="pt-2">
                    <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Trophy className="w-3 h-3" />
                        <span>RACE PODIUM</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">FINAL CLASSIFICATION</span>
                    </div>

                    {mockPodium ? (
                      <div className="grid grid-cols-3 gap-2 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10">
                        {mockPodium.map((p) => {
                          const headshot = getDriverHeadshot(p.code);
                          const borderCol = p.pos === 1 ? 'border-amber-400' : p.pos === 2 ? 'border-slate-300' : 'border-amber-600';
                          const posBadgeBg = p.pos === 1 ? 'bg-amber-400 text-black' : p.pos === 2 ? 'bg-slate-300 text-black' : 'bg-amber-700 text-white';

                          return (
                            <div key={p.pos} className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/5 border border-white/5 relative">
                              <span className={`w-4 h-4 rounded-full ${posBadgeBg} text-[9px] font-mono font-black absolute -top-1.5 -left-1.5 flex items-center justify-center shadow-md`}>
                                P{p.pos}
                              </span>

                              {headshot ? (
                                <img
                                  src={headshot}
                                  alt={p.code}
                                  className={`w-9 h-9 rounded-full object-cover object-top border-2 ${borderCol} shrink-0 mb-1 shadow-md`}
                                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className={`w-9 h-9 rounded-full bg-[var(--bg-tertiary)] border-2 ${borderCol} font-mono font-bold text-[10px] text-white flex items-center justify-center mb-1`}>
                                  {p.code}
                                </div>
                              )}

                              <div className="font-hud font-black text-xs text-white">{p.code}</div>
                              <div className="text-[9px] font-mono text-[var(--text-muted)] truncate w-full">{p.gap}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-center text-xs font-mono text-emerald-400">
                        Official Results Homologated ✓
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upcoming Race Weekend Sessions Badge Strip */
                  <div className="pt-2">
                    <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[var(--apex-crimson)]">
                        <Clock className="w-3 h-3" />
                        <span>SESSION SCHEDULE</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--apex-gold)]">LIVE TIMING READY</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center p-1 px-2 rounded bg-white/5">
                        <span className="text-[var(--text-muted)]">QUALIFYING</span>
                        <span className="font-bold text-white">{race.Qualifying?.date?.slice(5) || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between items-center p-1 px-2 rounded bg-white/5">
                        <span className="text-[var(--apex-crimson)] font-bold">RACE</span>
                        <span className="font-bold text-white">{race.date.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div className="relative z-10 p-4 pt-0">
                <button
                  onClick={() => {
                    if (onSelectRace) onSelectRace(race);
                    setSelectedModalRace(race);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--apex-crimson)] border border-[var(--border-subtle)] hover:border-[var(--apex-crimson)] text-white text-xs font-hud font-bold uppercase tracking-wider transition-all duration-200 group/btn cursor-pointer"
                >
                  <span>{race.isPast ? 'View Full Race Results & Classification' : 'Grand Prix Details & Weather'}</span>
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRaces.length === 0 && (
        <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl">
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
