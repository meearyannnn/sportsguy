'use client';

import React, { useState, useEffect } from 'react';
import {
  loadFantasyProfile,
  saveTeam,
  calculateFantasyPoints,
  getSeasonHistory,
  isTeamLocked,
  getTeamBudget,
  getActiveChipsRemaining,
  autoPick,
  clearFantasyProfile,
  DRIVER_PRICES,
  CONSTRUCTOR_PRICES,
  FANTASY_BUDGET,
  FantasyRoundScore,
  DriverScore,
  Chip,
} from '@/lib/f1/fantasy';
import { DriverStanding, ConstructorStanding, Race, RaceResult } from '@/lib/f1/types';
import { DRIVER_DETAILS, F1_TEAMS, getTeamMeta } from '@/lib/f1/teams';
import { getSeason2026Metrics } from '@/lib/f1/season2026Data';
import { Lock, Unlock, Trophy, Star, Zap, RefreshCw, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface FantasyModeProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  calendar: Race[];
  recentRace: Race | null;
  raceResults: RaceResult[];
  selectedSeason: string;
  selectedRound: string;
}

// ── Budget bar ────────────────────────────────────────────────────────────────

function BudgetBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const over = used > total;
  const color = over ? '#E10600' : pct > 85 ? '#F5B800' : '#10E070';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">Budget</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {used}M <span className="text-[var(--text-muted)] font-normal">/ {total}M</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      {over && (
        <p className="text-[9px] text-red-400 font-hud uppercase tracking-wider">
          Over budget by {used - total}M
        </p>
      )}
    </div>
  );
}

// ── Driver list item ──────────────────────────────────────────────────────────

function DriverRow({
  driverId,
  standing,
  selected,
  isCaptain,
  onToggle,
  onSetCaptain,
  disabled,
}: {
  driverId: string;
  standing?: DriverStanding;
  selected: boolean;
  isCaptain: boolean;
  onToggle: () => void;
  onSetCaptain: () => void;
  disabled: boolean;
}) {
  const detail = DRIVER_DETAILS[driverId];
  const team = detail ? getTeamMeta(detail.teamId) : null;
  const metrics = getSeason2026Metrics(driverId);
  const cost = DRIVER_PRICES[driverId] ?? 8;

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-150 ${disabled && !selected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        backgroundColor: selected ? `${team?.color ?? '#E10600'}12` : 'var(--bg-raised)',
        borderColor: selected ? (team?.color ?? 'var(--red)') : 'var(--border-dim)',
      }}
      onClick={() => !disabled || selected ? onToggle() : undefined}
    >
      {/* Team bar */}
      <span className="w-0.5 h-8 rounded-full shrink-0" style={{ backgroundColor: team?.color ?? '#888' }} />

      {/* Driver info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-hud text-xs font-black uppercase tracking-wide text-[var(--text-primary)]">
            {detail?.code ?? driverId.toUpperCase()}
          </span>
          {isCaptain && selected && (
            <span
              className="text-[8px] font-hud uppercase tracking-wider px-1 py-0.5 rounded"
              style={{ backgroundColor: '#F5B80020', color: '#F5B800' }}
            >
              2x
            </span>
          )}
        </div>
        <div className="text-[9px] text-[var(--text-muted)] truncate">
          {team?.name ?? ''} · {metrics ? `${metrics.pointsPerRace.toFixed(1)} pts/race` : `P${standing?.position ?? '—'}`}
        </div>
      </div>

      {/* Form dots (last 5) */}
      {metrics?.last5Races && (
        <div className="hidden sm:flex items-center gap-0.5">
          {metrics.last5Races.slice(0, 5).map((r, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: r.isDNF ? '#E10600' : r.isPodium ? (team?.color ?? '#10E070') : r.isPoints ? '#ffffff30' : '#ffffff10',
              }}
              title={r.isDNF ? `DNF — ${r.raceName}` : `P${r.finishPos} — ${r.raceName}`}
            />
          ))}
        </div>
      )}

      {/* Captain button (only when selected) */}
      {selected && (
        <button
          onClick={(e) => { e.stopPropagation(); onSetCaptain(); }}
          className="p-1 rounded transition-all duration-150 shrink-0"
          style={{
            backgroundColor: isCaptain ? '#F5B80020' : 'transparent',
            color: isCaptain ? '#F5B800' : 'var(--text-muted)',
          }}
          title="Set as captain (2x points)"
        >
          <Star size={11} fill={isCaptain ? '#F5B800' : 'none'} />
        </button>
      )}

      {/* Price */}
      <div
        className="font-mono text-xs font-bold shrink-0 w-8 text-right"
        style={{ color: selected ? (team?.color ?? 'var(--red)') : 'var(--text-muted)' }}
      >
        {cost}M
      </div>
    </div>
  );
}

