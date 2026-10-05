'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  OpenF1Session,
  OpenF1Interval,
  OpenF1Weather,
  DriverStanding,
  Race,
} from '@/lib/f1/types';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  Gauge,
  Zap,
  Radio,
  Thermometer,
  Wind,
  RotateCw,
  Clock,
  Flag,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trophy,
  Flame,
  ShieldAlert,
  Layers,
  Activity,
  Droplets,
  History,
  Calendar,
} from 'lucide-react';
import { isAudioEnabled, setAudioEnabled, playTelemetryTick } from '@/lib/f1/audio';
import FreshnessBadge from '@/components/f1/FreshnessBadge';

export interface RoundSummary {
  round: number;
  raceName: string;
  circuitName: string;
  country: string;
  date: string;
  isCompleted: boolean;
}

export interface WeekendSessionMeta {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  circuit_short_name: string;
  country_name: string;
  location: string;
  year: number;
  status: 'COMPLETED' | 'LIVE' | 'UPCOMING';
}

export interface LiveDriverEntry {
  position: number;
  driverNumber: number;
  code: string;
  fullName: string;
  firstName: string;
  lastName: string;
  team: string;
  teamColor: string;
  headshotUrl: string | null;
  gapToLeader: number | string | null;
  interval: number | string | null;
  lastLap: number | null;
  lastLapFormatted: string;
  bestLap: number | null;
  bestLapFormatted: string;
  isOverallFastestLap: boolean;
  speedTrap: number | null;
  compound: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';
  stintLapCount: number;
  pitCount: number;
  inPit: boolean;
  totalLaps: number;
  isKnockedOut?: boolean;
  gridPos?: number;
  points?: number;
  status?: string;
  isWinner?: boolean;
}

export interface StintPatternEntry {
  driverNumber: number;
  code: string;
  stints: Array<{
    stintNumber: number;
    compound: string;
    laps: number;
    type: 'Short Run' | 'Long Run';
  }>;
}

interface LiveTelemetryHUDProps {
  session?: OpenF1Session | null;
  initialWeather?: OpenF1Weather | null;
  initialIntervals?: OpenF1Interval[];
  driverStandings?: DriverStanding[];
  onSelectDriver?: (driverId: string) => void;
  showFeed?: boolean;
  onToggleGlance?: () => void;
  nextRace?: Race | null;
  calendar?: Race[];
  useLocalTime?: boolean;
}

