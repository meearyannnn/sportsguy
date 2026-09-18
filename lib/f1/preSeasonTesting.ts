import { getTeamMeta } from './teams';

export interface TestingDriverResult {
  rank: number;
  driverId: string;
  driverName: string;
  driverNumber: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  bestLapTime: string;
  gapToLeader: string;
  compound: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  compoundColor: string;
  lapsCompleted: number;
  topSpeedKm: number;
}

export interface TestingTeamMileage {
  rank: number;
  teamId: string;
  teamName: string;
  fullName: string;
  totalLaps: number;
  totalKm: number;
  reliabilityScore: number; // 0 to 100%
  color: string;
  logoImageUrl?: string;
  carImageUrl?: string;
}

export interface TestingSessionData {
  id: string;
  sessionName: string;
  date: string;
  location: string;
  trackName: string;
  weatherTemp: string;
  results: TestingDriverResult[];
}

export const PRESEASON_TESTING_SESSIONS: TestingSessionData[] = [
  {
    id: 'day3_combined',
    sessionName: 'Bahrain Winter Testing - Day 3 Final Benchmark Classification',
    date: 'February 28, 2026',
    location: 'Sakhir, Bahrain',
    trackName: 'Bahrain International Circuit',
    weatherTemp: '28°C Air / 38°C Track',
    results: [
      {
        rank: 1,
        driverId: 'max_verstappen',
        driverName: 'Max Verstappen',
        driverNumber: 1,
        teamId: 'red_bull',
        teamName: 'Red Bull Racing',
        teamColor: '#3671C6',
        bestLapTime: '1:30.305',
        gapToLeader: 'LEADER',
        compound: 'C4',
        compoundColor: '#EF4444',
        lapsCompleted: 142,
        topSpeedKm: 331.8,
      },
      {
        rank: 2,
        driverId: 'norris',
        driverName: 'Lando Norris',
        driverNumber: 4,
        teamId: 'mclaren',
        teamName: 'McLaren',
        teamColor: '#FF8000',
        bestLapTime: '1:30.420',
        gapToLeader: '+0.115s',
        compound: 'C4',
        compoundColor: '#EF4444',
        lapsCompleted: 138,
        topSpeedKm: 330.4,
      },
      {
        rank: 3,
        driverId: 'leclerc',
        driverName: 'Charles Leclerc',
        driverNumber: 16,
        teamId: 'ferrari',
        teamName: 'Ferrari',
        teamColor: '#E8002D',
        bestLapTime: '1:30.510',
        gapToLeader: '+0.205s',
        compound: 'C5',
        compoundColor: '#EF4444',
        lapsCompleted: 145,
        topSpeedKm: 332.6,
      },
      {
        rank: 4,
        driverId: 'hamilton',
        driverName: 'Lewis Hamilton',
        driverNumber: 44,
        teamId: 'ferrari',
        teamName: 'Ferrari',
        teamColor: '#E8002D',
        bestLapTime: '1:30.680',
        gapToLeader: '+0.375s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 129,
        topSpeedKm: 332.1,
      },
      {
        rank: 5,
        driverId: 'piastri',
        driverName: 'Oscar Piastri',
        driverNumber: 81,
        teamId: 'mclaren',
        teamName: 'McLaren',
        teamColor: '#FF8000',
        bestLapTime: '1:30.790',
        gapToLeader: '+0.485s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 134,
        topSpeedKm: 329.8,
      },
      {
        rank: 6,
        driverId: 'russell',
        driverName: 'George Russell',
        driverNumber: 63,
        teamId: 'mercedes',
        teamName: 'Mercedes',
        teamColor: '#27F4D2',
        bestLapTime: '1:30.850',
        gapToLeader: '+0.545s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 126,
        topSpeedKm: 330.2,
      },
      {
        rank: 7,
        driverId: 'antonelli',
        driverName: 'Andrea Kimi Antonelli',
        driverNumber: 12,
        teamId: 'mercedes',
        teamName: 'Mercedes',
        teamColor: '#27F4D2',
        bestLapTime: '1:30.980',
        gapToLeader: '+0.675s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 131,
        topSpeedKm: 329.5,
      },
      {
        rank: 8,
        driverId: 'alonso',
        driverName: 'Fernando Alonso',
        driverNumber: 14,
        teamId: 'aston_martin',
        teamName: 'Aston Martin',
        teamColor: '#229971',
        bestLapTime: '1:31.120',
        gapToLeader: '+0.815s',
        compound: 'C2',
        compoundColor: '#3B82F6',
        lapsCompleted: 118,
        topSpeedKm: 328.6,
      },
      {
        rank: 9,
        driverId: 'albon',
        driverName: 'Alexander Albon',
        driverNumber: 23,
        teamId: 'williams',
        teamName: 'Williams',
        teamColor: '#64C4FF',
        bestLapTime: '1:31.290',
        gapToLeader: '+0.985s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 122,
        topSpeedKm: 331.0,
      },
      {
        rank: 10,
        driverId: 'hulkenberg',
        driverName: 'Nico Hülkenberg',
        driverNumber: 27,
        teamId: 'sauber',
        teamName: 'Kick Sauber',
        teamColor: '#52E252',
        bestLapTime: '1:31.450',
        gapToLeader: '+1.145s',
        compound: 'C3',
        compoundColor: '#F59E0B',
        lapsCompleted: 115,
        topSpeedKm: 327.9,
      },
    ],
  },
];

