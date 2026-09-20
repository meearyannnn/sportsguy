/**
 * CHAMPIONSHIP TIMELINE DATA BUILDER
 * Fetches driver standings after each completed round to build an
 * animated season-long points progression chart.
 */

import { DriverStanding } from './types';
import { HISTORICAL_TIMELINES } from './championshipTimelinesData';

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

export interface TimelinePoint {
  round: number;
  raceName: string;
  circuitId: string;
  driverPoints: Record<string, number>; // driverId → cumulative points at this round
}

export interface SeasonTimeline {
  season: string;
  rounds: TimelinePoint[];
  driverIds: string[];  // ordered by final standings
  driverNames: Record<string, string>;
  driverCodes: Record<string, string>;
  constructorColors: Record<string, string>;
}

const tlCache = new Map<string, { ts: number; data: SeasonTimeline }>();
const TTL = 24 * 60 * 60 * 1000; // 24 hours

/** Team hex colors by constructorId */
const TEAM_COLORS: Record<string, string> = {
  ferrari: '#E8002D',
  mclaren: '#FF8000',
  mercedes: '#27F4D2',
  red_bull: '#3671C6',
  aston_martin: '#358C75',
  alpine: '#0093CC',
  williams: '#64C4FF',
  rb: '#6692FF',
  racing_bulls: '#6692FF',
  haas: '#B6BABD',
  sauber: '#52E252',
  kick_sauber: '#52E252',
  renault: '#FFF500',
  racing_point: '#F596C8',
  force_india: '#F596C8',
  toro_rosso: '#469BFF',
  alphatauri: '#5E8FAA',
  alfa: '#900000',
};

async function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

async function fetchWithRetry<T>(url: string, retries = 3): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        return (await res.json()) as T;
      }
      if (res.status === 429) {
        await sleep(500 * attempt);
        continue;
      }
    } catch {
      await sleep(500 * attempt);
    }
  }
  return null;
}

export async function buildSeasonTimeline(
  season: string,
  topN: number = 8
): Promise<SeasonTimeline | null> {
  const normSeason = season === 'current' ? '2026' : String(season);
  const cacheKey = `timeline_${normSeason}_${topN}`;
  const hit = tlCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  // 1. Instant verified historical datasets (100% accurate, zero rate-limit, monotonic non-decreasing)
  if (HISTORICAL_TIMELINES[normSeason]) {
    const base = HISTORICAL_TIMELINES[normSeason];
    const topDriverIds = base.driverIds.slice(0, topN);
    const filteredTimeline: SeasonTimeline = {
      ...base,
      driverIds: topDriverIds,
    };
    tlCache.set(cacheKey, { ts: Date.now(), data: filteredTimeline });
    return filteredTimeline;
  }

  // 2. Resilient live fetcher for other / future seasons
  try {
    const calJson = await fetchWithRetry<any>(`${JOLPICA_BASE}/${normSeason}.json?limit=30`);
    const races: any[] = calJson?.MRData?.RaceTable?.Races ?? [];
    const completedRaces = races.filter((r) => {
      const raceDate = new Date(r.date);
      return raceDate < new Date();
    });

    if (completedRaces.length === 0) return null;

    // Get standings to identify top drivers
    const finalStandingsJson = await fetchWithRetry<any>(
      `${JOLPICA_BASE}/${normSeason}/driverstandings.json?limit=25`
    );
    const finalStandings: DriverStanding[] =
      finalStandingsJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
    const topDrivers = finalStandings.slice(0, topN);
    const driverIds = topDrivers.map((ds) => ds.Driver.driverId);

    const driverNames: Record<string, string> = {};
    const driverCodes: Record<string, string> = {};
    const constructorColors: Record<string, string> = {};

    topDrivers.forEach((ds) => {
      const did = ds.Driver.driverId;
      driverNames[did] = `${ds.Driver.givenName} ${ds.Driver.familyName}`;
      driverCodes[did] = ds.Driver.code ?? did.slice(0, 3).toUpperCase();
      const constructorId = ds.Constructors?.[0]?.constructorId ?? '';
      constructorColors[did] = TEAM_COLORS[constructorId] ?? '#888888';
    });

    // Paced sequential retrieval with non-decreasing cumulative guarantee
    const rounds: TimelinePoint[] = [];
    const cumulativePoints: Record<string, number> = {};
    driverIds.forEach((did) => { cumulativePoints[did] = 0; });

    for (const race of completedRaces) {
      const url = `${JOLPICA_BASE}/${normSeason}/${race.round}/driverstandings.json?limit=25`;
      const json = await fetchWithRetry<any>(url);
      const standings: DriverStanding[] =
        json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

      // If standings are completely missing or round was cancelled/unheld, do not create a fake 0 drop
      if (standings.length === 0) {
        continue;
      }

      const roundPoints: Record<string, number> = {};
      let totalPointsInRound = 0;

      driverIds.forEach((did) => {
        const match = standings.find((ds) => ds.Driver.driverId === did);
        const raw = match ? parseFloat(match.points) : cumulativePoints[did];
        // Strictly non-decreasing: points can never be lower than previous round
        const verifiedPoints = Math.max(raw || 0, cumulativePoints[did]);
        roundPoints[did] = verifiedPoints;
        totalPointsInRound += verifiedPoints;
      });

      // Avoid empty/unheld round entries with zero points
      if (totalPointsInRound === 0) {
        continue;
      }

      // Update running cumulative points
      Object.assign(cumulativePoints, roundPoints);

      rounds.push({
        round: parseInt(race.round, 10),
        raceName: race.raceName.replace(' Grand Prix', ' GP'),
        circuitId: race.Circuit?.circuitId ?? '',
        driverPoints: roundPoints,
      });

      // Polite delay between rounds
      await sleep(100);
    }

    rounds.sort((a, b) => a.round - b.round);

    const timeline: SeasonTimeline = {
      season: normSeason,
      rounds,
      driverIds,
      driverNames,
      driverCodes,
      constructorColors,
    };

    tlCache.set(cacheKey, { ts: Date.now(), data: timeline });
    return timeline;
  } catch (err) {
    console.error('Failed to build season timeline:', err);
    return null;
  }
}

