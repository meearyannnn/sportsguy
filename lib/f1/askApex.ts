import { DriverStanding, ConstructorStanding, Race, RaceResult } from './types';
import { TOP_SEASON_PIT_STOPS, TEAM_PIT_CREW_STANDINGS } from './pitstops';
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
        answer: `${leaderName} leads the World Drivers' Championship with ${leader.points} points (${leader.wins} wins), holding a ${gap}-point margin over ${p2?.Driver.givenName || 'rivals'} ${p2?.Driver.familyName || ''}.`,
        highlightValue: `${leader.points} PTS`,
        highlightLabel: `${leader.Driver.code || 'P1'} • P1`,
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
      answer: `Official pre-season telemetry sessions track aerodynamic rakes, tyre degradation deltas, and multi-stint simulation runs. View detailed testing telemetry in the testing module.`,
      highlightValue: 'TESTING',
      highlightLabel: 'Telemetry Hub',
      targetTab: 'testing',
      actionText: 'Open Testing Telemetry →',
      category: 'TESTING',
    };
  }

  // 5. Junior Series (F2, F3, F1 Academy) - Feed Disabled Notice
  if (
    query.includes('f2') ||
    query.includes('formula 2') ||
    query.includes('f3') ||
    query.includes('formula 3') ||
    query.includes('f1 academy') ||
    query.includes('academy') ||
    query.includes('junior')
  ) {
    return {
      query: rawQuery,
      isAnswered: true,
      headline: 'Junior Series Telemetry • Feed Disabled',
      answer: 'Live API feeds for Formula 2, Formula 3, and F1 Academy are currently not connected. Mock standings have been excluded to guarantee strict telemetry accuracy.',
      highlightValue: 'STANDBY',
      highlightLabel: 'Feeder Series',
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
          answer: `${d.givenName} ${d.familyName} races for ${constr}. Current season standings: P${standing.position} with ${standing.points} points and ${standing.wins} Grand Prix victories.`,
          highlightValue: `P${standing.position}`,
          highlightLabel: `${standing.points} PTS • ${standing.wins} Wins`,
          targetDriverId: d.driverId,
          actionText: `Open ${d.familyName} Dossier →`,
          category: 'DRIVER',
        };
      }
    }
  }

  // 7. Closest Finish / Race Margins (Calculated from recentResults)
  if (query.includes('closest finish') || query.includes('smallest gap') || query.includes('closest race') || query.includes('finish margin')) {
    if (recentResults && recentResults.length >= 2) {
      const p1 = recentResults[0];
      const p2 = recentResults[1];
      const p1Name = `${p1.Driver.givenName} ${p1.Driver.familyName}`;
      const p2Name = `${p2.Driver.givenName} ${p2.Driver.familyName}`;
      const marginTime = p2.Time?.time || p2.status || 'close finish';
      return {
        query: rawQuery,
        isAnswered: true,
        headline: 'Latest Race Victory Margin',
        answer: `In the latest fetched Grand Prix classification, ${p1Name} secured victory ahead of ${p2Name} (${marginTime}).`,
        highlightValue: marginTime,
        highlightLabel: `${p1.Driver.code || 'P1'} vs ${p2.Driver.code || 'P2'}`,
        targetTab: 'results',
        actionText: 'View Race Results →',
        category: 'STANDINGS',
      };
    }
  }

  // 8. Out of Scope / Speculative / Declined
  return {
    query: rawQuery,
    isAnswered: false,
    headline: 'Pit Radio • Outside Telemetry Parameters',
    answer:
      'APEX only processes factual queries derived from official FIA timing, standings, pit stop data, and pre-season testing. Speculative predictions and opinions are excluded.',
    highlightValue: 'STANDBY',
    highlightLabel: 'Pit Radio',
    category: 'DECLINED',
  };
}
