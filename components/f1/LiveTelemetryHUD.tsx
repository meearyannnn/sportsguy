'use client';

import React, { useState, useEffect } from 'react';
import { OpenF1Session, OpenF1Interval, OpenF1Weather, OpenF1CarData, OpenF1Driver, Race } from '@/lib/f1/types';
import { getCarTelemetry, getSessionWeather, getSessionIntervals } from '@/lib/f1/openf1';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  Gauge,
  Activity,
  Zap,
  Radio,
  Thermometer,
  Wind,
  Droplets,
  RotateCw,
  Fuel,
} from 'lucide-react';
import PaceTrace from '@/components/f1/PaceTrace';
import { isAudioEnabled, setAudioEnabled, playTelemetryTick } from '@/lib/f1/audio';
import LightsOutSequence from '@/components/f1/LightsOutSequence';
import LiveUpdatesFeed from '@/components/f1/LiveUpdatesFeed';
import FreshnessBadge from '@/components/f1/FreshnessBadge';
import ContextualExplainer from '@/components/f1/ContextualExplainer';
import { useAdaptiveTelemetry } from '@/lib/f1/useAdaptiveTelemetry';
import TrackMapVisualizer from '@/components/f1/TrackMapVisualizer';
import { DriverStanding } from '@/lib/f1/types';
import { Wifi, WifiOff } from 'lucide-react';

interface LiveTelemetryHUDProps {
  session: OpenF1Session | null;
  initialWeather: OpenF1Weather | null;
  initialIntervals: OpenF1Interval[];
  driverStandings?: DriverStanding[];
  onSelectDriver?: (driverId: string) => void;
  showFeed?: boolean;
  onToggleGlance?: () => void;
  nextRace?: Race | null;
  useLocalTime?: boolean;
}

