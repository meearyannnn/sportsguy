export interface TestingLapEntry {
  driverId: string;
  driverName: string;
  driverCode: string;
  teamName: string;
  teamId: string;
  bestLap: string;
  gap: string;
  compound: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  laps: number;
  session: 'Morning' | 'Afternoon' | 'Day';
}

export interface TestingIncident {
  time: string;
  day: number;
  type: 'RED_FLAG' | 'RELIABILITY' | 'INCIDENT' | 'AERO_RAKE';
  headline: string;
  detail: string;
  team?: string;
}

export interface TeamMileage {
  teamName: string;
  teamId: string;
  color: string;
  laps: number;
  kilometers: number;
  powerUnit: string;
}

export interface PreSeasonTestingDay {
  day: number;
  date: string;
  circuit: string;
  location: string;
  trackTemp: string;
  airTemp: string;
  fastestDriver: string;
  fastestTime: string;
  totalLapsCompleted: number;
  entries: TestingLapEntry[];
  incidents: TestingIncident[];
}

export const PRESEASON_TESTING_DATA: {
  season: string;
  venue: string;
  provisionalNotice: string;
  days: PreSeasonTestingDay[];
  mileage: TeamMileage[];
} = {
  season: 'Formula 1 Pre-Season',
  venue: 'Bahrain International Circuit',
  provisionalNotice: 'Pre-season testing feeds activate during official FIA testing windows.',
  days: [],
  mileage: [],
};
