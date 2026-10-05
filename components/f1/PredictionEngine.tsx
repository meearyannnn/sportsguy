'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  predictRaceOutcome,
  DriverPrediction,
  PredictionFactor,
  PredictionScenario,
  TRACK_CHARACTERISTICS,
} from '@/lib/f1/prediction';
import { getWeatherForCircuit, OpenMeteoWeather } from '@/lib/f1/openmeteo';
import { DriverStanding, Race } from '@/lib/f1/types';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  CloudRain,
  Wind,
  Thermometer,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info,
  Timer,
  Zap,
  Flag,
  Wrench,
  Award,
} from 'lucide-react';

interface PredictionEngineProps {
  driverStandings: DriverStanding[];
  nextRace: Race | null;
  calendar: Race[];
}

// ── Form sparkline ──────────────────────────────────────────────────────────────
function FormBar({
  bars,
  color,
}: {
  bars: { pos: number; raceName: string; isDNF: boolean }[];
  color: string;
}) {
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
              backgroundColor: b.isDNF
                ? '#E10600'
                : b.pos <= 3
                ? color
                : b.pos <= 10
                ? `${color}80`
                : '#ffffff15',
              minWidth: '4px',
            }}
            title={b.isDNF ? `DNF — ${b.raceName}` : `P${b.pos} — ${b.raceName}`}
          />
        );
      })}
    </div>
  );
}

// ── Probability Range Component (Confidence Interval) ───────────────────────

interface ProbIntervalProps {
  min: number;
  max: number;
  mostLikely: number;
  color: string;
  label: string;
  size?: 'normal' | 'compact';
}

