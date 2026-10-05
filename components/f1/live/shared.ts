// Shared client-side types + formatters for the Live Center.

export type SessionStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface SeasonRound {
  round: number;
  name: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;
  status: SessionStatus;
  winner: string | null;
  meetingKey: number | null;
}

export interface WeekendSession {
  sessionKey: number;
  name: string;
  type: string;
  start: string;
  end: string;
  status: SessionStatus;
}

export interface WeekendPayload {
  season: SeasonRound[];
  round: SeasonRound;
  sessions: WeekendSession[];
  defaultSessionKey: number | null;
}

export interface LiveDriver {
  number: number;
  code: string;
  fullName: string;
  team: string;
  color: string;
  headshot: string | null;
}

export interface TowerRow {
  position: number | null;
  driver: number;
  laps: number;
  gap: number | string | null;
  interval: number | string | null;
  bestLap: number | null;
  lastLap: number | null;
  q: Array<number | null> | null;
  status: 'RUNNING' | 'FINISHED' | 'DNF' | 'DNS' | 'DSQ' | 'PIT';
  statusText: string | null;
  points: number | null;
  grid: number | null;
  compound: string | null;
  tyreAge: number | null;
  pits: number;
  fastestLap: boolean;
  sectors: [number | null, number | null, number | null];
}

export interface SessionPayload {
  meta: {
    sessionKey: number;
    meetingKey: number;
    name: string;
    type: string;
    start: string;
    end: string;
    circuit: string;
    country: string;
    location: string;
    status: SessionStatus;
  };
  drivers: LiveDriver[];
  tower: TowerRow[];
  totalLaps: number | null;
  raceControl: Array<{ date: string; lap: number | null; category: string; flag: string | null; message: string; driver: number | null }>;
  weather: { air: number; track: number; humidity: number; wind: number; rain: boolean } | null;
  stints: Array<{ driver: number; n: number; compound: string; from: number; to: number; age: number }>;
  pits: Array<{ driver: number; lap: number; duration: number | null }>;
  lapPositions: Record<number, Array<number | null>>;
  positionsTimeline: Array<[number, number, number]>;
  laps: Record<number, Array<[number, number, number | null]>>;
  replay: { start: string; end: string } | null;
}

export interface TrackPayload {
  path: Array<[number, number]>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export interface LapTelemetry {
  driver: number;
  lap: number;
  lapTime: number;
  sectors: Array<number | null>;
  speedTrap: number | null;
  samples: Array<{ t: number; d: number; speed: number; throttle: number; brake: number; gear: number; rpm: number; drs: number; x: number | null; y: number | null }>;
}

export function fmtLap(sec: number | null | undefined): string {
  if (sec == null || !isFinite(sec)) return '—';
  const m = Math.floor(sec / 60);
  const s = sec - m * 60;
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, '0')}` : s.toFixed(3);
}

export function fmtGap(g: number | string | null | undefined): string {
  if (g == null) return '—';
  if (typeof g === 'string') return g;
  if (g === 0) return '—';
  return `+${g.toFixed(3)}`;
}

export function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : `${m}:${String(ss).padStart(2, '0')}`;
}

export function shortSession(name: string): string {
  return name
    .replace('Practice ', 'FP')
    .replace('Sprint Qualifying', 'SQ')
    .replace('Sprint Shootout', 'SQ')
    .replace('Qualifying', 'QUALI')
    .replace('Sprint', 'SPRINT')
    .replace('Race', 'RACE');
}

export const COMPOUND_COLOR: Record<string, string> = {
  SOFT: 'var(--tyre-soft)',
  MEDIUM: 'var(--tyre-medium)',
  HARD: 'var(--tyre-hard)',
  INTERMEDIATE: 'var(--tyre-inter)',
  WET: 'var(--tyre-wet)',
};

/** Builds a projector from OpenF1 track coordinates to an SVG viewBox with padding. */
export function makeProjector(bounds: TrackPayload['bounds'], size = 1000, pad = 60) {
  const w = bounds.maxX - bounds.minX || 1;
  const h = bounds.maxY - bounds.minY || 1;
  const scale = (size - pad * 2) / Math.max(w, h);
  const vbW = w * scale + pad * 2;
  const vbH = h * scale + pad * 2;
  return {
    vbW,
    vbH,
    // Flip Y: OpenF1 y grows "north", SVG y grows downward.
    p: (x: number, y: number): [number, number] => [pad + (x - bounds.minX) * scale, pad + (bounds.maxY - y) * scale],
  };
}

export const speedColor = (v: number, min = 80, max = 340) => {
  const t = Math.min(1, Math.max(0, (v - min) / (max - min)));
  // blue → cyan → green → yellow → red
  const hue = 240 - t * 240;
  return `hsl(${hue.toFixed(0)}, 95%, 55%)`;
};