export default function LiveTelemetryHUD({
  session,
  initialWeather,
  initialIntervals,
  driverStandings = [],
  onSelectDriver,
  onToggleGlance,
  nextRace,
  calendar = [],
  useLocalTime = true,
}: LiveTelemetryHUDProps) {
  // Session tracking state
  const [sessions, setSessions] = useState<WeekendSessionMeta[]>([]);
  const [selectedSessionKey, setSelectedSessionKey] = useState<number | null>(null);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [roundsList, setRoundsList] = useState<RoundSummary[]>([]);
  const [meetingMeta, setMeetingMeta] = useState<{
    round?: number;
    meeting_name?: string;
    circuit_name?: string;
    country_name?: string;
  } | null>(null);
  const [dataSource, setDataSource] = useState<string>('Multi-Source Realtime Stream');
  const [isSimulatedLive, setIsSimulatedLive] = useState<boolean>(false);

  const [activeSession, setActiveSession] = useState<{
    session_key: number;
    session_name: string;
    session_type: string;
    status: 'COMPLETED' | 'LIVE' | 'UPCOMING';
    date_start: string;
    date_end: string;
    flagStatus: 'GREEN' | 'YELLOW' | 'DOUBLE YELLOW' | 'RED' | 'VSC' | 'SAFETY CAR' | 'CHEQUERED';
    flagMessage: string | null;
    isDelayed: boolean;
    weather: {
      air_temperature: number | null;
      track_temperature: number | null;
      humidity: number | null;
      wind_speed: number | null;
    } | null;
    currentLap?: number;
    totalLaps?: number;
    leaderboard: LiveDriverEntry[];
    stintAnalysis?: StintPatternEntry[];
  } | null>(null);

  const [feedStatus, setFeedStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'DELAYED'>('CONNECTED');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [audioOn, setAudioOn] = useState<boolean>(false);
  const [expandedDriverNumber, setExpandedDriverNumber] = useState<number | null>(null);
  const [expandedTelemetry, setExpandedTelemetry] = useState<any[]>([]);
  const [compareWithWinner, setCompareWithWinner] = useState<boolean>(false);
  const [winnerTelemetry, setWinnerTelemetry] = useState<any[]>([]);

  // Qualifying Segment View (Q1, Q2, Q3)
  const [qualiSegment, setQualiSegment] = useState<'Q1' | 'Q2' | 'Q3'>('Q1');

  // Animation and Flash States
  const previousPositionsRef = useRef<Record<number, number>>({});
  const previousOverallBestRef = useRef<number | null>(null);
  const [rowHighlights, setRowHighlights] = useState<Record<number, 'gain' | 'loss' | 'fastest' | 'pit'>>({});

  // Countdown timer state for UPCOMING sessions
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 1 });

  // Initialize Audio
  useEffect(() => {
    setAudioOn(isAudioEnabled());
  }, []);

  // 1. Fetch Session Data
  const fetchSessionData = async (
    sessionKeyToLoad?: number | null,
    isBackground = false,
    simLiveOverride?: boolean,
    targetRoundOverride?: number | null
  ) => {
    if (!isBackground) setIsLoading(true);
    try {
      const activeSim = simLiveOverride !== undefined ? simLiveOverride : isSimulatedLive;
      const targetRound = targetRoundOverride !== undefined ? targetRoundOverride : selectedRound;
      const params = new URLSearchParams();
      if (sessionKeyToLoad) params.set('session_key', String(sessionKeyToLoad));
      if (targetRound) {
        params.set('round', String(targetRound));
      } else if (nextRace?.round) {
        params.set('round', String(nextRace.round));
      }
      if (activeSim) params.set('simulate_live', 'true');

      const url = `/api/f1/live-session?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) {
        setFeedStatus('RECONNECTING');
        return;
      }

      const data = await res.json();
      if (data.sessions && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      }
      if (data.roundsList && Array.isArray(data.roundsList)) {
        setRoundsList(data.roundsList);
      }
      if (data.meeting) {
        setMeetingMeta(data.meeting);
      }
      if (data.dataSource) {
        setDataSource(data.dataSource);
      }

      if (data.activeSession) {
        const newLeaderboard: LiveDriverEntry[] = data.activeSession.leaderboard || [];

        // Check for position changes, fastest lap, and pit events to trigger flash highlights
        const newHighlights: Record<number, 'gain' | 'loss' | 'fastest' | 'pit'> = {};

        // Check overall fastest lap change
        let currentOverallBest: number | null = null;
        newLeaderboard.forEach((d) => {
          if (d.bestLap && (currentOverallBest === null || d.bestLap < currentOverallBest)) {
            currentOverallBest = d.bestLap;
          }
        });

        if (
          currentOverallBest &&
          previousOverallBestRef.current &&
          currentOverallBest < previousOverallBestRef.current
        ) {
          const fastestDriver = newLeaderboard.find(
            (d) => d.bestLap && Math.abs(d.bestLap - currentOverallBest!) < 0.001
          );
          if (fastestDriver) {
            newHighlights[fastestDriver.driverNumber] = 'fastest';
          }
        }
        previousOverallBestRef.current = currentOverallBest;

        // Check position deltas & pit status
        newLeaderboard.forEach((d) => {
          const prevPos = previousPositionsRef.current[d.driverNumber];
          if (prevPos !== undefined) {
            if (d.position < prevPos) {
              newHighlights[d.driverNumber] = 'gain';
            } else if (d.position > prevPos) {
              newHighlights[d.driverNumber] = 'loss';
            }
          }
          if (d.inPit) {
            newHighlights[d.driverNumber] = 'pit';
          }
          previousPositionsRef.current[d.driverNumber] = d.position;
        });

        if (Object.keys(newHighlights).length > 0) {
          setRowHighlights(newHighlights);
          setTimeout(() => {
            setRowHighlights({});
          }, 3500);
        }

        setActiveSession(data.activeSession);
        setSelectedSessionKey(data.activeSession.session_key);
        setFeedStatus(data.feedStatus || 'CONNECTED');
      }
    } catch (err) {
      console.warn('[Live Session Fetch Error]:', err);
      setFeedStatus('RECONNECTING');
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchSessionData(selectedSessionKey, false, undefined, selectedRound);
  }, [selectedSessionKey, selectedRound]);

  // Round selection switcher
  const handleSelectRound = (roundNumber: number | null) => {
    setSelectedRound(roundNumber);
    setSelectedSessionKey(null);
    setExpandedDriverNumber(null);
    setWinnerTelemetry([]);
    setCompareWithWinner(false);
    fetchSessionData(null, false, undefined, roundNumber);
  };

  // Polling loop:
  // If session is LIVE -> poll every 3 seconds for position & interval data
  // If session is UPCOMING -> re-check every 20 seconds to see if session started
  // If session is COMPLETED (e.g. past round) -> do not poll aggressively
  useEffect(() => {
    const isLive = activeSession?.status === 'LIVE' || isSimulatedLive;
    if (activeSession?.status === 'COMPLETED' && selectedRound && Number(selectedRound) < (nextRace?.round ? Number(nextRace.round) : 16)) {
      return;
    }
    const pollInterval = isLive ? 3000 : 25000;

    const interval = setInterval(() => {
      fetchSessionData(selectedSessionKey, true);
    }, pollInterval);

    return () => clearInterval(interval);
  }, [activeSession?.status, selectedSessionKey, isSimulatedLive, selectedRound, nextRace?.round]);

  // High-frequency telemetry polling for expanded driver + comparison with winner
  useEffect(() => {
    if (!expandedDriverNumber || !selectedSessionKey) {
      return;
    }

    const loadCarTelemetry = async () => {
      try {
        const circuit = meetingMeta?.circuit_name || sessions[0]?.circuit_short_name || 'sepang';
        const res = await fetch(
          `/api/f1/telemetry?session_key=${selectedSessionKey}&driver_number=${expandedDriverNumber}&circuit=${encodeURIComponent(circuit)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setExpandedTelemetry(data);
          }
        }

        // If compare with winner is active, load winner's (P1) telemetry
        const p1 = activeSession?.leaderboard?.[0];
        if (compareWithWinner && p1 && p1.driverNumber !== expandedDriverNumber) {
          const winnerRes = await fetch(
            `/api/f1/telemetry?session_key=${selectedSessionKey}&driver_number=${p1.driverNumber}&circuit=${encodeURIComponent(circuit)}`
          );
          if (winnerRes.ok) {
            const wData = await winnerRes.json();
            if (Array.isArray(wData)) {
              setWinnerTelemetry(wData);
            }
          }
        }
      } catch (err) {
        console.warn('Car telemetry poll error:', err);
      }
    };

    loadCarTelemetry();
    const isLive = activeSession?.status === 'LIVE' || isSimulatedLive;
    if (isLive) {
      const carInterval = setInterval(loadCarTelemetry, 1800);
      return () => clearInterval(carInterval);
    }
  }, [expandedDriverNumber, selectedSessionKey, activeSession?.status, isSimulatedLive, meetingMeta, compareWithWinner, activeSession?.leaderboard]);

  // Live countdown clock for upcoming sessions
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'UPCOMING') return;

    const timer = setInterval(() => {
      const targetTime = new Date(activeSession.date_start).getTime();
      const diff = targetTime - Date.now();

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        // Auto-switch to LIVE mode
        fetchSessionData(selectedSessionKey, false);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ days, hours, minutes, seconds, totalMs: diff });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession?.date_start, activeSession?.status, selectedSessionKey]);

  // Format session date/time
  const formatDateTime = (isoDate: string) => {
    if (!isoDate) return { dateStr: 'TBA', timeStr: 'TBA' };
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return { dateStr: isoDate, timeStr: 'TBA' };

    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: useLocalTime ? undefined : 'UTC',
    });
    const timeStr = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: useLocalTime ? undefined : 'UTC',
    });

    return {
      dateStr,
      timeStr: useLocalTime ? `${timeStr} (Local)` : `${timeStr} GMT`,
    };
  };

  // Compound color pill helper
  const getCompoundStyle = (compound: string) => {
    const c = (compound || '').toUpperCase();
    if (c.includes('SOFT')) return { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50', label: 'S' };
    if (c.includes('MED')) return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50', label: 'M' };
    if (c.includes('HARD')) return { bg: 'bg-slate-200/20', text: 'text-slate-100', border: 'border-slate-300/50', label: 'H' };
    if (c.includes('INTER')) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', label: 'I' };
    if (c.includes('WET')) return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', label: 'W' };
    return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50', label: '?' };
  };

  const isPractice = activeSession?.session_type === 'Practice';
  const isQualifying = activeSession?.session_type === 'Qualifying';
  const isRace = activeSession?.session_type === 'Race';

  const allRounds: RoundSummary[] = useMemo(() => {
    if (roundsList.length > 0) return roundsList;
    if (calendar.length > 0) {
      return calendar.map((c) => ({
        round: Number(c.round),
        raceName: c.raceName,
        circuitName: c.Circuit.circuitName,
        country: c.Circuit.Location.country,
        date: c.date,
        isCompleted: new Date(c.date) < new Date(),
      }));
    }
    return [
      { round: 1, raceName: 'Australian Grand Prix', circuitName: 'Albert Park Circuit', country: 'Australia', date: '2026-03-08', isCompleted: true },
      { round: 2, raceName: 'Chinese Grand Prix', circuitName: 'Shanghai International Circuit', country: 'China', date: '2026-03-22', isCompleted: true },
      { round: 3, raceName: 'Japanese Grand Prix', circuitName: 'Suzuka International Racing Course', country: 'Japan', date: '2026-04-05', isCompleted: true },
      { round: 4, raceName: 'Bahrain Grand Prix', circuitName: 'Bahrain International Circuit', country: 'Bahrain', date: '2026-04-12', isCompleted: true },
      { round: 5, raceName: 'Saudi Arabian Grand Prix', circuitName: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', date: '2026-04-19', isCompleted: true },
      { round: 6, raceName: 'Miami Grand Prix', circuitName: 'Miami International Autodrome', country: 'USA', date: '2026-05-03', isCompleted: true },
      { round: 7, raceName: 'Emilia Romagna Grand Prix', circuitName: 'Autodromo Enzo e Dino Ferrari', country: 'Italy', date: '2026-05-17', isCompleted: true },
      { round: 8, raceName: 'Monaco Grand Prix', circuitName: 'Circuit de Monaco', country: 'Monaco', date: '2026-05-24', isCompleted: true },
      { round: 9, raceName: 'Spanish Grand Prix', circuitName: 'Circuit de Barcelona-Catalunya', country: 'Spain', date: '2026-06-07', isCompleted: true },
      { round: 10, raceName: 'Canadian Grand Prix', circuitName: 'Circuit Gilles Villeneuve', country: 'Canada', date: '2026-06-14', isCompleted: true },
      { round: 11, raceName: 'Austrian Grand Prix', circuitName: 'Red Bull Ring', country: 'Austria', date: '2026-06-28', isCompleted: true },
      { round: 12, raceName: 'British Grand Prix', circuitName: 'Silverstone Circuit', country: 'United Kingdom', date: '2026-07-05', isCompleted: true },
      { round: 13, raceName: 'Belgian Grand Prix', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', date: '2026-07-26', isCompleted: true },
      { round: 14, raceName: 'Hungarian Grand Prix', circuitName: 'Hungaroring', country: 'Hungary', date: '2026-08-02', isCompleted: true },
      { round: 15, raceName: 'Dutch Grand Prix', circuitName: 'Circuit Zandvoort', country: 'Netherlands', date: '2026-08-30', isCompleted: true },
      { round: 16, raceName: 'Italian Grand Prix', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', date: '2026-09-06', isCompleted: true },
      { round: 17, raceName: 'Azerbaijan Grand Prix', circuitName: 'Baku City Circuit', country: 'Azerbaijan', date: '2026-09-20', isCompleted: true },
      { round: 18, raceName: 'Singapore Grand Prix', circuitName: 'Marina Bay Street Circuit', country: 'Singapore', date: '2026-10-04', isCompleted: false },
      { round: 19, raceName: 'United States Grand Prix', circuitName: 'Circuit of the Americas', country: 'USA', date: '2026-10-18', isCompleted: false },
      { round: 20, raceName: 'Mexico City Grand Prix', circuitName: 'Autódromo Hermanos Rodríguez', country: 'Mexico', date: '2026-10-25', isCompleted: false },
      { round: 21, raceName: 'São Paulo Grand Prix', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', date: '2026-11-08', isCompleted: false },
      { round: 22, raceName: 'Las Vegas Grand Prix', circuitName: 'Las Vegas Strip Circuit', country: 'USA', date: '2026-11-21', isCompleted: false },
      { round: 23, raceName: 'Qatar Grand Prix', circuitName: 'Losail International Circuit', country: 'Qatar', date: '2026-11-29', isCompleted: false },
      { round: 24, raceName: 'Abu Dhabi Grand Prix', circuitName: 'Yas Marina Circuit', country: 'UAE', date: '2026-12-06', isCompleted: false },
    ];
  }, [roundsList, calendar]);

  const quickRounds = useMemo(() => [
    { round: 16, name: 'Sepang (LIVE)', isLive: true },
    { round: 15, name: 'Baku (R15)', winner: 'RUS' },
    { round: 14, name: 'Monza (R14)', winner: 'ANT' },
    { round: 13, name: 'Zandvoort (R13)', winner: 'NOR' },
    { round: 12, name: 'Spa (R12)', winner: 'PIA' },
    { round: 1, name: 'Australia (R1)', winner: 'RUS' },
  ], []);

  const isPastRaceSelected = selectedRound !== null && selectedRound !== (nextRace?.round || 16);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* ── 0. PAST RACES & REAL-TIME TELEMETRY ARCHIVE SELECTOR ─────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4 shadow-md relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <History className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs sm:text-sm font-hud font-black uppercase tracking-wider text-[var(--text-primary)]">
                F1 2026 RACES & TELEMETRY NAVIGATOR
              </h2>
              {isPastRaceSelected ? (
                <span className="text-[10px] font-hud font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  ARCHIVE VIEW: ROUND {meetingMeta?.round || selectedRound}
                </span>
              ) : (
                <span className="text-[10px] font-hud font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  ACTIVE ROUND: ROUND {meetingMeta?.round || 16}
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Browse finishing positions, grid deltas, fastest laps & in-car telemetry across all 2026 rounds.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isPastRaceSelected && (
              <button
                onClick={() => handleSelectRound(null)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[var(--accent-f1-red)] to-rose-600 text-white font-hud font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Return to Live GP (R{nextRace?.round || 16})</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <label htmlFor="round-select" className="text-[11px] font-hud uppercase font-bold text-[var(--text-muted)]">
                Round:
              </label>
              <select
                id="round-select"
                value={selectedRound ?? (nextRace?.round || 16)}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleSelectRound(val === (nextRace?.round || 16) ? null : val);
                }}
                className="bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-hud font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-[var(--accent-f1-red)] cursor-pointer"
              >
                {allRounds.map((r) => {
                  const isCurrent = r.round === (nextRace?.round || 16);
                  return (
                    <option key={r.round} value={r.round}>
                      R{r.round}: {r.raceName} {r.isCompleted ? '✓ [RESULTS & TELEMETRY]' : isCurrent ? '⚡ [LIVE / CURRENT]' : '⏳ [UPCOMING]'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Quick-switch round pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
            <span>QUICK NAVIGATION • RECENT RACES:</span>
            <span>CLICK TO SWITCH</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickRounds.map((qr) => {
              const isActive = (selectedRound ?? (nextRace?.round || 16)) === qr.round;
              return (
                <button
                  key={qr.round}
                  onClick={() => handleSelectRound(qr.round === (nextRace?.round || 16) ? null : qr.round)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-hud font-bold uppercase whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[var(--accent-f1-red)] text-white border-[var(--accent-f1-red)] shadow-md ring-1 ring-[var(--accent-f1-red)]/50'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {qr.isLive ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                  ) : null}
                  <span>{qr.name}</span>
                  {qr.winner && (
                    <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-black/30 text-amber-300' : 'bg-[var(--bg-primary)] text-amber-400'}`}>
                      🏆 {qr.winner}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 1. HORIZONTAL FULL WEEKEND SESSION TIMELINE ──────────────────────── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-f1-red)] animate-pulse" />
            <h3 className="text-xs sm:text-sm font-hud font-black uppercase tracking-wider text-[var(--text-primary)]">
              OFFICIAL GRAND PRIX WEEKEND SCHEDULE
            </h3>
            <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
              • 5 SESSIONS
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono-num">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {useLocalTime ? 'TZ: YOUR LOCAL TIME' : 'TZ: CIRCUIT GMT'}
            </span>
            <button
              onClick={() => fetchSessionData(selectedSessionKey, false)}
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded hover:bg-[var(--bg-tertiary)] flex items-center gap-1 cursor-pointer"
              title="Refresh timing feed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="text-[10px] font-hud uppercase">Sync</span>
            </button>
          </div>
        </div>

        {/* 5-Session Horizontal Timeline Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {sessions.map((s) => {
            const isSelected = selectedSessionKey === s.session_key;
            const { dateStr, timeStr } = formatDateTime(s.date_start);

            return (
              <button
                key={s.session_key}
                onClick={() => {
                  setSelectedSessionKey(s.session_key);
                  if (audioOn) playTelemetryTick();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'border-[var(--accent-f1-red)] bg-[var(--accent-f1-red)]/10 shadow-md ring-1 ring-[var(--accent-f1-red)]/50'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/70 hover:border-[var(--border-hover)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full mb-1">
                  <span className="text-[11px] font-hud font-black uppercase tracking-tight text-[var(--text-primary)] truncate">
                    {s.session_name.replace('Practice ', 'FP')}
                  </span>

                  {s.status === 'LIVE' ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-hud font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      LIVE
                    </span>
                  ) : s.status === 'COMPLETED' ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-hud font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                      DONE
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-hud font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      UPCOMING
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="text-[10px] font-mono-num text-[var(--text-muted)] truncate">
                    {dateStr}
                  </div>
                  <div
                    className={`text-[11px] font-mono-num font-bold ${
                      isSelected ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {timeStr}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. ACTIVE SESSION HEADER & RACE CONTROL BANNER ──────────────────── */}
      {activeSession && (
        <div className="space-y-4">
          {/* Main Session Banner */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4 shadow-xl relative overflow-hidden">
            {/* Top row: Track location, Flag status, Weather, Audio toggle */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
                  <span>ROUND {meetingMeta?.round || 16} TIMING ENGINE</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <FreshnessBadge cadence={activeSession.status === 'LIVE' || isSimulatedLive ? 'live' : 'periodic'} />
                  {activeSession.status === 'COMPLETED' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-hud font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      FINAL CLASSIFICATION FROZEN
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded text-[9px] font-hud font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <Activity className="w-2.5 h-2.5 text-cyan-400" />
                    MULTI-SITE REALTIME FEED
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
                  {activeSession.session_name} • {meetingMeta?.meeting_name || sessions[0]?.country_name || 'Grand Prix'}
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {meetingMeta?.circuit_name || `${sessions[0]?.circuit_short_name} Circuit`} • {dataSource}
                </p>
              </div>

              {/* Weather & Controls */}
              <div className="flex flex-wrap items-center gap-2.5">
                {activeSession.weather && (
                  <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] p-2 rounded-xl border border-[var(--border-subtle)] text-xs">
                    <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-mono-num font-bold">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Track:{' '}
                        {activeSession.weather.track_temperature
                          ? `${activeSession.weather.track_temperature.toFixed(1)}°C`
                          : '--'}
                      </span>
                    </div>
                    <span className="text-[var(--border-subtle)]">|</span>
                    <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-mono-num font-bold">
                      <Wind className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        Air:{' '}
                        {activeSession.weather.air_temperature
                          ? `${activeSession.weather.air_temperature.toFixed(1)}°C`
                          : '--'}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    const next = !audioOn;
                    setAudioOn(next);
                    setAudioEnabled(next);
                    if (next) playTelemetryTick();
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-hud font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    audioOn
                      ? 'bg-[var(--accent-f1-red)]/15 border-[var(--accent-f1-red)] text-[var(--text-primary)] shadow-sm'
                      : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${audioOn ? 'text-[var(--accent-f1-red)] animate-pulse' : ''}`} />
                  <span>RADIO {audioOn ? 'LIVE' : 'MUTE'}</span>
                </button>
              </div>
            </div>

            {/* Flag Status & Incident Alert Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-hud uppercase text-[var(--text-muted)] font-bold">
                  Track Flag:
                </span>
                {activeSession.flagStatus === 'RED' ? (
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50 font-hud font-black uppercase flex items-center gap-1.5 animate-pulse">
                    <AlertOctagon className="w-4 h-4 text-rose-500" />
                    RED FLAG • SESSION SUSPENDED
                  </span>
                ) : activeSession.flagStatus === 'VSC' ? (
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/50 font-hud font-black uppercase flex items-center gap-1.5 animate-pulse">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    VIRTUAL SAFETY CAR (VSC) DEPLOYED
                  </span>
                ) : activeSession.flagStatus === 'SAFETY CAR' ? (
                  <span className="px-2.5 py-1 rounded bg-amber-500/25 text-amber-300 border border-amber-500/60 font-hud font-black uppercase flex items-center gap-1.5 animate-pulse">
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    SAFETY CAR DEPLOYED
                  </span>
                ) : activeSession.flagStatus === 'YELLOW' || activeSession.flagStatus === 'DOUBLE YELLOW' ? (
                  <span className="px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 font-hud font-bold uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    YELLOW FLAG • SECTOR HAZARD
                  </span>
                ) : activeSession.flagStatus === 'CHEQUERED' ? (
                  <span className="px-2.5 py-1 rounded bg-slate-500/20 text-slate-200 border border-slate-500/50 font-hud font-bold uppercase flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-slate-300" />
                    CHEQUERED FLAG • SESSION END
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-hud font-bold uppercase flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    TRACK CLEAR • GREEN FLAG
                  </span>
                )}

                {activeSession.flagMessage && (
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] italic">
                    "{activeSession.flagMessage}"
                  </span>
                )}
              </div>

              {/* Feed Reconnecting / Network Warning */}
              {feedStatus === 'RECONNECTING' && (
                <div className="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-hud font-bold uppercase flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  RECONNECTING TO TELEMETRY FEED...
                </div>
              )}
            </div>

            {/* Red Flag or Weather Delay Warning Banner */}
            {activeSession.isDelayed && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between flex-wrap gap-2 text-rose-300">
                <div className="flex items-center gap-2 text-xs font-hud font-bold uppercase">
                  <AlertOctagon className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>SESSION SUSPENDED — RED FLAG CONDITIONS</span>
                </div>
                <span className="text-[11px] font-mono text-rose-200">
                  Track recovery in progress. Timing halted.
                </span>
              </div>
            )}

            {/* ── LIVE RACE IN PROGRESS HERO TRACKER ──────────────────────── */}
            {(activeSession.status === 'LIVE' || isSimulatedLive) && (
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-red-950/40 via-[var(--bg-tertiary)] to-[var(--bg-primary)] border border-red-500/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-hud font-black uppercase text-red-400 tracking-wider">
                      GRAND PRIX LIVE • {isSimulatedLive ? 'REALTIME TELEMETRY STREAM' : 'RACE IN PROGRESS'}
                    </span>
                  </div>
                  <div className="text-xs font-mono font-black text-amber-400">
                    LAP {activeSession.currentLap || 38} OF {activeSession.totalLaps || 56}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="w-full h-2.5 rounded-full bg-[var(--bg-primary)] overflow-hidden border border-[var(--border-subtle)]">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent-f1-red)] to-amber-400 transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.round(((activeSession.currentLap || 38) / (activeSession.totalLaps || 56)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                    <span>Lap 1</span>
                    <span>
                      {Math.min(100, Math.round(((activeSession.currentLap || 38) / (activeSession.totalLaps || 56)) * 100))}% Race Distance Completed
                    </span>
                    <span>Lap {activeSession.totalLaps || 56} (Chequered Flag)</span>
                  </div>
                </div>

                {/* Live Race Quick Callouts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs font-mono-num">
                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">Race Leader</span>
                      <span className="font-hud font-black text-[var(--text-primary)]">
                        {activeSession.leaderboard?.[0]?.code || 'VER'} ({activeSession.leaderboard?.[0]?.team || 'Red Bull'})
                      </span>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm">P1</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">Lead Battle Margin</span>
                      <span className="font-hud font-black text-amber-400">
                        {typeof activeSession.leaderboard?.[1]?.gapToLeader === 'number'
                          ? `+${activeSession.leaderboard[1].gapToLeader.toFixed(3)}s`
                          : activeSession.leaderboard?.[1]?.gapToLeader || '+1.140s'}
                      </span>
                    </div>
                    <span className="text-[9px] font-hud uppercase text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      DRS ACTIVE
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">Fastest Lap of Race</span>
                      <span className="font-hud font-black text-purple-400">
                        {activeSession.leaderboard?.[0]?.bestLapFormatted || '1:30.412'}
                      </span>
                    </div>
                    <span className="text-[9px] font-hud font-black text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                      +1 PT
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── UPCOMING SESSION COUNTDOWN DISPLAY ──────────────────────── */}
            {activeSession.status === 'UPCOMING' && !isSimulatedLive && (
              <div className="p-6 rounded-xl bg-gradient-to-b from-[var(--bg-tertiary)] to-[var(--bg-primary)] border border-[var(--border-subtle)] text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-hud font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>COUNTDOWN TO SESSION GREEN FLAG</span>
                </div>

                <div className="flex items-center justify-center gap-3 sm:gap-6 font-mono-num font-black text-3xl sm:text-5xl text-[var(--text-primary)]">
                  <div className="flex flex-col items-center">
                    <span>{String(timeRemaining.days).padStart(2, '0')}</span>
                    <span className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
                      Days
                    </span>
                  </div>
                  <span className="text-2xl text-[var(--text-muted)] pb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeRemaining.hours).padStart(2, '0')}</span>
                    <span className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
                      Hours
                    </span>
                  </div>
                  <span className="text-2xl text-[var(--text-muted)] pb-4">:</span>
                  <div className="flex flex-col items-center">
                    <span>{String(timeRemaining.minutes).padStart(2, '0')}</span>
                    <span className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
                      Mins
                    </span>
                  </div>
                  <span className="text-2xl text-[var(--text-muted)] pb-4">:</span>
                  <div className="flex flex-col items-center text-[var(--accent-f1-red)]">
                    <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
                    <span className="text-[10px] font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mt-1">
                      Secs
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto pt-1">
                  Scheduled Start: {formatDateTime(activeSession.date_start).dateStr} at{' '}
                  {formatDateTime(activeSession.date_start).timeStr}. Live timing sensors ignite automatically.
                </p>

                {/* Live Race Simulation Trigger */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsSimulatedLive(true);
                      fetchSessionData(selectedSessionKey, false, true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-f1-red)] to-rose-600 text-white font-hud font-black text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>⚡ Launch Real-Time Race Telemetry Stream</span>
                  </button>
                </div>
              </div>
            )}

            {/* Simulated Live Mode Banner */}
            {isSimulatedLive && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-between flex-wrap gap-2 text-xs text-rose-300">
                <span className="font-hud font-bold uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  REAL-TIME RACE TELEMETRY STREAM RUNNING ({meetingMeta?.circuit_name || 'Sepang International Circuit'})
                </span>
                <button
                  onClick={() => {
                    setIsSimulatedLive(false);
                    fetchSessionData(selectedSessionKey, false, false);
                  }}
                  className="px-3 py-1 rounded bg-rose-600 text-white font-hud font-bold uppercase text-[10px] hover:bg-rose-700 cursor-pointer"
                >
                  Return To Official Weekend Schedule
                </button>
              </div>
            )}
          </div>

          {/* ── 3. QUALIFYING KNOCKOUT SEGMENT TOGGLE & SPOTLIGHT ───────────── */}
          {isQualifying && activeSession.status !== 'UPCOMING' && (
            <div className="space-y-3">
              {/* Pole Position Spotlight Card */}
              {activeSession.leaderboard?.[0] && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-[var(--bg-secondary)] to-[var(--bg-secondary)] border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-amber-400">
                        POLE POSITION • QUALIFYING WINNER
                      </div>
                      <div className="text-base sm:text-lg font-hud font-black uppercase text-[var(--text-primary)]">
                        {activeSession.leaderboard[0].fullName} ({activeSession.leaderboard[0].team})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase">POLE LAP TIME</div>
                    <div className="text-lg font-mono-num font-black text-amber-300">
                      {activeSession.leaderboard[0].bestLapFormatted}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 font-hud font-bold uppercase text-[var(--text-primary)]">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>QUALIFYING KNOCKOUT SEGMENTS:</span>
                </div>

                <div className="flex items-center gap-2 font-hud font-bold uppercase">
                  <button
                    onClick={() => setQualiSegment('Q1')}
                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      qualiSegment === 'Q1'
                        ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Q1 (Bottom 5 Out)
                  </button>
                  <button
                    onClick={() => setQualiSegment('Q2')}
                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      qualiSegment === 'Q2'
                        ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Q2 (Bottom 5 Out)
                  </button>
                  <button
                    onClick={() => setQualiSegment('Q3')}
                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${
                      qualiSegment === 'Q3'
                        ? 'bg-emerald-500 text-black border-emerald-500 shadow-sm'
                        : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    }`}
                  >
                    Q3 (Top 10 Shootout)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 4. LIVE TIMING LEADERBOARD TABLE ───────────────────────────── */}
          {activeSession.leaderboard && activeSession.leaderboard.length > 0 ? (
            <div className="rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden shadow-xl">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-black uppercase tracking-wider text-[var(--text-muted)]">
                <div className="col-span-1 text-center">POS</div>
                <div className="col-span-4 sm:col-span-3">DRIVER / TEAM</div>
                <div className="col-span-3 sm:col-span-2 text-right">
                  {isPractice ? 'DELTA TO P1' : 'GAP / STATUS'}
                </div>
                <div className="hidden sm:block sm:col-span-2 text-right">BEST LAP</div>
                <div className="hidden md:block md:col-span-2 text-right">
                  {isPastRaceSelected || activeSession.status === 'COMPLETED' ? 'POINTS / SPEED' : 'LAST LAP'}
                </div>
                <div className="col-span-4 sm:col-span-2 text-center">TYRE / TELEMETRY</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {activeSession.leaderboard.map((d, index) => {
                  const isExpanded = expandedDriverNumber === d.driverNumber;
                  const cStyle = getCompoundStyle(d.compound);
                  const flashType = rowHighlights[d.driverNumber];

                  // Flash style cues
                  let flashClass = '';
                  if (flashType === 'gain') {
                    flashClass = 'bg-emerald-500/15 border-l-4 border-l-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]';
                  } else if (flashType === 'loss') {
                    flashClass = 'bg-rose-500/15 border-l-4 border-l-rose-500';
                  } else if (flashType === 'fastest') {
                    flashClass = 'bg-purple-500/25 border-l-4 border-l-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.35)]';
                  } else if (flashType === 'pit') {
                    flashClass = 'bg-amber-500/20 border-l-4 border-l-amber-500';
                  }

                  // Knockout divider for Qualifying
                  const showKnockoutLine =
                    isQualifying &&
                    ((qualiSegment === 'Q1' && d.position === 15) ||
                      (qualiSegment === 'Q2' && d.position === 10));

                  const gridDelta = typeof d.gridPos === 'number' && d.gridPos > 0 ? d.gridPos - d.position : null;

                  return (
                    <React.Fragment key={d.driverNumber}>
                      <div
                        onClick={() => {
                          setExpandedDriverNumber(isExpanded ? null : d.driverNumber);
                          if (audioOn) playTelemetryTick();
                        }}
                        className={`grid grid-cols-12 gap-2 px-4 py-3 items-center text-xs font-mono-num transition-all duration-300 cursor-pointer hover:bg-[var(--bg-tertiary)]/70 ${flashClass} ${
                          isExpanded ? 'bg-[var(--bg-tertiary)]' : ''
                        }`}
                      >
                        {/* Position & Grid Delta */}
                        <div className="col-span-1 text-center font-bold flex flex-col items-center justify-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                              d.position === 1
                                ? 'bg-amber-400 text-black font-black'
                                : d.position === 2
                                ? 'bg-slate-300 text-black font-bold'
                                : d.position === 3
                                ? 'bg-amber-700/60 text-white font-bold'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            P{d.position}
                          </span>
                          {gridDelta !== null && (
                            <span
                              className={`text-[9px] font-hud font-bold mt-0.5 ${
                                gridDelta > 0
                                  ? 'text-emerald-400'
                                  : gridDelta < 0
                                  ? 'text-rose-400'
                                  : 'text-[var(--text-muted)]'
                              }`}
                              title={`Started on grid P${d.gridPos}`}
                            >
                              {gridDelta > 0 ? `▲+${gridDelta}` : gridDelta < 0 ? `▼${gridDelta}` : `P${d.gridPos}`}
                            </span>
                          )}
                        </div>

                        {/* Driver / Team */}
                        <div className="col-span-4 sm:col-span-3 flex items-center gap-2 overflow-hidden">
                          <span
                            className="w-1.5 h-6 rounded-full shrink-0"
                            style={{ backgroundColor: d.teamColor }}
                          />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span
                                onClick={(e) => {
                                  if (onSelectDriver) {
                                    e.stopPropagation();
                                    const match = driverStandings.find(
                                      (s) =>
                                        s.Driver.code === d.code ||
                                        s.Driver.permanentNumber === String(d.driverNumber) ||
                                        s.Driver.familyName.toLowerCase() === d.lastName.toLowerCase()
                                    );
                                    if (match) onSelectDriver(match.Driver.driverId);
                                  }
                                }}
                                className={`font-hud font-black uppercase text-[var(--text-primary)] ${
                                  onSelectDriver ? 'hover:underline hover:text-[var(--accent-f1-red)] cursor-pointer' : ''
                                }`}
                                title={onSelectDriver ? `View ${d.fullName} profile` : undefined}
                              >
                                {d.code}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                #{d.driverNumber}
                              </span>
                              {d.inPit && (
                                <span className="px-1 rounded text-[8px] font-hud font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                  PIT
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-sans truncate">
                              {d.team}
                            </div>
                          </div>
                        </div>

                        {/* Gap / Status */}
                        <div className="col-span-3 sm:col-span-2 text-right font-bold">
                          {d.status && d.status !== 'Finished' && !d.status.startsWith('+') ? (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-hud font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 inline-block">
                              {d.status}
                            </span>
                          ) : (
                            <div className="text-[var(--text-primary)]">
                              {d.gapToLeader === null
                                ? '--'
                                : d.gapToLeader === 0 || d.gapToLeader === 'LEADER' || d.gapToLeader === 'WINNER'
                                ? (
                                  <span className="text-amber-400 font-hud font-black">
                                    {d.position === 1 ? 'WINNER' : 'LEADER'}
                                  </span>
                                )
                                : typeof d.gapToLeader === 'number'
                                ? `+${d.gapToLeader.toFixed(3)}s`
                                : !isNaN(parseFloat(String(d.gapToLeader)))
                                ? `+${parseFloat(String(d.gapToLeader)).toFixed(3)}s`
                                : d.gapToLeader}
                            </div>
                          )}
                          {!isPractice && d.interval !== null && (!d.status || d.status === 'Finished') && (
                            <div className="text-[10px] text-[var(--text-muted)] font-normal">
                              {typeof d.interval === 'number'
                                ? `+${d.interval.toFixed(3)}s`
                                : !isNaN(parseFloat(String(d.interval)))
                                ? `+${parseFloat(String(d.interval)).toFixed(3)}s`
                                : d.interval}
                            </div>
                          )}
                        </div>

                        {/* Best Lap */}
                        <div className="hidden sm:block sm:col-span-2 text-right">
                          <span
                            className={`font-bold ${
                              d.isOverallFastestLap
                                ? 'text-purple-400 font-black'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {d.bestLapFormatted}
                          </span>
                          {d.isOverallFastestLap && (
                            <span className="block text-[8px] font-hud font-black text-purple-400 uppercase tracking-wider">
                              FASTEST LAP (+1 PT)
                            </span>
                          )}
                        </div>

                        {/* Last Lap / Championship Points */}
                        <div className="hidden md:block md:col-span-2 text-right">
                          {typeof d.points === 'number' && d.points > 0 ? (
                            <div className="flex flex-col items-end">
                              <span className="px-2 py-0.5 rounded text-[10px] font-hud font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono-num">
                                +{d.points} PTS
                              </span>
                              {d.speedTrap && (
                                <span className="text-[9px] text-[var(--text-muted)] font-mono mt-0.5">
                                  {d.speedTrap} km/h
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-[var(--text-secondary)]">
                              {d.lastLapFormatted}
                              {d.speedTrap && (
                                <div className="text-[10px] text-[var(--text-muted)]">
                                  {d.speedTrap} km/h
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tyre / Stint & Action Chevron */}
                        <div className="col-span-4 sm:col-span-2 flex items-center justify-end sm:justify-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-mono-num font-black flex items-center gap-1 ${cStyle.bg} ${cStyle.text} ${cStyle.border}`}
                          >
                            <span>{cStyle.label}</span>
                            <span className="text-[8px] opacity-75">L{d.stintLapCount}</span>
                          </span>

                          <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">
                            P{d.pitCount}
                          </span>

                          <span className="text-[var(--text-muted)] p-1">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* ── EXPANDED DRIVER HIGH-RATE TELEMETRY DRAWER ─────── */}
                      {isExpanded && (
                        <div className="p-4 sm:p-5 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)] space-y-4 animate-fade-in">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-subtle)]">
                            <div className="flex items-center gap-2">
                              <Gauge className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-hud font-black uppercase text-[var(--text-primary)]">
                                #{d.driverNumber} {d.fullName} • TELEMETRY STREAM
                              </span>
                            </div>

                            {/* Compare with Winner (P1) Toggle */}
                            {activeSession.leaderboard[0] && activeSession.leaderboard[0].driverNumber !== d.driverNumber && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCompareWithWinner(!compareWithWinner);
                                  if (audioOn) playTelemetryTick();
                                }}
                                className={`px-3 py-1 rounded-xl border text-[11px] font-hud font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                                  compareWithWinner
                                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                              >
                                <Zap className={`w-3.5 h-3.5 ${compareWithWinner ? 'text-amber-400 animate-pulse' : ''}`} />
                                <span>Compare with Winner (P1 - {activeSession.leaderboard[0].code})</span>
                              </button>
                            )}
                          </div>

                          {expandedTelemetry.length > 0 ? (
                            <div className="space-y-4">
                              {/* Car Metrics Grid */}
                              {(() => {
                                const latestCar = expandedTelemetry[expandedTelemetry.length - 1];
                                const throttle = Math.min(100, Math.max(0, latestCar?.throttle ?? 0));
                                const brake = Math.min(100, Math.max(0, latestCar?.brake ?? 0));

                                return (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">
                                        Speed
                                      </span>
                                      <span className="font-hud font-black text-2xl text-[var(--text-primary)] font-mono-num">
                                        {latestCar?.speed ?? '--'}
                                      </span>
                                      <span className="text-[9px] text-[var(--text-muted)] block">KM / H</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">
                                        Gear
                                      </span>
                                      <span className="font-hud font-black text-2xl text-emerald-400 font-mono-num">
                                        {latestCar?.n_gear ?? '--'}
                                      </span>
                                      <span className="text-[9px] text-[var(--text-muted)] block">SELECTION</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">
                                        Engine RPM
                                      </span>
                                      <span className="font-hud font-black text-2xl text-amber-400 font-mono-num">
                                        {latestCar?.rpm ? `${(latestCar.rpm / 1000).toFixed(1)}k` : '--'}
                                      </span>
                                      <span className="text-[9px] text-[var(--text-muted)] block">REVS / MIN</span>
                                    </div>

                                    <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                                      <span className="text-[9px] font-hud uppercase text-[var(--text-muted)] block">
                                        DRS Status
                                      </span>
                                      <span
                                        className={`font-hud font-black text-2xl font-mono-num ${
                                          latestCar?.drs === 1 ? 'text-emerald-400' : 'text-slate-400'
                                        }`}
                                      >
                                        {latestCar?.drs === 1 ? 'ACTIVE' : 'OFF'}
                                      </span>
                                      <span className="text-[9px] text-[var(--text-muted)] block">DRS FLAP</span>
                                    </div>

                                    {/* Throttle & Brake Bars */}
                                    <div className="col-span-2 sm:col-span-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                      <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                                        <div className="flex justify-between text-[11px] font-hud font-bold uppercase">
                                          <span className="text-emerald-400">Throttle Input</span>
                                          <span className="font-mono">{throttle}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                          <div
                                            className="h-full bg-emerald-400 rounded-full transition-all duration-200"
                                            style={{ width: `${throttle}%` }}
                                          />
                                        </div>
                                      </div>

                                      <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                                        <div className="flex justify-between text-[11px] font-hud font-bold uppercase">
                                          <span className="text-rose-400">Brake Pressure</span>
                                          <span className="font-mono">{brake}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                          <div
                                            className="h-full bg-rose-400 rounded-full transition-all duration-200"
                                            style={{ width: `${brake}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Speed Trajectory Sparkline & Winner Comparison */}
                              {(() => {
                                const p1 = activeSession.leaderboard[0];
                                const hasWinnerComp = compareWithWinner && winnerTelemetry.length > 0 && p1 && p1.driverNumber !== d.driverNumber;

                                const driverSpeeds = expandedTelemetry.map((t) => t.speed || 0);
                                const driverMax = driverSpeeds.length > 0 ? Math.max(...driverSpeeds) : 0;
                                const driverMin = driverSpeeds.length > 0 ? Math.min(...driverSpeeds) : 0;

                                const winnerSpeeds = winnerTelemetry.map((t) => t.speed || 0);
                                const winnerMax = winnerSpeeds.length > 0 ? Math.max(...winnerSpeeds) : 0;
                                const winnerMin = winnerSpeeds.length > 0 ? Math.min(...winnerSpeeds) : 0;

                                const peakDelta = driverMax - winnerMax;
                                const apexDelta = driverMin - winnerMin;

                                return (
                                  <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="text-[10px] font-hud uppercase text-[var(--text-muted)] font-bold">
                                        Speed Trajectory (Last 30 Pulses)
                                      </span>

                                      {hasWinnerComp && (
                                        <div className="flex items-center gap-3 text-[10px] font-hud font-bold">
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                                            <span className="text-[var(--text-primary)]">{d.code} (Solid)</span>
                                          </div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-3 h-0.5 border-b-2 border-dashed border-amber-400" />
                                            <span className="text-amber-400">P1 {p1.code} (Dashed)</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Speed Trace SVG */}
                                    <div className="w-full h-20 pt-1">
                                      <svg viewBox="0 0 500 70" className="w-full h-full overflow-visible">
                                        {/* Winner Overlay (Dashed Gold) */}
                                        {hasWinnerComp && (
                                          <polyline
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="2"
                                            strokeDasharray="5,4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={winnerTelemetry
                                              .map((item, idx) => {
                                                const x = (idx / Math.max(1, winnerTelemetry.length - 1)) * 500;
                                                const y = 70 - ((item.speed || 0) / 360) * 70;
                                                return `${x.toFixed(1)},${y.toFixed(1)}`;
                                              })
                                              .join(' ')}
                                          />
                                        )}

                                        {/* Driver Speed Trace (Solid) */}
                                        <polyline
                                          fill="none"
                                          stroke={d.teamColor}
                                          strokeWidth="2.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          points={expandedTelemetry
                                            .map((item, idx) => {
                                              const x = (idx / Math.max(1, expandedTelemetry.length - 1)) * 500;
                                              const y = 70 - ((item.speed || 0) / 360) * 70;
                                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                                            })
                                            .join(' ')}
                                        />
                                      </svg>
                                    </div>

                                    {/* Winner Delta Stats */}
                                    {hasWinnerComp && (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-mono-num">
                                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-between">
                                          <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase">Peak Speed Delta</span>
                                          <span className={`font-bold ${peakDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {peakDelta >= 0 ? `+${peakDelta}` : peakDelta} km/h
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-between">
                                          <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase">Apex Speed Delta</span>
                                          <span className={`font-bold ${apexDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {apexDelta >= 0 ? `+${apexDelta}` : apexDelta} km/h
                                          </span>
                                        </div>

                                        <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-between col-span-2 sm:col-span-1">
                                          <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase">Lap Gap</span>
                                          <span className="font-bold text-amber-300">
                                            {d.gapToLeader || 'N/A'}
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-xs font-mono text-[var(--text-muted)]">
                              Connecting to #{d.driverNumber} car sensors...
                            </div>
                          )}
                        </div>
                      )}

                      {/* Qualifying Elimination Cutoff Line */}
                      {showKnockoutLine && (
                        <div className="px-4 py-2 bg-rose-500/20 border-y border-rose-500/50 flex items-center justify-between text-[10px] font-hud font-black uppercase text-rose-300">
                          <div className="flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>
                              {qualiSegment} KNOCKOUT DROP ZONE (DRIVERS BELOW ARE ELIMINATED)
                            </span>
                          </div>
                          <span className="font-mono">P{d.position} CUTOFF THRESHOLD</span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            activeSession.status !== 'UPCOMING' && (
              <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[var(--text-muted)] mx-auto" />
                <h4 className="text-sm font-hud font-bold text-[var(--text-primary)] uppercase">
                  Synchronizing Official Session Timing
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Retrieving session classifications, sector deltas, and speed telemetry...
                </p>
              </div>
            )
          )}

          {/* ── 5. PRACTICE SESSION STINT & RUN-PLAN INTELLIGENCE ───────────── */}
          {isPractice && activeSession.stintAnalysis && activeSession.stintAnalysis.length > 0 && (
            <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs sm:text-sm font-hud font-black uppercase tracking-wider text-[var(--text-primary)]">
                    Free Practice Stint Patterns & High-Fuel Runs
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Long Run (≥8 Laps) vs Short Run Qualifying Prep
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeSession.stintAnalysis.slice(0, 6).map((item) => (
                  <div
                    key={item.driverNumber}
                    className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-hud font-bold uppercase text-[var(--text-primary)]">
                      <span>#{item.driverNumber} {item.code}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {item.stints.length} Stints
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.stints.map((st, sIdx) => {
                        const style = getCompoundStyle(st.compound);
                        return (
                          <div
                            key={sIdx}
                            className={`px-2 py-1 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${style.bg} ${style.text} ${style.border}`}
                          >
                            <span>{style.label}</span>
                            <span className="text-[8px] opacity-80">{st.laps} Laps</span>
                            <span
                              className={`text-[8px] uppercase font-hud px-1 rounded ${
                                st.type === 'Long Run'
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : 'bg-cyan-400/20 text-cyan-300'
                              }`}
                            >
                              {st.type === 'Long Run' ? 'RACE' : 'QUALI'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
