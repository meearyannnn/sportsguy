/**
 * RACE PREDICTION ENGINE v2
 * Data-driven model using real 2026 season metrics + historical Jolpica circuit records + OpenMeteo weather.
 * Antonelli leads the championship (292pts, 8 wins) so the model will correctly reflect that.
 */

import { DriverStanding, Race } from './types';
import { OpenMeteoWeather } from './openmeteo';
import { SEASON_2026_DRIVER_METRICS, getSeason2026Metrics } from './season2026Data';

export interface DriverPrediction {
  driverId: string;
  driverCode: string;
  driverName: string;
  constructorId: string;
  constructorName: string;
  winProbability: number;
  podiumProbability: number;
  dnfRisk: number;
  confidenceScore: number;
  formRating: number;        // 0-100 based on last 5 races
  qualifyingStrength: number; // 0-100 based on season poles + avg grid
  raceStrength: number;      // 0-100 based on avg finish + wins
  factors: PredictionFactor[];
  formBar: { pos: number; raceName: string; isDNF: boolean }[];  // last 5 races
}

export interface PredictionFactor {
  label: string;
  impact: 'positive' | 'negative' | 'neutral';
  detail: string;
}

// ── Circuit archetype definitions ──────────────────────────────────────────────
// These define which car/driver profiles benefit at each circuit
export interface CircuitProfile {
  circuitId: string;
  name: string;
  type: 'street' | 'power' | 'technical' | 'downforce' | 'balanced';
  overtakingDifficulty: 'low' | 'medium' | 'high';
  tyreDegradation: 'low' | 'medium' | 'high';
  // Which teams historically dominate here (2020–2025 data)
  teamAffinities: Record<string, number>; // constructorId → advantage multiplier (1.0 = neutral)
}

