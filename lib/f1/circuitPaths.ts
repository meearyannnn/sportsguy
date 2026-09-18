export interface CircuitCorner {
  turn: number;
  name?: string;
  x: number;
  y: number;
}

export interface CircuitDRSZone {
  id: string;
  name: string;
  startPercent: number; // 0 to 1 along track length
  endPercent: number;
}

export interface CircuitSector {
  sector: 1 | 2 | 3;
  startPercent: number;
  endPercent: number;
  color: string;
}

export interface CircuitTrackData {
  id: string;
  name: string;
  shortName: string;
  svgPath: string;
  viewBox: string;
  corners: CircuitCorner[];
  drsZones: CircuitDRSZone[];
  sectors: CircuitSector[];
  speedMapPoints?: Array<{ percent: number; speedKm: number }>;
}

export const CIRCUITS_TRACK_MAPS: Record<string, CircuitTrackData> = {
  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    shortName: 'Monza',
    viewBox: '0 0 600 400',
    svgPath: 'M 80,320 L 460,320 C 530,320 560,280 540,220 C 520,160 480,140 420,150 L 320,160 L 260,110 L 220,110 L 200,160 L 140,160 C 90,160 60,200 60,260 Z',
    corners: [
      { turn: 1, name: 'Variante del Rettifilo', x: 460, y: 320 },
      { turn: 3, name: 'Curva Grande', x: 540, y: 220 },
      { turn: 4, name: 'Variante della Roggia', x: 420, y: 150 },
      { turn: 6, name: 'Lesmo 1', x: 260, y: 110 },
      { turn: 7, name: 'Lesmo 2', x: 220, y: 110 },
      { turn: 8, name: 'Variante Ascari', x: 200, y: 160 },
      { turn: 11, name: 'Curva Parabolica', x: 60, y: 260 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Main Straight DRS', startPercent: 0.85, endPercent: 0.12 },
      { id: 'drs2', name: 'Serraglio DRS', startPercent: 0.42, endPercent: 0.58 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.33, color: '#3B82F6' },
      { sector: 2, startPercent: 0.33, endPercent: 0.68, color: '#EAB308' },
      { sector: 3, startPercent: 0.68, endPercent: 1.0, color: '#10B981' },
    ],
  },
  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    shortName: 'Silverstone',
    viewBox: '0 0 600 400',
    svgPath: 'M 120,280 L 240,280 L 290,340 L 360,320 L 380,250 L 480,240 L 520,170 L 460,120 L 360,140 L 280,80 L 180,100 L 100,180 Z',
    corners: [
      { turn: 1, name: 'Abbey', x: 240, y: 280 },
      { turn: 3, name: 'Village', x: 290, y: 340 },
      { turn: 6, name: 'Brooklands', x: 380, y: 250 },
      { turn: 9, name: 'Copse', x: 520, y: 170 },
      { turn: 10, name: 'Maggotts', x: 460, y: 120 },
      { turn: 11, name: 'Becketts', x: 360, y: 140 },
      { turn: 15, name: 'Stowe', x: 180, y: 100 },
      { turn: 16, name: 'Vale', x: 100, y: 180 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Wellington Straight', startPercent: 0.22, endPercent: 0.36 },
      { id: 'drs2', name: 'Hangar Straight', startPercent: 0.62, endPercent: 0.78 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.31, color: '#3B82F6' },
      { sector: 2, startPercent: 0.31, endPercent: 0.65, color: '#EAB308' },
      { sector: 3, startPercent: 0.65, endPercent: 1.0, color: '#10B981' },
    ],
  },
  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    shortName: 'Spa',
    viewBox: '0 0 600 400',
    svgPath: 'M 100,300 L 160,340 L 220,320 L 260,240 L 420,120 L 500,100 L 530,160 L 480,240 L 380,300 L 280,310 L 180,260 Z',
    corners: [
      { turn: 1, name: 'La Source', x: 160, y: 340 },
      { turn: 3, name: 'Eau Rouge', x: 220, y: 320 },
      { turn: 4, name: 'Raidillon', x: 260, y: 240 },
      { turn: 7, name: 'Les Combes', x: 500, y: 100 },
      { turn: 10, name: 'Pouhon', x: 480, y: 240 },
      { turn: 14, name: 'Stavelot', x: 380, y: 300 },
      { turn: 17, name: 'Blanchimont', x: 180, y: 260 },
      { turn: 19, name: 'Bus Stop', x: 100, y: 300 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Kemmel Straight', startPercent: 0.18, endPercent: 0.38 },
      { id: 'drs2', name: 'Main Straight', startPercent: 0.90, endPercent: 0.08 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.28, color: '#3B82F6' },
      { sector: 2, startPercent: 0.28, endPercent: 0.72, color: '#EAB308' },
      { sector: 3, startPercent: 0.72, endPercent: 1.0, color: '#10B981' },
    ],
  },
  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco',
    shortName: 'Monaco',
    viewBox: '0 0 600 400',
    svgPath: 'M 140,320 L 220,320 L 300,260 L 380,220 L 460,200 L 500,240 L 440,280 L 380,280 L 340,320 L 280,340 L 200,340 L 120,350 Z',
    corners: [
      { turn: 1, name: 'Sainte Devote', x: 220, y: 320 },
      { turn: 3, name: 'Massenet', x: 300, y: 260 },
      { turn: 4, name: 'Casino Square', x: 380, y: 220 },
      { turn: 6, name: 'Grand Hotel Hairpin', x: 500, y: 240 },
      { turn: 8, name: 'Portier', x: 440, y: 280 },
      { turn: 10, name: 'Nouvelle Chicane', x: 340, y: 320 },
      { turn: 15, name: 'Swimming Pool', x: 200, y: 340 },
      { turn: 18, name: 'Rascasse', x: 120, y: 350 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Pit Straight DRS', startPercent: 0.88, endPercent: 0.08 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.35, color: '#3B82F6' },
      { sector: 2, startPercent: 0.35, endPercent: 0.68, color: '#EAB308' },
      { sector: 3, startPercent: 0.68, endPercent: 1.0, color: '#10B981' },
    ],
  },
  suzuka: {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    shortName: 'Suzuka',
    viewBox: '0 0 600 400',
    svgPath: 'M 100,280 L 220,280 L 280,220 L 340,160 L 400,120 L 480,140 L 500,220 L 420,260 L 340,240 L 260,200 L 200,240 L 140,260 Z',
    corners: [
      { turn: 1, name: 'First Corner', x: 220, y: 280 },
      { turn: 3, name: 'S Curves', x: 280, y: 220 },
      { turn: 8, name: 'Degner 1', x: 400, y: 120 },
      { turn: 11, name: 'Hairpin', x: 500, y: 220 },
      { turn: 14, name: 'Spoon Curve', x: 340, y: 240 },
      { turn: 15, name: '130R', x: 200, y: 240 },
      { turn: 16, name: 'Casio Triangle', x: 140, y: 260 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Main Straight', startPercent: 0.85, endPercent: 0.10 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.36, color: '#3B82F6' },
      { sector: 2, startPercent: 0.36, endPercent: 0.70, color: '#EAB308' },
      { sector: 3, startPercent: 0.70, endPercent: 1.0, color: '#10B981' },
    ],
  },
  bahrain: {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    shortName: 'Sakhir',
    viewBox: '0 0 600 400',
    svgPath: 'M 80,300 L 320,300 L 380,240 L 320,180 L 420,120 L 480,140 L 500,220 L 420,280 L 280,260 L 180,220 L 120,260 Z',
    corners: [
      { turn: 1, name: 'Michael Schumacher Turn', x: 320, y: 300 },
      { turn: 4, name: 'Turn 4', x: 380, y: 240 },
      { turn: 9, name: 'Turns 9 & 10 Hairpin', x: 480, y: 140 },
      { turn: 11, name: 'Turn 11', x: 500, y: 220 },
      { turn: 14, name: 'Final Corner', x: 120, y: 260 },
    ],
    drsZones: [
      { id: 'drs1', name: 'Main Straight DRS', startPercent: 0.82, endPercent: 0.10 },
      { id: 'drs2', name: 'Back Straight DRS', startPercent: 0.38, endPercent: 0.52 },
      { id: 'drs3', name: 'Outer Straight DRS', startPercent: 0.60, endPercent: 0.72 },
    ],
    sectors: [
      { sector: 1, startPercent: 0.0, endPercent: 0.32, color: '#3B82F6' },
      { sector: 2, startPercent: 0.32, endPercent: 0.67, color: '#EAB308' },
      { sector: 3, startPercent: 0.67, endPercent: 1.0, color: '#10B981' },
    ],
  },
};

// Generic fallback racetrack path for any other circuit
export const DEFAULT_TRACK_DATA: CircuitTrackData = {
  id: 'generic',
  name: 'Grand Prix Circuit',
  shortName: 'Circuit',
  viewBox: '0 0 600 400',
  svgPath: 'M 100,300 L 340,300 C 440,300 500,240 480,180 C 460,120 380,100 300,120 L 200,140 C 140,150 100,200 100,300 Z',
  corners: [
    { turn: 1, name: 'Turn 1', x: 340, y: 300 },
    { turn: 4, name: 'Turn 4', x: 480, y: 180 },
    { turn: 8, name: 'Turn 8', x: 300, y: 120 },
    { turn: 12, name: 'Turn 12', x: 100, y: 300 },
  ],
  drsZones: [
    { id: 'drs1', name: 'Main Straight DRS', startPercent: 0.85, endPercent: 0.10 },
  ],
  sectors: [
    { sector: 1, startPercent: 0.0, endPercent: 0.33, color: '#3B82F6' },
    { sector: 2, startPercent: 0.33, endPercent: 0.66, color: '#EAB308' },
    { sector: 3, startPercent: 0.66, endPercent: 1.0, color: '#10B981' },
  ],
};

export function getCircuitTrackData(circuitIdOrName: string): CircuitTrackData {
  if (!circuitIdOrName) return CIRCUITS_TRACK_MAPS.monza;
  const key = circuitIdOrName.toLowerCase().trim().replace(/[\s-]+/g, '_');
  
  if (CIRCUITS_TRACK_MAPS[key]) return CIRCUITS_TRACK_MAPS[key];
  for (const [id, track] of Object.entries(CIRCUITS_TRACK_MAPS)) {
    if (key.includes(id) || track.name.toLowerCase().includes(key) || key.includes(track.shortName.toLowerCase())) {
      return track;
    }
  }
  return DEFAULT_TRACK_DATA;
}
