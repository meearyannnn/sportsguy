'use client';

import React, { useState, useEffect } from 'react';
import { Race } from '@/lib/f1/types';
import { getDriverHeadshot, getTeamMeta } from '@/lib/f1/teams';
import { getRaceResults } from '@/lib/f1/jolpica';
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

export interface PodiumEntry {
  pos: number;
  code: string;
  name: string;
  driverId: string;
  teamColor: string;
  gap: string;
}

export default function CalendarView({

  races,
  useLocalTime,
  onSelectRace,
  onViewResults,
}: CalendarViewProps) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'sprint'>('all');
  const [search, setSearch] = useState('');
  const [selectedModalRace, setSelectedModalRace] = useState<Race | null>(null);
  const [livePodiums, setLivePodiums] = useState<Record<string, PodiumEntry[]>>({});

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

  // Dynamically fetch live scraped F1 podiums + Jolpica race results (No hardcoding)
  useEffect(() => {
    let isMounted = true;

    // 1. Fetch live scraped official podiums from Formula1.com
    fetch('/api/f1/podiums')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data?.podiums) return;
        setLivePodiums((prev) => ({
          ...prev,
          ...data.podiums,
        }));
      })
      .catch((err) => console.warn('Official F1 scraper podiums notice:', err));

    // 2. Fetch live results from Jolpica for past races
    const pastRaces = categorizedRaces.filter((r) => r.isPast);
    pastRaces.forEach((race) => {
      getRaceResults(race.season || '2026', race.round).then((res) => {
        if (!isMounted || !res?.results || res.results.length === 0) return;
        const top3: PodiumEntry[] = res.results.slice(0, 3).map((r) => {
          const teamMeta = getTeamMeta(r.Constructor?.constructorId || '');
          return {
            pos: parseInt(r.position, 10),
            code: r.Driver.code || (r.Driver.familyName.slice(0, 3).toUpperCase()),
            name: `${r.Driver.givenName} ${r.Driver.familyName}`,
            driverId: r.Driver.driverId,
            teamColor: teamMeta.color,
            gap: r.Time?.time || (r.position === '1' ? 'WINNER' : r.status),
          };
        });
        setLivePodiums((prev) => ({
          ...prev,
          [race.round]: top3,
        }));
      });
    });

    return () => {
      isMounted = false;
    };
  }, [races]);

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
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ==================== HERO HEADER (MATCHES DASHBOARD SLEEK TELEMETRY UI) ==================== */}
      {nextRace && (
        <div className="relative overflow-hidden" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 'var(--r-lg)', padding: 'clamp(16px,3vw,28px)' }}>
          {/* Top Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5" style={{ padding: '4px 12px', background: 'var(--red-subtle)', border: '1px solid rgba(225,6,0,0.25)', borderRadius: 'var(--r-pill)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--red)' }}>
                ROUND {nextRace.round} • 2026 CHAMPIONSHIP
              </span>
              <span className="text-xs font-hud text-[var(--text-muted)] uppercase tracking-wider">
                FIA SCHEDULE
              </span>
            </div>
            {nextRace.isSprint && (
              <span className="px-2.5 py-1 rounded-[4px] text-[11px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 inline-flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" strokeWidth={1.75} />
                <span>SPRINT WEEKEND</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* GP Title & Countdown */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60 shrink-0" strokeWidth={1.75} />
                  <span>{nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}</span>
                </div>
                 <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 'clamp(22px,5vw,42px)', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 0.95, color: 'var(--text-primary)', margin: '6px 0 0' }}>
                  {nextRace.raceName}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                  {nextRace.Circuit.circuitName} — Official Formula 1 World Championship weekend.
                </p>
              </div>

              {/* Lights Out Countdown Box */}
              <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.28)', border: '1px solid var(--border-dim)', borderRadius: 'var(--r-md)' }}>
                <div className="flex items-center justify-between text-xs font-hud font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60 shrink-0" strokeWidth={1.75} />
                    <span>LIGHTS OUT COUNTDOWN</span>
                  </span>
                  <span className="font-mono text-[11px] text-[var(--text-muted)]">Local Sync</span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">DAYS</div>
                    <div className="text-xl sm:text-3xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                      {String(timeLeft.days).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">HOURS</div>
                    <div className="text-xl sm:text-3xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">MIN</div>
                    <div className="text-xl sm:text-3xl font-bold font-mono text-[var(--text-primary)] tabular-nums">
                      {String(timeLeft.mins).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--accent-f1-red)]/30">
                    <div className="text-[10px] font-mono uppercase text-[var(--accent-f1-red)]">SEC</div>
                    <div className="text-xl sm:text-3xl font-bold font-mono text-[var(--accent-f1-red)] tabular-nums">
                      {String(timeLeft.secs).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Circuit Telemetry Spec & Timetable Side Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/60 border border-[var(--border-subtle)] space-y-3 flex-1 flex flex-col justify-center">
                <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  CIRCUIT TELEMETRY SPEC
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">LENGTH</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)] tabular-nums">6.003 KM</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] font-mono uppercase text-[var(--text-muted)]">CORNERS</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)] tabular-nums">20 TURNS</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onSelectRace) onSelectRace(nextRace);
                  setSelectedModalRace(nextRace);
                }}
                className="w-full py-3 px-4 rounded-lg bg-[var(--accent-f1-red)] hover:bg-[var(--accent-f1-red)]/90 text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>OPEN FULL WEEKEND SCHEDULE & HUB</span>
                <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PRECISION FILTER & SEARCH BAR ==================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Segmented Filter Control */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {[
            { id: 'all', label: 'All 24 Rounds' },
            { id: 'upcoming', label: 'Upcoming Races' },
            { id: 'completed', label: 'Completed' },
            { id: 'sprint', label: 'Sprint Weekends' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--r-sm)',
                background: filter === item.id ? 'var(--red)' : 'var(--bg-raised)',
                color: filter === item.id ? '#fff' : 'var(--text-secondary)',
                border: filter === item.id ? 'none' : '1px solid var(--border-dim)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'background 150ms, color 150ms',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60 pointer-events-none" strokeWidth={1.75} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search GP, circuit, or country..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-hover)]"
          />
        </div>
      </div>

      {/* ==================== ROUND CARDS GRID ==================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,300px),1fr))', gap: 12 }}>
        {filteredRaces.map((race) => {
          const podium = livePodiums[race.round];
          const isNextUpcoming = race.round === nextRace?.round && !race.isPast;

          return (
            <div
              key={race.round}
              className="group"
              style={{
                position: 'relative',
                background: 'var(--bg-raised)',
                border: `1px solid ${isNextUpcoming ? 'rgba(225,6,0,0.40)' : 'var(--border-dim)'}`,
                borderRadius: 'var(--r-lg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = isNextUpcoming ? 'rgba(225,6,0,0.60)' : 'var(--border-mid)'; e.currentTarget.style.background = 'var(--bg-overlay)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isNextUpcoming ? 'rgba(225,6,0,0.40)' : 'var(--border-dim)'; e.currentTarget.style.background = 'var(--bg-raised)'; }}
            >
              <div className="space-y-4">
                {/* Header Row: Round Badge & Date */}
                <div className="flex items-baseline justify-between">
                  <span style={{ padding: '2px 8px', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }}>
                    RND {race.round}
                  </span>

                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatDateRange(race.date)}
                  </span>
                </div>

                {/* Grand Prix & Circuit Details (Flush left, no emojis) */}
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, textTransform: 'uppercase', letterSpacing: '-0.01em', color: 'var(--text-primary)', lineHeight: 1.05, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {race.raceName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60 shrink-0" strokeWidth={1.75} />
                    <span className="line-clamp-1">{race.Circuit.circuitName}</span>
                  </div>
                </div>

                {/* ================= COMPACT PODIUM STRIP ================= */}
                {race.isPast ? (
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="text-[10px] font-hud font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Trophy className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60 shrink-0" strokeWidth={1.75} />
                        <span>RACE PODIUM</span>
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onViewResults) onViewResults(race.round);
                          setSelectedModalRace(race);
                        }}
                        className="text-[10px] font-mono text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        CLASSIFICATION
                      </button>
                    </div>

                    {podium && podium.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 bg-[var(--bg-tertiary)]/50 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                        {podium.map((p) => {
                          const medalTone =
                            p.pos === 1
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : p.pos === 2
                              ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
                              : 'bg-amber-700/20 text-amber-200 border-amber-700/40';
                          const headshot = getDriverHeadshot(p.driverId || p.code || p.name);

                          return (
                            <div
                              key={p.pos}
                              className="flex flex-col items-center text-center p-2 rounded-lg bg-[var(--bg-primary)]/70 relative border border-[var(--border-subtle)]"
                            >
                              <span
                                className={`px-1.5 py-0.5 rounded-full text-[8px] font-mono font-bold leading-none border ${medalTone} absolute -top-1.5 -left-1.5 z-10`}
                              >
                                P{p.pos}
                              </span>

                              {headshot ? (
                                <img
                                  src={headshot}
                                  alt={p.name}
                                  className="w-9 h-9 rounded-full object-cover object-top border border-[var(--border-subtle)] mb-1 shrink-0 bg-[var(--bg-tertiary)]"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full border border-[var(--border-subtle)] mb-1 shrink-0 bg-[var(--bg-tertiary)] flex items-center justify-center font-mono font-bold text-xs text-[var(--text-muted)]">
                                  {p.code.slice(0, 2)}
                                </div>
                              )}

                              <div className="font-hud font-bold text-xs text-[var(--text-primary)] leading-tight mt-0.5">
                                {p.code}
                              </div>
                              <div className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums truncate w-full mt-0.5">
                                {p.gap}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] text-center text-xs font-mono text-[var(--text-muted)]">
                        Awaiting Official FIA Classification...
                      </div>
                    )}
                  </div>
                ) : (
                  /* Upcoming Sessions Badge Strip */
                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="text-[10px] font-hud font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-60 shrink-0" strokeWidth={1.75} />
                        <span>SESSION SCHEDULE</span>
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">SCHEDULED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono bg-[var(--bg-tertiary)]/50 p-2.5 rounded-lg border border-[var(--border-subtle)]">
                      <div className="flex justify-between items-center px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-[10px]">QUALIFYING</span>
                        <span className="font-medium text-[var(--text-secondary)] tabular-nums">{race.Qualifying?.date?.slice(5) || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between items-center px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                        <span className="text-[var(--text-muted)] text-[10px]">RACE</span>
                        <span className="font-medium text-[var(--text-secondary)] tabular-nums">{race.date.slice(5)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Button */}
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-dim)' }}>
                <button
                  onClick={() => {
                    if (onSelectRace) onSelectRace(race);
                    setSelectedModalRace(race);
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-highlight)',
                    border: '1px solid var(--border-dim)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-highlight)')}
                >
                  <span>{race.isPast ? 'View Full Race Results' : 'Grand Prix Details'}</span>
                  <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)', flexShrink: 0 }} strokeWidth={1.75} />
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