export const CIRCUIT_PROFILES: Record<string, CircuitProfile> = {
  baku: {
    circuitId: 'baku',
    name: 'Baku City Circuit',
    type: 'street',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'medium',
    teamAffinities: { ferrari: 1.12, mercedes: 1.08, red_bull: 1.05, mclaren: 0.95, aston_martin: 0.92 },
  },
  marina_bay: {
    circuitId: 'marina_bay',
    name: 'Marina Bay Street Circuit',
    type: 'street',
    overtakingDifficulty: 'low',
    tyreDegradation: 'high',
    teamAffinities: { ferrari: 1.10, mercedes: 1.05, red_bull: 1.02, mclaren: 0.98 },
  },
  monza: {
    circuitId: 'monza',
    name: 'Autodromo Nazionale Monza',
    type: 'power',
    overtakingDifficulty: 'high',
    tyreDegradation: 'low',
    teamAffinities: { ferrari: 1.18, mercedes: 1.10, mclaren: 1.05, red_bull: 0.95 },
  },
  silverstone: {
    circuitId: 'silverstone',
    name: 'Silverstone Circuit',
    type: 'balanced',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'medium',
    teamAffinities: { mercedes: 1.12, mclaren: 1.08, ferrari: 1.05, red_bull: 1.02 },
  },
  spa: {
    circuitId: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    type: 'power',
    overtakingDifficulty: 'high',
    tyreDegradation: 'medium',
    teamAffinities: { ferrari: 1.08, mercedes: 1.06, red_bull: 1.04, mclaren: 1.03 },
  },
  hungaroring: {
    circuitId: 'hungaroring',
    name: 'Hungaroring',
    type: 'downforce',
    overtakingDifficulty: 'low',
    tyreDegradation: 'high',
    teamAffinities: { mercedes: 1.10, ferrari: 1.06, mclaren: 1.04, red_bull: 0.98 },
  },
  zandvoort: {
    circuitId: 'zandvoort',
    name: 'Circuit Zandvoort',
    type: 'downforce',
    overtakingDifficulty: 'low',
    tyreDegradation: 'high',
    teamAffinities: { red_bull: 1.15, mercedes: 1.03, ferrari: 1.00, mclaren: 0.98 },
  },
  monaco: {
    circuitId: 'monaco',
    name: 'Circuit de Monaco',
    type: 'street',
    overtakingDifficulty: 'low',
    tyreDegradation: 'low',
    teamAffinities: { ferrari: 1.10, mercedes: 1.04, red_bull: 1.02, mclaren: 0.98 },
  },
  americas: {
    circuitId: 'americas',
    name: 'Circuit of The Americas',
    type: 'technical',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'high',
    teamAffinities: { mercedes: 1.10, ferrari: 1.05, red_bull: 1.04, mclaren: 1.02 },
  },
  interlagos: {
    circuitId: 'interlagos',
    name: 'Autodromo José Carlos Pace',
    type: 'balanced',
    overtakingDifficulty: 'high',
    tyreDegradation: 'medium',
    teamAffinities: { mercedes: 1.08, ferrari: 1.06, red_bull: 1.05, mclaren: 1.03 },
  },
  albert_park: {
    circuitId: 'albert_park',
    name: 'Albert Park Circuit',
    type: 'street',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'medium',
    teamAffinities: { ferrari: 1.08, mercedes: 1.06, mclaren: 1.05, red_bull: 1.02 },
  },
  red_bull_ring: {
    circuitId: 'red_bull_ring',
    name: 'Red Bull Ring',
    type: 'power',
    overtakingDifficulty: 'high',
    tyreDegradation: 'medium',
    teamAffinities: { red_bull: 1.15, ferrari: 1.05, mercedes: 1.03, mclaren: 1.02 },
  },
  losail: {
    circuitId: 'losail',
    name: 'Losail International Circuit',
    type: 'balanced',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'high',
    teamAffinities: { mercedes: 1.08, ferrari: 1.05, red_bull: 1.04, mclaren: 1.03 },
  },
  villeneuve: {
    circuitId: 'villeneuve',
    name: 'Circuit Gilles-Villeneuve',
    type: 'power',
    overtakingDifficulty: 'high',
    tyreDegradation: 'low',
    teamAffinities: { ferrari: 1.08, mercedes: 1.06, red_bull: 1.02, mclaren: 1.05 },
  },
  jeddah: {
    circuitId: 'jeddah',
    name: 'Jeddah Corniche Circuit',
    type: 'street',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'medium',
    teamAffinities: { ferrari: 1.08, mercedes: 1.06, red_bull: 1.04, mclaren: 0.98 },
  },
  bahrain: {
    circuitId: 'bahrain',
    name: 'Bahrain International Circuit',
    type: 'balanced',
    overtakingDifficulty: 'high',
    tyreDegradation: 'high',
    teamAffinities: { ferrari: 1.06, mercedes: 1.05, red_bull: 1.04, mclaren: 1.03 },
  },
  suzuka: {
    circuitId: 'suzuka',
    name: 'Suzuka International Racing Course',
    type: 'technical',
    overtakingDifficulty: 'low',
    tyreDegradation: 'medium',
    teamAffinities: { red_bull: 1.10, mercedes: 1.06, ferrari: 1.04, mclaren: 1.03 },
  },
  miami: {
    circuitId: 'miami',
    name: 'Miami International Autodrome',
    type: 'street',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'medium',
    teamAffinities: { mercedes: 1.05, ferrari: 1.04, red_bull: 1.03, mclaren: 1.08 },
  },
  yas_marina: {
    circuitId: 'yas_marina',
    name: 'Yas Marina Circuit',
    type: 'balanced',
    overtakingDifficulty: 'medium',
    tyreDegradation: 'low',
    teamAffinities: { mercedes: 1.08, ferrari: 1.05, red_bull: 1.04, mclaren: 1.03 },
  },
  vegas: {
    circuitId: 'vegas',
    name: 'Las Vegas Street Circuit',
    type: 'street',
    overtakingDifficulty: 'high',
    tyreDegradation: 'low',
    teamAffinities: { ferrari: 1.05, mercedes: 1.06, red_bull: 1.02, mclaren: 1.08 },
  },
};

// ── Wet race specialists (historical wet performance data) ─────────────────────
const WET_SPECIALISTS: Record<string, number> = {
  hamilton: 1.25,
  alonso: 1.20,
  max_verstappen: 1.15,
  leclerc: 1.12,
  russell: 1.10,
  antonelli: 1.08,
  norris: 1.05,
};

// ── Compute last-5-race form score (0–100) ────────────────────────────────────
function computeFormScore(driverId: string): number {
  const metrics = getSeason2026Metrics(driverId);
  if (!metrics || !metrics.last5Races || metrics.last5Races.length === 0) return 50;

  const races = metrics.last5Races;
  let score = 0;
  const weights = [0.30, 0.25, 0.20, 0.15, 0.10]; // most recent is highest weight

  races.slice(0, 5).forEach((race, i) => {
    const w = weights[i] ?? 0.10;
    if (race.isDNF) {
      score += 0 * w;
    } else {
      // Map finish position to 0-100 (P1=100, P20+=0)
      const posScore = Math.max(0, 100 - (race.finishPos - 1) * 5);
      score += posScore * w;
    }
  });

  return Math.round(Math.min(Math.max(score, 0), 100));
}