function ProbInterval({ min, max, mostLikely, color, label, size = 'normal' }: ProbIntervalProps) {
  const isCompact = size === 'compact';
  return (
    <div className="flex flex-col items-center justify-center min-w-[70px]">
      <div className="flex items-baseline gap-1">
        <span
          className={`font-mono font-black ${isCompact ? 'text-xs' : 'text-sm'}`}
          style={{ color }}
        >
          {mostLikely}%
        </span>
      </div>

      {/* Mini uncertainty range bar */}
      <div className="w-12 h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden my-0.5 relative">
        <div
          className="absolute top-0 bottom-0 rounded-full opacity-35"
          style={{
            left: `${min}%`,
            width: `${Math.max(4, max - min)}%`,
            backgroundColor: color,
          }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 rounded-full"
          style={{
            left: `${Math.max(0, mostLikely - 2)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <span className="text-[8px] font-mono text-[var(--text-muted)] tracking-tight">
        {min}–{max}%
      </span>
      <span className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-hud mt-0.5">
        {label}
      </span>
    </div>
  );
}

// ── Trend Pill ──────────────────────────────────────────────────────────────

function TrendPill({ trend }: { trend: DriverPrediction['trend'] }) {
  if (trend.direction === 'same' || trend.deltaPct === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-[var(--text-muted)] opacity-60">
        <Minus size={10} />
        0%
      </span>
    );
  }

  const isUp = trend.direction === 'up';
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
        isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
      }`}
      title={`Shift from baseline scenario: ${isUp ? '+' : '-'}${trend.deltaPct}%`}
    >
      {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {isUp ? `+${trend.deltaPct}%` : `-${trend.deltaPct}%`}
    </span>
  );
}

// ── Confidence Badge ────────────────────────────────────────────────────────

function ConfidenceBadge({
  level,
  score,
  reason,
}: {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  reason: string;
}) {
  const config = {
    HIGH: {
      bg: 'rgba(16, 224, 112, 0.12)',
      text: '#10E070',
      border: 'rgba(16, 224, 112, 0.25)',
      icon: <CheckCircle2 size={10} />,
      label: 'High Confidence',
    },
    MEDIUM: {
      bg: 'rgba(59, 155, 250, 0.12)',
      text: '#3B9BFA',
      border: 'rgba(59, 155, 250, 0.25)',
      icon: <Info size={10} />,
      label: 'Med Confidence',
    },
    LOW: {
      bg: 'rgba(245, 184, 0, 0.12)',
      text: '#F5B800',
      border: 'rgba(245, 184, 0, 0.25)',
      icon: <AlertTriangle size={10} />,
      label: 'Low Confidence',
    },
  }[level];

  return (
    <div
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-hud uppercase tracking-wider border cursor-help group/conf relative"
      style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
    >
      {config.icon}
      <span>{config.label}</span>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/conf:flex flex-col z-50 pointer-events-none min-w-[200px] p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-dim)] shadow-xl text-left">
        <div className="text-[10px] font-hud font-bold uppercase text-[var(--text-primary)]">
          Data Integrity Score: {score}/100
        </div>
        <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{reason}</div>
      </div>
    </div>
  );
}

// ── Factor Badge ──────────────────────────────────────────────────────────────

function FactorItem({ factor }: { factor: PredictionFactor }) {
  const isPos = factor.impact === 'positive';
  const isNeg = factor.impact === 'negative';

  return (
    <div
      className={`flex items-start justify-between gap-2 p-2 rounded-lg border text-xs ${
        isPos
          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
          : isNeg
          ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
          : 'bg-[var(--bg-overlay)]/40 border-[var(--border-dim)] text-[var(--text-secondary)]'
      }`}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 font-hud font-bold tracking-tight text-[11px]">
          {isPos ? (
            <TrendingUp size={12} className="text-emerald-400 shrink-0" />
          ) : isNeg ? (
            <TrendingDown size={12} className="text-rose-400 shrink-0" />
          ) : (
            <Minus size={12} className="text-[var(--text-muted)] shrink-0" />
          )}
          <span>{factor.label}</span>
          <span
            className={`font-mono text-[10px] px-1 py-0.2 rounded font-bold ${
              isPos ? 'bg-emerald-500/20 text-emerald-400' : isNeg ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-white'
            }`}
          >
            {factor.deltaPct > 0 ? `+${factor.deltaPct}%` : `${factor.deltaPct}%`}
          </span>
        </div>
        <div className="text-[10px] text-[var(--text-muted)]">{factor.detail}</div>
        <div className="text-[8px] font-mono text-[var(--text-muted)] opacity-75">
          Source: {factor.citation}
        </div>
      </div>
    </div>
  );
}

// ── Main Prediction Card ──────────────────────────────────────────────────────

function PredictionCard({
  pred,
  rank,
  scenario,
}: {
  pred: DriverPrediction;
  rank: number;
  scenario: PredictionScenario;
}) {
  const [expanded, setExpanded] = useState(false);
  const team = getTeamMeta(pred.constructorId);
  const color = team?.color ?? '#888888';
  const isTop3 = rank <= 3;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer shadow-md"
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
        <div className="flex items-center gap-2.5 shrink-0" style={{ minWidth: '120px' }}>
          <span className="w-1 h-9 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: color }} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-hud text-sm font-black uppercase tracking-wide text-[var(--text-primary)]">
                {pred.driverCode}
              </span>
              <TrendPill trend={pred.trend} />
            </div>
            <div className="text-[10px] text-[var(--text-muted)] leading-tight">
              {pred.constructorName}
            </div>
          </div>
        </div>

        {/* Model Confidence */}
        <div className="hidden md:block shrink-0">
          <ConfidenceBadge
            level={pred.confidenceLevel}
            score={pred.confidenceScore}
            reason={pred.confidenceReason}
          />
        </div>

        {/* Form sparkline */}
        <div className="flex-1 hidden sm:block" style={{ maxWidth: '64px' }}>
          <FormBar bars={pred.formBar} color={color} />
          <div className="text-[8px] text-[var(--text-muted)] font-hud uppercase tracking-wider mt-0.5">
            L5 Form
          </div>
        </div>

        {/* Probability Bounded Intervals */}
        <div className="flex items-center gap-4 flex-1 justify-end sm:justify-center">
          <ProbInterval
            min={pred.winInterval.min}
            max={pred.winInterval.max}
            mostLikely={pred.winInterval.mostLikely}
            color={color}
            label="Win"
          />
          <ProbInterval
            min={pred.podiumInterval.min}
            max={pred.podiumInterval.max}
            mostLikely={pred.podiumInterval.mostLikely}
            color="#F5B800"
            label="Podium"
          />
          <ProbInterval
            min={pred.dnfInterval.min}
            max={pred.dnfInterval.max}
            mostLikely={pred.dnfInterval.mostLikely}
            color={pred.dnfRisk > 25 ? '#E10600' : '#56565F'}
            label="DNF Risk"
            size="compact"
          />
        </div>

        {/* Expand toggle */}
        <ChevronDown
          size={16}
          className="shrink-0 text-[var(--text-muted)] transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
        />
      </div>

      {/* Expanded Multi-Factor Attribution & Integrity Audit */}
      {expanded && (
        <div
          className="border-t border-[var(--border-dim)] px-4 py-4 space-y-4 animate-fade-in bg-[var(--bg-card)]/40"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Driver Bio & Full Model Confidence Header */}
          <div className="flex items-center justify-between border-b border-[var(--border-dim)]/50 pb-2 flex-wrap gap-2">
            <div>
              <span className="font-hud uppercase tracking-wider text-sm font-bold text-[var(--text-primary)]">
                {pred.driverName}
              </span>
              <span className="text-xs text-[var(--text-muted)] ml-2">
                · {pred.constructorName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ConfidenceBadge
                level={pred.confidenceLevel}
                score={pred.confidenceScore}
                reason={pred.confidenceReason}
              />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                Uncertainty Range: ±{Math.round((pred.winInterval.max - pred.winInterval.min) / 2)}%
              </span>
            </div>
          </div>

          {/* Performance Attribute Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Recency Form (L3 55%)', value: pred.formRating, color },
              { label: 'Qualifying Power', value: pred.qualifyingStrength, color: '#9B5FFA' },
              { label: 'Race Craft & Wins', value: pred.raceStrength, color: '#F5B800' },
              { label: 'Reliability Index', value: pred.upgradePackage.reliabilityRating, color: pred.upgradePackage.reliabilityRating < 80 ? '#E10600' : '#10E070' },
            ].map((s) => (
              <div key={s.label} className="p-2.5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-dim)] space-y-1">
                <div className="flex justify-between text-[9px]">
                  <span className="font-hud uppercase tracking-widest text-[var(--text-muted)] truncate">
                    {s.label}
                  </span>
                  <span className="font-mono font-bold" style={{ color: s.color }}>
                    {s.value}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.value}%`, backgroundColor: s.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Factor Attribution Breakdown (WHY the model produced that number) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest font-hud font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Zap size={12} className="text-amber-400" />
                Key Attribution Factors (Model Weighting Breakdown)
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">
                Quantified delta impact on win probability
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {pred.factors.map((f, i) => (
                <FactorItem key={i} factor={f} />
              ))}
            </div>
          </div>

          {/* Track Historical Record & Car Upgrade Trajectory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border-dim)]/50">
            {/* Historical Track Record (Strict Data Integrity) */}
            <div className="p-3 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-dim)] space-y-1.5">
              <div className="text-[10px] font-hud uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                <Flag size={12} className="text-blue-400" />
                Track History (Last 5 Years)
              </div>
              {pred.trackRecord.isRookieAtTrack ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <Info size={14} className="shrink-0" />
                  <span>Debut Venue: No prior starts recorded at this circuit (Rookie status logged).</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono pt-1">
                  <div className="bg-[var(--bg-overlay)] p-1.5 rounded">
                    <div className="text-[9px] text-[var(--text-muted)]">Starts</div>
                    <div className="font-bold text-[var(--text-primary)]">{pred.trackRecord.starts}</div>
                  </div>
                  <div className="bg-[var(--bg-overlay)] p-1.5 rounded">
                    <div className="text-[9px] text-[var(--text-muted)]">Wins</div>
                    <div className="font-bold text-emerald-400">{pred.trackRecord.wins}</div>
                  </div>
                  <div className="bg-[var(--bg-overlay)] p-1.5 rounded">
                    <div className="text-[9px] text-[var(--text-muted)]">Podiums</div>
                    <div className="font-bold text-amber-400">{pred.trackRecord.podiums}</div>
                  </div>
                  <div className="bg-[var(--bg-overlay)] p-1.5 rounded">
                    <div className="text-[9px] text-[var(--text-muted)]">Avg Fin</div>
                    <div className="font-bold text-[var(--text-primary)]">P{pred.trackRecord.avgFinish}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Chassis Upgrade & Teammate Duel */}
            <div className="p-3 rounded-lg bg-[var(--bg-raised)] border border-[var(--border-dim)] space-y-1.5">
              <div className="text-[10px] font-hud uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-1.5">
                <Wrench size={12} className="text-emerald-400" />
                Chassis Upgrade & Teammate Duel
              </div>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Upgrade Package:</span>
                  <span className="font-semibold text-[var(--text-primary)] truncate max-w-[200px]" title={pred.upgradePackage.name}>
                    {pred.upgradePackage.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Measured Delta:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {pred.upgradePackage.measuredDeltaSec < 0 ? `${pred.upgradePackage.measuredDeltaSec * 1000}ms/lap` : 'Baseline'}
                  </span>
                </div>
                {pred.teammateH2H && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Teammate Duel vs {pred.teammateH2H.teammateName}:</span>
                    <span className="font-mono font-bold text-[var(--text-primary)]">
                      {pred.teammateH2H.raceScore} ({pred.teammateH2H.pointsSplit[0]}% pts)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Audit Trail Sources & Logged Citations */}
          <div className="pt-2 border-t border-[var(--border-dim)]/40 text-[9px] text-[var(--text-muted)] space-y-1">
            <span className="font-hud uppercase tracking-widest font-bold text-[var(--text-secondary)]">
              Audited Data Sources:
            </span>
            <ul className="list-disc list-inside space-y-0.5 font-mono text-[8px] opacity-80">
              {pred.citations.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Track Information Panel ──────────────────────────────────────────────────

function TrackInfoBar({ circuitId }: { circuitId: string }) {
  const track = TRACK_CHARACTERISTICS[circuitId];
  if (!track) return null;

  return (
    <div className="p-3.5 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
      <div>
        <span className="text-[9px] uppercase tracking-wider font-hud text-[var(--text-muted)] block">
          Track Archetype
        </span>
        <span className="font-hud font-bold text-[var(--text-primary)] uppercase">
          {track.type} Circuit
        </span>
      </div>

      <div>
        <span className="text-[9px] uppercase tracking-wider font-hud text-[var(--text-muted)] block">
          Safety Car Prob
        </span>
        <span className="font-mono font-bold text-amber-400">
          {track.safetyCarProbability}% Risk
        </span>
      </div>

      <div>
        <span className="text-[9px] uppercase tracking-wider font-hud text-[var(--text-muted)] block">
          Pole Conversion
        </span>
        <span className="font-mono font-bold text-emerald-400">
          {track.poleToWinConversionRate}% Win Rate
        </span>
      </div>

      <div>
        <span className="text-[9px] uppercase tracking-wider font-hud text-[var(--text-muted)] block">
          Pit Loss Time
        </span>
        <span className="font-mono font-bold text-[var(--text-primary)]">
          {track.pitLossSeconds}s Delta
        </span>
      </div>

      <div>
        <span className="text-[9px] uppercase tracking-wider font-hud text-[var(--text-muted)] block">
          Overtaking Delta
        </span>
        <span className="font-hud font-semibold text-[var(--text-secondary)]">
          {track.overtakingDifficulty} · {track.tyreDegSeverity} Deg
        </span>
      </div>
    </div>
  );
}

// ── Weather Panel ────────────────────────────────────────────────────────────

function WeatherPanel({ weather }: { weather: OpenMeteoWeather }) {
  const rain = weather.precipitationProbability;
  const isWet = rain > 50;
  return (
    <div
      className="flex items-center gap-4 px-4 py-2.5 rounded-xl border flex-wrap text-xs"
      style={{
        backgroundColor: 'var(--bg-raised)',
        borderColor: isWet ? 'rgba(59,155,250,0.40)' : 'var(--border-dim)',
      }}
    >
      <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)] shrink-0">
        Forecast Interval
      </div>
      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        <Thermometer size={12} style={{ color: '#F5B800' }} />
        {weather.airTemperature.toFixed(0)}°C
      </div>
      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        <Wind size={12} style={{ color: '#3B9BFA' }} />
        {weather.windSpeed.toFixed(0)} km/h
      </div>
      <div className="flex items-center gap-1.5 font-mono" style={{ color: isWet ? '#3B9BFA' : 'var(--text-muted)' }}>
        <CloudRain size={12} />
        {Math.max(0, rain - 10)}–{Math.min(100, rain + 15)}% Precip ({rain}% most likely)
      </div>
      {isWet && (
        <span className="px-2 py-0.5 rounded text-[9px] font-hud uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
          Wet race activated in prediction model
        </span>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function PredictionEngine({
  driverStandings,
  nextRace,
  calendar,
}: PredictionEngineProps) {
  const [predictions, setPredictions] = useState<DriverPrediction[]>([]);
  const [weather, setWeather] = useState<OpenMeteoWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCircuitId, setSelectedCircuitId] = useState<string | null>(null);
  const [scenario, setScenario] = useState<PredictionScenario>('baseline');
  const [showAll, setShowAll] = useState(false);

  const targetRace = selectedCircuitId
    ? calendar.find((r) => r.Circuit.circuitId === selectedCircuitId) ?? nextRace
    : nextRace;
  const circuitId = targetRace?.Circuit.circuitId ?? 'baku';

  const runModel = useCallback(async () => {
    if (!targetRace || driverStandings.length === 0) return;
    setLoading(true);
    try {
      const weatherData = await getWeatherForCircuit(
        circuitId,
        targetRace.Circuit.Location.lat,
        targetRace.Circuit.Location.long
      );
      setWeather(weatherData);
      const preds = predictRaceOutcome(
        circuitId,
        targetRace,
        driverStandings,
        weatherData,
        scenario,
        'current'
      );
      setPredictions(preds);
    } finally {
      setLoading(false);
    }
  }, [targetRace, driverStandings, circuitId, scenario]);

  useEffect(() => {
    runModel();
  }, [runModel]);

  const upcomingRaces = calendar.filter((r) => new Date(r.date) >= new Date()).slice(0, 8);
  const visiblePreds = showAll ? predictions : predictions.slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
              Multi-Factor Prediction Engine
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-hud uppercase tracking-wider bg-[var(--red)]/15 text-[var(--red)] border border-[var(--red)]/30 font-bold">
              v3.0 Probabilistic
            </span>
          </div>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Bounded confidence intervals · 5-year track stats · Recency-weighted form · Upgrade trajectory
          </p>
        </div>

        <button
          onClick={runModel}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-hud text-xs font-bold uppercase tracking-wider transition-all duration-150 disabled:opacity-40 shadow-sm"
          style={{ backgroundColor: 'var(--red)', color: '#fff' }}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Simulating…' : 'Re-Run Model'}
        </button>
      </div>

      {/* Prominent Legal & Mathematical Advisory Banner */}
      <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <div className="font-hud font-bold text-amber-300 uppercase tracking-wide">
            Probabilistic Simulation Notice — Strictly Not Financial or Betting Advice
          </div>
          <div className="text-[var(--text-muted)] leading-relaxed">
            This predictive engine computes probabilistic outcome distributions using multi-factor regression over official FIA timing, 5-year track histories, and aerodynamic telemetry. Real Formula 1 events involve high stochastic volatility (turn-one collisions, sudden mechanical retirements, meteorological shifts, and safety car timings).
          </div>
        </div>
      </div>

      {/* Comparison Mode Scenario Simulator Selector */}
      <div className="p-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)] space-y-2">
        <div className="flex items-center justify-between text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
            <Sliders size={13} className="text-[var(--red)]" />
            Comparison Mode & Scenario Simulation
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            Select scenario to observe probability interval shifts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'baseline', label: 'Baseline Model', desc: 'Standard 2026 Telemetry' },
            { id: 'post_quali', label: 'Post-Quali Grid', desc: 'Pole Conversion Weight' },
            { id: 'wet_race', label: 'Wet Race Scenario', desc: '85% Rain & Wet Specialists' },
            { id: 'grid_penalty', label: 'Grid Penalty Stress', desc: 'Simulate 5-Place Drop' },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => setScenario(sc.id as PredictionScenario)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                scenario === sc.id
                  ? 'border-[var(--red)] bg-[var(--bg-card)] shadow-md ring-1 ring-[var(--red)]/40'
                  : 'border-[var(--border-dim)] bg-[var(--bg-overlay)]/40 hover:bg-[var(--bg-card)] text-[var(--text-muted)]'
              }`}
            >
              <div className={`font-hud font-bold text-xs uppercase ${scenario === sc.id ? 'text-[var(--red)]' : 'text-[var(--text-primary)]'}`}>
                {sc.label}
              </div>
              <div className="text-[9px] text-[var(--text-muted)] mt-0.5">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Race selector */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)] mr-1">
          Select Venue:
        </span>
        <button
          onClick={() => setSelectedCircuitId(null)}
          className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-hud border transition-all duration-150 ${
            !selectedCircuitId
              ? 'bg-[var(--red-subtle)] border-[var(--red)] text-[var(--red)] font-bold'
              : 'bg-[var(--bg-raised)] border-[var(--border-dim)] text-[var(--text-muted)]'
          }`}
        >
          Next Race
        </button>
        {upcomingRaces.map((r) => (
          <button
            key={r.Circuit.circuitId}
            onClick={() => setSelectedCircuitId(r.Circuit.circuitId)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-hud border transition-all duration-150 ${
              selectedCircuitId === r.Circuit.circuitId
                ? 'bg-[var(--red-subtle)] border-[var(--red)] text-[var(--red)] font-bold'
                : 'bg-[var(--bg-raised)] border-[var(--border-dim)] text-[var(--text-muted)]'
            }`}
          >
            R{r.round} {r.raceName.replace(' Grand Prix', '')}
          </button>
        ))}
      </div>

      {/* Target race title */}
      {targetRace && (
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)]">
          <div className="w-1.5 h-10 rounded-full bg-[var(--red)]" />
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

      {/* Track Stats + Weather Bar */}
      <div className="space-y-2">
        <TrackInfoBar circuitId={circuitId} />
        {weather && <WeatherPanel weather={weather} />}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--red)] border-t-transparent animate-spin" />
          <span className="text-xs font-hud uppercase tracking-wider text-[var(--text-muted)]">
            Executing Monte-Carlo multi-factor distribution…
          </span>
        </div>
      )}

      {/* Prediction Cards */}
      {!loading && predictions.length > 0 && (
        <div className="space-y-2">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-2 text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)] border-b border-[var(--border-dim)]">
            <div className="w-7 text-center">Pos</div>
            <div style={{ minWidth: '120px' }}>Driver / Shift</div>
            <div className="hidden md:block">Data Quality</div>
            <div className="flex-1 hidden sm:block" style={{ maxWidth: '64px' }}>Form</div>
            <div className="flex gap-4 flex-1 justify-end sm:justify-center">
              <div className="w-[70px] text-center">Win (CI)</div>
              <div className="w-[70px] text-center">Podium (CI)</div>
              <div className="w-[70px] text-center">DNF (CI)</div>
            </div>
            <div className="w-4" />
          </div>

          {visiblePreds.map((pred, i) => (
            <PredictionCard
              key={pred.driverId}
              pred={pred}
              rank={i + 1}
              scenario={scenario}
            />
          ))}

          {!showAll && predictions.length > 10 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3.5 text-xs font-hud uppercase tracking-widest text-[var(--text-primary)] hover:text-[var(--red)] transition-colors border border-[var(--border-dim)] rounded-xl bg-[var(--bg-raised)] font-bold shadow-sm"
            >
              Show all {predictions.length} classified drivers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
