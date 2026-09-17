import { F1_TEAMS } from './teams';

export interface PitStopRecord {
  id: string;
  driverId: string;
  driverName: string;
  driverCode: string;
  teamId: string;
  teamName: string;
  round: number;
  gpName: string;
  lap: number;
  stopNumber: number;
  stationaryTime: number; // in seconds
  pitLaneTime: number;
  date: string;
}

export interface TeamPitCrewRanking {
  teamId: string;
  teamName: string;
  color: string;
  dhlPoints: number;
  averageStationaryTime: number;
  fastestStop: number;
  sub25StopsCount: number;
  totalStops: number;
}

export const TOP_SEASON_PIT_STOPS: PitStopRecord[] = [];
export const TEAM_PIT_CREW_STANDINGS: TeamPitCrewRanking[] = [];
