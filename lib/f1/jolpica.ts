import {
  JolpicaResponse,
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
  Driver,
  Constructor,
} from './types';

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';

// In-memory cache for API resilience and rapid client-side responses
const memoryCache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes default cache

async function fetchWithCache<T>(url: string, ttl = CACHE_TTL_MS): Promise<T> {
  const cached = memoryCache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout safeguard

    const res = await fetch(url, {
      next: { revalidate: ttl > 3600000 ? 86400 : 300 },
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (cached) return cached.data as T; // Fallback to stale on rate limit or 5xx
      throw new Error(`Timing archive API error: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as T;
    memoryCache.set(url, { timestamp: now, data: json });
    return json;
  } catch (err) {
    if (cached) return cached.data as T;
    throw err;
  }
}

export async function getCalendar(season: string | number = 'current'): Promise<Race[]> {
  try {
    const res = await fetchWithCache<JolpicaResponse<Race>>(
      `${JOLPICA_BASE}/${season}.json?limit=35`
    );
    return res.MRData.RaceTable?.Races || [];
  } catch (err) {
    console.error('Failed to get calendar:', err);
    return [];
  }
}

export async function getDriverStandings(
  season: string | number = 'current'
): Promise<DriverStanding[]> {
  try {
    const res = await fetchWithCache<JolpicaResponse<DriverStanding>>(
      `${JOLPICA_BASE}/${season}/driverstandings.json?limit=30`
    );
    const lists = res.MRData.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].DriverStandings || [] : [];
  } catch (err) {
    console.error('Failed to get driver standings:', err);
    return [];
  }
}

export async function getConstructorStandings(
  season: string | number = 'current'
): Promise<ConstructorStanding[]> {
  try {
    const res = await fetchWithCache<JolpicaResponse<ConstructorStanding>>(
      `${JOLPICA_BASE}/${season}/constructorstandings.json?limit=15`
    );
    const lists = res.MRData.StandingsTable?.StandingsLists;
    return lists && lists.length > 0 ? lists[0].ConstructorStandings || [] : [];
  } catch (err) {
    console.error('Failed to get constructor standings:', err);
    return [];
  }
}

export async function getRaceResults(
  season: string | number = 'current',
  round: string | number = 'last'
): Promise<{ race: Race | null; results: RaceResult[] }> {
  try {
    const res = await fetchWithCache<JolpicaResponse<RaceResult>>(
      `${JOLPICA_BASE}/${season}/${round}/results.json?limit=30`
    );
    const races = res.MRData.RaceTable?.Races;
    if (races && races.length > 0) {
      return {
        race: races[0],
        results: races[0].Results || [],
      };
    }
    return { race: null, results: [] };
  } catch (err) {
    console.error(`Failed to get race results for ${season} round ${round}:`, err);
    return { race: null, results: [] };
  }
}

export async function getAllDrivers(season: string | number = 'current'): Promise<Driver[]> {
  try {
    const res = await fetchWithCache<JolpicaResponse<Driver>>(
      `${JOLPICA_BASE}/${season}/drivers.json?limit=40`
    );
    return res.MRData.DriverTable?.Drivers || [];
  } catch (err) {
    console.error('Failed to get drivers:', err);
    return [];
  }
}

export async function getAllConstructors(
  season: string | number = 'current'
): Promise<Constructor[]> {
  try {
    const res = await fetchWithCache<JolpicaResponse<Constructor>>(
      `${JOLPICA_BASE}/${season}/constructors.json?limit=20`
    );
    return res.MRData.ConstructorTable?.Constructors || [];
  } catch (err) {
    console.error('Failed to get constructors:', err);
    return [];
  }
}
