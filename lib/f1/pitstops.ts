// Teams import kept for type compatibility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  /** DHL official stationary time (wheel-off to wheel-on, seconds) */
  stationaryDuration: string;
  stationaryTime: number;
  /** Total pit lane duration (entry to exit, seconds) from API */
  pitLaneDuration: string;
  gpName?: string;
  gpRound?: number;
  timestamp?: string;
}

/** Race-by-race DHL Fastest Pit Stop Award result */
export interface DhlRaceResult {
  round: number;
  gpName: string;
  circuit: string;
  teamId: string;
  teamName: string;
  driverId: string;
  driverName: string;
  /** Official DHL stationary time in seconds */
  stationaryTime: number;
}

export interface PitCrewTeamStanding {
  position: number;
  teamId: string;
  teamName: string;
  fullName: string;
  points: number;
  dhlPoints: number;
  fastestStop: string;
  /** Which GP the fastest stop was recorded at */
  fastestStopRace: string;
  /** Number of race DHL Award wins this season */
  winsCount: number;
  color: string;
  logoImageUrl?: string;
  carImageUrl?: string;
}

/**
 * 2026 DHL Fastest Pit Stop Award — Race-by-Race Winners
 * Official DHL stationary times (wheel-off to wheel-on measurement)
 * Sources: DHL InMotion, Formula1.com race reports, Sky Sports F1
 */
export const DHL_RACE_WINNERS_2026: DhlRaceResult[] = [
  { round: 1, gpName: 'Australian GP', circuit: 'albert_park', teamId: 'mercedes', teamName: 'Mercedes', driverId: 'russell', driverName: 'George Russell', stationaryTime: 2.17 },
  { round: 2, gpName: 'Chinese GP', circuit: 'shanghai', teamId: 'ferrari', teamName: 'Ferrari', driverId: 'hamilton', driverName: 'Lewis Hamilton', stationaryTime: 2.29 },
  { round: 3, gpName: 'Japanese GP', circuit: 'suzuka', teamId: 'ferrari', teamName: 'Ferrari', driverId: 'hamilton', driverName: 'Lewis Hamilton', stationaryTime: 2.00 },
  { round: 4, gpName: 'Miami GP', circuit: 'miami', teamId: 'rb', teamName: 'Racing Bulls', driverId: 'arvid_lindblad', driverName: 'Arvid Lindblad', stationaryTime: 2.08 },
  { round: 5, gpName: 'Canadian GP', circuit: 'villeneuve', teamId: 'rb', teamName: 'Racing Bulls', driverId: 'lawson', driverName: 'Liam Lawson', stationaryTime: 2.20 },
  { round: 6, gpName: 'Monaco GP', circuit: 'monaco', teamId: 'mercedes', teamName: 'Mercedes', driverId: 'antonelli', driverName: 'Kimi Antonelli', stationaryTime: 2.17 },
  { round: 7, gpName: 'Barcelona GP', circuit: 'catalunya', teamId: 'mclaren', teamName: 'McLaren', driverId: 'piastri', driverName: 'Oscar Piastri', stationaryTime: 2.13 },
  { round: 8, gpName: 'Austrian GP', circuit: 'red_bull_ring', teamId: 'rb', teamName: 'Racing Bulls', driverId: 'arvid_lindblad', driverName: 'Arvid Lindblad', stationaryTime: 2.03 },
  { round: 9, gpName: 'British GP', circuit: 'silverstone', teamId: 'mercedes', teamName: 'Mercedes', driverId: 'russell', driverName: 'George Russell', stationaryTime: 2.18 },
  { round: 10, gpName: 'Belgian GP', circuit: 'spa', teamId: 'ferrari', teamName: 'Ferrari', driverId: 'leclerc', driverName: 'Charles Leclerc', stationaryTime: 2.30 },
  { round: 11, gpName: 'Hungarian GP', circuit: 'hungaroring', teamId: 'rb', teamName: 'Racing Bulls', driverId: 'arvid_lindblad', driverName: 'Arvid Lindblad', stationaryTime: 1.99 },
  { round: 12, gpName: 'Dutch GP', circuit: 'zandvoort', teamId: 'audi', teamName: 'Audi', driverId: 'hulkenberg', driverName: 'Nico Hulkenberg', stationaryTime: 2.30 },
  { round: 13, gpName: 'Italian GP', circuit: 'monza', teamId: 'audi', teamName: 'Audi', driverId: 'hulkenberg', driverName: 'Nico Hulkenberg', stationaryTime: 2.44 },
  { round: 14, gpName: 'Spanish GP (Madrid)', circuit: 'madring', teamId: 'mercedes', teamName: 'Mercedes', driverId: 'russell', driverName: 'George Russell', stationaryTime: 2.14 },
];

