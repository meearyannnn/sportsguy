'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  predictRaceOutcome,
  DriverPrediction,
  PredictionFactor,
  CIRCUIT_PROFILES,
} from '@/lib/f1/prediction';
import { getWeatherForCircuit, OpenMeteoWeather } from '@/lib/f1/openmeteo';
import { DriverStanding, Race } from '@/lib/f1/types';
import { getTeamMeta } from '@/lib/f1/teams';
import { CloudRain, Wind, Thermometer, RefreshCw, TrendingUp, TrendingDown, Minus, ChevronDown } from 'lucide-react';

interface PredictionEngineProps {
  driverStandings: DriverStanding[];
  nextRace: Race | null;
  calendar: Race[];
}

// ── Form sparkline ──────────────────────────────────────────────────────────────
function FormBar({ bars, color }: { bars: { pos: number; raceName: string; isDNF: boolean }[]; color: string }) {
  if (bars.length === 0) return null;
  const maxPos = 22;
  return (
    <div className="flex items-end gap-0.5 h-5">
      {bars.map((b, i) => {
        const heightPct = b.isDNF ? 8 : Math.max(8, (1 - (b.pos - 1) / (maxPos - 1)) * 100);
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-500"
            style={{
              height: `${heightPct}%`,
              backgroundColor: b.isDNF ? '#E10600' : b.pos <= 3 ? color : b.pos <= 10 ? `${color}80` : '#ffffff15',
              minWidth: '4px',
            }}
            title={b.isDNF ? `DNF — ${b.raceName}` : `P${b.pos} — ${b.raceName}`}
          />
        );
      })}
    </div>
  );
}

// ── Probability Arc (SVG donut-style) ─────────────────────────────────────────

function ProbArc({ value, color, label, size = 52 }: { value: number; color: string; label: string; size?: number }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 1s var(--ease-snap)' }}
        />
        <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill={color} fontFamily="var(--font-mono)">
          {value}%
        </text>
      </svg>
      <span className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-hud">{label}</span>
    </div>
  );
}

// ── Factor Badge ──────────────────────────────────────────────────────────────

function FactorBadge({ factor }: { factor: PredictionFactor }) {
  const config = {
    positive: { bg: 'rgba(16,224,112,0.10)', text: '#10E070', icon: <TrendingUp size={9} /> },
    negative: { bg: 'rgba(225,6,0,0.10)', text: '#E10600', icon: <TrendingDown size={9} /> },
    neutral: { bg: 'rgba(255,255,255,0.06)', text: '#888', icon: <Minus size={9} /> },
  }[factor.impact];

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-hud uppercase tracking-wider"
      style={{ backgroundColor: config.bg, color: config.text }}
      title={factor.detail}
    >
      {config.icon}
      {factor.label}
    </div>
  );
}

// ── Main prediction card ──────────────────────────────────────────────────────

