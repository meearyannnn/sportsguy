export type Compound = 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN';

export interface StintPitStop {
  lap: number;
  pitLaneDuration?: string | null;
  stationaryDuration?: string | null;
}

export interface Stint {
  stintNumber: number;
  compound: Compound;
  startLap: number;
  endLap: number;
  duration: number;
  tyreAgeAtStart: number;
  isNew: boolean;
  pitStop?: StintPitStop | null;
}

export interface DriverTireStrategy {
  driverId: string;
  driverCode: string;
  driverName: string;
  driverNumber: number;
  constructorId: string;
  constructorName: string;
  constructorColor?: string;
  position: number;
  positionText: string;
  gridPosition: number | null;
  isPitLaneStart?: boolean;
  isDNF: boolean;
  retirementLap: number | null;
  retirementReason: string | null;
  isLapped: boolean;
  lapsCompleted: number;
  strategyAvailable: boolean;
  totalLaps: number;
  status: string;
  stints: Stint[];
}

export interface TireStrategyStats {
  compoundShare: Record<string, number>;
  avgStintLength: Record<string, number>;
  compoundLaps: Record<string, number>;
  fastestStop: {
    driverName: string;
    driverCode: string;
    constructorName: string;
    lap: number;
    duration: number;
    durationStr: string;
    stationaryStr?: string;
  } | null;
}

export interface TireStrategyData {
  race: {
    season: string;
    round: string;
    raceName: string;
    circuitName?: string;
    locality?: string;
    country?: string;
    date?: string;
  } | null;
  sessionKey: number | null;
  isVerified: boolean;
  dataSource: string;
  maxLaps: number;
  totalStops: number;
  stats: TireStrategyStats | null;
  strategies: DriverTireStrategy[];
}

export const COMPOUND_META: Record<
  Compound,
  { label: string; abbr: string; color: string; textColor: string; border: string; glow: string }
> = {
  SOFT: {
    label: 'Soft',
    abbr: 'S',
    color: '#E8002D',
    textColor: '#FFFFFF',
    border: 'rgba(232, 0, 45, 0.4)',
    glow: 'rgba(232, 0, 45, 0.25)',
  },
  MEDIUM: {
    label: 'Medium',
    abbr: 'M',
    color: '#FFF200',
    textColor: '#111111',
    border: 'rgba(255, 242, 0, 0.4)',
    glow: 'rgba(255, 242, 0, 0.25)',
  },
  HARD: {
    label: 'Hard',
    abbr: 'H',
    color: '#FFFFFF',
    textColor: '#111111',
    border: 'rgba(255, 255, 255, 0.4)',
    glow: 'rgba(255, 255, 255, 0.25)',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    abbr: 'I',
    color: '#39B54A',
    textColor: '#FFFFFF',
    border: 'rgba(57, 181, 74, 0.4)',
    glow: 'rgba(57, 181, 74, 0.25)',
  },
  WET: {
    label: 'Wet',
    abbr: 'W',
    color: '#0072CE',
    textColor: '#FFFFFF',
    border: 'rgba(0, 114, 206, 0.4)',
    glow: 'rgba(0, 114, 206, 0.25)',
  },
  UNKNOWN: {
    label: 'Unavailable',
    abbr: '—',
    color: '#374151',
    textColor: '#9CA3AF',
    border: 'rgba(75, 85, 99, 0.4)',
    glow: 'rgba(75, 85, 99, 0.25)',
  },
};

const clientCache = new Map<string, { timestamp: number; data: TireStrategyData }>();
const CLIENT_TTL_MS = 15 * 60 * 1000; // 15 mins

export async function fetchTireStrategy(
  season: string = 'current',
  round: string = 'last'
): Promise<TireStrategyData | null> {
  const cacheKey = `tire_strategy_v2_${season}_${round}`;
  const now = Date.now();

  const mem = clientCache.get(cacheKey);
  if (mem && now - mem.timestamp < CLIENT_TTL_MS) {
    return mem.data;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem(`apex_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (now - parsed.timestamp < CLIENT_TTL_MS * 2) {
          clientCache.set(cacheKey, parsed);
          return parsed.data;
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(`/api/f1/stints?season=${encodeURIComponent(season)}&round=${encodeURIComponent(round)}`);
    if (!res.ok) {
      throw new Error(`Failed to load stints: HTTP ${res.status}`);
    }
    const data: TireStrategyData = await res.json();
    clientCache.set(cacheKey, { timestamp: now, data });

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(`apex_${cacheKey}`, JSON.stringify({ timestamp: now, data }));
      } catch {}
    }

    return data;
  } catch (err) {
    console.error('Error in fetchTireStrategy:', err);
    return null;
  }
}
