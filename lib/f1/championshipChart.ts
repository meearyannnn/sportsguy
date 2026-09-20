/**
 * CHAMPIONSHIP TIMELINE DATA BUILDER
 * Fetches driver standings after each completed round to build an
 * animated season-long points progression chart.
 */

import { DriverStanding } from './types';

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
const TTL = 60 * 60 * 1000; // 1 hour

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
  haas: '#B6BABD',
  sauber: '#52E252',
  renault: '#FFF500',
  racing_point: '#F596C8',
  force_india: '#F596C8',
  toro_rosso: '#469BFF',
};

async function cachedFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export async function buildSeasonTimeline(
  season: string,
  topN: number = 8
): Promise<SeasonTimeline | null> {
  const cacheKey = `timeline_${season}_${topN}`;
  const hit = tlCache.get(cacheKey);
  if (hit && Date.now() - hit.ts < TTL) return hit.data;

  // Step 1: Get the race calendar so we know which rounds exist
  const calJson = await cachedFetch<any>(
    `${JOLPICA_BASE}/${season}.json?limit=25`
  );
  const races: any[] = calJson?.MRData?.RaceTable?.Races ?? [];
  const completedRaces = races.filter((r) => {
    const raceDate = new Date(r.date);
    return raceDate < new Date();
  });

  if (completedRaces.length === 0) return null;

  // Step 2: Get final standings to determine top drivers
  const finalStandingsJson = await cachedFetch<any>(
    `${JOLPICA_BASE}/${season}/driverstandings.json?limit=25`
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

  // Step 3: Fetch standings per round in parallel (batch of 4 to be polite)
  const rounds: TimelinePoint[] = [];

  const batchSize = 4;
  for (let i = 0; i < completedRaces.length; i += batchSize) {
    const batch = completedRaces.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (race) => {
        const url = `${JOLPICA_BASE}/${season}/${race.round}/driverstandings.json?limit=25`;
        const json = await cachedFetch<any>(url);
        const standings: DriverStanding[] =
          json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

        const driverPoints: Record<string, number> = {};
        driverIds.forEach((did) => { driverPoints[did] = 0; });
        standings.forEach((ds) => {
          if (driverIds.includes(ds.Driver.driverId)) {
            driverPoints[ds.Driver.driverId] = parseFloat(ds.points) || 0;
          }
        });

        return {
          round: parseInt(race.round, 10),
          raceName: race.raceName.replace(' Grand Prix', ' GP'),
          circuitId: race.Circuit?.circuitId ?? '',
          driverPoints,
        } as TimelinePoint;
      })
    );
    rounds.push(...batchResults);
  }

  rounds.sort((a, b) => a.round - b.round);

  const timeline: SeasonTimeline = {
    season,
    rounds,
    driverIds,
    driverNames,
    driverCodes,
    constructorColors,
  };

  tlCache.set(cacheKey, { ts: Date.now(), data: timeline });
  return timeline;
}