function PredictionCard({ pred, rank }: { pred: DriverPrediction; rank: number }) {
  const [expanded, setExpanded] = useState(false);
  const team = getTeamMeta(pred.constructorId);
  const color = team?.color ?? '#888888';
  const isTop3 = rank <= 3;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-raised)',
        borderColor: isTop3 ? `${color}55` : 'var(--border-dim)',
        boxShadow: rank === 1 ? `0 0 30px ${color}15, 0 0 0 1px ${color}30` : 'none',
      }}
      onClick={() => setExpanded((e) => !e)}
    >
      <div className="h-0.5" style={{ backgroundColor: isTop3 ? color : 'transparent' }} />

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Rank */}
        <div className="w-7 shrink-0 text-center">
          <span
            className="font-display text-xl font-black"
            style={{ color: isTop3 ? color : 'var(--text-muted)' }}
          >
            {rank}
          </span>
        </div>

        {/* Driver identity */}
        <div className="flex items-center gap-2 shrink-0" style={{ minWidth: '100px' }}>
          <span className="w-0.5 h-8 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <div>
            <div className="font-hud text-sm font-black uppercase tracking-wide text-[var(--text-primary)]">
              {pred.driverCode}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] leading-tight">{pred.constructorName}</div>
          </div>
        </div>

        {/* Form sparkline */}
        <div className="flex-1 hidden sm:block" style={{ maxWidth: '64px' }}>
          <FormBar bars={pred.formBar} color={color} />
          <div className="text-[8px] text-[var(--text-muted)] font-hud uppercase tracking-wider mt-0.5">Form</div>
        </div>

        {/* Probability arcs */}
        <div className="flex items-center gap-3 flex-1 justify-end sm:justify-center">
          <ProbArc value={pred.winProbability} color={color} label="Win" />
          <ProbArc value={pred.podiumProbability} color="#F5B800" label="Podium" />
          <ProbArc value={pred.dnfRisk} color={pred.dnfRisk > 25 ? '#E10600' : '#56565F'} label="DNF" size={44} />
        </div>

        {/* Expand toggle */}
        <ChevronDown
          size={14}
          className="shrink-0 text-[var(--text-muted)] transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-[var(--border-dim)] px-4 py-4 space-y-4 animate-fade-in">
          {/* Strength bars */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Form', value: pred.formRating, color },
              { label: 'Qualifying', value: pred.qualifyingStrength, color: '#9B5FFA' },
              { label: 'Race Craft', value: pred.raceStrength, color: '#F5B800' },
            ].map((s) => (
              <div key={s.label} className="space-y-1.5">
                <div className="flex justify-between text-[9px]">
                  <span className="font-hud uppercase tracking-widest text-[var(--text-muted)]">{s.label}</span>
                  <span className="font-mono" style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.value}%`, backgroundColor: s.color, transition: 'width 0.8s var(--ease-snap)' }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Factors */}
          {pred.factors.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">Key Factors</div>
              <div className="flex flex-wrap gap-1.5">
                {pred.factors.map((f, i) => <FactorBadge key={i} factor={f} />)}
              </div>
            </div>
          )}

          {/* Full driver name */}
          <div className="text-[10px] text-[var(--text-muted)]">
            <span className="font-hud uppercase tracking-wider text-[var(--text-secondary)]">{pred.driverName}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Weather Panel ──────────────────────────────────────────────────────────────

function WeatherPanel({ weather, circuitId }: { weather: OpenMeteoWeather; circuitId?: string }) {
  const rain = weather.precipitationProbability;
  const isWet = rain > 50;
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl border flex-wrap"
      style={{
        backgroundColor: 'var(--bg-raised)',
        borderColor: isWet ? 'rgba(59,155,250,0.40)' : 'var(--border-dim)',
        boxShadow: isWet ? '0 0 20px rgba(59,155,250,0.08)' : 'none',
      }}
    >
      <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)] shrink-0">Circuit Weather</div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <Thermometer size={12} style={{ color: '#F5B800' }} />
        {weather.airTemperature.toFixed(0)}°C
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
        <Wind size={12} style={{ color: '#3B9BFA' }} />
        {weather.windSpeed.toFixed(0)} km/h
      </div>
      <div className="flex items-center gap-1.5 text-xs" style={{ color: isWet ? '#3B9BFA' : 'var(--text-muted)' }}>
        <CloudRain size={12} />
        {rain}% precipitation
      </div>
      {isWet && (
        <span
          className="px-2 py-0.5 rounded text-[9px] font-hud uppercase tracking-wider"
          style={{ backgroundColor: 'rgba(59,155,250,0.15)', color: '#3B9BFA', border: '1px solid rgba(59,155,250,0.30)' }}
        >
          Wet race likely — probabilities adjusted
        </span>
      )}
    </div>
  );
}

// ── Circuit info panel ─────────────────────────────────────────────────────────

function CircuitPanel({ circuitId }: { circuitId: string }) {
  const profile = CIRCUIT_PROFILES[circuitId];
  if (!profile) return null;

  const typeColors: Record<string, string> = {
    street: '#F5B800',
    power: '#E10600',
    technical: '#9B5FFA',
    downforce: '#10E070',
    balanced: '#3B9BFA',
  };

  const diffLabel = { low: 'Hard to overtake', medium: 'Moderate overtaking', high: 'Easy to overtake' }[profile.overtakingDifficulty];
  const tyreLabel = { low: 'Low tyre deg', medium: 'Medium deg', high: 'High tyre deg' }[profile.tyreDegradation];

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-xl border flex-wrap"
      style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
    >
      <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)] shrink-0">Circuit Profile</div>
      <span
        className="px-2 py-0.5 rounded text-[9px] font-hud uppercase tracking-wider"
        style={{ backgroundColor: `${typeColors[profile.type]}18`, color: typeColors[profile.type] }}
      >
        {profile.type}
      </span>
      <span className="text-[10px] text-[var(--text-muted)]">{diffLabel}</span>
      <span className="text-[10px] text-[var(--text-muted)]">·</span>
      <span className="text-[10px] text-[var(--text-muted)]">{tyreLabel}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PredictionEngine({ driverStandings, nextRace, calendar }: PredictionEngineProps) {
  const [predictions, setPredictions] = useState<DriverPrediction[]>([]);
  const [weather, setWeather] = useState<OpenMeteoWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const targetRace = selectedCircuitId
    ? (calendar.find((r) => r.Circuit.circuitId === selectedCircuitId) ?? nextRace)
    : nextRace;
  const circuitId = targetRace?.Circuit.circuitId ?? '';

  const run = useCallback(async () => {
    if (!targetRace || driverStandings.length === 0) return;
    setLoading(true);
    try {
      const weatherData = await getWeatherForCircuit(
        circuitId,
        targetRace.Circuit.Location.lat,
        targetRace.Circuit.Location.long
      );
      setWeather(weatherData);
      const preds = predictRaceOutcome(circuitId, targetRace, driverStandings, weatherData, 'current');
      setPredictions(preds);
    } finally {
      setLoading(false);
    }
  }, [targetRace, driverStandings, circuitId]);

  useEffect(() => { run(); }, [run]);

  const upcomingRaces = calendar.filter((r) => new Date(r.date) >= new Date()).slice(0, 8);
  const visiblePreds = showAll ? predictions : predictions.slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Prediction Engine
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Data-driven race outcome model using 2026 season metrics
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-hud text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-40"
          style={{ backgroundColor: 'var(--red)', color: '#fff' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Calculating…' : 'Refresh'}
        </button>
      </div>

      {/* Race selector */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCircuitId(null)}
          className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-hud border transition-all duration-150"
          style={{
            backgroundColor: !selectedCircuitId ? 'var(--red-subtle)' : 'var(--bg-raised)',
            borderColor: !selectedCircuitId ? 'var(--red)' : 'var(--border-dim)',
            color: !selectedCircuitId ? 'var(--red)' : 'var(--text-muted)',
          }}
        >
          Next Race
        </button>
        {upcomingRaces.map((r) => (
          <button
            key={r.Circuit.circuitId}
            onClick={() => setSelectedCircuitId(r.Circuit.circuitId)}
            className="px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-hud border transition-all duration-150"
            style={{
              backgroundColor: selectedCircuitId === r.Circuit.circuitId ? 'var(--red-subtle)' : 'var(--bg-raised)',
              borderColor: selectedCircuitId === r.Circuit.circuitId ? 'var(--red)' : 'var(--border-dim)',
              color: selectedCircuitId === r.Circuit.circuitId ? 'var(--red)' : 'var(--text-muted)',
            }}
          >
            R{r.round} {r.raceName.replace(' Grand Prix', '')}
          </button>
        ))}
      </div>

      {/* Target race */}
      {targetRace && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border" style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}>
          <div className="w-1 h-10 rounded-full bg-[var(--red)]" />
          <div>
            <div className="font-hud text-base font-black uppercase tracking-wide text-[var(--text-primary)]">
              {targetRace.raceName}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {targetRace.Circuit.circuitName} · Round {targetRace.round} · {targetRace.Circuit.Location.country}
            </div>
          </div>
        </div>
      )}

      {/* Circuit profile + weather */}
      <div className="space-y-2">
        {circuitId && <CircuitPanel circuitId={circuitId} />}
        {weather && <WeatherPanel weather={weather} circuitId={circuitId} />}
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-dim)] bg-[var(--bg-raised)]">
        <div className="w-1 h-4 rounded-full bg-[var(--amber)]" />
        <p className="text-[9px] text-[var(--text-muted)]">
          Model uses 2026 season data (points-per-race, avg finish, DNF rate, form) · circuit affinity profiles · OpenMeteo weather · Not betting advice.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <span className="text-sm text-[var(--text-muted)]">Running prediction model…</span>
        </div>
      )}

      {/* Cards */}
      {!loading && predictions.length > 0 && (
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-1.5 text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
            <div className="w-7">#</div>
            <div style={{ minWidth: '100px' }}>Driver</div>
            <div className="flex-1 hidden sm:block" style={{ maxWidth: '64px' }}>Form</div>
            <div className="flex gap-3 flex-1 justify-end sm:justify-center">
              <div className="w-[52px] text-center">Win</div>
              <div className="w-[52px] text-center">Podium</div>
              <div className="w-[44px] text-center">DNF</div>
            </div>
            <div className="w-4" />
          </div>

          {visiblePreds.map((pred, i) => (
            <PredictionCard key={pred.driverId} pred={pred} rank={i + 1} />
          ))}

          {!showAll && predictions.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 text-xs font-hud uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--red)] transition-colors"
            >
              Show all {predictions.length} drivers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
