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

/* ─── Countdown tile ───────────────────────── */
function CountTile({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        flex: '1 1 72px',
        background: accent ? 'rgba(225,6,0,0.08)' : 'var(--bg-raised)',
        border: `1px solid ${accent ? 'rgba(225,6,0,0.35)' : 'var(--border-dim)'}`,
        borderRadius: 'var(--r-md)',
        padding: '10px 12px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: 'clamp(28px, 6vw, 48px)',
          lineHeight: 1,
          color: accent ? 'var(--red)' : 'var(--text-primary)',
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: accent ? 'var(--red)' : 'var(--text-muted)',
          marginTop: 4,
        }}
      >
        {label}
      </div>
      {accent && (
        <span
          className="animate-live-pulse"
          style={{
            display: 'inline-block',
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'var(--red)',
            marginTop: 4,
          }}
        />
      )}
    </div>
  );
}

/* ─── Weather tile ─────────────────────────── */
function WeatherTile({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div
      style={{
        flex: '1 1 64px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-dim)',
        borderRadius: 'var(--r-md)',
        padding: '10px 8px',
        textAlign: 'center',
      }}
    >
      <Icon style={{ width: 14, height: 14, color, margin: '0 auto 4px' }} />
      <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
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
    getWeatherForCircuit(circuitId, lat, lng).then(setAmbientWeather);
  }, [nextRace]);

  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, isInProgress: false,
  });

  useEffect(() => {
    if (!nextRace?.date) return;
    const targetDateStr = nextRace.time
      ? `${nextRace.date}T${nextRace.time}`
      : `${nextRace.date}T13:00:00Z`;
    const targetTime = new Date(targetDateStr).getTime();
    const raceEndTime = targetTime + 4 * 60 * 60 * 1000;
    const fp1Time = targetTime - 48 * 60 * 60 * 1000;

    const tick = () => {
      const now = Date.now();
      if (now >= fp1Time && now <= raceEndTime) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isInProgress: true });
        return;
      }
      const diff = targetTime - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, isInProgress: false });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        isPast: false,
        isInProgress: false,
      });
    };

    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [nextRace]);

  const circuitId = nextRace?.Circuit?.circuitId || 'marina_bay';
  const circuitMeta = CIRCUIT_EXTRAS[circuitId] || {
    corners: 19, drsZones: 3, lengthKm: 5.063,
    lapRecord: '1:34.486', recordHolder: 'Daniel Ricciardo', recordYear: '2024',
  };
  const honestTime = evaluateHonestSessionTime(nextRace?.date, nextRace?.time);

  const formatSessionTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'TBA';
    const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
    const date = new Date(iso);
    if (useLocalTime) {
      return date.toLocaleTimeString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    return timeStr ? `${timeStr.slice(0, 5)} GMT` : 'TBA';
  };

  const rawCircuitName = nextRace?.Circuit?.circuitName || 'Marina Bay Street Circuit';
  const displayCircuitTitle = rawCircuitName.toLowerCase().includes('madring')
    ? 'Madrid Street Circuit'
    : rawCircuitName;

  const sessions = [
    nextRace?.FirstPractice && { label: 'FP1', date: nextRace.FirstPractice.date, time: nextRace.FirstPractice.time, accent: false },
    nextRace?.SecondPractice && { label: 'FP2', date: nextRace.SecondPractice.date, time: nextRace.SecondPractice.time, accent: false },
    nextRace?.ThirdPractice && { label: 'FP3', date: (nextRace as any).ThirdPractice?.date, time: (nextRace as any).ThirdPractice?.time, accent: false },
    nextRace?.Qualifying && { label: 'QUALI', date: nextRace.Qualifying.date, time: nextRace.Qualifying.time, accent: true },
    nextRace?.date && { label: 'RACE', date: nextRace.date, time: nextRace.time, accent: true, isRace: true },
  ].filter(Boolean) as Array<{ label: string; date?: string; time?: string; accent: boolean; isRace?: boolean }>;

  return (
    <section
      className="relative w-full overflow-hidden carbon-weave"
      style={{
        background: 'var(--bg-raised)',
        border: '1px solid var(--border-dim)',
        borderRadius: 'var(--r-lg)',
      }}
    >
      {/* Circuit watermark */}
      <CircuitWatermark circuitId={circuitId} />

      {/* Kerb stripe at top */}
      <div className="kerb-stripe w-full" style={{ borderRadius: 'var(--r-lg) var(--r-lg) 0 0' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: 'clamp(20px, 4vw, 36px)' }}>
        {/* ── Header row ─────────────────────────── */}
        <div
          className="flex flex-wrap items-center justify-between gap-3"
          style={{ paddingBottom: 20, borderBottom: '1px solid var(--border-dim)', marginBottom: 24 }}
        >
          <div className="flex items-center gap-3">
            {/* Round badge */}
            <span
              className="flex items-center gap-1.5"
              style={{
                padding: '4px 12px',
                background: 'var(--red-subtle)',
                border: '1px solid rgba(225,6,0,0.25)',
                borderRadius: 'var(--r-pill)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--red)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-live-pulse" style={{ background: 'var(--red)', flexShrink: 0 }} />
              RND {nextRace?.round || '17'} &bull; {nextRace?.season || '2026'} WCC
            </span>
            <span
              className="hidden sm:inline"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}
            >
              FIA SCHEDULE
            </span>
          </div>
          <span
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.04em' }}
          >
            {nextRace?.date || '—'}
          </span>
        </div>

        {/* ── Main grid ──────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: 'clamp(20px, 4vw, 40px)',
            alignItems: 'start',
          }}
        >
          {/* LEFT: Race title + countdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title */}
            <div>
              <div
                className="flex items-center gap-1.5"
                style={{ marginBottom: 6, color: 'var(--red)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 12, letterSpacing: '0.10em', textTransform: 'uppercase' }}
              >
                <MapPin style={{ width: 12, height: 12 }} />
                {nextRace?.Circuit?.Location?.locality || 'Marina Bay'}, {nextRace?.Circuit?.Location?.country || 'Singapore'}
              </div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 'clamp(28px, 6vw, 56px)',
                  lineHeight: 0.95,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  color: 'var(--text-primary)',
                  margin: 0,
                }}
              >
                {nextRace?.raceName || 'Singapore Grand Prix'}
              </h1>
              <p
                style={{ marginTop: 8, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}
              >
                {displayCircuitTitle} — FIA Formula 1 World Championship Weekend
              </p>
            </div>

            {/* Countdown HUD */}
            <div
              className="timing-tower-rail is-live"
              style={{
                background: 'rgba(0,0,0,0.30)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px',
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ marginBottom: 12 }}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  <Clock style={{ width: 12, height: 12, color: 'var(--red)' }} />
                  {timeLeft.isInProgress
                    ? 'LIVE RACE WEEKEND IN PROGRESS'
                    : timeLeft.isPast
                    ? 'GRAND PRIX COMPLETED'
                    : 'LIGHTS OUT COUNTDOWN'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                  {useLocalTime ? 'LOCAL' : 'TRACK GMT'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <CountTile value={String(timeLeft.days).padStart(2, '0')}    label="DAYS"    />
                <CountTile value={String(timeLeft.hours).padStart(2, '0')}   label="HOURS"   />
                <CountTile value={String(timeLeft.minutes).padStart(2, '0')} label="MIN"     />
                <CountTile value={String(timeLeft.seconds).padStart(2, '0')} label="SEC"     accent />
              </div>
            </div>

            {/* Timezone honest banner */}
            {useLocalTime && honestTime && (
              <div
                className={`flex items-center justify-between gap-3 ${honestTime.badgeBg} ${honestTime.badgeBorder}`}
                style={{ padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--border-dim)', fontSize: 12 }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`${honestTime.badgeColor} ${honestTime.badgeBorder}`}
                    style={{ padding: '2px 8px', borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}
                  >
                    {honestTime.badgeLabel}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {honestTime.inconvenienceAdvice}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                  {honestTime.localTimeString}
                </span>
              </div>
            )}

            {/* CTA buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button
                onClick={() => onNavigateTab('live')}
                className="btn-red flex items-center gap-1.5"
              >
                <Gauge style={{ width: 13, height: 13 }} />
                INITIALIZE LIVE TELEMETRY
                <ChevronRight style={{ width: 13, height: 13 }} />
              </button>

              {onToggleGlance && (
                <button
                  onClick={onToggleGlance}
                  className="flex items-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    padding: '0 14px',
                    height: 36,
                    background: 'rgba(245,184,0,0.08)',
                    border: '1px solid rgba(245,184,0,0.28)',
                    borderRadius: 'var(--r-sm)',
                    color: '#F5B800',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Zap style={{ width: 13, height: 13 }} />
                  GLANCE HUD
                </button>
              )}

              <button
                onClick={() => onNavigateTab('calendar')}
                className="btn-ghost flex items-center gap-1.5"
              >
                <CalendarIcon style={{ width: 13, height: 13 }} />
                CALENDAR
              </button>
            </div>
          </div>

          {/* RIGHT: Circuit specs + weather + timetable */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Circuit spec card */}
            <div
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px',
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ paddingBottom: 12, borderBottom: '1px solid var(--border-dim)', marginBottom: 12 }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  CIRCUIT SPEC
                </span>
                <span
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-secondary)', padding: '2px 8px', background: 'var(--bg-highlight)', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-dim)' }}
                >
                  LAP RECORD: {circuitMeta.lapRecord}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {[
                  { label: 'Length', value: `${circuitMeta.lengthKm} km` },
                  { label: 'Corners', value: String(circuitMeta.corners) },
                  { label: 'DRS Zones', value: String(circuitMeta.drsZones) },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--bg-raised)', border: '1px solid var(--border-dim)', borderRadius: 'var(--r-sm)' }}
                  >
                    <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, color: 'var(--text-primary)', marginTop: 2, lineHeight: 1 }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weather row */}
              <div>
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: 8, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}
                >
                  <span>{weather?.track_temperature ? 'TRACK CONDITIONS (LIVE SENSORS)' : 'AMBIENT FORECAST'}</span>
                  <span style={{ color: weather?.track_temperature ? 'var(--green)' : 'var(--blue)', fontSize: 9 }}>
                    {weather?.track_temperature ? 'LIVE' : 'METEO'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {weather?.track_temperature ? (
                    <WeatherTile icon={Thermometer} label="Track" value={`${weather.track_temperature.toFixed(1)}°C`} color="var(--amber)" />
                  ) : (
                    <WeatherTile icon={CloudRain} label="Rain" value={ambientWeather ? `${ambientWeather.precipitationProbability}%` : '—'} color="var(--blue)" />
                  )}
                  <WeatherTile
                    icon={Flame}
                    label="Air"
                    value={weather?.air_temperature ? `${weather.air_temperature.toFixed(1)}°C` : ambientWeather ? `${ambientWeather.airTemperature.toFixed(1)}°C` : '—'}
                    color="#F97316"
                  />
                  <WeatherTile
                    icon={Droplets}
                    label="Humidity"
                    value={weather?.humidity ? `${weather.humidity.toFixed(0)}%` : ambientWeather ? `${ambientWeather.humidity}%` : '—'}
                    color="var(--blue)"
                  />
                  <WeatherTile
                    icon={Wind}
                    label="Wind"
                    value={weather?.wind_speed ? `${weather.wind_speed.toFixed(1)}m/s` : ambientWeather ? `${ambientWeather.windSpeed.toFixed(1)}kph` : '—'}
                    color="var(--blue)"
                  />
                </div>
              </div>
            </div>

            {/* Weekend timetable */}
            <div
              style={{
                background: 'rgba(0,0,0,0.28)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-md)',
                padding: '14px 16px',
              }}
            >
              <div
                className="flex items-center justify-between"
                style={{ paddingBottom: 10, borderBottom: '1px solid var(--border-dim)', marginBottom: 10 }}
              >
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  WEEKEND TIMETABLE
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {useLocalTime ? 'LOCAL' : 'TRACK GMT'}
                </span>
              </div>

              <div>
                {sessions.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: s.isRace ? '8px 10px' : '7px 0',
                      borderBottom: i < sessions.length - 1 ? '1px solid var(--border-dim)' : 'none',
                      background: s.isRace ? 'var(--red-subtle)' : 'transparent',
                      borderRadius: s.isRace ? 'var(--r-sm)' : 0,
                      marginTop: s.isRace ? 4 : 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: s.isRace ? 'var(--red)' : s.accent ? 'var(--amber)' : 'var(--text-secondary)',
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: 12,
                        color: s.isRace ? 'var(--red)' : s.accent ? 'var(--amber)' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatSessionTime(s.date, s.time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