export default function LiveTelemetryHUD({
  session,
  initialWeather,
  initialIntervals,
  driverStandings = [],
  onSelectDriver,
  showFeed = true,
  onToggleGlance,
  nextRace,
  useLocalTime = true,
}: LiveTelemetryHUDProps) {
  const [weather, setWeather] = useState<OpenF1Weather | null>(initialWeather);
  const [intervals, setIntervals] = useState<OpenF1Interval[]>(initialIntervals);
  const [selectedDriverNumber, setSelectedDriverNumber] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<OpenF1CarData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audioOn, setAudioOn] = useState<boolean>(false);
  const [isLightsOutOpen, setIsLightsOutOpen] = useState<boolean>(false);
  const { pollIntervalMs, isLowDataMode, setLowDataMode, networkType } = useAdaptiveTelemetry(2500);

  useEffect(() => {
    setAudioOn(isAudioEnabled());
  }, []);

  const now = Date.now();
  const isSessionActive = Boolean(
    session &&
    session.date_start &&
    session.date_end &&
    new Date(session.date_start).getTime() <= now &&
    now <= new Date(session.date_end).getTime() + 2 * 3600 * 1000
  );

  const sessionKey = session?.session_key;

  // Fetch telemetry whenever driver changes or on interval
  const loadTelemetry = async (driverNum: number) => {
    if (!sessionKey || !isSessionActive) return;
    setIsRefreshing(true);
    try {
      const data = await getCarTelemetry(sessionKey, driverNum);
      console.log('[OpenF1 Live Telemetry Poll]', new Date().toISOString(), { sessionKey, driverNum, dataCount: data?.length || 0, raw: data });
      if (data && data.length > 0) {
        setTelemetry(data);
      } else {
        setTelemetry([]);
      }
    } catch (e) {
      console.error('[OpenF1 Poll Error]', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isSessionActive && sessionKey) {
      loadTelemetry(selectedDriverNumber);
    }
  }, [selectedDriverNumber, sessionKey, isSessionActive]);

  // Adaptive polling (pauses on screen lock/background tab, throttles on cellular)
  useEffect(() => {
    if (!isSessionActive || pollIntervalMs <= 0 || !sessionKey) return;
    const interval = setInterval(() => {
      loadTelemetry(selectedDriverNumber);
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [selectedDriverNumber, sessionKey, pollIntervalMs, isSessionActive]);

  const currentCar = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const currentThrottle = Math.min(100, Math.max(0, Math.round(currentCar?.throttle ?? 0)));
  const currentBrake = Math.min(100, Math.max(0, Math.round(currentCar?.brake ?? 0)));

  // If no live session is currently active, render dynamic, aesthetic standby state
  if (!isSessionActive) {
    // Helper to format session date & time accurately based on user's timezone preference
    const formatSessionSchedule = (session?: { date: string; time?: string }) => {
      if (!session || !session.date) return { day: 'TBA', dateFormatted: 'DATE TBA', timeFormatted: 'TBA' };
      const iso = session.time ? `${session.date}T${session.time}` : `${session.date}T12:00:00Z`;
      const d = new Date(iso);
      if (isNaN(d.getTime())) {
        return { day: 'TBA', dateFormatted: session.date, timeFormatted: session.time || 'TBA' };
      }
      const day = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: useLocalTime ? undefined : 'UTC' }).toUpperCase();
      const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: useLocalTime ? undefined : 'UTC' }).toUpperCase();
      const dateNum = d.toLocaleDateString('en-US', { day: 'numeric', timeZone: useLocalTime ? undefined : 'UTC' });
      const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: useLocalTime ? undefined : 'UTC' });
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: useLocalTime ? undefined : 'UTC' });

      return {
        day,
        dateFormatted: `${day}, ${month} ${dateNum}, ${year}`,
        timeFormatted: useLocalTime ? `${time} LOCAL` : `${time} GMT`,
      };
    };

    const nextRaceName = nextRace?.raceName || 'Azerbaijan Grand Prix';
    const rawCircuit = nextRace?.Circuit?.circuitName || 'Baku City Circuit';
    const circuitName = rawCircuit.toLowerCase().includes('madring') ? 'Madrid Street Circuit' : rawCircuit;
    const locality = nextRace?.Circuit?.Location?.locality || 'Baku';
    const country = nextRace?.Circuit?.Location?.country || 'Azerbaijan';

    // Format individual weekend sessions
    const fp1 = formatSessionSchedule(nextRace?.FirstPractice);
    const sprint = formatSessionSchedule(nextRace?.Sprint);
    const qualifying = formatSessionSchedule(nextRace?.Qualifying);
    const race = formatSessionSchedule({ date: nextRace?.date || '', time: nextRace?.time });

    const sessionList = [
      {
        title: 'PRACTICE 1 (FP1)',
        data: fp1,
        isPrimary: false,
      },
      ...(nextRace?.Sprint
        ? [
            {
              title: 'SPRINT RACE',
              data: sprint,
              isPrimary: false,
            },
            {
              title: 'QUALIFYING',
              data: qualifying,
              isPrimary: false,
            },
          ]
        : [
            {
              title: 'QUALIFYING',
              data: qualifying,
              isPrimary: false,
            },
          ]),
      {
        title: 'GRAND PRIX RACE',
        data: race,
        isPrimary: true,
      },
    ];

    return (
      <div className="space-y-4">
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)]/40 border border-[var(--border-subtle)] overflow-hidden transition-all shadow-sm">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[var(--accent-f1-red)]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Status & Timezone indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--border-subtle)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-hud font-bold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TELEMETRY STANDBY • TRACK SILENT</span>
            </div>

            <span className="text-[11px] font-mono-num text-[var(--text-muted)] uppercase tracking-wider">
              SYNC: {useLocalTime ? 'YOUR LOCAL TIME' : 'CIRCUIT GMT'}
            </span>
          </div>

          {/* Main Title & Circuit info */}
          <div className="py-6 text-center max-w-xl mx-auto space-y-2.5">
            <div className="text-xs font-hud font-bold tracking-wider text-[var(--accent-f1-red)] uppercase">
              ROUND {nextRace?.round || '15'} • {locality}, {country}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-hud tracking-tight text-[var(--text-primary)] uppercase leading-tight">
              NEXT SESSION: {nextRaceName}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              OpenF1 live telemetry stream, high-rate engine gauges, driver intervals, and speed traces automatically ignite when the next FIA track session goes green at {circuitName}.
            </p>
          </div>

          {/* Dynamic Schedule Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {sessionList.map((s, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all text-left ${
                  s.isPrimary
                    ? 'border-[var(--accent-f1-red)]/40 bg-[var(--accent-f1-red)]/5 hover:border-[var(--accent-f1-red)]/70'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 hover:border-[var(--border-hover)]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span
                    className={`text-[10px] uppercase font-hud font-bold tracking-wider ${
                      s.isPrimary ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {s.title}
                  </span>
                  {s.isPrimary && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] animate-ping" />
                  )}
                </div>
                <div className="text-sm font-black font-hud text-[var(--text-primary)] tracking-tight">
                  {s.data.dateFormatted}
                </div>
                <div
                  className={`text-xs font-mono-num font-bold mt-1 ${
                    s.isPrimary ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {s.data.timeFormatted}
                </div>
              </div>
            ))}
          </div>

          {/* System Hardware Readiness Footer */}
          <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono-num text-[var(--text-muted)]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>OPENF1 API: ARMED</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SPEED TRAPS: CALIBRATED</span>
              </span>
            </div>
            {onToggleGlance && (
              <button
                onClick={onToggleGlance}
                className="text-[11px] font-hud font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                <span>TEST GLANCE HUD</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const activeTeam = getTeamMeta('ferrari');

  // SVG Sparkline path calculation
  const maxSpeed = 350;
  const svgWidth = 500;
  const svgHeight = 120;

  const sparklinePoints = telemetry
    .map((item, idx) => {
      const x = (idx / Math.max(1, telemetry.length - 1)) * svgWidth;
      const y = svgHeight - (item.speed / maxSpeed) * svgHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Top HUD Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE TIMING & TELEMETRY STREAM</span>
            <span className="text-[var(--text-muted)]">•</span>
            <FreshnessBadge cadence="live" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            {session ? `${session.country_name} GP • ${session.session_name}` : 'Live Session Timing & HUD'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time intervals & in-car telemetry traces
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] p-2 rounded border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-1 text-[var(--text-primary)] font-mono-num font-bold">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Track: {weather?.track_temperature ? `${weather.track_temperature.toFixed(1)}°C` : '--'}</span>
            </div>
            <span className="text-[var(--border-subtle)]">|</span>
            <div className="flex items-center gap-1 text-[var(--text-primary)] font-mono-num font-bold">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>Air: {weather?.air_temperature ? `${weather.air_temperature.toFixed(1)}°C` : '--'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              const next = !audioOn;
              setAudioOn(next);
              setAudioEnabled(next);
              if (next) playTelemetryTick();
            }}
            className={`px-2.5 py-1.5 rounded border text-[10px] font-mono-num font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              audioOn
                ? 'bg-[var(--bg-tertiary)] border-[var(--accent-f1-red)]/60 text-[var(--text-primary)]'
                : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Radio className={`w-3 h-3 ${audioOn ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'}`} />
            <span>RADIO: {audioOn ? 'LIVE TICK' : 'MUTE'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
            <span>LIVE TIMING LEADERBOARD</span>
            <span>INTERVAL</span>
          </div>

          <div className="space-y-1.5">
            {intervals.length > 0 ? (
              intervals.map((inv, idx) => (
                <div
                  key={inv.driver_number}
                  onClick={() => {
                    setSelectedDriverNumber(inv.driver_number);
                    playTelemetryTick();
                  }}
                  className="flex items-center justify-between p-2.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-mono-num cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-muted)]">P{idx + 1}</span>
                    <span className="font-bold text-[var(--text-primary)]">#{inv.driver_number}</span>
                  </div>
                  <div className="font-bold">
                    {inv.gap_to_leader === 0 || inv.gap_to_leader === null ? 'LEADER' : `+${inv.gap_to_leader.toFixed(3)}s`}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs font-mono-num text-[var(--text-muted)]">
                Waiting for timing data...
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-4">
          {/* Interactive Live Track Map Visualizer */}
          <TrackMapVisualizer
            circuitId={session?.circuit_short_name?.toLowerCase() || 'monza'}
            circuitName={session?.circuit_short_name || 'Monza'}
            driverStandings={driverStandings}
            session={session}
            intervals={intervals}
            onSelectDriver={onSelectDriver}
          />

          <div className="p-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
            <div className="pb-4 border-b border-[var(--border-subtle)]">
              <div className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                F1 CAR TELEMETRY (DRIVER #{selectedDriverNumber})
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">Speed</div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.speed ?? '--'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num">KM / H</div>
              </div>

              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">Gear</div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.n_gear ?? '--'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num">GEAR</div>
              </div>

              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase">RPM</div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.rpm ? (currentCar.rpm / 1000).toFixed(1) + 'k' : '--'}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num">RPM</div>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              <StatBar label="Throttle Input" value={currentThrottle} color="#10b981" />
              <StatBar label="Brake Pressure" value={currentBrake} color="#ef4444" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  color: string;
}

function StatBar({ label, value, color }: StatBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-hud font-bold uppercase tracking-wider">
        <span className="text-[var(--text-muted)] text-[11px]">{label}</span>
        <span className="font-mono-num text-[var(--text-primary)] text-xs">{value}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden border border-[var(--border-subtle)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, value))}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