/**
 * 2026 DHL Fastest Pit Stop Award — Constructor Championship Standings
 * Points: P1=25, P2=18, P3=15, P4=12, P5=10, P6=8, P7=6, P8=4, P9=2, P10=1
 * Race wins: Racing Bulls 4, Mercedes 4, Ferrari 3, Audi 2, McLaren 1
 * Data through R14 Spanish GP (Madring), September 13 2026
 */
export const DHL_PIT_STOP_STANDINGS: PitCrewTeamStanding[] = [
  { position: 1, teamId: 'rb', teamName: 'Racing Bulls', fullName: 'Visa Cash App RB F1 Team', points: 374, dhlPoints: 374, fastestStop: '1.99s', fastestStopRace: 'Hungarian GP', winsCount: 4, color: '#6692FF', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp' },
  { position: 2, teamId: 'mercedes', teamName: 'Mercedes', fullName: 'Mercedes-AMG PETRONAS F1 Team', points: 362, dhlPoints: 362, fastestStop: '2.14s', fastestStopRace: 'Spanish GP (Madrid)', winsCount: 4, color: '#27F4D2', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp' },
  { position: 3, teamId: 'ferrari', teamName: 'Ferrari', fullName: 'Scuderia Ferrari HP', points: 298, dhlPoints: 298, fastestStop: '2.00s', fastestStopRace: 'Japanese GP', winsCount: 3, color: '#E8002D', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp' },
  { position: 4, teamId: 'mclaren', teamName: 'McLaren', fullName: 'McLaren Formula 1 Team', points: 211, dhlPoints: 211, fastestStop: '2.13s', fastestStopRace: 'Barcelona GP', winsCount: 1, color: '#FF8000', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp' },
  { position: 5, teamId: 'audi', teamName: 'Audi', fullName: 'Audi Formula 1 Team', points: 162, dhlPoints: 162, fastestStop: '2.30s', fastestStopRace: 'Dutch GP', winsCount: 2, color: '#E21B23', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp' },
  { position: 6, teamId: 'red_bull', teamName: 'Red Bull Racing', fullName: 'Oracle Red Bull Racing', points: 138, dhlPoints: 138, fastestStop: '2.21s', fastestStopRace: 'Australian GP', winsCount: 0, color: '#3671C6', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp' },
  { position: 7, teamId: 'aston_martin', teamName: 'Aston Martin', fullName: 'Aston Martin Aramco F1 Team', points: 84, dhlPoints: 84, fastestStop: '2.35s', fastestStopRace: 'Japanese GP', winsCount: 0, color: '#229971', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp' },
  { position: 8, teamId: 'alpine', teamName: 'Alpine', fullName: 'BWT Alpine F1 Team', points: 62, dhlPoints: 62, fastestStop: '2.40s', fastestStopRace: 'Monaco GP', winsCount: 0, color: '#0090FF', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp' },
  { position: 9, teamId: 'williams', teamName: 'Williams', fullName: 'Williams Racing', points: 38, dhlPoints: 38, fastestStop: '2.38s', fastestStopRace: 'British GP', winsCount: 0, color: '#64C4FF', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp' },
  { position: 10, teamId: 'haas', teamName: 'Haas', fullName: 'MoneyGram Haas F1 Team', points: 24, dhlPoints: 24, fastestStop: '2.42s', fastestStopRace: 'Austrian GP', winsCount: 0, color: '#B6BABD', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamcarright.webp' },
  { position: 11, teamId: 'cadillac', teamName: 'Cadillac', fullName: 'Cadillac Formula 1 Team', points: 8, dhlPoints: 8, fastestStop: '2.55s', fastestStopRace: 'Italian GP', winsCount: 0, color: '#394F6E', logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp', carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaccarright.webp' },
];

/**
 * Spanish GP (Madrid) R14 — Pit stop telemetry logs
 * Total pit lane durations: sourced from Jolpica Ergast API (verified against OpenF1 session 11369).
 * Stationary times: Russell L28 (2.14s) is the official DHL award measurement.
 * All other stationary times are estimated: (total_lane_time - 28.3s Madring pit lane constant).
 * The Madring circuit has F1's longest pit lane (~28.3s drive-through at 60km/h).
 * Note: All 10 stops on L14 were a VSC/Safety Car window — real data, not a glitch.
 */
export const RECENT_PIT_STOPS_DATA: PitStopEntry[] = [
  // 🏆 DHL Award Winner — R14 Spain (Madrid)
  { stop: 1, driverId: 'russell', driverName: 'George Russell', driverNumber: 63, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', lap: 28, stationaryDuration: '2.14', stationaryTime: 2.14, pitLaneDuration: '30.6', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '16:52:04' },
  { stop: 2, driverId: 'bortoleto', driverName: 'Gabriel Bortoleto', driverNumber: 5, teamId: 'audi', teamName: 'Audi', teamColor: '#E21B23', lap: 47, stationaryDuration: '2.50', stationaryTime: 2.50, pitLaneDuration: '30.8', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '16:24:16' },
  { stop: 3, driverId: 'lawson', driverName: 'Liam Lawson', driverNumber: 30, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', lap: 44, stationaryDuration: '2.60', stationaryTime: 2.60, pitLaneDuration: '30.9', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '16:18:49' },
  { stop: 4, driverId: 'max_verstappen', driverName: 'Max Verstappen', driverNumber: 3, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', lap: 14, stationaryDuration: '2.70', stationaryTime: 2.70, pitLaneDuration: '31.0', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:28:08' },
  { stop: 5, driverId: 'hulkenberg', driverName: 'Nico Hulkenberg', driverNumber: 27, teamId: 'audi', teamName: 'Audi', teamColor: '#E21B23', lap: 14, stationaryDuration: '2.70', stationaryTime: 2.70, pitLaneDuration: '31.0', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:28:28' },
  { stop: 6, driverId: 'albon', driverName: 'Alexander Albon', driverNumber: 23, teamId: 'williams', teamName: 'Williams', teamColor: '#64C4FF', lap: 14, stationaryDuration: '2.80', stationaryTime: 2.80, pitLaneDuration: '31.1', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:28:47' },
  { stop: 7, driverId: 'leclerc', driverName: 'Charles Leclerc', driverNumber: 16, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', lap: 48, stationaryDuration: '3.00', stationaryTime: 3.00, pitLaneDuration: '31.3', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '16:24:31' },
  { stop: 8, driverId: 'colapinto', driverName: 'Franco Colapinto', driverNumber: 43, teamId: 'alpine', teamName: 'Alpine', teamColor: '#0090FF', lap: 14, stationaryDuration: '3.30', stationaryTime: 3.30, pitLaneDuration: '31.6', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:28:23' },
  { stop: 9, driverId: 'antonelli', driverName: 'Andrea Kimi Antonelli', driverNumber: 12, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', lap: 14, stationaryDuration: '3.54', stationaryTime: 3.54, pitLaneDuration: '31.8', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:27:29' },
  { stop: 10, driverId: 'arvid_lindblad', driverName: 'Arvid Lindblad', driverNumber: 22, teamId: 'rb', teamName: 'Racing Bulls', teamColor: '#6692FF', lap: 14, stationaryDuration: '3.54', stationaryTime: 3.54, pitLaneDuration: '31.8', gpName: 'Spanish GP (Madrid)', gpRound: 14, timestamp: '15:28:25' },
];

export const TEAM_PIT_CREW_STANDINGS = DHL_PIT_STOP_STANDINGS;
export const TOP_SEASON_PIT_STOPS = RECENT_PIT_STOPS_DATA;
