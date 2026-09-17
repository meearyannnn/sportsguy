'use client';

import React, { useState } from 'react';
import { Race } from '@/lib/f1/types';
import { CIRCUIT_EXTRAS } from '@/lib/f1/teams';
import GrandPrixDetailModal from './GrandPrixDetailModal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';
import ContextualExplainer from '@/components/f1/ContextualExplainer';
import { evaluateHonestSessionTime } from '@/lib/f1/timeHonesty';

interface CalendarViewProps {
  races: Race[];
  useLocalTime: boolean;
  onSelectRace?: (race: Race) => void;
  onViewResults?: (round: string) => void;
}

export default function CalendarView({
  races,
  useLocalTime,
  onSelectRace,
  onViewResults,
}: CalendarViewProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [expandedRound, setExpandedRound] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedModalRace, setSelectedModalRace] = useState<Race | null>(null);

  const now = new Date().getTime();

  // Sort & categorise
  const categorizedRaces = races.map((race) => {
    const raceIso = race.time ? `${race.date}T${race.time}` : `${race.date}T13:00:00Z`;
    const raceTime = new Date(raceIso).getTime();
    const isPast = raceTime < now;
    return {
      ...race,
      isPast,
      raceTime,
    };
  });

  // Find next upcoming race index
  const nextRaceIndex = categorizedRaces.findIndex((r) => !r.isPast);

  const filteredRaces = categorizedRaces.filter((race) => {
    if (filter === 'upcoming' && race.isPast) return false;
    if (filter === 'completed' && !race.isPast) return false;

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

  const formatSession = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'TBA';
    const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
    const d = new Date(iso);
    if (useLocalTime) {
      return d.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return `${dateStr} • ${timeStr ? timeStr.slice(0, 5) + ' UTC' : 'TBA'}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Precision Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-hud font-black text-xs uppercase tracking-widest text-[var(--accent-f1-red)]">
              FIA 2026 CALENDAR
            </span>
            <span className="text-[var(--text-muted)] text-xs">•</span>
            <span className="text-xs font-mono-num text-[var(--text-muted)]">
              24 ROUNDS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)] mt-0.5">
            World Championship Calendar
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter country/circuit..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] font-hud"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center border border-[var(--border-subtle)] rounded p-0.5 bg-[var(--bg-secondary)] text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              All ({races.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'upcoming'
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === 'completed'
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Contextual First-Time Explainer for Timezone Honesty */}
      <ContextualExplainer
        conceptId="honest_scheduling"
        title="Timezone-Honest Calendar"
        description="Session times reflect your actual local clock with plain-language inconvenience tags (Graveyard Shift, Dawn Patrol, Workday Conflict) so you can plan alarms or catch the Morning Digest."
        badge="HONEST SCHEDULING"
      />

      {/* Race Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRaces.map((race) => {
          const isNext = race.round === String(nextRaceIndex + 1);
          const isExpanded = expandedRound === race.round;
          const circuitId = race.Circuit?.circuitId;
          const countryKey = race.Circuit?.Location?.country?.toLowerCase().replace(/\s+/g, '_') || '';
          const circuitInfo = CIRCUIT_EXTRAS[circuitId] || CIRCUIT_EXTRAS[countryKey] || {
            corners: 16,
            drsZones: 2,
            lengthKm: 5.3,
            lapRecord: '1:28.000',
            recordHolder: 'Track Record',
            recordYear: '2024',
          };

          return (
            <div
              key={race.round}
              className={`relative rounded border transition-colors flex flex-col justify-between ${
                isNext
                  ? 'bg-[var(--bg-secondary)] border-[var(--accent-f1-red)] border-l-4'
                  : race.isPast
                  ? 'bg-[var(--bg-secondary)] opacity-85 border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
              }`}
            >
              {/* Top Banner Accent */}
              {isNext && (
                <div className="bg-[var(--accent-f1-red)]/10 border-b border-[var(--accent-f1-red)]/30 text-[var(--accent-f1-red)] px-3 py-1 text-[10px] font-hud font-black uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] animate-live-pulse"></span>
                    NEXT RACE ON CALENDAR
                  </span>
                  <span>R{race.round}</span>
                </div>
              )}

              <div className="p-4 space-y-3 flex-1">
                {/* Header: Round & Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-hud font-bold text-[var(--accent-f1-red)] tracking-wider">
                    ROUND {race.round}
                  </span>

                  {race.isPast ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-3 h-3" />
                      COMPLETED
                    </span>
                  ) : (
                    (() => {
                      const honest = useLocalTime ? evaluateHonestSessionTime(race.date, race.time) : null;
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {honest && (
                            <span
                              className={`text-[9px] font-hud font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${honest.badgeColor} ${honest.badgeBg} ${honest.badgeBorder}`}
                              title={honest.inconvenienceAdvice}
                            >
                              {honest.badgeLabel}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[11px] font-mono-num text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                            {race.date}
                          </span>
                        </div>
                      );
                    })()
                  )}
                </div>

                {/* Race Title & Country (Clickable to open dossier) */}
                <div
                  onClick={() => setSelectedModalRace(race)}
                  className="cursor-pointer group"
                >
                  <h3 className="text-lg font-black font-hud uppercase tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors">
                    {race.raceName}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                    <span>
                      {race.Circuit.Location.locality}, {race.Circuit.Location.country}
                    </span>
                  </p>
                </div>

                {/* Circuit Info Snippet (Clickable to open dossier) */}
                <div
                  onClick={() => setSelectedModalRace(race)}
                  className="p-2.5 rounded-lg bg-[var(--bg-primary)]/80 hover:bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-between text-xs cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      Circuit
                    </div>
                    <div className="font-semibold text-[var(--text-primary)] truncate">
                      {race.Circuit.circuitName}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      Lap Record
                    </div>
                    <div className="font-mono-num font-bold text-purple-400">
                      {circuitInfo.lapRecord}
                    </div>
                  </div>
                </div>

                {/* Open Full Details Dossier Button */}
                <button
                  onClick={() => setSelectedModalRace(race)}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--accent-f1-red)]/10 hover:bg-[var(--accent-f1-red)]/20 border border-[var(--accent-f1-red)]/30 text-xs font-hud font-bold text-[var(--accent-f1-red)] flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>View Grand Prix & Circuit Details</span>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Expand Timetable Button */}
                <button
                  onClick={() => setExpandedRound(isExpanded ? null : race.round)}
                  className="w-full py-2 px-3 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-xs font-hud font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    {isExpanded ? 'Hide Quick Timetable' : 'Quick Session Timetable'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Collapsible Session Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-xs">
                    <div className="text-[10px] uppercase font-hud font-bold text-[var(--text-muted)] flex justify-between">
                      <span>SESSION</span>
                      <span>{useLocalTime ? 'YOUR LOCAL TIME' : 'CIRCUIT TIME'}</span>
                    </div>

                    {race.FirstPractice && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                        <span className="text-[var(--text-secondary)]">Practice 1</span>
                        <span className="font-mono-num font-semibold">
                          {formatSession(race.FirstPractice.date, race.FirstPractice.time)}
                        </span>
                      </div>
                    )}

                    {race.SecondPractice && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                        <span className="text-[var(--text-secondary)]">Practice 2</span>
                        <span className="font-mono-num font-semibold">
                          {formatSession(race.SecondPractice.date, race.SecondPractice.time)}
                        </span>
                      </div>
                    )}

                    {race.ThirdPractice && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50">
                        <span className="text-[var(--text-secondary)]">Practice 3</span>
                        <span className="font-mono-num font-semibold">
                          {formatSession(race.ThirdPractice.date, race.ThirdPractice.time)}
                        </span>
                      </div>
                    )}

                    {race.SprintQualifying && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50 text-orange-400">
                        <span>Sprint Shootout</span>
                        <span className="font-mono-num font-semibold">
                          {formatSession(race.SprintQualifying.date, race.SprintQualifying.time)}
                        </span>
                      </div>
                    )}

                    {race.Sprint && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50 text-orange-400">
                        <span>Sprint Race</span>
                        <span className="font-mono-num font-semibold">
                          {formatSession(race.Sprint.date, race.Sprint.time)}
                        </span>
                      </div>
                    )}

                    {race.Qualifying && (
                      <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50 text-amber-400 font-medium">
                        <span>Qualifying</span>
                        <span className="font-mono-num font-bold">
                          {formatSession(race.Qualifying.date, race.Qualifying.time)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-1.5 px-2 rounded bg-[var(--accent-f1-red)]/15 text-[var(--accent-f1-red)] font-hud font-black">
                      <span>MAIN GRAND PRIX</span>
                      <span className="font-mono-num">
                        {formatSession(race.date, race.time)}
                      </span>
                    </div>

                    <div className="pt-2 flex justify-between text-[11px] text-[var(--text-muted)] font-mono-num">
                      <span>Length: {circuitInfo.lengthKm} km</span>
                      <span>{circuitInfo.corners} Corners</span>
                      <span>{circuitInfo.drsZones} DRS</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Grand Prix & Circuit Dossier Modal */}
      <GrandPrixDetailModal
        race={selectedModalRace}
        isOpen={!!selectedModalRace}
        onClose={() => setSelectedModalRace(null)}
        useLocalTime={useLocalTime}
        onViewResults={onViewResults}
      />
    </div>
  );
}
