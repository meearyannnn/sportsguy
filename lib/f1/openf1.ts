import {
  OpenF1Session,
  OpenF1Interval,
  OpenF1Weather,
  OpenF1Driver,
  OpenF1CarData,
  OpenF1Lap,
} from './types';

const OPENF1_BASE = 'https://api.openf1.org/v1';

const openf1Cache = new Map<string, { timestamp: number; data: any }>();
const CACHE_TTL_LIVE_MS = 20 * 1000; // 20s live cache

async function fetchOpenF1<T>(endpoint: string, ttl = CACHE_TTL_LIVE_MS): Promise<T | null> {
  const url = `${OPENF1_BASE}/${endpoint}`;
  const cached = openf1Cache.get(url);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttl) {
    return cached.data as T;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout safeguard

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`OpenF1 telemetry sensor notice (${res.status}): ${url}`);
      if (cached) return cached.data as T;
      return null;
    }

    const data = (await res.json()) as T;
    openf1Cache.set(url, { timestamp: now, data });
    return data;
  } catch (err) {
    console.warn(`OpenF1 telemetry network notice:`, err);
    if (cached) return cached.data as T;
    return null;
  }
}

export async function getLatestSession(): Promise<OpenF1Session | null> {
  try {
    const sessions = await fetchOpenF1<OpenF1Session[]>('sessions?session_key=latest', 60000);
    return sessions && Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
  } catch (err) {
    console.error('Failed to get latest session from OpenF1:', err);
    return null;
  }
}

export async function getSessionDrivers(sessionKey: number | string): Promise<OpenF1Driver[]> {
  try {
    const drivers = await fetchOpenF1<OpenF1Driver[]>(`drivers?session_key=${sessionKey}`, 120000);
    return Array.isArray(drivers) ? drivers : [];
  } catch (err) {
    console.error('Failed to get drivers from OpenF1:', err);
    return [];
  }
}

export async function getSessionIntervals(sessionKey: number | string): Promise<OpenF1Interval[]> {
  try {
    const intervals = await fetchOpenF1<OpenF1Interval[]>(
      `intervals?session_key=${sessionKey}`,
      15000
    );
    return Array.isArray(intervals) ? intervals : [];
  } catch (err) {
    console.error('Failed to get intervals from OpenF1:', err);
    return [];
  }
}

export async function getSessionWeather(sessionKey: number | string): Promise<OpenF1Weather | null> {
  try {
    const weather = await fetchOpenF1<OpenF1Weather[]>(
      `weather?session_key=${sessionKey}`,
      30000
    );
    return Array.isArray(weather) && weather.length > 0 ? weather[weather.length - 1] : null;
  } catch (err) {
    console.error('Failed to get weather from OpenF1:', err);
    return null;
  }
}

export async function getCarTelemetry(
  sessionKey: number | string,
  driverNumber: number | string
): Promise<OpenF1CarData[]> {
  try {
    const carData = await fetchOpenF1<OpenF1CarData[]>(
      `car_data?session_key=${sessionKey}&driver_number=${driverNumber}`,
      20000
    );
    // Limit to recent 25 sample points for smooth sparklines
    return Array.isArray(carData) && carData.length > 0 ? carData.slice(-25) : [];
  } catch (err) {
    console.error('Failed to get car telemetry from OpenF1:', err);
    return [];
  }
}

export async function getSessionLaps(
  sessionKey: number | string,
  driverNumber?: number | string
): Promise<OpenF1Lap[]> {
  try {
    const query = driverNumber
      ? `laps?session_key=${sessionKey}&driver_number=${driverNumber}`
      : `laps?session_key=${sessionKey}`;
    const laps = await fetchOpenF1<OpenF1Lap[]>(query, 30000);
    return Array.isArray(laps) ? laps : [];
  } catch (err) {
    console.error('Failed to get laps from OpenF1:', err);
    return [];
  }
}

export interface OpenF1Stint {
  session_key: number;
  meeting_key: number;
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export async function getSessionStints(sessionKey: number | string): Promise<OpenF1Stint[]> {
  try {
    const stints = await fetchOpenF1<OpenF1Stint[]>(`stints?session_key=${sessionKey}`, 60000);
    return Array.isArray(stints) ? stints : [];
  } catch (err) {
    console.error('Failed to get stints from OpenF1:', err);
    return [];
  }
}