// ── Constructor row ───────────────────────────────────────────────────────────

function ConstructorRow({
  constructorId,
  standing,
  selected,
  onSelect,
}: {
  constructorId: string;
  standing?: ConstructorStanding;
  selected: boolean;
  onSelect: () => void;
}) {
  const team = F1_TEAMS[constructorId];
  const cost = CONSTRUCTOR_PRICES[constructorId] ?? 10;
  if (!team) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-150"
      style={{
        backgroundColor: selected ? `${team.color}12` : 'var(--bg-raised)',
        borderColor: selected ? team.color : 'var(--border-dim)',
        boxShadow: selected ? `0 0 12px ${team.color}15` : 'none',
      }}
      onClick={onSelect}
    >
      <span className="w-0.5 h-7 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
      <div className="flex-1 min-w-0">
        <div className="font-hud text-xs font-black uppercase tracking-wide text-[var(--text-primary)]">{team.name}</div>
        <div className="text-[9px] text-[var(--text-muted)]">{team.powerUnit} · P{standing?.position ?? '—'} · {standing?.points ?? '0'} pts</div>
      </div>
      <div className="font-mono text-xs font-bold shrink-0" style={{ color: selected ? team.color : 'var(--text-muted)' }}>
        {cost}M
      </div>
    </div>
  );
}

// ── Chip button ───────────────────────────────────────────────────────────────

const CHIP_META: Record<Chip, { label: string; desc: string; color: string }> = {
  wildcard: { label: 'Wildcard', desc: 'Unlimited free transfers this round', color: '#9B5FFA' },
  boost: { label: 'Boost', desc: 'All drivers score 1.5x points', color: '#F5B800' },
  autopilot: { label: 'Autopilot', desc: 'Auto-selects best available team', color: '#10E070' },
};

function ChipButton({
  chip,
  active,
  available,
  onActivate,
}: {
  chip: Chip;
  active: boolean;
  available: boolean;
  onActivate: () => void;
}) {
  const meta = CHIP_META[chip];
  return (
    <button
      onClick={onActivate}
      disabled={!available}
      className="flex-1 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        backgroundColor: active ? `${meta.color}18` : 'var(--bg-raised)',
        borderColor: active ? meta.color : 'var(--border-dim)',
        boxShadow: active ? `0 0 16px ${meta.color}20` : 'none',
      }}
    >
      <div className="font-hud text-xs font-black uppercase tracking-wider" style={{ color: active ? meta.color : 'var(--text-secondary)' }}>
        {meta.label}
      </div>
      <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{meta.desc}</div>
      {!available && (
        <div className="text-[8px] font-hud uppercase tracking-wider mt-1 text-[var(--text-muted)]">Used</div>
      )}
    </button>
  );
}

// ── Round score card ──────────────────────────────────────────────────────────

