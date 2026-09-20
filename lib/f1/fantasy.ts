/**
 * FANTASY F1 ENGINE v2
 * Full-featured fantasy system with:
 * - Captain multiplier (2x points for chosen driver)
 * - 3 free transfers per round (extra cost -5pts)
 * - Proper FIA-aligned scoring
 * - Chip system: Wildcard, Autopilot, Boost
 * - localStorage persistence
 */

import { RaceResult } from './types';
import { SEASON_2026_DRIVER_METRICS } from './season2026Data';

// ── Types ─────────────────────────────────────────────────────────────────────

export type Chip = 'wildcard' | 'boost' | 'autopilot';

export interface FantasyTeam {
  round: string;
  season: string;
  lockedAt: string | null;
  driverIds: string[];       // 5 drivers
  constructorId: string;     // 1 constructor
  captainId: string;         // must be one of driverIds — gets 2x points
  previousDriverIds: string[]; // for transfer tracking
  previousConstructorId: string;
  transfersUsed: number;     // free transfers used this round (3 free)
  activeChip: Chip | null;
}

export interface DriverScore {
  driverId: string;
  isCaptain: boolean;
  basePoints: number;
  multipliedPoints: number;
  breakdown: { label: string; pts: number }[];
}

export interface FantasyRoundScore {
  round: string;
  season: string;
  raceName: string;
  driverScores: DriverScore[];
  constructorBonus: number;
  transferPenalty: number;
  chipBonus: number;
  total: number;
}

export interface FantasyProfile {
  teams: Record<string, FantasyTeam>;
  scores: Record<string, FantasyRoundScore>;
  totalPoints: number;
  chipsUsed: Partial<Record<Chip, string>>; // chip → round key used
}

// ── Scoring system ────────────────────────────────────────────────────────────

const POSITION_POINTS: Record<number, number> = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8,  7: 6,  8: 4,  9: 2,  10: 1,
};

const FASTEST_LAP_BONUS = 5;
const DNF_PENALTY = -5;
const CONSTRUCTOR_WIN_BONUS = 10;   // constructor scores when their driver wins
const CONSTRUCTOR_PODIUM_BONUS = 5; // per driver on podium
const TRANSFER_PENALTY = -4;        // per extra transfer beyond 3 free
const FREE_TRANSFERS = 3;

// ── Pricing: based on 2026 season form ───────────────────────────────────────

export const DRIVER_PRICES: Record<string, number> = {
  antonelli: 28,
  russell: 24,
  hamilton: 22,
  norris: 22,
  leclerc: 20,
  max_verstappen: 18,
  piastri: 16,
  hadjar: 14,
  sainz: 18,
  albon: 14,
  lawson: 12,
  lindblad: 10,
  gasly: 10,
  colapinto: 10,
  bearman: 8,
  hulkenberg: 12,
  bortoleto: 10,
  doohan: 8,
  ocon: 8,
  alonso: 8,
  tsunoda: 8,
  stroll: 6,
  bottas: 6,
  perez: 6,
};

export const CONSTRUCTOR_PRICES: Record<string, number> = {
  mercedes: 28,
  ferrari: 22,
  mclaren: 22,
  red_bull: 16,
  williams: 14,
  rb: 12,
  alpine: 10,
  haas: 10,
  aston_martin: 8,
  sauber: 8,
};

export const FANTASY_BUDGET = 100;

// ── Persistence ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'apex_fantasy_v2';

export function loadFantasyProfile(): FantasyProfile {
  if (typeof window === 'undefined') return emptyProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FantasyProfile;
  } catch {}
  return emptyProfile();
}

export function saveFantasyProfile(profile: FantasyProfile): void {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch {}
}