export const PRESEASON_TEAM_MILEAGE: TestingTeamMileage[] = [
  {
    rank: 1,
    teamId: 'ferrari',
    teamName: 'Ferrari',
    fullName: 'Scuderia Ferrari HP',
    totalLaps: 418,
    totalKm: 2262,
    reliabilityScore: 98,
    color: '#E8002D',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp',
  },
  {
    rank: 2,
    teamId: 'red_bull',
    teamName: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    totalLaps: 405,
    totalKm: 2192,
    reliabilityScore: 96,
    color: '#3671C6',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp',
  },
  {
    rank: 3,
    teamId: 'mclaren',
    teamName: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    totalLaps: 392,
    totalKm: 2121,
    reliabilityScore: 95,
    color: '#FF8000',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp',
  },
  {
    rank: 4,
    teamId: 'mercedes',
    teamName: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS F1 Team',
    totalLaps: 380,
    totalKm: 2056,
    reliabilityScore: 94,
    color: '#27F4D2',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp',
  },
  {
    rank: 5,
    teamId: 'haas',
    teamName: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    totalLaps: 375,
    totalKm: 2029,
    reliabilityScore: 93,
    color: '#E6002B',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamcarright.webp',
  },
  {
    rank: 6,
    teamId: 'williams',
    teamName: 'Williams',
    fullName: 'Williams Racing',
    totalLaps: 365,
    totalKm: 1975,
    reliabilityScore: 91,
    color: '#64C4FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp',
  },
  {
    rank: 7,
    teamId: 'aston_martin',
    teamName: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    totalLaps: 352,
    totalKm: 1905,
    reliabilityScore: 89,
    color: '#229971',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp',
  },
  {
    rank: 8,
    teamId: 'alpine',
    teamName: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    totalLaps: 340,
    totalKm: 1840,
    reliabilityScore: 88,
    color: '#0090FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp',
  },
  {
    rank: 9,
    teamId: 'sauber',
    teamName: 'Kick Sauber',
    fullName: 'Stake F1 Team Kick Sauber',
    totalLaps: 330,
    totalKm: 1786,
    reliabilityScore: 86,
    color: '#52E252',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp',
  },
  {
    rank: 10,
    teamId: 'rb',
    teamName: 'Racing Bulls',
    fullName: 'Visa Cash App RB F1 Team',
    totalLaps: 315,
    totalKm: 1705,
    reliabilityScore: 85,
    color: '#6692FF',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp',
  },
];
