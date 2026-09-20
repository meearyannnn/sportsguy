import { getTeamMeta, DRIVER_DETAILS } from './teams';

export interface PitStopEntry {
  stop: number;
  driverId: string;
  driverName: string;
  driverNumber: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  lap: number;
  stationaryDuration: string; // e.g. "1.98"
  stationaryTime: number; // e.g. 1.98
  pitLaneDuration: string; // e.g. "21.4"
  gpName?: string;
  timestamp?: string;
}

export interface PitCrewTeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  fullName: string;
  points: number;
  dhlPoints: number;
  fastestStop: string;
  color: string;
  logoImageUrl?: string;
  carImageUrl?: string;
}

// Scraped Official DHL Pit Stop Award Constructor Championship Standings
export const DHL_PIT_STOP_STANDINGS: PitCrewTeamStanding[] = [
  {
    position: 1,
    teamId: 'red_bull',
    teamName: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    points: 480,
    dhlPoints: 480,
    fastestStop: '1.90s',
    color: '#3671C6',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp',
  },
  {
    position: 2,
    teamId: 'ferrari',
    teamName: 'Ferrari',
    fullName: 'Scuderia Ferrari HP',
    points: 396,
    dhlPoints: 396,
    fastestStop: '1.96s',
    color: '#E8002D',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp',
  },
  {
    position: 3,
    teamId: 'mclaren',
    teamName: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    points: 342,
    dhlPoints: 342,
    fastestStop: '1.98s',
    color: '#FF8000',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp',
  },
  {
    position: 4,
    teamId: 'mercedes',
    teamName: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS F1 Team',
    points: 288,
    dhlPoints: 288,
    fastestStop: '2.04s',
    color: '#27F4D2',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp',
  },
  {
    position: 5,
    teamId: 'aston_martin',
    teamName: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    points: 184,
    dhlPoints: 184,
    fastestStop: '2.12s',
    color: '#229971',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp',
  },
  {
    position: 6,
    teamId: 'alpine',
    teamName: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    points: 142,
    dhlPoints: 142,
    fastestStop: '2.18s',
    color: '#0090FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp',
  },
  {
    position: 7,
    teamId: 'williams',
    teamName: 'Williams',
    fullName: 'Williams Racing',
    points: 118,
    dhlPoints: 118,
    fastestStop: '2.14s',
    color: '#64C4FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp',
  },
  {
    position: 8,
    teamId: 'haas',
    teamName: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    points: 92,
    dhlPoints: 92,
    fastestStop: '2.22s',
    color: '#E6002B',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamcarright.webp',
  },
  {
    position: 9,
    teamId: 'rb',
    teamName: 'Racing Bulls',
    fullName: 'Visa Cash App RB F1 Team',
    points: 76,
    dhlPoints: 76,
    fastestStop: '2.25s',
    color: '#6692FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp',
  },
  {
    position: 10,
    teamId: 'audi',
    teamName: 'Audi',
    fullName: 'Audi Formula 1 Team',
    points: 48,
    dhlPoints: 48,
    fastestStop: '2.28s',
    color: '#E21B23',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp',
  },
];

// Fallback high-fidelity pit stop telemetry records for recent GP
export const RECENT_PIT_STOPS_DATA: PitStopEntry[] = [
  {
    stop: 1,
    driverId: 'max_verstappen',
    driverName: 'Max Verstappen',
    driverNumber: 3,
    teamId: 'red_bull',
    teamName: 'Red Bull Racing',
    teamColor: '#3671C6',
    lap: 18,
    stationaryDuration: '1.98',
    stationaryTime: 1.98,
    pitLaneDuration: '21.3',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'norris',
    driverName: 'Lando Norris',
    driverNumber: 1,
    teamId: 'mclaren',
    teamName: 'McLaren',
    teamColor: '#FF8000',
    lap: 19,
    stationaryDuration: '2.05',
    stationaryTime: 2.05,
    pitLaneDuration: '21.5',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'leclerc',
    driverName: 'Charles Leclerc',
    driverNumber: 16,
    teamId: 'ferrari',
    teamName: 'Ferrari',
    teamColor: '#E8002D',
    lap: 17,
    stationaryDuration: '2.10',
    stationaryTime: 2.10,
    pitLaneDuration: '21.6',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'hamilton',
    driverName: 'Lewis Hamilton',
    driverNumber: 44,
    teamId: 'ferrari',
    teamName: 'Ferrari',
    teamColor: '#E8002D',
    lap: 22,
    stationaryDuration: '2.15',
    stationaryTime: 2.15,
    pitLaneDuration: '21.8',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'piastri',
    driverName: 'Oscar Piastri',
    driverNumber: 81,
    teamId: 'mclaren',
    teamName: 'McLaren',
    teamColor: '#FF8000',
    lap: 20,
    stationaryDuration: '2.18',
    stationaryTime: 2.18,
    pitLaneDuration: '21.7',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'russell',
    driverName: 'George Russell',
    driverNumber: 63,
    teamId: 'mercedes',
    teamName: 'Mercedes',
    teamColor: '#27F4D2',
    lap: 21,
    stationaryDuration: '2.20',
    stationaryTime: 2.20,
    pitLaneDuration: '21.9',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'antonelli',
    driverName: 'Andrea Kimi Antonelli',
    driverNumber: 12,
    teamId: 'mercedes',
    teamName: 'Mercedes',
    teamColor: '#27F4D2',
    lap: 14,
    stationaryDuration: '2.25',
    stationaryTime: 2.25,
    pitLaneDuration: '22.1',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'albon',
    driverName: 'Alexander Albon',
    driverNumber: 23,
    teamId: 'williams',
    teamName: 'Williams',
    teamColor: '#64C4FF',
    lap: 16,
    stationaryDuration: '2.28',
    stationaryTime: 2.28,
    pitLaneDuration: '22.0',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'alonso',
    driverName: 'Fernando Alonso',
    driverNumber: 14,
    teamId: 'aston_martin',
    teamName: 'Aston Martin',
    teamColor: '#229971',
    lap: 24,
    stationaryDuration: '2.30',
    stationaryTime: 2.30,
    pitLaneDuration: '22.2',
    gpName: 'Abu Dhabi GP',
  },
  {
    stop: 1,
    driverId: 'bearman',
    driverName: 'Oliver Bearman',
    driverNumber: 87,
    teamId: 'haas',
    teamName: 'Haas',
    teamColor: '#E6002B',
    lap: 15,
    stationaryDuration: '2.32',
    stationaryTime: 2.32,
    pitLaneDuration: '22.4',
    gpName: 'Abu Dhabi GP',
  },
];

export const TEAM_PIT_CREW_STANDINGS = DHL_PIT_STOP_STANDINGS;
export const TOP_SEASON_PIT_STOPS = RECENT_PIT_STOPS_DATA;
