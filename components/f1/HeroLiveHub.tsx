'use client';

import React, { useState, useEffect } from 'react';
import { Race, OpenF1Session, OpenF1Weather } from '@/lib/f1/types';
import { CIRCUIT_EXTRAS } from '@/lib/f1/teams';
import { getWeatherForCircuit, OpenMeteoWeather } from '@/lib/f1/openmeteo';
import {
  Clock,
  MapPin,
  Flame,
  Wind,
  Droplets,
  Thermometer,
  CloudRain,
  ChevronRight,
  ShieldAlert,
  Gauge,
  Calendar as CalendarIcon,
  Zap,
} from 'lucide-react';
import CircuitWatermark from '@/components/f1/CircuitWatermark';
import { evaluateHonestSessionTime } from '@/lib/f1/timeHonesty';

interface HeroLiveHubProps {
  nextRace: Race | null;
  latestSession: OpenF1Session | null;
  weather: OpenF1Weather | null;
  useLocalTime: boolean;
  onNavigateTab: (tab: 'hub' | 'calendar' | 'standings' | 'results' | 'paddock' | 'live') => void;
  onToggleGlance?: () => void;
}

export default function HeroLiveHub({
  nextRace,
  latestSession,
  weather,
  useLocalTime,
  onNavigateTab,
  onToggleGlance,
}: HeroLiveHubProps) {
  const [ambientWeather, setAmbientWeather] = useState<OpenMeteoWeather | null>(null);

  useEffect(() => {
    const circuitId = nextRace?.Circuit?.circuitId;
    const lat = nextRace?.Circuit?.Location?.lat;
    const lng = nextRace?.Circuit?.Location?.long;

    getWeatherForCircuit(circuitId, lat, lng).then((data) => {
      setAmbientWeather(data);
    });
  }, [nextRace]);
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
    isInProgress: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
    isInProgress: false,
  });

  useEffect(() => {
    if (!nextRace?.date) return;

    const targetDateStr = nextRace.time
      ? `${nextRace.date}T${nextRace.time}`
      : `${nextRace.date}T13:00:00Z`;

    const targetTime = new Date(targetDateStr).getTime();
    const raceEndTime = targetTime + 4 * 60 * 60 * 1000;
    const fp1Time = targetTime - 48 * 60 * 60 * 1000;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (now >= fp1Time && now <= raceEndTime) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isInProgress: true });
        return;
      }

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isInProgress: false });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false, isInProgress: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [nextRace]);

  const circuitId = nextRace?.Circuit?.circuitId || 'marina_bay';
  const circuitMeta = CIRCUIT_EXTRAS[circuitId] || {
    corners: 19,
    drsZones: 3,
    lengthKm: 5.063,
    lapRecord: '1:34.486',
    recordHolder: 'Daniel Ricciardo',
    recordYear: '2024',
  };

  const honestTime = evaluateHonestSessionTime(nextRace?.date, nextRace?.time);

  const formatSessionTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'TBA';
    const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
    const date = new Date(iso);

    if (useLocalTime) {
      return date.toLocaleTimeString([], {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // Circuit time
      return timeStr ? `${timeStr.slice(0, 5)} GMT` : 'TBA';
    }
  };

  return (
    <section className="relative w-full rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8 overflow-hidden">
      {/* Faint Circuit Track Watermark at 2-3% opacity */}
      <CircuitWatermark circuitId={circuitId} />
      {/* Hero Header & Status */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded text-xs font-hud font-bold tracking-wider uppercase bg-[var(--accent-f1-red)]/10 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/25 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] animate-live-pulse"></span>
            ROUND {nextRace?.round || '17'} • {nextRace?.season || '2026'} CHAMPIONSHIP
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono-num hidden sm:inline">
            FIA SCHEDULE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-num text-[var(--text-secondary)]">
          <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span>{nextRace?.date || '2026-09-20'}</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left Column: Race Title, Location & Massive Countdown HUD */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent-f1-red)] text-xs font-bold tracking-wider font-hud uppercase mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {nextRace?.Circuit?.Location?.locality || 'Marina Bay'},{' '}
                {nextRace?.Circuit?.Location?.country || 'Singapore'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black font-hud tracking-tight text-[var(--text-primary)] uppercase leading-none">
              {nextRace?.raceName || 'Singapore Grand Prix'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">
              {nextRace?.Circuit?.circuitName || 'Marina Bay Street Circuit'} — Official Formula 1 World Championship weekend.
            </p>
          </div>

          {/* Countdown Clock HUD — Asymmetric Telemetry Tower */}
          <div className="bg-[var(--bg-primary)] rounded-none p-4 border border-[var(--border-subtle)] timing-tower-rail is-live">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-hud font-bold tracking-wider text-[var(--text-muted)] uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                {timeLeft.isInProgress ? 'LIVE GRAND PRIX WEEKEND IN PROGRESS' : timeLeft.isPast ? 'GRAND PRIX COMPLETED' : 'LIGHTS OUT COUNTDOWN'}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-mono-num">
                {useLocalTime ? 'Local Sync' : 'Track GMT'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[90px] bg-[var(--bg-secondary)] rounded-sm p-3 border border-[var(--border-subtle)]">
                <div className="text-[9px] font-mono-num font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  DAYS
                </div>
                <div className="font-hud font-black text-3xl sm:text-4xl text-[var(--text-primary)] font-mono-num leading-none mt-1">
                  {String(timeLeft.days).padStart(2, '0')}
                </div>
              </div>

              <div className="flex-1 min-w-[90px] bg-[var(--bg-secondary)] rounded-sm p-3 border border-[var(--border-subtle)]">
                <div className="text-[9px] font-mono-num font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  HOURS
                </div>
                <div className="font-hud font-black text-3xl sm:text-4xl text-[var(--text-primary)] font-mono-num leading-none mt-1">
                  {String(timeLeft.hours).padStart(2, '0')}
                </div>
              </div>

              <div className="w-20 bg-[var(--bg-secondary)] rounded-sm p-3 border border-[var(--border-subtle)]">
                <div className="text-[9px] font-mono-num font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  MIN
                </div>
                <div className="font-hud font-bold text-xl sm:text-2xl text-[var(--text-secondary)] font-mono-num leading-none mt-1">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </div>
              </div>

              <div className="w-20 bg-[var(--bg-secondary)] rounded-sm p-3 border border-[var(--accent-f1-red)]/50 relative overflow-hidden">
                <div className="text-[9px] font-mono-num font-bold text-[var(--accent-f1-red)] uppercase tracking-widest flex items-center justify-between">
                  <span>SEC</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] animate-live-pulse" />
                </div>
                <div className="font-hud font-black text-xl sm:text-2xl text-[var(--accent-f1-red)] font-mono-num leading-none mt-1">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>

          {/* Timezone-Honest Inconvenience Plain Language Framing */}
          {useLocalTime && honestTime && (
            <div className={`p-3 rounded-sm border flex items-center justify-between gap-3 text-xs ${honestTime.badgeBg} ${honestTime.badgeBorder}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-2 py-0.5 rounded-none font-hud font-bold uppercase text-[10px] tracking-wider border ${honestTime.badgeColor} ${honestTime.badgeBorder} bg-black/20 shrink-0`}>
                  {honestTime.badgeLabel}
                </span>
                <span className="text-[var(--text-secondary)] font-sans text-xs truncate">
                  {honestTime.inconvenienceAdvice}
                </span>
              </div>
              <span className="font-mono-num text-[11px] font-bold text-[var(--text-primary)] shrink-0">
                {honestTime.localTimeString}
              </span>
            </div>
          )}

          {/* Quick Navigation buttons with Pit-Wall Radio Voice */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onNavigateTab('live')}
              className="px-4 py-2 rounded-sm bg-[var(--accent-f1-red)] text-white font-hud font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>INITIALIZE LIVE TELEMETRY</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {onToggleGlance && (
              <button
                onClick={onToggleGlance}
                className="px-3.5 py-2 rounded-sm bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-hud font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Open distraction-free Glance Mode"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>GLANCE HUD</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('calendar')}
              className="px-3.5 py-2 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-hud font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
              <span>INSPECT CALENDAR</span>
            </button>

            <button
              onClick={() => onNavigateTab('paddock')}
              className="px-3.5 py-2 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-hud font-bold text-xs tracking-wider uppercase flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>OPEN H2H TELEMETRY</span>
            </button>
          </div>
        </div>

        {/* Right Column: Track Telemetry, Weather & Weekend Sessions */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Circuit Specs Card */}
          <div className="bg-[var(--bg-primary)] rounded-sm p-4 border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-hud font-bold tracking-wider text-[var(--text-muted)] uppercase">
                CIRCUIT TELEMETRY SPEC
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono-num font-semibold">
                LAP RECORD: {circuitMeta.lapRecord}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="text-center p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">Length</div>
                <div className="font-hud font-black text-lg text-[var(--text-primary)] font-mono-num">
                  {circuitMeta.lengthKm} KM
                </div>
              </div>

              <div className="text-center p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">Corners</div>
                <div className="font-hud font-black text-lg text-[var(--text-primary)] font-mono-num">
                  {circuitMeta.corners}
                </div>
              </div>

              <div className="text-center p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <div className="text-xs text-[var(--text-muted)] uppercase font-semibold">DRS Zones</div>
                <div className="font-hud font-black text-lg text-[var(--accent-f1-red)] font-mono-num">
                  {circuitMeta.drsZones}
                </div>
              </div>
            </div>

            {/* Weather telemetry & ambient forecast widget */}
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <div className="text-[11px] font-hud font-semibold text-[var(--text-muted)] uppercase mb-2 flex items-center justify-between">
                <span>
                  {weather?.track_temperature
                    ? 'TRACK CONDITIONS (OPENF1 SENSORS)'
                    : 'AMBIENT FORECAST (OPEN-METEO)'}
                </span>
                <span className={weather?.track_temperature ? 'text-emerald-400 text-[10px]' : 'text-blue-400 text-[10px]'}>
                  {weather?.track_temperature ? 'LIVE SENSORS' : 'REAL-TIME METEO'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {weather?.track_temperature ? (
                  <div className="flex flex-col items-center bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
                    <span className="text-[10px] text-[var(--text-muted)]">Track Temp</span>
                    <span className="font-mono-num font-bold">
                      {weather.track_temperature.toFixed(1)}°C
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                    <CloudRain className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
                    <span className="text-[10px] text-[var(--text-muted)]">Rain Prob</span>
                    <span className="font-mono-num font-bold">
                      {ambientWeather ? `${ambientWeather.precipitationProbability}%` : '--'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <Flame className="w-3.5 h-3.5 text-orange-400 mb-0.5" />
                  <span className="text-[10px] text-[var(--text-muted)]">Air Temp</span>
                  <span className="font-mono-num font-bold">
                    {weather?.air_temperature
                      ? `${weather.air_temperature.toFixed(1)}°C`
                      : ambientWeather
                      ? `${ambientWeather.airTemperature.toFixed(1)}°C`
                      : '--'}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
                  <span className="text-[10px] text-[var(--text-muted)]">Humidity</span>
                  <span className="font-mono-num font-bold">
                    {weather?.humidity
                      ? `${weather.humidity.toFixed(0)}%`
                      : ambientWeather
                      ? `${ambientWeather.humidity}%`
                      : '--'}
                  </span>
                </div>

                <div className="flex flex-col items-center bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-subtle)]">
                  <Wind className="w-3.5 h-3.5 text-blue-400 mb-0.5" />
                  <span className="text-[10px] text-[var(--text-muted)]">Wind</span>
                  <span className="font-mono-num font-bold">
                    {weather?.wind_speed
                      ? `${weather.wind_speed.toFixed(1)} m/s`
                      : ambientWeather
                      ? `${ambientWeather.windSpeed.toFixed(1)} km/h`
                      : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekend Session Schedule */}
          <div className="bg-[var(--bg-primary)] rounded p-4 border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] text-xs font-hud font-bold tracking-wider text-[var(--text-muted)] uppercase">
              <span>WEEKEND TIMETABLE</span>
              <span className="text-[var(--accent-f1-red)]">
                {useLocalTime ? 'YOUR LOCAL TIME' : 'TRACK TIME'}
              </span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)] text-xs">
              {nextRace?.FirstPractice && (
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Practice 1 (FP1)</span>
                  <span className="font-mono-num font-bold text-[var(--text-primary)]">
                    {formatSessionTime(nextRace.FirstPractice.date, nextRace.FirstPractice.time)}
                  </span>
                </div>
              )}

              {nextRace?.SecondPractice && (
                <div className="py-2 flex items-center justify-between">
                  <span className="text-[var(--text-secondary)] font-medium">Practice 2 (FP2)</span>
                  <span className="font-mono-num font-bold text-[var(--text-primary)]">
                    {formatSessionTime(nextRace.SecondPractice.date, nextRace.SecondPractice.time)}
                  </span>
                </div>
              )}

              {nextRace?.Qualifying && (
                <div className="py-2 flex items-center justify-between">
                  <span className="text-amber-400 font-semibold">Qualifying</span>
                  <span className="font-mono-num font-bold text-amber-400">
                    {formatSessionTime(nextRace.Qualifying.date, nextRace.Qualifying.time)}
                  </span>
                </div>
              )}

              <div className="py-2 flex items-center justify-between bg-[var(--accent-f1-red)]/10 px-2 rounded-lg mt-1 border border-[var(--accent-f1-red)]/20">
                <span className="text-[var(--accent-f1-red)] font-bold uppercase font-hud">
                  Grand Prix Race
                </span>
                <span className="font-mono-num font-black text-[var(--accent-f1-red)]">
                  {formatSessionTime(nextRace?.date, nextRace?.time)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