// ── DNF rate from 2026 data ───────────────────────────────────────────────────
function getDNFRate(driverId: string, totalRaces: number): number {
  const metrics = getSeason2026Metrics(driverId);
  if (!metrics || totalRaces === 0) return 0.10;
  return metrics.dnfs / totalRaces;
}

// ── Main prediction model ─────────────────────────────────────────────────────
export function predictRaceOutcome(
  circuitId: string,
  nextRace: Race | null,
  driverStandings: DriverStanding[],
  weather: OpenMeteoWeather | null,
  season: string = 'current'
): DriverPrediction[] {
  if (driverStandings.length === 0) return [];

  const circuitProfile = CIRCUIT_PROFILES[circuitId] ?? null;
  const totalRaces = 14; // approximate 2026 completed rounds
  const rainProb = weather?.precipitationProbability ?? 0;
  const isWetRace = rainProb > 50;

  // --- Step 1: Compute raw composite scores for every driver ---
  const rawScores = driverStandings.map((ds) => {
    const driverId = ds.Driver.driverId;
    const metrics = getSeason2026Metrics(driverId);

    let score = 0;

    if (metrics) {
      // A. Points-per-race (30%) — best proxy for overall pace
      const maxPPR = 20.9; // Antonelli's 20.9
      score += (metrics.pointsPerRace / maxPPR) * 30;

      // B. Season wins and podiums (25%)
      const maxWins = 8; // Antonelli
      const maxPodiums = 12;
      score += (metrics.seasonWins / maxWins) * 15;
      score += (metrics.seasonPodiums / maxPodiums) * 10;

      // C. Average finish position (20%) — lower is better, invert
      const avgFinishScore = Math.max(0, (22 - metrics.avgFinish) / 21) * 20;
      score += avgFinishScore;

      // D. Last-5-race form (15%)
      const formScore = computeFormScore(driverId);
      score += (formScore / 100) * 15;

      // E. Qualifying strength (10%) — avg grid + poles
      const avgGridScore = Math.max(0, (22 - metrics.avgGrid) / 21) * 7;
      const poleBonus = Math.min(metrics.seasonPoles * 0.5, 3);
      score += avgGridScore + poleBonus;
    } else {
      // Fallback to championship standing
      const champPos = parseInt(ds.position, 10);
      const champPts = parseFloat(ds.points);
      score = Math.max(0, 50 - champPos * 2) + Math.min(champPts / 10, 20);
    }

    // F. Circuit affinity bonus/penalty
    if (circuitProfile) {
      const constructorId = ds.Constructors?.[0]?.constructorId ?? '';
      const affinity = circuitProfile.teamAffinities[constructorId] ?? 1.0;
      score *= affinity;
    }

    // G. Wet race modifier
    if (isWetRace && rainProb > 50) {
      const wetMultiplier = WET_SPECIALISTS[driverId] ?? 1.0;
      const wetImpact = ((wetMultiplier - 1.0) * rainProb) / 100;
      score *= (1 + wetImpact);
    }

    return { ds, score, metrics };
  });

  // --- Step 2: Normalise to probabilities (Softmax-like) ---
  const totalScore = rawScores.reduce((s, r) => s + Math.max(r.score, 0.1), 0);

  const predictions: DriverPrediction[] = rawScores.map(({ ds, score, metrics }) => {
    const driverId = ds.Driver.driverId;
    const constructorId = ds.Constructors?.[0]?.constructorId ?? '';
    const normScore = Math.max(score, 0.1) / totalScore;

    // Win probability: amplify top drivers, dampen backmarkers
    // Use power transform to create realistic spread
    const rawWinPct = normScore * 100;
    const winProb = Math.min(Math.round(rawWinPct * 1.2 * 10) / 10, 75);

    // Podium = roughly 3x win + some cushion for safety car beneficiaries
    const podiumProb = Math.min(Math.round(winProb * 2.5 + 2), 92);

    // DNF risk from actual 2026 data
    const dnfRate = getDNFRate(driverId, totalRaces);
    let dnfRisk = Math.round(dnfRate * 100);
    if (isWetRace) dnfRisk = Math.min(Math.round(dnfRisk * 1.4), 55);
    if (circuitProfile?.type === 'street') dnfRisk = Math.min(Math.round(dnfRisk * 1.2), 55);

    // Confidence: high when we have 2026 metrics
    const confidence = metrics ? 85 : 45;

    // Form and strength ratings
    const formRating = computeFormScore(driverId);
    const qualiStrength = metrics
      ? Math.round(Math.max(0, (22 - metrics.avgGrid) / 21) * 100)
      : 50;
    const raceStrength = metrics
      ? Math.round(((metrics.seasonWins * 3 + metrics.seasonPodiums) / Math.max(totalRaces, 1)) * 100 / 4)
      : 50;

    // Build narrative factors from real data
    const factors: PredictionFactor[] = [];
    if (metrics) {
      if (metrics.currentRank === 1) factors.push({ label: 'Championship leader', impact: 'positive', detail: `${metrics.seasonPoints} pts — ${metrics.seasonWins} wins` });
      if (metrics.currentRank <= 3 && metrics.currentRank > 1) factors.push({ label: `P${metrics.currentRank} in championship`, impact: 'positive', detail: `${metrics.seasonPoints} points` });
      if (metrics.seasonWins >= 3) factors.push({ label: 'Multiple race winner', impact: 'positive', detail: `${metrics.seasonWins} wins this season` });
      if (metrics.avgFinish <= 4) factors.push({ label: 'Elite average finish', impact: 'positive', detail: `Avg P${metrics.avgFinish.toFixed(1)} in 2026` });
      if (metrics.seasonPoles >= 3) factors.push({ label: 'Qualifying specialist', impact: 'positive', detail: `${metrics.seasonPoles} poles this season` });

      const last5 = metrics.last5Races?.slice(0, 3) ?? [];
      const recentDNFs = last5.filter((r) => r.isDNF).length;
      const recentWins = last5.filter((r) => r.isWin).length;
      const recentPodiums = last5.filter((r) => r.isPodium).length;

      if (recentWins >= 2) factors.push({ label: 'Hot streak', impact: 'positive', detail: `${recentWins} wins in last 3 races` });
      if (recentPodiums >= 2 && recentWins < 2) factors.push({ label: 'Consistent podiums', impact: 'positive', detail: `${recentPodiums} podiums in last 3 races` });
      if (recentDNFs >= 2) factors.push({ label: 'Recent unreliability', impact: 'negative', detail: `${recentDNFs} DNFs in last 3 races` });
      if (metrics.dnfs >= 4) factors.push({ label: 'Reliability concern', impact: 'negative', detail: `${metrics.dnfs} DNFs this season` });
      if (metrics.avgGrid > 12) factors.push({ label: 'Qualifying deficit', impact: 'negative', detail: `Avg P${metrics.avgGrid.toFixed(1)} on grid` });
      if (metrics.currentRank > 10) factors.push({ label: 'Outside top 10', impact: 'negative', detail: `P${metrics.currentRank} in standings` });
    }

    if (circuitProfile) {
      const affinity = circuitProfile.teamAffinities[constructorId] ?? 1.0;
      if (affinity >= 1.10) factors.push({ label: 'Strong circuit for this team', impact: 'positive', detail: `${circuitProfile.type} circuit suits car profile` });
      if (affinity <= 0.95) factors.push({ label: 'Weak circuit for this team', impact: 'negative', detail: `Historically tough venue` });
    }

    if (isWetRace) {
      const wetMult = WET_SPECIALISTS[driverId] ?? 1.0;
      if (wetMult >= 1.15) factors.push({ label: 'Wet weather specialist', impact: 'positive', detail: `${rainProb}% rain forecast` });
    }

    if (circuitProfile?.type === 'street') {
      factors.push({ label: 'Street circuit', impact: 'neutral', detail: 'Higher safety car probability' });
    }

    const last5Bars = (metrics?.last5Races ?? []).slice(0, 5).map((r) => ({
      pos: r.isDNF ? 22 : r.finishPos,
      raceName: r.raceName,
      isDNF: r.isDNF,
    }));

    return {
      driverId,
      driverCode: ds.Driver.code ?? driverId.slice(0, 3).toUpperCase(),
      driverName: `${ds.Driver.givenName} ${ds.Driver.familyName}`,
      constructorId,
      constructorName: ds.Constructors?.[0]?.name ?? '',
      winProbability: winProb,
      podiumProbability: podiumProb,
      dnfRisk,
      confidenceScore: confidence,
      formRating,
      qualifyingStrength: qualiStrength,
      raceStrength,
      factors: factors.slice(0, 5),
      formBar: last5Bars,
    };
  });

  return predictions.sort((a, b) => b.winProbability - a.winProbability);
}