function RoundScoreCard({ score }: { score: FantasyRoundScore }) {
  const [exp, setExp] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden cursor-pointer transition-all duration-150"
      style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
      onClick={() => setExp((e) => !e)}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1">
          <div className="font-hud text-xs font-bold uppercase text-[var(--text-primary)]">
            R{score.round} — {score.raceName.replace(' Grand Prix', ' GP')}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {score.constructorBonus > 0 && (
              <span className="text-[9px] font-hud uppercase tracking-wider text-amber-400">
                +{score.constructorBonus} team
              </span>
            )}
            {score.transferPenalty < 0 && (
              <span className="text-[9px] font-hud uppercase tracking-wider text-red-400">
                {score.transferPenalty} transfers
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-2xl font-black text-[var(--text-primary)]">{score.total}</span>
          <span className="text-[9px] text-[var(--text-muted)] font-hud uppercase">pts</span>
          {exp ? <ChevronUp size={12} className="text-[var(--text-muted)]" /> : <ChevronDown size={12} className="text-[var(--text-muted)]" />}
        </div>
      </div>

      {exp && (
        <div className="px-4 pb-3 border-t border-[var(--border-dim)] pt-3 space-y-1.5">
          {score.driverScores.map((ds: DriverScore) => {
            const detail = DRIVER_DETAILS[ds.driverId];
            const team = detail ? getTeamMeta(detail.teamId) : null;
            return (
              <div key={ds.driverId} className="flex items-center gap-3">
                <span className="w-0.5 h-4 rounded-full shrink-0" style={{ backgroundColor: team?.color ?? '#888' }} />
                <span className="text-[10px] font-hud uppercase tracking-wide text-[var(--text-secondary)] w-10">
                  {detail?.code ?? ds.driverId}
                </span>
                {ds.isCaptain && <Star size={8} className="text-amber-400" fill="#F5B800" />}
                <div className="flex gap-1 flex-1 flex-wrap">
                  {ds.breakdown.map((b, i) => (
                    <span key={i} className="text-[9px] font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-overlay)', color: b.pts >= 0 ? 'var(--text-secondary)' : '#E10600' }}>
                      {b.label}: {b.pts > 0 ? '+' : ''}{b.pts}
                    </span>
                  ))}
                </div>
                <span className="font-mono text-xs font-bold text-[var(--text-primary)] w-8 text-right">
                  {ds.multipliedPoints > 0 ? '+' : ''}{ds.multipliedPoints}
                </span>
              </div>
            );
          })}
          {score.constructorBonus > 0 && (
            <div className="flex items-center gap-3 pt-1 border-t border-[var(--border-dim)] mt-1">
              <span className="text-[10px] font-hud uppercase tracking-wide text-amber-400">Constructor bonus</span>
              <span className="ml-auto font-mono text-xs font-bold text-amber-400">+{score.constructorBonus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'team' | 'scores' | 'chips' | 'rules';

const SCORING_TABLE = [
  { event: '1st Place', pts: 25 }, { event: '2nd', pts: 18 },
  { event: '3rd', pts: 15 }, { event: '4th', pts: 12 },
  { event: '5th', pts: 10 }, { event: '6th', pts: 8 },
  { event: '7th', pts: 6 }, { event: '8th', pts: 4 },
  { event: '9th', pts: 2 }, { event: '10th', pts: 1 },
  { event: 'Fastest Lap (top 10)', pts: 5 },
  { event: '+5 positions gained', pts: 2 },
  { event: 'DNF', pts: -5 },
  { event: 'Captain bonus', pts: '×2' },
  { event: 'Constructor win', pts: 10 },
  { event: 'Constructor podium', pts: 5 },
  { event: 'Extra transfer (per)', pts: -4 },
];

export default function FantasyMode({
  driverStandings,
  constructorStandings,
  calendar,
  recentRace,
  raceResults,
  selectedSeason,
  selectedRound,
}: FantasyModeProps) {
  const [tab, setTab] = useState<Tab>('team');
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [selectedConstructorId, setSelectedConstructorId] = useState<string>('');
  const [captainId, setCaptainId] = useState<string>('');
  const [activeChip, setActiveChip] = useState<Chip | null>(null);
  const [saved, setSaved] = useState(false);
  const [scored, setScored] = useState(false);
  const [history, setHistory] = useState<FantasyRoundScore[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [chipsAvailable, setChipsAvailable] = useState<Chip[]>([]);
  const [showDrivers, setShowDrivers] = useState(true);
  const [driverSort, setDriverSort] = useState<'price' | 'form' | 'pts'>('form');

  const season = selectedSeason === 'current' ? '2026' : selectedSeason;
  const locked = isTeamLocked(season, selectedRound);

  useEffect(() => {
    const profile = loadFantasyProfile();
    const key = `${season}-${selectedRound}`;
    const team = profile.teams[key];
    if (team) {
      setSelectedDriverIds(team.driverIds);
      setSelectedConstructorId(team.constructorId);
      setCaptainId(team.captainId);
      setActiveChip(team.activeChip);
    }
    setHistory(getSeasonHistory(season));
    setTotalPoints(profile.totalPoints);
    setChipsAvailable(getActiveChipsRemaining());
  }, [season, selectedRound]);

  const usedBudget = getTeamBudget(selectedDriverIds, selectedConstructorId);
  const isValid = selectedDriverIds.length === 5 && selectedConstructorId && usedBudget <= FANTASY_BUDGET && captainId && selectedDriverIds.includes(captainId);

  const handleDriverToggle = (id: string) => {
    if (locked) return;
    setSelectedDriverIds((prev) => {
      if (prev.includes(id)) {
        if (captainId === id) setCaptainId(prev.find((d) => d !== id) ?? '');
        return prev.filter((d) => d !== id);
      }
      if (prev.length >= 5) return prev;
      if (!captainId) setCaptainId(id);
      return [...prev, id];
    });
    setSaved(false);
  };

  const handleSave = () => {
    if (!isValid) return;
    saveTeam({ season, round: selectedRound, driverIds: selectedDriverIds, constructorId: selectedConstructorId, captainId, activeChip });
    setSaved(true);
    setChipsAvailable(getActiveChipsRemaining());
  };

  const handleAutoPick = () => {
    if (locked) return;
    const pick = autoPick();
    setSelectedDriverIds(pick.driverIds);
    setSelectedConstructorId(pick.constructorId);
    setCaptainId(pick.captainId);
    setSaved(false);
  };

  const handleScore = () => {
    if (!raceResults.length || !recentRace) return;
    const score = calculateFantasyPoints({ season, round: selectedRound, raceName: recentRace.raceName, results: raceResults });
    if (score) {
      const p = loadFantasyProfile();
      setHistory(getSeasonHistory(season));
      setTotalPoints(p.totalPoints);
      setScored(true);
      setTab('scores');
    }
  };

  const handleClear = () => {
    if (confirm('Clear all fantasy data? This cannot be undone.')) {
      clearFantasyProfile();
      setSelectedDriverIds([]);
      setSelectedConstructorId('');
      setCaptainId('');
      setHistory([]);
      setTotalPoints(0);
      setChipsAvailable(['wildcard', 'boost', 'autopilot']);
    }
  };

  // Sort drivers
  const allDriverIds = driverStandings.map((ds) => ds.Driver.driverId);
  const sortedDriverIds = [...allDriverIds].sort((a, b) => {
    if (driverSort === 'price') return (DRIVER_PRICES[b] ?? 0) - (DRIVER_PRICES[a] ?? 0);
    if (driverSort === 'pts') {
      const aP = parseFloat(driverStandings.find((ds) => ds.Driver.driverId === a)?.points ?? '0');
      const bP = parseFloat(driverStandings.find((ds) => ds.Driver.driverId === b)?.points ?? '0');
      return bP - aP;
    }
    // form: sort by pointsPerRace
    const aM = getSeason2026Metrics(a);
    const bM = getSeason2026Metrics(b);
    return (bM?.pointsPerRace ?? 0) - (aM?.pointsPerRace ?? 0);
  });

  const cumHistory = history.reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-hud text-2xl font-black uppercase tracking-tight text-[var(--text-primary)]">
            Fantasy F1
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {season} Season · Round {selectedRound} · {locked ? 'Locked' : 'Open for selection'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-2xl font-black text-[var(--text-primary)]">{totalPoints}</div>
            <div className="text-[9px] font-hud uppercase tracking-widest text-[var(--text-muted)]">Total pts</div>
          </div>
          <div className="flex items-center gap-1.5">
            {locked
              ? <Lock size={12} className="text-amber-400" />
              : <Unlock size={12} className="text-green-400" />
            }
            <span className="text-[9px] font-hud uppercase tracking-wider text-[var(--text-muted)]">
              {locked ? 'Locked' : 'Open'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-dim)] gap-0">
        {(['team', 'scores', 'chips', 'rules'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2.5 text-[10px] uppercase tracking-widest font-hud font-bold border-b-2 -mb-px transition-all duration-150"
            style={{
              borderColor: tab === t ? 'var(--red)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── TEAM TAB ── */}
      {tab === 'team' && (
        <div className="space-y-6">
          <BudgetBar used={usedBudget} total={FANTASY_BUDGET} />

          {/* Selected team preview */}
          <div
            className="rounded-xl border px-4 py-3"
            style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                Your team ({selectedDriverIds.length}/5 drivers)
              </div>
              <button
                onClick={handleAutoPick}
                className="flex items-center gap-1 text-[9px] font-hud uppercase tracking-widest px-2 py-1 rounded border border-[var(--border-dim)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-mid)] transition-colors"
              >
                <RefreshCw size={9} />
                Auto Pick
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {selectedDriverIds.length === 0 ? (
                <div className="text-xs text-[var(--text-muted)] italic">Select 5 drivers below</div>
              ) : (
                selectedDriverIds.map((id) => {
                  const detail = DRIVER_DETAILS[id];
                  const team = detail ? getTeamMeta(detail.teamId) : null;
                  const isCapt = id === captainId;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: `${team?.color ?? '#888'}15`,
                        border: `1px solid ${team?.color ?? '#888'}${isCapt ? '' : '50'}`,
                      }}
                    >
                      <span className="font-hud text-xs font-black uppercase" style={{ color: team?.color }}>
                        {detail?.code ?? id.toUpperCase()}
                      </span>
                      {isCapt && <Star size={9} fill="#F5B800" className="text-amber-400" />}
                    </div>
                  );
                })
              )}
              {selectedConstructorId && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{
                    backgroundColor: `${F1_TEAMS[selectedConstructorId]?.color ?? '#888'}15`,
                    border: `1px solid ${F1_TEAMS[selectedConstructorId]?.color ?? '#888'}50`,
                  }}
                >
                  <span className="text-[9px] font-hud uppercase tracking-wider text-[var(--text-muted)]">TEAM</span>
                  <span className="font-hud text-xs font-black uppercase" style={{ color: F1_TEAMS[selectedConstructorId]?.color }}>
                    {F1_TEAMS[selectedConstructorId]?.name ?? selectedConstructorId}
                  </span>
                </div>
              )}
            </div>
            <div className="text-[9px] text-[var(--text-muted)] mt-2 italic">
              Tap the star on a driver to set captain (2x points)
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={!isValid || locked}
              className="flex-1 py-3 rounded-xl font-hud text-sm font-bold uppercase tracking-wide transition-all duration-150 disabled:opacity-30"
              style={{ backgroundColor: saved ? 'var(--green)' : 'var(--red)', color: saved ? '#0B0B0E' : '#fff' }}
            >
              {saved ? 'Saved' : 'Save Team'}
            </button>
            {raceResults.length > 0 && !scored && (
              <button
                onClick={handleScore}
                className="flex-1 py-3 rounded-xl border font-hud text-sm font-bold uppercase tracking-wide transition-all duration-150"
                style={{ borderColor: 'var(--border-mid)', color: 'var(--text-secondary)' }}
              >
                Score Last Race
              </button>
            )}
            <button
              onClick={handleClear}
              className="p-3 rounded-xl border border-[var(--border-dim)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/40 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Driver sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">Sort by</span>
            {(['form', 'price', 'pts'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setDriverSort(s)}
                className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-hud rounded border transition-all"
                style={{
                  backgroundColor: driverSort === s ? 'var(--red-subtle)' : 'var(--bg-raised)',
                  borderColor: driverSort === s ? 'var(--red)' : 'var(--border-dim)',
                  color: driverSort === s ? 'var(--red)' : 'var(--text-muted)',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Drivers */}
            <div className="space-y-1.5">
              <button
                onClick={() => setShowDrivers((v) => !v)}
                className="flex items-center justify-between w-full"
              >
                <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                  Drivers — {selectedDriverIds.length}/5
                </div>
                {showDrivers ? <ChevronUp size={12} className="text-[var(--text-muted)]" /> : <ChevronDown size={12} className="text-[var(--text-muted)]" />}
              </button>
              {showDrivers && (
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {sortedDriverIds.map((id) => (
                    <DriverRow
                      key={id}
                      driverId={id}
                      standing={driverStandings.find((ds) => ds.Driver.driverId === id)}
                      selected={selectedDriverIds.includes(id)}
                      isCaptain={captainId === id}
                      onToggle={() => handleDriverToggle(id)}
                      onSetCaptain={() => setCaptainId(id)}
                      disabled={selectedDriverIds.length >= 5}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Constructors */}
            <div className="space-y-1.5">
              <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)]">Constructor</div>
              <div className="space-y-1">
                {constructorStandings.map((cs) => (
                  <ConstructorRow
                    key={cs.Constructor.constructorId}
                    constructorId={cs.Constructor.constructorId}
                    standing={cs}
                    selected={selectedConstructorId === cs.Constructor.constructorId}
                    onSelect={() => { if (!locked) { setSelectedConstructorId(cs.Constructor.constructorId); setSaved(false); } }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCORES TAB ── */}
      {tab === 'scores' && (
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[var(--text-muted)]">
              <Trophy size={32} className="opacity-20" />
              <p className="text-sm text-center">No scores yet. Save a team and click "Score Last Race" after a race weekend.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-[10px] uppercase tracking-widest font-hud text-[var(--text-muted)]">
                  {history.length} rounds · Season total
                </div>
                <div className="font-display text-3xl font-black text-[var(--text-primary)]">{cumHistory} pts</div>
              </div>

              {/* Points trend */}
              <div className="rounded-xl border px-4 py-3" style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}>
                <div className="text-[9px] uppercase tracking-widest font-hud text-[var(--text-muted)] mb-3">Points per round</div>
                <div className="flex items-end gap-1 h-16">
                  {history.map((s, i) => {
                    const maxPts = Math.max(...history.map((h) => h.total), 1);
                    const heightPct = Math.max(8, (s.total / maxPts) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-sm transition-all duration-700"
                          style={{ height: `${heightPct}%`, backgroundColor: s.total >= 0 ? 'var(--red)' : '#E1060050', minWidth: '8px' }}
                          title={`R${s.round}: ${s.total} pts`}
                        />
                        <span className="text-[8px] font-mono text-[var(--text-muted)]">{s.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {[...history].reverse().map((score) => (
                <RoundScoreCard key={`${score.season}-${score.round}`} score={score} />
              ))}
            </>
          )}
        </div>
      )}

      {/* ── CHIPS TAB ── */}
      {tab === 'chips' && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            Each chip can only be used once per season. Activate before saving your team.
          </p>
          <div className="flex gap-3 flex-col sm:flex-row">
            {(['wildcard', 'boost', 'autopilot'] as Chip[]).map((chip) => (
              <ChipButton
                key={chip}
                chip={chip}
                active={activeChip === chip}
                available={chipsAvailable.includes(chip)}
                onActivate={() => {
                  setActiveChip((prev) => prev === chip ? null : chip);
                  if (chip === 'autopilot') handleAutoPick();
                }}
              />
            ))}
          </div>
          {activeChip && (
            <div className="px-4 py-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)]">
              <p className="text-xs text-[var(--text-secondary)]">
                <span className="font-hud uppercase tracking-wider font-bold text-[var(--text-primary)]">{CHIP_META[activeChip].label}</span>
                {' '}chip active — save your team to lock it in.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── RULES TAB ── */}
      {tab === 'rules' && (
        <div className="space-y-4">
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-raised)', borderColor: 'var(--border-dim)' }}>
            {SCORING_TABLE.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border-dim)] last:border-0"
              >
                <span className="text-xs text-[var(--text-secondary)]">{row.event}</span>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: typeof row.pts === 'number' && row.pts < 0 ? '#E10600' : 'var(--text-primary)' }}
                >
                  {typeof row.pts === 'number' && row.pts > 0 ? '+' : ''}{row.pts} pts
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {[
              ['Budget', `${FANTASY_BUDGET}M total — 5 drivers + 1 constructor`],
              ['Transfers', `${3} free per round — extra cost 4pts each`],
              ['Captain', '1 driver earns 2× points — choose wisely'],
              ['Chips', 'Wildcard (unlimited transfers), Boost (1.5× all), Autopilot (auto-team) — once each per season'],
            ].map(([title, desc]) => (
              <div key={title} className="px-4 py-3 rounded-xl border border-[var(--border-dim)] bg-[var(--bg-raised)]">
                <div className="text-[10px] font-hud uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{title}</div>
                <div className="text-xs text-[var(--text-secondary)]">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
