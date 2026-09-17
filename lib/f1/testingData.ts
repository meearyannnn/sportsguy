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
  season: '2024 / 2025 Pre-Season',
  venue: 'Bahrain International Circuit, Sakhir (5.412 km)',
  provisionalNotice:
    'PROVISIONAL TELEMETRY • RUN PLANS & FUEL LOADS NOT DISCLOSED. Testing lap times are indicative only; engine modes, high-fuel race simulations, and aerodynamic test rakes alter performance deltas by 2.0s to 3.5s.',
  days: [
    {
      day: 1,
      date: 'February 21',
      circuit: 'Bahrain International Circuit',
      location: 'Sakhir, Bahrain',
      trackTemp: '36.2°C',
      airTemp: '24.1°C',
      fastestDriver: 'Max Verstappen',
      fastestTime: '1:31.344',
      totalLapsCompleted: 1238,
      entries: [
        { driverId: 'max_verstappen', driverName: 'Max Verstappen', driverCode: 'VER', teamName: 'Red Bull Racing', teamId: 'red_bull', bestLap: '1:31.344', gap: 'LEADER', compound: 'C3', laps: 142, session: 'Day' },
        { driverId: 'norris', driverName: 'Lando Norris', driverCode: 'NOR', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:32.484', gap: '+1.140s', compound: 'C3', laps: 72, session: 'Afternoon' },
        { driverId: 'sainz', driverName: 'Carlos Sainz', driverCode: 'SAI', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:32.584', gap: '+1.240s', compound: 'C3', laps: 69, session: 'Afternoon' },
        { driverId: 'ricciardo', driverName: 'Daniel Ricciardo', driverCode: 'RIC', teamName: 'Racing Bulls', teamId: 'rb', bestLap: '1:32.599', gap: '+1.255s', compound: 'C3', laps: 51, session: 'Afternoon' },
        { driverId: 'gasly', driverName: 'Pierre Gasly', driverCode: 'GAS', teamName: 'Alpine', teamId: 'alpine', bestLap: '1:32.805', gap: '+1.461s', compound: 'C3', laps: 60, session: 'Afternoon' },
        { driverId: 'stroll', driverName: 'Lance Stroll', driverCode: 'STR', teamName: 'Aston Martin', teamId: 'aston_martin', bestLap: '1:33.007', gap: '+1.663s', compound: 'C3', laps: 53, session: 'Afternoon' },
        { driverId: 'leclerc', driverName: 'Charles Leclerc', driverCode: 'LEC', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:33.247', gap: '+1.903s', compound: 'C3', laps: 64, session: 'Morning' },
        { driverId: 'alonso', driverName: 'Fernando Alonso', driverCode: 'ALO', teamName: 'Aston Martin', teamId: 'aston_martin', bestLap: '1:33.385', gap: '+2.041s', compound: 'C2', laps: 77, session: 'Morning' },
        { driverId: 'piastri', driverName: 'Oscar Piastri', driverCode: 'PIA', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:33.658', gap: '+2.314s', compound: 'C3', laps: 57, session: 'Morning' },
        { driverId: 'zhou', driverName: 'Zhou Guanyu', driverCode: 'ZHO', teamName: 'Kick Sauber', teamId: 'sauber', bestLap: '1:33.871', gap: '+2.527s', compound: 'C3', laps: 62, session: 'Afternoon' },
        { driverId: 'russell', driverName: 'George Russell', driverCode: 'RUS', teamName: 'Mercedes', teamId: 'mercedes', bestLap: '1:34.109', gap: '+2.765s', compound: 'C3', laps: 121, session: 'Day' },
        { driverId: 'albon', driverName: 'Alex Albon', driverCode: 'ALB', teamName: 'Williams', teamId: 'williams', bestLap: '1:34.587', gap: '+3.243s', compound: 'C4', laps: 40, session: 'Morning' },
      ],
      incidents: [
        { time: '11:42', day: 1, type: 'RELIABILITY', headline: 'Williams Fuel Pump Stoppage', detail: 'Alex Albon pulled off track at Turn 2 with a precautionary fuel system shutdown.', team: 'Williams' },
        { time: '14:15', day: 1, type: 'AERO_RAKE', headline: 'Mercedes Extensive Kiel Probe Calibration', detail: 'George Russell conducted 25 laps with oversized front-wing aero rakes to map floor downforce.', team: 'Mercedes' },
      ],
    },
    {
      day: 2,
      date: 'February 22',
      circuit: 'Bahrain International Circuit',
      location: 'Sakhir, Bahrain',
      trackTemp: '37.8°C',
      airTemp: '23.8°C',
      fastestDriver: 'Carlos Sainz',
      fastestTime: '1:29.921',
      totalLapsCompleted: 1290,
      entries: [
        { driverId: 'sainz', driverName: 'Carlos Sainz', driverCode: 'SAI', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:29.921', gap: 'LEADER', compound: 'C4', laps: 84, session: 'Afternoon' },
        { driverId: 'perez', driverName: 'Sergio Perez', driverCode: 'PER', teamName: 'Red Bull Racing', teamId: 'red_bull', bestLap: '1:30.679', gap: '+0.758s', compound: 'C3', laps: 129, session: 'Day' },
        { driverId: 'hamilton', driverName: 'Lewis Hamilton', driverCode: 'HAM', teamName: 'Mercedes', teamId: 'mercedes', bestLap: '1:31.066', gap: '+1.145s', compound: 'C3', laps: 123, session: 'Day' },
        { driverId: 'norris', driverName: 'Lando Norris', driverCode: 'NOR', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:31.256', gap: '+1.335s', compound: 'C3', laps: 52, session: 'Afternoon' },
        { driverId: 'ricciardo', driverName: 'Daniel Ricciardo', driverCode: 'RIC', teamName: 'Racing Bulls', teamId: 'rb', bestLap: '1:31.361', gap: '+1.440s', compound: 'C4', laps: 88, session: 'Afternoon' },
        { driverId: 'leclerc', driverName: 'Charles Leclerc', driverCode: 'LEC', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:31.750', gap: '+1.829s', compound: 'C3', laps: 54, session: 'Morning' },
        { driverId: 'stroll', driverName: 'Lance Stroll', driverCode: 'STR', teamName: 'Aston Martin', teamId: 'aston_martin', bestLap: '1:32.029', gap: '+2.108s', compound: 'C3', laps: 96, session: 'Afternoon' },
        { driverId: 'ocon', driverName: 'Esteban Ocon', driverCode: 'OCO', teamName: 'Alpine', teamId: 'alpine', bestLap: '1:32.061', gap: '+2.140s', compound: 'C3', laps: 78, session: 'Afternoon' },
        { driverId: 'bottas', driverName: 'Valtteri Bottas', driverCode: 'BOT', teamName: 'Kick Sauber', teamId: 'sauber', bestLap: '1:32.227', gap: '+2.306s', compound: 'C3', laps: 97, session: 'Afternoon' },
        { driverId: 'piastri', driverName: 'Oscar Piastri', driverCode: 'PIA', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:32.328', gap: '+2.407s', compound: 'C3', laps: 35, session: 'Morning' },
        { driverId: 'sargeant', driverName: 'Logan Sargeant', driverCode: 'SAR', teamName: 'Williams', teamId: 'williams', bestLap: '1:32.578', gap: '+2.657s', compound: 'C4', laps: 117, session: 'Day' },
        { driverId: 'hulkenberg', driverName: 'Nico Hulkenberg', driverCode: 'HUL', teamName: 'Haas', teamId: 'haas', bestLap: '1:37.509', gap: '+7.588s', compound: 'C2', laps: 89, session: 'Morning' },
      ],
      incidents: [
        { time: '10:22', day: 2, type: 'RED_FLAG', headline: 'Drain Cover Dislodged at Turn 11 Kerb', detail: 'Lewis Hamilton ran over a loosened metal drain frame on entry kerbing, triggering a 75-minute red flag for circuit welding.', team: 'FIA Race Direction' },
        { time: '12:10', day: 2, type: 'INCIDENT', headline: 'Ferrari Floor Replacement Required', detail: 'Charles Leclerc sustained minor floor damage running over debris from the Turn 11 drain cover; car repaired in under 40 mins.', team: 'Ferrari' },
      ],
    },
    {
      day: 3,
      date: 'February 23',
      circuit: 'Bahrain International Circuit',
      location: 'Sakhir, Bahrain',
      trackTemp: '34.5°C',
      airTemp: '22.9°C',
      fastestDriver: 'Charles Leclerc',
      fastestTime: '1:30.322',
      totalLapsCompleted: 1215,
      entries: [
        { driverId: 'leclerc', driverName: 'Charles Leclerc', driverCode: 'LEC', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:30.322', gap: 'LEADER', compound: 'C4', laps: 74, session: 'Afternoon' },
        { driverId: 'russell', driverName: 'George Russell', driverCode: 'RUS', teamName: 'Mercedes', teamId: 'mercedes', bestLap: '1:30.368', gap: '+0.046s', compound: 'C4', laps: 67, session: 'Afternoon' },
        { driverId: 'zhou', driverName: 'Zhou Guanyu', driverCode: 'ZHO', teamName: 'Kick Sauber', teamId: 'sauber', bestLap: '1:30.647', gap: '+0.325s', compound: 'C4', laps: 85, session: 'Afternoon' },
        { driverId: 'max_verstappen', driverName: 'Max Verstappen', driverCode: 'VER', teamName: 'Red Bull Racing', teamId: 'red_bull', bestLap: '1:30.755', gap: '+0.433s', compound: 'C3', laps: 66, session: 'Afternoon' },
        { driverId: 'tsunoda', driverName: 'Yuki Tsunoda', driverCode: 'TSU', teamName: 'Racing Bulls', teamId: 'rb', bestLap: '1:30.775', gap: '+0.453s', compound: 'C4', laps: 53, session: 'Afternoon' },
        { driverId: 'albon', driverName: 'Alex Albon', driverCode: 'ALB', teamName: 'Williams', teamId: 'williams', bestLap: '1:30.984', gap: '+0.662s', compound: 'C4', laps: 121, session: 'Day' },
        { driverId: 'piastri', driverName: 'Oscar Piastri', driverCode: 'PIA', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:31.030', gap: '+0.708s', compound: 'C3', laps: 91, session: 'Afternoon' },
        { driverId: 'alonso', driverName: 'Fernando Alonso', driverCode: 'ALO', teamName: 'Aston Martin', teamId: 'aston_martin', bestLap: '1:31.159', gap: '+0.837s', compound: 'C3', laps: 75, session: 'Afternoon' },
        { driverId: 'sainz', driverName: 'Carlos Sainz', driverCode: 'SAI', teamName: 'Ferrari', teamId: 'ferrari', bestLap: '1:31.247', gap: '+0.925s', compound: 'C3', laps: 71, session: 'Morning' },
        { driverId: 'perez', driverName: 'Sergio Perez', driverCode: 'PER', teamName: 'Red Bull Racing', teamId: 'red_bull', bestLap: '1:31.483', gap: '+1.161s', compound: 'C3', laps: 53, session: 'Morning' },
        { driverId: 'norris', driverName: 'Lando Norris', driverCode: 'NOR', teamName: 'McLaren', teamId: 'mclaren', bestLap: '1:31.622', gap: '+1.300s', compound: 'C3', laps: 20, session: 'Morning' },
        { driverId: 'gasly', driverName: 'Pierre Gasly', driverCode: 'GAS', teamName: 'Alpine', teamId: 'alpine', bestLap: '1:32.149', gap: '+1.827s', compound: 'C3', laps: 47, session: 'Afternoon' },
      ],
      incidents: [
        { time: '10:45', day: 3, type: 'RED_FLAG', headline: 'Second Drain Cover Failure at Turn 11', detail: 'A second drain cover dislodged during morning runs; session was suspended and lunch break cancelled to preserve track time.', team: 'FIA Race Direction' },
        { time: '12:20', day: 3, type: 'RELIABILITY', headline: 'McLaren Clutch Inspection Delays Norris', detail: 'Lando Norris sat in the garage for over 2 hours while mechanics diagnosed a sensor anomaly on the clutch assembly.', team: 'McLaren' },
      ],
    },
  ],
  mileage: [
    { teamName: 'Haas', teamId: 'haas', color: '#E6002B', laps: 441, kilometers: 2386, powerUnit: 'Ferrari' },
    { teamName: 'Ferrari', teamId: 'ferrari', color: '#E8002D', laps: 416, kilometers: 2251, powerUnit: 'Ferrari' },
    { teamName: 'Red Bull Racing', teamId: 'red_bull', color: '#3671C6', laps: 391, kilometers: 2116, powerUnit: 'Honda RBPT' },
    { teamName: 'Aston Martin', teamId: 'aston_martin', color: '#229971', laps: 379, kilometers: 2051, powerUnit: 'Mercedes' },
    { teamName: 'Kick Sauber', teamId: 'sauber', color: '#52E252', laps: 379, kilometers: 2051, powerUnit: 'Ferrari' },
    { teamName: 'Racing Bulls', teamId: 'rb', color: '#6692FF', laps: 367, kilometers: 1986, powerUnit: 'Honda RBPT' },
    { teamName: 'Mercedes', teamId: 'mercedes', color: '#27F4D2', laps: 361, kilometers: 1953, powerUnit: 'Mercedes' },
    { teamName: 'Alpine', teamId: 'alpine', color: '#0090FF', laps: 334, kilometers: 1807, powerUnit: 'Renault' },
    { teamName: 'McLaren', teamId: 'mclaren', color: '#FF8000', laps: 328, kilometers: 1775, powerUnit: 'Mercedes' },
    { teamName: 'Williams', teamId: 'williams', color: '#64C4FF', laps: 299, kilometers: 1618, powerUnit: 'Mercedes' },
  ],
};
