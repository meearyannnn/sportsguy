'use client';

import React, { useState, useEffect } from 'react';
import { OpenF1Session, OpenF1Interval, OpenF1Weather, OpenF1CarData, OpenF1Driver } from '@/lib/f1/types';
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
import { Wifi, WifiOff } from 'lucide-react';

interface LiveTelemetryHUDProps {
  session: OpenF1Session | null;
  initialWeather: OpenF1Weather | null;
  initialIntervals: OpenF1Interval[];
  onSelectDriver?: (driverId: string) => void;
  showFeed?: boolean;
  onToggleGlance?: () => void;
}

export default function LiveTelemetryHUD({
  session,
  initialWeather,
  initialIntervals,
  onSelectDriver,
  showFeed = true,
  onToggleGlance,
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

  // If no live session is currently active, render explicit inactive state per requirement
  if (!isSessionActive) {
    return (
      <div className="space-y-6">
        <div className="p-8 sm:p-12 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-hud font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>NO LIVE F1 TRACK SESSION ACTIVE RIGHT NOW</span>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black font-hud tracking-tight text-[var(--text-primary)] uppercase">
              NEXT SESSION: AZERBAIJAN GRAND PRIX
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              OpenF1 live telemetry stream, high-rate engine gauges, driver intervals, and speed traces automatically ignite when the next FIA track session goes green.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono-num pt-2">
            <div className="px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-left">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-hud font-bold block">PRACTICE 1 (FP1)</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">FRIDAY, SEP 25, 2026</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-left">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-hud font-bold block">QUALIFYING</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">SATURDAY, SEP 26, 2026</span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-left">
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-hud font-bold block">GRAND PRIX RACE</span>
              <span className="text-sm font-bold text-[var(--accent-f1-red)]">SUNDAY, SEP 27, 2026</span>
            </div>
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

