import { DriverStanding, ConstructorStanding, Race, RaceResult } from './types';
import { TOP_SEASON_PIT_STOPS, TEAM_PIT_CREW_STANDINGS } from './pitstops';
import { JUNIOR_SERIES_DATABASE, getAcademyDriversForTeam } from './juniorSeries';
import { PRESEASON_TESTING_DATA } from './testingData';
import { F1_TEAMS } from './teams';
import { NavTab } from '@/components/f1/Navbar';

export interface AskApexResult {
  query: string;
  isAnswered: boolean;
  headline: string;
  answer: string;
  highlightValue?: string;
  highlightLabel?: string;
  targetTab?: NavTab;
  targetDriverId?: string;
  actionText?: string;
  category: 'STANDINGS' | 'DRIVER' | 'PIT_STOP' | 'CALENDAR' | 'JUNIOR' | 'TESTING' | 'DECLINED';
}

export function queryApexIntelligence(
  rawQuery: string,
  driverStandings: DriverStanding[],
  calendar: Race[],
  recentResults: RaceResult[]
): AskApexResult {
  const query = rawQuery.trim().toLowerCase();

  // 1. Championship Leader / Standings
  if (
    !query.includes('f2') &&
    !query.includes('f3') &&
    !query.includes('academy') &&
    !query.includes('junior') &&
    (query.includes('who is leading') ||
      query.includes('who leads') ||
      query.includes('championship leader') ||
      query.includes('standings leader') ||
      query.includes('first in standings') ||
      query.includes('p1') ||
      query.includes('points leader'))
  ) {
    const leader = driverStandings[0];
    const p2 = driverStandings[1];
    if (leader) {
      const leaderName = `${leader.Driver.givenName} ${leader.Driver.familyName}`;
      const gap = p2 ? parseInt(leader.points, 10) - parseInt(p2.points, 10) : 0;
      return {
        query: rawQuery,
        isAnswered: true,
        headline: 'Championship Leader',
        answer: `${leaderName} leads the 2024 FIA Formula 1 World Drivers' Championship with ${leader.points} points (${leader.wins} wins), holding a ${gap}-point margin over ${p2?.Driver.givenName} ${p2?.Driver.familyName}.`,
        highlightValue: `${leader.points} PTS`,
        highlightLabel: `${leader.Driver.code} • P1`,
        targetTab: 'standings',
        actionText: 'View World Standings →',
        category: 'STANDINGS',
      };
    }
  }

  // 2. Fastest Pit Stop / Pit Crew
  if (
    query.includes('pit stop') ||
    query.includes('pitstop') ||
    query.includes('fastest stop') ||
    query.includes('pit crew') ||
    query.includes('wheel change')
  ) {
    const best = TOP_SEASON_PIT_STOPS[0];
    const bestTeam = TEAM_PIT_CREW_STANDINGS[0];
    return {
      query: rawQuery,
      isAnswered: true,
      headline: 'Fastest Pit Stop Benchmark',
      answer: `${best.teamName} holds the season record with a ${best.stationaryTime.toFixed(2)}s stationary stop for ${best.driverName} at the ${best.gpName}. ${bestTeam.teamName} currently leads the Pit Crew Championship with ${bestTeam.dhlPoints} points.`,
      highlightValue: `${best.stationaryTime.toFixed(2)}s`,
      highlightLabel: `${best.teamName}`,
      targetTab: 'pitcrew',
      actionText: 'Open Pit Crew Leaderboard →',
      category: 'PIT_STOP',
    };
  }

  // 3. Next Race / Calendar
  if (
    query.includes('next race') ||
    query.includes('upcoming race') ||
    query.includes('next gp') ||
    query.includes('next grand prix') ||
    query.includes('where is the next') ||
    query.includes('when is the next')
  ) {
    const now = Date.now();
    const next =
      calendar.find((r) => {
        const iso = r.time ? `${r.date}T${r.time}` : `${r.date}T13:00:00Z`;
        return new Date(iso).getTime() > now;
      }) || calendar[calendar.length - 1];

    if (next) {
      return {
        query: rawQuery,
        isAnswered: true,
        headline: 'Next Grand Prix',
        answer: `Round ${next.round}: The ${next.raceName} takes place at ${next.Circuit.circuitName} in ${next.Circuit.Location.locality}, ${next.Circuit.Location.country} on ${next.date}.`,
        highlightValue: `RND ${next.round}`,
        highlightLabel: next.raceName,
        targetTab: 'calendar',
        actionText: 'View Season Calendar →',
        category: 'CALENDAR',
      };
    }
  }

  // 4. Pre-Season Testing
  if (
    query.includes('testing') ||
    query.includes('pre-season') ||
    query.includes('preseason') ||
    query.includes('bahrain test')
  ) {
    return {
      query: rawQuery,
      isAnswered: true,
      headline: 'Pre-Season Testing Intelligence',
      answer: `Carlos Sainz (Ferrari) set the fastest overall benchmark lap of 1:29.921 on Day 2 in Bahrain. Haas logged the highest cumulative mileage with 441 laps (2,386 km). Note: fuel loads and engine run plans were undisclosed.`,
      highlightValue: '1:29.921',
      highlightLabel: 'SAI • Ferrari',
      targetTab: 'testing',
      actionText: 'Open Testing Telemetry →',
      category: 'TESTING',
    };
  }

  // 5. Junior Series (F2, F3, F1 Academy)
  if (
    query.includes('f2') ||
    query.includes('formula 2') ||
    query.includes('f3') ||
    query.includes('formula 3') ||
    query.includes('f1 academy') ||
    query.includes('academy') ||
    query.includes('junior')
  ) {
    if (query.includes('academy') || query.includes('f1 academy')) {
      const p1 = JUNIOR_SERIES_DATABASE.academy.drivers[0];
      return {
        query: rawQuery,
        isAnswered: true,
        headline: 'F1 Academy Leader',
        answer: `${p1.name} leads the F1 Academy Championship with ${p1.points} points (${p1.wins} wins) representing ${p1.team} and supported by the Alpine Academy.`,
        highlightValue: `${p1.points} PTS`,
        highlightLabel: `${p1.name} (P1)`,
        targetTab: 'junior',
        actionText: 'View F1 Academy Standings →',
        category: 'JUNIOR',
      };
    }

    if (query.includes('f3') || query.includes('formula 3')) {
      const p1 = JUNIOR_SERIES_DATABASE.f3.drivers[0];
      return {
        query: rawQuery,
        isAnswered: true,
        headline: 'FIA Formula 3 Champion',
        answer: `${p1.name} (${p1.team}) clinched the FIA Formula 3 title with ${p1.points} points after a dramatic Monza season finale.`,
        highlightValue: `${p1.points} PTS`,
        highlightLabel: `${p1.name} • P1`,
        targetTab: 'junior',
        actionText: 'View Junior Series Hub →',
        category: 'JUNIOR',
      };
    }

    // F2 default
    const p1 = JUNIOR_SERIES_DATABASE.f2.drivers[0];
    const p2 = JUNIOR_SERIES_DATABASE.f2.drivers[1];
    return {
      query: rawQuery,
      isAnswered: true,
      headline: 'FIA Formula 2 Standings',
      answer: `${p1.name} (${p1.team}, Red Bull Junior) leads the FIA F2 Championship with ${p1.points} points, engaged in a tight title fight with ${p2.name} (${p2.points} pts).`,
      highlightValue: `${p1.points} PTS`,
      highlightLabel: `${p1.name} • P1`,
      targetTab: 'junior',
      actionText: 'View F2 Standings →',
      category: 'JUNIOR',
    };
  }

  // 6. Specific Driver Queries
  const driverQueryMap: Record<string, string> = {
    norris: 'norris',
    lando: 'norris',
    verstappen: 'max_verstappen',
    max: 'max_verstappen',
    leclerc: 'leclerc',
    charles: 'leclerc',
    hamilton: 'hamilton',
    lewis: 'hamilton',
    piastri: 'piastri',
    oscar: 'piastri',
    sainz: 'sainz',
    carlos: 'sainz',
    russell: 'russell',
    george: 'russell',
    alonso: 'alonso',
    fernando: 'alonso',
    perez: 'perez',
    checo: 'perez',
  };

  for (const [key, driverId] of Object.entries(driverQueryMap)) {
    if (query.includes(key)) {
      const standing = driverStandings.find(
        (s) => s.Driver.driverId === driverId || s.Driver.familyName.toLowerCase().includes(key)
      );
      if (standing) {
        const d = standing.Driver;
        const constr = standing.Constructors[0]?.name || 'F1';
        return {
          query: rawQuery,
          isAnswered: true,
          headline: `${d.givenName} ${d.familyName} Telemetry Profile`,
          answer: `${d.givenName} ${d.familyName} races for ${constr}. This season: Championship P${standing.position} with ${standing.points} points and ${standing.wins} Grand Prix victories.`,
          highlightValue: `P${standing.position}`,
          highlightLabel: `${standing.points} PTS • ${standing.wins} Wins`,
          targetDriverId: d.driverId,
          actionText: `Open ${d.familyName} Dossier →`,
          category: 'DRIVER',
        };
      }
    }
  }

  // 7. Closest Finish / Race Margins
  if (query.includes('closest finish') || query.includes('smallest gap') || query.includes('closest race')) {
    return {
      query: rawQuery,
      isAnswered: true,
      headline: 'Closest Grand Prix Finish',
      answer: 'The closest finish of the season occurred at the Italian Grand Prix in Monza, with Charles Leclerc holding off Oscar Piastri by just 2.664 seconds, following a thrilling tyre-conservation one-stop strategy.',
      highlightValue: '2.664s',
      highlightLabel: 'Monza Delta',
      targetTab: 'results',
      actionText: 'View Race Results →',
      category: 'STANDINGS',
    };
  }

  // 8. Out of Scope / Speculative / Declined
  return {
    query: rawQuery,
    isAnswered: false,
    headline: 'Pit Radio • Outside Telemetry Parameters',
    answer:
      'APEX only processes factual queries derived from official FIA timing, standings, pit stop data, pre-season testing, and junior series feeder pipelines. Speculative predictions and opinions are excluded.',
    highlightValue: 'STANDBY',
    highlightLabel: 'Pit Radio',
    category: 'DECLINED',
  };
}
