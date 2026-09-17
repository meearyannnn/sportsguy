import React, { useEffect, useState } from 'react';
import { Race, RaceResult, DriverStanding, ConstructorStanding } from '@/lib/f1/types';
import { CIRCUIT_EXTRAS, getTeamMeta } from '@/lib/f1/teams';
import { fetchF1ComCircuitSpecs, F1ComCircuitSpecs } from '@/lib/f1/f1ComScraper';
import {
  getRaceResults,
  getQualifyingResults,
  getDriverStandingsByRound,
  getConstructorStandingsByRound,
} from '@/lib/f1/jolpica';
import { getOpenMeteoWeather, OpenMeteoWeather } from '@/lib/f1/openmeteo';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/f1/preferences';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Flag,
  ArrowRight,
  Shield,
  Gauge,
  Trophy,
  Users,
  Timer,
  CloudSun,
  Wind,
  Droplets,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Award,
} from 'lucide-react';

interface GrandPrixDetailModalProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
  useLocalTime: boolean;
  onViewResults?: (round: string) => void;
}

type ModalSubTab = 'classification' | 'qualifying' | 'standings' | 'circuit' | 'timetable';

export default function GrandPrixDetailModal({
  race,
  isOpen,
  onClose,
  useLocalTime,
  onViewResults,
}: GrandPrixDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalSubTab>('classification');
  const [scrapedSpecs, setScrapedSpecs] = useState<F1ComCircuitSpecs | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [qualifyingResults, setQualifyingResults] = useState<any[]>([]);
  const [roundDriverStandings, setRoundDriverStandings] = useState<DriverStanding[]>([]);
  const [roundConstructorStandings, setRoundConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState<boolean>(false);

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

  // Load all round-specific details asynchronously
  useEffect(() => {
    if (!isOpen || !race) return;

    let isMounted = true;
    setLoadingData(true);

    const round = race.round;
    const season = race.season || 'current';

    // 1. Fetch circuit scraped specs
    const slug = race.Circuit?.Location?.country || race.Circuit?.circuitId;
    if (slug) {
      fetchF1ComCircuitSpecs(slug).then((specs) => {
        if (isMounted && specs) setScrapedSpecs(specs);
      });
    }

    // 2. Fetch Open-Meteo weather
    if (race.Circuit?.Location?.lat && race.Circuit?.Location?.long) {
      getOpenMeteoWeather(
        parseFloat(race.Circuit.Location.lat),
        parseFloat(race.Circuit.Location.long)
      ).then((w: OpenMeteoWeather | null) => {
        if (isMounted && w) setWeatherData(w);
      });
    }

    // 3. Fetch Race Results, Qualifying & Round Standings
    Promise.all([
      getRaceResults(season, round),
      getQualifyingResults(season, round),
      getDriverStandingsByRound(season, round),
      getConstructorStandingsByRound(season, round),
    ])
      .then(([resData, qualData, dStandings, cStandings]) => {
        if (!isMounted) return;
        if (resData?.results) setRaceResults(resData.results);
        if (qualData) setQualifyingResults(qualData);
        if (dStandings) setRoundDriverStandings(dStandings);
        if (cStandings) setRoundConstructorStandings(cStandings);
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, [race, isOpen]);

  if (!isOpen || !race) return null;

  const now = new Date().getTime();
  const raceIso = race.time ? `${race.date}T${race.time}` : `${race.date}T13:00:00Z`;
  const isPast = new Date(raceIso).getTime() < now;

  const circuitId = race.Circuit?.circuitId || '';
  const countryKey = race.Circuit?.Location?.country?.toLowerCase().replace(/\s+/g, '_') || '';
  const fallbackMeta = CIRCUIT_EXTRAS[circuitId] || CIRCUIT_EXTRAS[countryKey] || {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.3,
    lapRecord: '1:28.000',
    recordHolder: 'Track Record',
    recordYear: '2024',
  };

  const circuitMeta = {
    corners: scrapedSpecs?.corners || fallbackMeta.corners,
    drsZones: scrapedSpecs?.drsZones || fallbackMeta.drsZones,
    lengthKm: scrapedSpecs?.circuitLengthKm || fallbackMeta.lengthKm,
    lapRecord: scrapedSpecs?.lapRecord || fallbackMeta.lapRecord,
    recordHolder: scrapedSpecs?.recordHolder || fallbackMeta.recordHolder,
    recordYear: scrapedSpecs?.recordYear || fallbackMeta.recordYear,
    laps: scrapedSpecs?.laps || Math.round(305 / (scrapedSpecs?.circuitLengthKm || fallbackMeta.lengthKm)),
  };

  const estimatedLaps = circuitMeta.laps;
  const totalDistanceKm = (estimatedLaps * circuitMeta.lengthKm).toFixed(1);

  const formatSession = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'TBA';
    const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
    const d = new Date(iso);
    if (useLocalTime) {
      return d.toLocaleTimeString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return `${dateStr} • ${timeStr ? timeStr.slice(0, 5) + ' UTC' : 'TBA'}`;
  };

  // Top 3 Podium Winners
  const podiumWinners = raceResults.slice(0, 3);
  const poleSitter = qualifyingResults[0] || (raceResults.find((r) => r.grid === '1') || null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10 my-auto text-[var(--text-primary)] max-h-[92vh] flex flex-col">
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[var(--accent-f1-red)] via-amber-400 to-purple-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50 shrink-0 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-hud font-black uppercase tracking-wider bg-[var(--accent-f1-red)]/20 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/30">
                  ROUND {race.round} OF {race.season}
                </span>
                {isPast ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle2 className="w-3 h-3" />
                    OFFICIAL GRAND PRIX RESULT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/30 px-2.5 py-0.5 rounded border border-amber-800/40">
                    <Clock className="w-3 h-3" />
                    UPCOMING GRAND PRIX
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] tracking-tight mt-1">
                {race.raceName}
              </h2>

              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                <span>
                  {race.Circuit.circuitName} • {race.Circuit.Location.locality},{' '}
                  {race.Circuit.Location.country}
                </span>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            {[
              { id: 'classification', label: 'Race Results', icon: Trophy },
              { id: 'qualifying', label: 'Qualifying Grid', icon: Timer },
              { id: 'standings', label: 'Round Standings', icon: Users },
              { id: 'circuit', label: 'Circuit Telemetry', icon: Gauge },
              { id: 'timetable', label: 'Schedule & Weather', icon: Calendar },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ModalSubTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
          {/* ==================== SUB-TAB 1: RACE CLASSIFICATION & PODIUMS ==================== */}
          {activeTab === 'classification' && (
            <div className="space-y-6">
              {/* Podium Highlight Cards */}
              {podiumWinners.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {podiumWinners.map((res, idx) => {
                    const teamMeta = getTeamMeta(res.Constructor?.constructorId || '');
                    return (
                      <div
                        key={res.position}
                        className={`p-4 rounded-xl border relative overflow-hidden flex flex-col justify-between ${
                          idx === 0
                            ? 'bg-gradient-to-br from-amber-500/15 via-[var(--bg-primary)] to-[var(--bg-primary)] border-amber-500/40 shadow-lg shadow-amber-500/5'
                            : idx === 1
                            ? 'bg-gradient-to-br from-slate-400/15 via-[var(--bg-primary)] to-[var(--bg-primary)] border-slate-400/40'
                            : 'bg-gradient-to-br from-amber-700/15 via-[var(--bg-primary)] to-[var(--bg-primary)] border-amber-700/40'
                        }`}
                      >
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ backgroundColor: teamMeta.color }}
                        />

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-hud font-black uppercase ${
                                idx === 0
                                  ? 'bg-amber-400 text-black'
                                  : idx === 1
                                  ? 'bg-slate-300 text-black'
                                  : 'bg-amber-700 text-white'
                              }`}
                            >
                              {idx === 0 ? '🏆 WINNER (P1)' : `PODIUM (P${idx + 1})`}
                            </span>
                            <span className="text-xs font-mono font-bold text-[var(--accent-f1-red)]">
                              +{res.points} PTS
                            </span>
                          </div>

                          <div>
                            <div className="text-base font-black font-hud text-[var(--text-primary)]">
                              {res.Driver.givenName} {res.Driver.familyName}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              {res.Constructor.name}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[var(--text-muted)]">Time / Interval</span>
                          <span className="font-bold text-[var(--text-primary)]">
                            {res.Time?.time || 'WINNER'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Race Classification Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[var(--accent-f1-red)]" />
                    <span>Official Race Classification (Round {race.round})</span>
                  </h3>
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    {raceResults.length > 0 ? `${raceResults.length} Drivers Classified` : 'Results Pending'}
                  </span>
                </div>

                {raceResults.length > 0 ? (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          <tr>
                            <th className="py-2.5 px-3 w-10 text-center">Pos</th>
                            <th className="py-2.5 px-3">Driver</th>
                            <th className="py-2.5 px-3">Constructor</th>
                            <th className="py-2.5 px-3 text-center">Grid Delta</th>
                            <th className="py-2.5 px-3 text-center">Laps</th>
                            <th className="py-2.5 px-3">Time / Status</th>
                            <th className="py-2.5 px-3 text-right pr-4">Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                          {raceResults.map((res) => {
                            const gridNum = parseInt(res.grid, 10);
                            const posNum = parseInt(res.position, 10);
                            const delta = !isNaN(gridNum) && !isNaN(posNum) ? gridNum - posNum : 0;
                            const isFastest = res.FastestLap?.rank === '1';
                            const teamMeta = getTeamMeta(res.Constructor.constructorId);

                            return (
                              <tr key={res.position} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                                <td className="py-2.5 px-3 text-center font-bold">
                                  <span className={`inline-flex w-5 h-5 items-center justify-center rounded text-[11px] ${
                                    res.position === '1' ? 'bg-amber-400 text-black font-black' :
                                    res.position === '2' ? 'bg-slate-300 text-black font-black' :
                                    res.position === '3' ? 'bg-amber-700 text-white font-black' :
                                    'text-[var(--text-muted)]'
                                  }`}>
                                    {res.position}
                                  </span>
                                </td>

                                <td className="py-2.5 px-3 font-sans">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: teamMeta.color }} />
                                    <span className="font-bold text-[var(--text-primary)]">
                                      {res.Driver.givenName} {res.Driver.familyName}
                                    </span>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                                      {res.Driver.code}
                                    </span>
                                    {isFastest && (
                                      <span className="px-1.5 py-0.5 rounded text-[9px] font-hud font-bold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30" title="Fastest Lap Bonus Point">
                                        ⚡ FL
                                      </span>
                                    )}
                                  </div>
                                </td>

                                <td className="py-2.5 px-3 text-[var(--text-secondary)] font-sans">
                                  {res.Constructor.name}
                                </td>

                                <td className="py-2.5 px-3 text-center font-mono">
                                  {delta > 0 ? (
                                    <span className="inline-flex items-center gap-0.5 text-emerald-400 font-bold text-[11px]">
                                      <TrendingUp className="w-3 h-3" /> +{delta}
                                    </span>
                                  ) : delta < 0 ? (
                                    <span className="inline-flex items-center gap-0.5 text-rose-400 text-[11px]">
                                      <TrendingDown className="w-3 h-3" /> {delta}
                                    </span>
                                  ) : (
                                    <span className="text-[var(--text-muted)] text-[11px]">-</span>
                                  )}
                                </td>

                                <td className="py-2.5 px-3 text-center text-[var(--text-muted)]">
                                  {res.laps}
                                </td>

                                <td className="py-2.5 px-3 text-[var(--text-primary)]">
                                  {res.Time?.time || res.status}
                                </td>

                                <td className="py-2.5 px-3 text-right pr-4 font-bold text-sm text-[var(--accent-f1-red)]">
                                  {res.points !== '0' ? `+${res.points}` : '0'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-xl">
                    Official race results are pending for this Grand Prix.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== SUB-TAB 2: QUALIFYING GRID ==================== */}
          {activeTab === 'qualifying' && (
            <div className="space-y-6">
              {/* Pole Sitter Banner */}
              {poleSitter && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[var(--bg-primary)] to-[var(--bg-primary)] border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-400 text-black flex items-center justify-center font-hud font-black text-lg">
                      P1
                    </div>
                    <div>
                      <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-amber-400">
                        OFFICIAL POLE POSITION
                      </div>
                      <div className="text-base font-black font-hud text-[var(--text-primary)]">
                        {poleSitter.Driver?.givenName} {poleSitter.Driver?.familyName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-hud uppercase text-[var(--text-muted)]">Pole Lap</div>
                    <div className="font-hud font-black text-lg text-amber-400 font-mono">
                      {poleSitter.Q3 || poleSitter.Q2 || poleSitter.Q1 || 'QUALIFIED'}
                    </div>
                  </div>
                </div>
              )}

              {/* Qualifying Table */}
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">Grid</th>
                        <th className="py-2.5 px-3">Driver</th>
                        <th className="py-2.5 px-3">Constructor</th>
                        <th className="py-2.5 px-3 text-center">Q1</th>
                        <th className="py-2.5 px-3 text-center">Q2</th>
                        <th className="py-2.5 px-3 text-center">Q3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                      {(qualifyingResults.length > 0 ? qualifyingResults : raceResults).map((q, idx) => {
                        const pos = q.position || String(idx + 1);
                        const teamMeta = getTeamMeta(q.Constructor?.constructorId || '');

                        return (
                          <tr key={pos} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                            <td className="py-2.5 px-3 text-center font-bold text-[var(--text-muted)]">
                              P{pos}
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-4 rounded-full" style={{ backgroundColor: teamMeta.color }} />
                                <span className="font-bold text-[var(--text-primary)]">
                                  {q.Driver.givenName} {q.Driver.familyName}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-[var(--text-secondary)] font-sans">
                              {q.Constructor.name}
                            </td>
                            <td className="py-2.5 px-3 text-center text-[var(--text-muted)]">
                              {q.Q1 || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center text-[var(--text-secondary)]">
                              {q.Q2 || '-'}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                              {q.Q3 || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-TAB 3: ROUND STANDINGS ==================== */}
          {activeTab === 'standings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Championship Standings After Round */}
              <div className="space-y-3">
                <h3 className="font-hud font-black text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  <span>Driver Standings After Round {race.round}</span>
                </h3>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <tr>
                          <th className="py-2 px-3 w-8 text-center">Pos</th>
                          <th className="py-2 px-3">Driver</th>
                          <th className="py-2 px-3 text-right pr-3">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                        {roundDriverStandings.slice(0, 10).map((d) => (
                          <tr key={d.Driver.driverId} className="hover:bg-[var(--bg-secondary)]/50">
                            <td className="py-2 px-3 text-center font-bold text-[var(--text-muted)]">
                              {d.position}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              <span className="font-bold text-[var(--text-primary)]">
                                {d.Driver.givenName} {d.Driver.familyName}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right pr-3 font-bold text-[var(--accent-f1-red)]">
                              {d.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Constructor Championship Standings After Round */}
              <div className="space-y-3">
                <h3 className="font-hud font-black text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>Constructor Standings After Round {race.round}</span>
                </h3>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <tr>
                          <th className="py-2 px-3 w-8 text-center">Pos</th>
                          <th className="py-2 px-3">Constructor</th>
                          <th className="py-2 px-3 text-right pr-3">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                        {roundConstructorStandings.map((c) => (
                          <tr key={c.Constructor.constructorId} className="hover:bg-[var(--bg-secondary)]/50">
                            <td className="py-2 px-3 text-center font-bold text-[var(--text-muted)]">
                              {c.position}
                            </td>
                            <td className="py-2 px-3 font-sans">
                              <span className="font-bold text-[var(--text-primary)]">
                                {c.Constructor.name}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right pr-3 font-bold text-[var(--text-primary)]">
                              {c.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== SUB-TAB 4: CIRCUIT TELEMETRY ==================== */}
          {activeTab === 'circuit' && (
            <div className="space-y-6">
              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                  <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Circuit Length</div>
                  <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-1">
                    {circuitMeta.lengthKm} KM
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                  <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Turns / Corners</div>
                  <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-1">
                    {circuitMeta.corners} Turns
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                  <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">DRS Zones</div>
                  <div className="font-hud font-black text-xl text-[var(--accent-f1-red)] font-mono-num mt-1">
                    {circuitMeta.drsZones} Zones
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                  <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">Total Race Laps</div>
                  <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-1">
                    {estimatedLaps} Laps
                  </div>
                </div>
              </div>

              {/* Lap Record Highlight */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-hud uppercase tracking-wider text-purple-300 font-bold">
                      Official All-Time Lap Record
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      Set by <span className="font-bold text-[var(--text-primary)]">{circuitMeta.recordHolder}</span> ({circuitMeta.recordYear})
                    </div>
                  </div>
                </div>

                <div className="font-hud font-black text-xl text-purple-400 font-mono">
                  {circuitMeta.lapRecord}
                </div>
              </div>

              {/* Technical Insights */}
              <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 text-xs">
                <h4 className="font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  <span>Circuit Insights & Aerodynamic Demand</span>
                </h4>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {race.Circuit.circuitName} spans {circuitMeta.lengthKm} km across {circuitMeta.corners} corners. Total Grand Prix race distance is {totalDistanceKm} km over {estimatedLaps} laps. It features {circuitMeta.drsZones} DRS detection and activation zones designed for high-speed overtaking down long straightaways.
                </p>
              </div>
            </div>
          )}

          {/* ==================== SUB-TAB 5: SCHEDULE & WEATHER ==================== */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              {/* Open-Meteo Weather Forecast Widget */}
              {weatherData && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-[var(--bg-primary)] to-[var(--bg-primary)] border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-hud font-bold text-blue-400 uppercase">
                      <CloudSun className="w-4 h-4" />
                      <span>Circuit Real Weather Forecast (Open-Meteo)</span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">LAT/LONG SYNC</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Ambient Temp</div>
                      <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{weatherData.airTemperature}°C</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Wind Speed</div>
                      <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{weatherData.windSpeed} km/h</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Humidity</div>
                      <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{weatherData.humidity}%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                      <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Precipitation</div>
                      <div className="text-sm font-bold font-mono text-blue-400">{weatherData.precipitationProbability}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timetable List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-hud font-black text-xs uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                    <span>Official Weekend Session Schedule</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <a
                      href={generateGoogleCalendarUrl(race, 'Grand Prix Race', race.date, race.time)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded bg-[var(--bg-primary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
                    >
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>Google Cal</span>
                    </a>

                    <button
                      onClick={() => downloadIcsFile(race, 'Grand Prix Race', race.date, race.time)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-primary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-[10px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Clock className="w-3 h-3 text-emerald-400" />
                      <span>Download .ICS</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] divide-y divide-[var(--border-subtle)] text-xs overflow-hidden">
                  {race.FirstPractice && (
                    <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                      <div className="font-medium text-[var(--text-secondary)]">Practice 1 (FP1)</div>
                      <div className="font-mono-num font-bold text-[var(--text-primary)]">
                        {formatSession(race.FirstPractice.date, race.FirstPractice.time)}
                      </div>
                    </div>
                  )}

                  {race.SecondPractice && (
                    <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                      <div className="font-medium text-[var(--text-secondary)]">Practice 2 (FP2)</div>
                      <div className="font-mono-num font-bold text-[var(--text-primary)]">
                        {formatSession(race.SecondPractice.date, race.SecondPractice.time)}
                      </div>
                    </div>
                  )}

                  {race.ThirdPractice && (
                    <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                      <div className="font-medium text-[var(--text-secondary)]">Practice 3 (FP3)</div>
                      <div className="font-mono-num font-bold text-[var(--text-primary)]">
                        {formatSession(race.ThirdPractice.date, race.ThirdPractice.time)}
                      </div>
                    </div>
                  )}

                  {race.SprintQualifying && (
                    <div className="p-3 flex items-center justify-between bg-orange-950/15 text-orange-400">
                      <div className="font-bold">Sprint Shootout</div>
                      <div className="font-mono-num font-bold">
                        {formatSession(race.SprintQualifying.date, race.SprintQualifying.time)}
                      </div>
                    </div>
                  )}

                  {race.Sprint && (
                    <div className="p-3 flex items-center justify-between bg-orange-950/25 text-orange-400">
                      <div className="font-bold">Sprint Race</div>
                      <div className="font-mono-num font-bold">
                        {formatSession(race.Sprint.date, race.Sprint.time)}
                      </div>
                    </div>
                  )}

                  {race.Qualifying && (
                    <div className="p-3 flex items-center justify-between bg-amber-950/15 text-amber-400">
                      <div className="font-bold">Grand Prix Qualifying</div>
                      <div className="font-mono-num font-black">
                        {formatSession(race.Qualifying.date, race.Qualifying.time)}
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 flex items-center justify-between bg-[var(--accent-f1-red)]/15 border-t border-[var(--accent-f1-red)]/30 text-[var(--accent-f1-red)]">
                    <div className="font-hud font-black uppercase tracking-wider text-sm flex items-center gap-1.5">
                      <Flag className="w-4 h-4" />
                      MAIN GRAND PRIX RACE
                    </div>
                    <div className="font-mono-num font-black text-sm">
                      {formatSession(race.date, race.time)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[var(--text-muted)] font-mono">
            Round {race.round} • FIA Formula 1 World Championship
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isPast && onViewResults && (
              <button
                onClick={() => {
                  onClose();
                  onViewResults(race.round);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[var(--accent-f1-red)] text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-md"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>GO TO FULL RESULTS TAB</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              CLOSE DOSSIER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
