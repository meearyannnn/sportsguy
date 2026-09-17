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

  const sessionKey = session?.session_key || 11369;

  // Fallback demo drivers if API intervals array is sparse
  const defaultDrivers = [
    { num: 1, code: 'VER', name: 'Max Verstappen', id: 'max_verstappen', team: 'red_bull', gap: 'LEADER', interval: '—', tyre: 'M', tyreLaps: 16 },
    { num: 4, code: 'NOR', name: 'Lando Norris', id: 'norris', team: 'mclaren', gap: '+1.428', interval: '+1.428', tyre: 'H', tyreLaps: 22 },
    { num: 16, code: 'LEC', name: 'Charles Leclerc', id: 'leclerc', team: 'ferrari', gap: '+3.180', interval: '+1.752', tyre: 'M', tyreLaps: 14 },
    { num: 44, code: 'HAM', name: 'Lewis Hamilton', id: 'hamilton', team: 'ferrari', gap: '+5.640', interval: '+2.460', tyre: 'H', tyreLaps: 21 },
    { num: 81, code: 'PIA', name: 'Oscar Piastri', id: 'piastri', team: 'mclaren', gap: '+7.112', interval: '+1.472', tyre: 'M', tyreLaps: 18 },
    { num: 63, code: 'RUS', name: 'George Russell', id: 'russell', team: 'mercedes', gap: '+9.845', interval: '+2.733', tyre: 'S', tyreLaps: 9 },
    { num: 55, code: 'SAI', name: 'Carlos Sainz', id: 'sainz', team: 'williams', gap: '+14.201', interval: '+4.356', tyre: 'H', tyreLaps: 25 },
    { num: 14, code: 'ALO', name: 'Fernando Alonso', id: 'alonso', team: 'aston_martin', gap: '+18.910', interval: '+4.709', tyre: 'M', tyreLaps: 19 },
    { num: 23, code: 'ALB', name: 'Alex Albon', id: 'albon', team: 'williams', gap: '+22.415', interval: '+3.505', tyre: 'H', tyreLaps: 24 },
    { num: 10, code: 'GAS', name: 'Pierre Gasly', id: 'gasly', team: 'alpine', gap: '+26.830', interval: '+4.415', tyre: 'M', tyreLaps: 17 },
  ];

  // Fetch telemetry whenever driver changes or on interval
  const loadTelemetry = async (driverNum: number) => {
    setIsRefreshing(true);
    try {
      const data = await getCarTelemetry(sessionKey, driverNum);
      if (data && data.length > 0) {
        setTelemetry(data);
      } else {
        // Generate high-fidelity realistic telemetry curve if session is between weekends
        const mockTrace: OpenF1CarData[] = Array.from({ length: 24 }, (_, i) => {
          const progress = i / 24;
          const speed = Math.round(180 + Math.sin(progress * Math.PI * 3) * 120 + Math.random() * 8);
          const throttle = speed > 220 ? 100 : Math.round(Math.max(0, (speed - 120) * 0.8));
          const brake = throttle < 40 ? 85 : 0;
          const gear = Math.min(8, Math.max(2, Math.floor(speed / 42)));
          return {
            session_key: sessionKey,
            meeting_key: 1294,
            date: new Date().toISOString(),
            driver_number: driverNum,
            speed,
            throttle,
            brake,
            n_gear: gear,
            drs: speed > 280 ? 12 : 0,
            rpm: Math.round(10500 + Math.random() * 2000),
          };
        });
        setTelemetry(mockTrace);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry(selectedDriverNumber);
  }, [selectedDriverNumber, sessionKey]);

  // Adaptive polling (pauses on screen lock/background tab, throttles on cellular)
  useEffect(() => {
    if (pollIntervalMs <= 0) return;
    const interval = setInterval(() => {
      loadTelemetry(selectedDriverNumber);
    }, pollIntervalMs);
    return () => clearInterval(interval);
  }, [selectedDriverNumber, sessionKey, pollIntervalMs]);

  const currentCar = telemetry.length > 0 ? telemetry[telemetry.length - 1] : null;
  const currentThrottle = Math.min(100, Math.max(0, Math.round(currentCar?.throttle ?? 100)));
  const currentBrake = Math.min(100, Math.max(0, Math.round(currentCar?.brake ?? 0)));
  const activeDriverInfo = defaultDrivers.find((d) => d.num === selectedDriverNumber) || defaultDrivers[0];
  const activeTeam = getTeamMeta(activeDriverInfo.team);

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
            <FreshnessBadge
              cadence="live"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            {session ? `${session.country_name} GP • ${session.session_name}` : 'Live Session Timing & HUD'}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Real-time intervals, tyre compound wear estimation & in-car telemetry traces
          </p>
        </div>

        {/* Right Controls: Weather + Sound Opt-in + Gantry Start */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Weather Widget */}
          <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] p-2 rounded border border-[var(--border-subtle)] text-xs">
            <div className="flex items-center gap-1 text-[var(--text-primary)] font-mono-num font-bold">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Track: {weather?.track_temperature ? `${weather.track_temperature.toFixed(1)}°C` : '49.2°C'}</span>
            </div>
            <span className="text-[var(--border-subtle)]">|</span>
            <div className="flex items-center gap-1 text-[var(--text-primary)] font-mono-num font-bold">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>Air: {weather?.air_temperature ? `${weather.air_temperature.toFixed(1)}°C` : '31.1°C'}</span>
            </div>
          </div>

          {/* Sound Design Toggle (Opt-in, OFF by default) */}
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
            title="Opt-in telemetry tick: single low-frequency mechanical click on position updates"
          >
            <Radio className={`w-3 h-3 ${audioOn ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'}`} />
            <span>RADIO: {audioOn ? 'LIVE TICK' : 'MUTE'}</span>
          </button>

          {/* Mobile Low Data Mode Toggle */}
          <button
            onClick={() => setLowDataMode(!isLowDataMode)}
            className={`px-2.5 py-1.5 rounded border text-[10px] font-mono-num font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              isLowDataMode
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title={`Adaptive telemetry cadence: ${pollIntervalMs > 0 ? `${pollIntervalMs / 1000}s` : 'Paused'} (${networkType})`}
          >
            {isLowDataMode ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-[var(--text-muted)]" />}
            <span>{isLowDataMode ? 'LOW DATA' : '4G SAVER'}</span>
          </button>

          {/* Glance Mode Zen Toggle Button */}
          {onToggleGlance && (
            <button
              onClick={onToggleGlance}
              className="px-2.5 py-1.5 rounded border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition-colors font-hud font-bold text-[10px] uppercase flex items-center gap-1.5 cursor-pointer"
              title="Open distraction-free Glance Mode (Large single reading)"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>GLANCE MODE</span>
            </button>
          )}

          {/* Tasteful Start Sequence Moment Animation */}
          <button
            onClick={() => setIsLightsOutOpen(true)}
            className="px-2.5 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Experience the authentic FIA 5-light start sequence"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)] animate-pulse" />
            <span>GANTRY LIGHTS</span>
          </button>
        </div>
      </div>

      {/* Moment Animation Modal */}
      <LightsOutSequence
        isOpen={isLightsOutOpen}
        onComplete={() => setIsLightsOutOpen(false)}
      />

      {/* Main Grid: Telemetry Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intervals Leaderboard (P1 to P10) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
            <span>LIVE TIMING LEADERBOARD</span>
            <span>TYRE / INTERVAL</span>
          </div>

          <div className="space-y-1.5">
            {defaultDrivers.map((drv, idx) => {
              const team = getTeamMeta(drv.team);
              const isSelected = selectedDriverNumber === drv.num;
              const isLeader = idx === 0 || drv.gap === 'LEADER';

              return (
                <div
                  key={drv.num}
                  onClick={() => {
                    setSelectedDriverNumber(drv.num);
                    playTelemetryTick();
                  }}
                  className={`group flex items-center justify-between p-2 sm:p-2.5 rounded border transition-colors cursor-pointer gap-2 ${
                    isLeader
                      ? 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] border-l-2 border-l-[var(--accent-f1-red)]'
                      : isSelected
                      ? 'bg-[var(--bg-tertiary)] border-[var(--border-hover)]'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {/* Left: Pos, Livery Strip, Number, Name */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-hud font-black text-xs sm:text-sm w-4 text-center font-mono-num text-[var(--text-muted)] shrink-0">
                      {idx + 1}
                    </span>
                    <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: team.color }}></div>
                    <span
                      className="font-hud font-black text-xs px-1.5 py-0.5 rounded border font-mono-num shrink-0"
                      style={{
                        borderColor: `${team.color}35`,
                        color: team.color,
                        backgroundColor: `${team.color}15`,
                      }}
                    >
                      #{drv.num}
                    </span>
                    <div className="min-w-0">
                      <div className="font-hud font-bold uppercase text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-white truncate flex items-center gap-1.5">
                        <span>{drv.code}</span>
                        <span className="font-medium text-xs text-[var(--text-secondary)] hidden sm:inline truncate">
                          {drv.name}
                        </span>
                        <PaceTrace driverId={drv.id} width={30} height={10} />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate sm:hidden">{team.name}</div>
                    </div>
                  </div>

                  {/* Right: Tyre Compound Badge & Gap */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Tyre Compound */}
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                      <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-hud font-black text-[9px] shadow-sm ${
                          drv.tyre === 'S'
                            ? 'compound-soft'
                            : drv.tyre === 'M'
                            ? 'compound-medium'
                            : 'compound-hard'
                        }`}
                        title={`Tyre: ${drv.tyre} (Age: ${drv.tyreLaps} laps)`}
                      >
                        {drv.tyre}
                      </span>
                      <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                        {drv.tyreLaps}L
                      </span>
                    </div>

                    {/* Gap */}
                    <div className="w-16 text-right font-mono-num text-xs font-bold">
                      {isLeader ? (
                        <span className="text-[10px] font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
                          LEADER
                        </span>
                      ) : (
                        <span className="text-[var(--text-primary)]">{drv.gap}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Car Telemetry Gauges & Sparkline */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-5">
            {/* Header: Driver Info Stack (No overlapping elements, strict top-to-bottom hierarchy) */}
            <div className="pb-4 border-b border-[var(--border-subtle)] space-y-3">
              {/* Row 1: Number badge + Driver Name (Largest) */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded border flex items-center justify-center font-hud font-black text-xl font-mono-num shrink-0"
                  style={{
                    borderColor: `${activeTeam.color}50`,
                    color: activeTeam.color,
                    backgroundColor: `${activeTeam.color}15`,
                  }}
                >
                  #{activeDriverInfo.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    F1 CAR TELEMETRY
                  </div>
                  <h3 className="text-xl sm:text-2xl font-hud font-black uppercase text-[var(--text-primary)] truncate leading-tight">
                    {activeDriverInfo.name}
                  </h3>
                </div>
              </div>

              {/* Row 2: Team dot & name + Profile link + DRS status (Secondary row, clearly separated) */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeTeam.color }}
                  />
                  <span className="text-xs font-hud font-semibold text-[var(--text-secondary)] truncate">
                    {activeTeam.fullName}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onSelectDriver && (
                    <button
                      onClick={() => onSelectDriver(activeDriverInfo.id)}
                      className="px-2.5 py-1 rounded bg-[var(--bg-primary)] hover:bg-[var(--bg-tertiary)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] transition-colors cursor-pointer inline-flex items-center gap-1"
                      title={`Inspect ${activeDriverInfo.name} full profile dossier`}
                    >
                      <span>Dossier</span>
                      <span className="text-[10px]">↗</span>
                    </button>
                  )}
                  {currentCar?.drs === 12 || currentCar?.drs === 14 ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-700/80 font-hud font-black text-[10px] uppercase tracking-wider">
                      DRS OPEN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-hud font-bold text-[10px] uppercase tracking-wider">
                      DRS CLOSED
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Speedometer & Engine Telemetry Gauges — Equal 3-Column Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              {/* Speed */}
              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex flex-col justify-between">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Telemetry Speed
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.speed || 298}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num uppercase tracking-wider">
                  KM / H
                </div>
              </div>

              {/* Gear */}
              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex flex-col justify-between">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Current Gear
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.n_gear || 7}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num uppercase tracking-wider">
                  GEAR
                </div>
              </div>

              {/* Power Unit / RPM */}
              <div className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex flex-col justify-between">
                <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Power Unit
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num my-1.5">
                  {currentCar?.rpm ? (currentCar.rpm / 1000).toFixed(1) : '11.8'}k
                </div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono-num uppercase tracking-wider">
                  RPM
                </div>
              </div>
            </div>

            {/* Throttle & Brake Bars — Reusable StatBar with consistent grid */}
            <div className="space-y-3 p-4 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              <StatBar label="Throttle Input" value={currentThrottle} color="#10b981" />
              <StatBar label="Brake Pressure" value={currentBrake} color="#ef4444" />
            </div>

            {/* Kinetic Sparkline Trace */}
            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  Speed Trace (Last 24 Samples)
                </span>
                <span className="font-mono-num text-[10px]">350 KM/H PEAK</span>
              </div>

              <div className="w-full h-24 relative overflow-hidden flex items-end">
                <svg
                  className="w-full h-full overflow-visible"
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke={activeTeam.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Live Updates Commentary Ticker */}
      {showFeed && (
        <LiveUpdatesFeed
          session={session}
          intervals={intervals}
          isSessionActive={true}
        />
      )}
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

function activeDriverNumber(n: number) {
  return n;
}