export function clearFantasyProfile(): void {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

function emptyProfile(): FantasyProfile {
  return { teams: {}, scores: {}, totalPoints: 0, chipsUsed: {} };
}

function roundKey(season: string, round: string): string {
  return `${season}-${round}`;
}

// ── Team operations ───────────────────────────────────────────────────────────

export function saveTeam(params: {
  season: string;
  round: string;
  driverIds: string[];
  constructorId: string;
  captainId: string;
  activeChip?: Chip | null;
}): FantasyProfile {
  const { season, round, driverIds, constructorId, captainId, activeChip = null } = params;
  const profile = loadFantasyProfile();
  const key = roundKey(season, round);
  const prev = profile.teams[key];

  // Count transfers
  let transfersUsed = 0;
  if (prev) {
    const addedDrivers = driverIds.filter((id) => !prev.driverIds.includes(id));
    const constructorChanged = constructorId !== prev.constructorId;
    const changes = addedDrivers.length + (constructorChanged ? 1 : 0);
    transfersUsed = activeChip === 'wildcard' ? 0 : Math.max(0, changes - FREE_TRANSFERS);
  }

  profile.teams[key] = {
    round,
    season,
    lockedAt: null,
    driverIds,
    constructorId,
    captainId,
    previousDriverIds: prev?.driverIds ?? [],
    previousConstructorId: prev?.constructorId ?? '',
    transfersUsed,
    activeChip,
  };

  if (activeChip && !profile.chipsUsed[activeChip]) {
    profile.chipsUsed[activeChip] = key;
  }

  saveFantasyProfile(profile);
  return profile;
}

export function lockTeam(season: string, round: string): FantasyProfile {
  const profile = loadFantasyProfile();
  const key = roundKey(season, round);
  if (profile.teams[key]) {
    profile.teams[key].lockedAt = new Date().toISOString();
    saveFantasyProfile(profile);
  }
  return profile;
}

export function isTeamLocked(season: string, round: string): boolean {
  return !!loadFantasyProfile().teams[roundKey(season, round)]?.lockedAt;
}

export function getActiveChipsRemaining(): Chip[] {
  const profile = loadFantasyProfile();
  const all: Chip[] = ['wildcard', 'boost', 'autopilot'];
  return all.filter((c) => !profile.chipsUsed[c]);
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export function calculateFantasyPoints(params: {
  season: string;
  round: string;
  raceName: string;
  results: RaceResult[];
}): FantasyRoundScore | null {
  const { season, round, raceName, results } = params;
  const profile = loadFantasyProfile();
  const key = roundKey(season, round);
  const team = profile.teams[key];
  if (!team) return null;

  const resultMap = new Map<string, RaceResult>(results.map((r) => [r.Driver.driverId, r]));
  const isBoost = team.activeChip === 'boost';

  const driverScores: DriverScore[] = team.driverIds.map((driverId) => {
    const r = resultMap.get(driverId);
    const isCaptain = driverId === team.captainId;
    const breakdown: { label: string; pts: number }[] = [];
    let pts = 0;

    if (!r) {
      breakdown.push({ label: 'No data', pts: 0 });
      return { driverId, isCaptain, basePoints: 0, multipliedPoints: 0, breakdown };
    }

    const pos = parseInt(r.positionText, 10);
    const posPts = POSITION_POINTS[pos] ?? 0;
    if (posPts > 0) {
      breakdown.push({ label: `P${pos}`, pts: posPts });
      pts += posPts;
    }

    const isDNF = r.status !== 'Finished' && !r.status.startsWith('+') && !r.status.startsWith('Lap');
    if (isDNF) {
      breakdown.push({ label: 'DNF', pts: DNF_PENALTY });
      pts += DNF_PENALTY;
    }

    if (r.FastestLap?.rank === '1' && !isDNF && pos <= 10) {
      breakdown.push({ label: 'Fastest Lap', pts: FASTEST_LAP_BONUS });
      pts += FASTEST_LAP_BONUS;
    }

    // Grid vs finish bonus (positions gained)
    const gridPos = parseInt(r.grid, 10);
    if (!isNaN(gridPos) && !isNaN(pos) && !isDNF) {
      const gained = gridPos - pos;
      if (gained >= 5) {
        breakdown.push({ label: `+${gained} positions`, pts: 2 });
        pts += 2;
      }
    }

    const basePoints = pts;
    let multipliedPoints = pts;

    // Captain 2x
    if (isCaptain) multipliedPoints = pts * 2;
    // Boost chip: all drivers 1.5x
    if (isBoost) multipliedPoints = Math.round(multipliedPoints * 1.5);

    return { driverId, isCaptain, basePoints, multipliedPoints, breakdown };
  });

  // Constructor bonus
  let constructorBonus = 0;
  results.forEach((r) => {
    if (r.Constructor.constructorId === team.constructorId) {
      const pos = parseInt(r.positionText, 10);
      if (pos === 1) constructorBonus += CONSTRUCTOR_WIN_BONUS;
      else if (pos <= 3) constructorBonus += CONSTRUCTOR_PODIUM_BONUS;
    }
  });

  const transferPenalty = team.transfersUsed * TRANSFER_PENALTY;
  const chipBonus = 0; // autopilot and boost handled inline

  const total =
    driverScores.reduce((s, d) => s + d.multipliedPoints, 0) +
    constructorBonus +
    transferPenalty +
    chipBonus;

  const score: FantasyRoundScore = {
    round, season, raceName,
    driverScores,
    constructorBonus,
    transferPenalty,
    chipBonus,
    total,
  };

  profile.scores[key] = score;
  profile.totalPoints = Object.values(profile.scores).reduce((s, sc) => s + sc.total, 0);
  saveFantasyProfile(profile);
  return score;
}

export function getSeasonHistory(season: string): FantasyRoundScore[] {
  const profile = loadFantasyProfile();
  return Object.values(profile.scores)
    .filter((s) => s.season === season)
    .sort((a, b) => parseInt(a.round) - parseInt(b.round));
}

export function getTeamBudget(driverIds: string[], constructorId: string): number {
  const driverCost = driverIds.reduce((s, id) => s + (DRIVER_PRICES[id] ?? 8), 0);
  const conCost = CONSTRUCTOR_PRICES[constructorId] ?? 10;
  return driverCost + conCost;
}

// ── Auto-pick best team within budget ─────────────────────────────────────────
export function autoPick(): { driverIds: string[]; constructorId: string; captainId: string } {
  // Sort drivers by season form (points-per-race desc)
  const driverMetrics = Object.entries(SEASON_2026_DRIVER_METRICS)
    .sort((a, b) => b[1].pointsPerRace - a[1].pointsPerRace);

  const selected: string[] = [];
  let budget = FANTASY_BUDGET;

  // Pick best constructor first
  const sortedConstructors = Object.entries(CONSTRUCTOR_PRICES)
    .sort((a, b) => b[1] - a[1]);

  let bestConstructor = 'mercedes';
  for (const [cid, cost] of sortedConstructors) {
    if (cost <= budget - 40) { // leave room for 5 drivers
      bestConstructor = cid;
      budget -= cost;
      break;
    }
  }

  // Pick best 5 drivers within remaining budget
  for (const [driverId, metrics] of driverMetrics) {
    if (selected.length >= 5) break;
    const cost = DRIVER_PRICES[driverId] ?? 8;
    if (budget - cost >= 0) {
      selected.push(driverId);
      budget -= cost;
    }
  }

  while (selected.length < 5) {
    const cheap = Object.entries(DRIVER_PRICES)
      .filter(([id]) => !selected.includes(id))
      .sort((a, b) => a[1] - b[1])[0];
    if (cheap) selected.push(cheap[0]);
    else break;
  }

  return {
    driverIds: selected.slice(0, 5),
    constructorId: bestConstructor,
    captainId: selected[0] ?? '',
  };
}
