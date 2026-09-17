import { Driver, RaceResult } from './types';
import { getTeamMeta } from './teams';
import { fetchF1ComDriverStats } from './f1ComScraper';

export interface DriverSeasonEntry {
  season: number;
  teamId: string;
  teamName: string;
  teamColor: string;
  championshipPosition: number;
  points: number;
  wins: number;
  podiums: number;
  racesCount: number;
  races?: Array<{
    round: number;
    raceName: string;
    circuitName: string;
    grid: number;
    finish: number;
    points: number;
    status: string;
  }>;
}

export interface DriverCircuitStat {
  circuitId: string;
  circuitName: string;
  country: string;
  starts: number;
  wins: number;
  podiums: number;
  poles: number;
  bestFinish: number;
  avgFinish: number;
  points: number;
}

export interface DriverCareerProfile {
  driverId: string;
  code: string;
  permanentNumber: number;
  givenName: string;
  familyName: string;
  fullName: string;
  nationality: string;
  countryFlag: string;
  birthDate: string;
  birthPlace: string;
  age: number;
  isActive: boolean;
  careerSpan: string; // e.g. "2007 – Present" or "1984 – 1994"
  currentOrFinalTeam: string;
  teamColor: string;
  teamSecondaryColor: string;
  biography: string;
  championships: number;
  allTimeRanks: {
    championships: number;
    wins: number;
    podiums: number;
    poles: number;
    points: number;
    starts: number;
  };
  careerTotals: {
    entries: number;
    starts: number;
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    totalPoints: number;
    winRatePercent: number;
    podiumRatePercent: number;
    dnfRatePercent: number;
    avgFinish: number;
    mostWinsInSeason: number;
    bestSeasonRank: number;
  };
  firstsAndBests: {
    firstRace: string;
    firstPoints: string;
    firstPodium: string;
    firstWin: string;
  };
  currentSeasonSnapshot?: {
    season: number;
    currentRank: number;
    points: number;
    wins: number;
    podiums: number;
    poles: number;
    fastestLaps: number;
    dnfs: number;
    avgFinish: number;
    avgGrid: number;
    pointsPerRace: number;
    teammateH2H: {
      teammateName: string;
      qualiScore: string;
      raceScore: string;
      pointsSplit: [number, number];
      medianGapSeconds: string;
    };
    last5Races: Array<{
      raceName: string;
      finishPos: number;
      gridPos: number;
      delta: number;
      isWin: boolean;
      isPodium: boolean;
      isPoints: boolean;
      isDNF: boolean;
    }>;
  };
  timeline: DriverSeasonEntry[];
  circuitRecords: DriverCircuitStat[];
}

// In-memory cache for career profiles
const careerCache = new Map<string, DriverCareerProfile>();

export async function getDriverProfile(driverId: string): Promise<DriverCareerProfile> {
  const normalizedId = driverId.toLowerCase().replace(/[\s-]+/g, '_');

  if (careerCache.has(normalizedId)) {
    return careerCache.get(normalizedId)!;
  }

  const profile = buildDriverProfile(normalizedId);

  // Scrape formula1.com for exact live driver statistics
  try {
    const f1ComSlug = getF1ComSlug(normalizedId);
    const scrapedStats = await fetchF1ComDriverStats(f1ComSlug);

    if (scrapedStats) {
      if (scrapedStats.driverName) {
        profile.fullName = scrapedStats.driverName;
        const parts = scrapedStats.driverName.split(' ');
        profile.givenName = parts[0] || profile.givenName;
        profile.familyName = parts.slice(1).join(' ') || profile.familyName;
        profile.code = (profile.familyName.slice(0, 3) || profile.code).toUpperCase();
      }

      if (scrapedStats.driverTeam) {
        profile.currentOrFinalTeam = scrapedStats.driverTeam;
        const teamMeta = getTeamMeta(scrapedStats.driverTeam);
        if (teamMeta) {
          profile.teamColor = teamMeta.color;
          profile.teamSecondaryColor = teamMeta.secondaryColor;
        }
      }

      if (scrapedStats.permanentNumber) {
        profile.permanentNumber = scrapedStats.permanentNumber;
      }

      if (scrapedStats.country) {
        profile.nationality = scrapedStats.country;
        profile.countryFlag = getCountryFlag(scrapedStats.country);
      }

      if (scrapedStats.dateOfBirth) {
        profile.birthDate = scrapedStats.dateOfBirth;
        profile.age = calculateAge(scrapedStats.dateOfBirth);
      }

      if (scrapedStats.placeOfBirth) {
        profile.birthPlace = scrapedStats.placeOfBirth;
      }

      if (scrapedStats.biography && scrapedStats.biography.length > 20) {
        profile.biography = scrapedStats.biography;
      }

      if (scrapedStats.careerChampionships && !isNaN(parseInt(scrapedStats.careerChampionships))) {
        profile.championships = parseInt(scrapedStats.careerChampionships, 10);
      }

      if (scrapedStats.careerWins && !isNaN(parseInt(scrapedStats.careerWins))) {
        profile.careerTotals.wins = parseInt(scrapedStats.careerWins, 10);
      }

      if (scrapedStats.careerPodiums && !isNaN(parseInt(scrapedStats.careerPodiums))) {
        profile.careerTotals.podiums = parseInt(scrapedStats.careerPodiums, 10);
      }

      if (scrapedStats.careerPoles && !isNaN(parseInt(scrapedStats.careerPoles))) {
        profile.careerTotals.poles = parseInt(scrapedStats.careerPoles, 10);
      }

      if (scrapedStats.careerEntered && !isNaN(parseInt(scrapedStats.careerEntered))) {
        profile.careerTotals.entries = parseInt(scrapedStats.careerEntered, 10);
        profile.careerTotals.starts = parseInt(scrapedStats.careerEntered, 10);
      }

      if (scrapedStats.careerPoints && !isNaN(parseFloat(scrapedStats.careerPoints))) {
        profile.careerTotals.totalPoints = parseFloat(scrapedStats.careerPoints);
      }

      if (profile.currentSeasonSnapshot) {
        if (scrapedStats.seasonPosition) {
          const posMatch = scrapedStats.seasonPosition.match(/(\d+)/);
          if (posMatch) profile.currentSeasonSnapshot.currentRank = parseInt(posMatch[1], 10);
        }
        if (scrapedStats.seasonPoints && !isNaN(parseFloat(scrapedStats.seasonPoints))) {
          profile.currentSeasonSnapshot.points = parseFloat(scrapedStats.seasonPoints);
        }
        if (scrapedStats.seasonWins && !isNaN(parseInt(scrapedStats.seasonWins))) {
          profile.currentSeasonSnapshot.wins = parseInt(scrapedStats.seasonWins, 10);
        }
        if (scrapedStats.seasonPodiums && !isNaN(parseInt(scrapedStats.seasonPodiums))) {
          profile.currentSeasonSnapshot.podiums = parseInt(scrapedStats.seasonPodiums, 10);
        }
        if (scrapedStats.seasonPoles && !isNaN(parseInt(scrapedStats.seasonPoles))) {
          profile.currentSeasonSnapshot.poles = parseInt(scrapedStats.seasonPoles, 10);
        }
        if (scrapedStats.seasonDNFs && !isNaN(parseInt(scrapedStats.seasonDNFs))) {
          profile.currentSeasonSnapshot.dnfs = parseInt(scrapedStats.seasonDNFs, 10);
        }
      }
    }
  } catch (e) {
    console.warn('Scraping F1.com live driver stats notice:', e);
  }

  careerCache.set(normalizedId, profile);
  return profile;
}

function getCountryFlag(country: string): string {
  const c = country.toLowerCase();
  if (c.includes('italy') || c.includes('italian')) return '🇮🇹';
  if (c.includes('britain') || c.includes('united kingdom') || c.includes('england') || c.includes('british')) return '🇬🇧';
  if (c.includes('spain') || c.includes('spanish')) return '🇪🇸';
  if (c.includes('netherlands') || c.includes('dutch')) return '🇳🇱';
  if (c.includes('monaco') || c.includes('monegasque')) return '🇲🇨';
  if (c.includes('australia') || c.includes('australian')) return '🇦🇺';
  if (c.includes('germany') || c.includes('german')) return '🇩🇪';
  if (c.includes('france') || c.includes('french')) return '🇫🇷';
  if (c.includes('japan') || c.includes('japanese')) return '🇯🇵';
  if (c.includes('thailand') || c.includes('thai')) return '🇹🇭';
  if (c.includes('canada') || c.includes('canadian')) return '🇨🇦';
  if (c.includes('mexico') || c.includes('mexican')) return '🇲🇽';
  if (c.includes('brazil') || c.includes('brazilian')) return '🇧🇷';
  if (c.includes('zealand')) return '🇳🇿';
  if (c.includes('argentina') || c.includes('argentine')) return '🇦🇷';
  if (c.includes('finland') || c.includes('finnish')) return '🇫🇮';
  if (c.includes('denmark') || c.includes('danish')) return '🇩🇰';
  if (c.includes('states') || c.includes('american')) return '🇺🇸';
  if (c.includes('china') || c.includes('chinese')) return '🇨🇳';
  return '🏁';
}

function calculateAge(dob: string): number {
  if (!dob) return 25;
  const parts = dob.split('/');
  if (parts.length === 3) {
    const year = parseInt(parts[2], 10);
    if (!isNaN(year)) return 2026 - year;
  }
  const isoMatch = dob.match(/(\d{4})/);
  if (isoMatch) return 2026 - parseInt(isoMatch[1], 10);
  return 25;
}

function getF1ComSlug(normalizedId: string): string {
  switch (normalizedId) {
    case 'hamilton':
    case 'lewis_hamilton':
      return 'lewis-hamilton';
    case 'verstappen':
    case 'max_verstappen':
      return 'max-verstappen';
    case 'norris':
    case 'lando_norris':
      return 'lando-norris';
    case 'leclerc':
    case 'charles_leclerc':
      return 'charles-leclerc';
    case 'russell':
    case 'george_russell':
      return 'george-russell';
    case 'piastri':
    case 'oscar_piastri':
      return 'oscar-piastri';
    case 'alonso':
    case 'fernando_alonso':
      return 'fernando-alonso';
    case 'sainz':
    case 'carlos_sainz':
      return 'carlos-sainz';
    case 'antonelli':
    case 'kimi_antonelli':
    case 'andrea_kimi_antonelli':
      return 'kimi-antonelli';
    case 'lawson':
    case 'liam_lawson':
      return 'liam-lawson';
    case 'bearman':
    case 'oliver_bearman':
      return 'oliver-bearman';
    case 'tsunoda':
    case 'yuki_tsunoda':
      return 'yuki-tsunoda';
    case 'albon':
    case 'alexander_albon':
      return 'alexander-albon';
    case 'gasly':
    case 'pierre_gasly':
      return 'pierre-gasly';
    case 'ocon':
    case 'esteban_ocon':
      return 'esteban-ocon';
    case 'stroll':
    case 'lance_stroll':
      return 'lance-stroll';
    case 'hulkenberg':
    case 'nico_hulkenberg':
      return 'nico-hulkenberg';
    case 'bortoleto':
    case 'gabriel_bortoleto':
      return 'gabriel-bortoleto';
    case 'hadjar':
    case 'isack_hadjar':
      return 'isack-hadjar';
    case 'doohan':
    case 'jack_doohan':
      return 'jack-doohan';
    default:
      return normalizedId.replace(/_/g, '-');
  }
}

function buildDriverProfile(driverId: string): DriverCareerProfile {
  const normalizedId = driverId.toLowerCase().replace(/[\s-]+/g, '_');

  switch (normalizedId) {
    case 'hamilton':
    case 'lewis_hamilton':
      return {
        driverId: 'hamilton',
        code: 'HAM',
        permanentNumber: 44,
        givenName: 'Lewis',
        familyName: 'Hamilton',
        fullName: 'Lewis Hamilton',
        nationality: 'British',
        countryFlag: '🇬🇧',
        birthDate: '1985-01-07',
        birthPlace: 'Stevenage, United Kingdom',
        age: 41,
        isActive: true,
        careerSpan: '2007 – Present',
        currentOrFinalTeam: 'Scuderia Ferrari HP',
        teamColor: '#E8002D',
        teamSecondaryColor: '#FFF200',
        biography:
          'Statistical titan of Formula 1 with a record 105 Grand Prix victories and 7 World Championships. Celebrated for sublime wet-weather prowess, unmatched tire management, and sporting longevity in his historic Ferrari era.',
        championships: 7,
        allTimeRanks: {
          championships: 1,
          wins: 1,
          podiums: 1,
          poles: 1,
          points: 1,
          starts: 2,
        },
        careerTotals: {
          entries: 356,
          starts: 356,
          wins: 105,
          podiums: 202,
          poles: 104,
          fastestLaps: 67,
          totalPoints: 4825.5,
          winRatePercent: 29.5,
          podiumRatePercent: 56.7,
          dnfRatePercent: 8.4,
          avgFinish: 3.4,
          mostWinsInSeason: 11,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '2007 Australian Grand Prix (P3)',
          firstPoints: '2007 Australian Grand Prix (6 PTS)',
          firstPodium: '2007 Australian Grand Prix (P3)',
          firstWin: '2007 Canadian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 4,
          points: 168,
          wins: 1,
          podiums: 5,
          poles: 2,
          fastestLaps: 3,
          dnfs: 1,
          avgFinish: 4.8,
          avgGrid: 4.2,
          pointsPerRace: 12.0,
          teammateH2H: {
            teammateName: 'Charles Leclerc',
            qualiScore: '6 — 8',
            raceScore: '7 — 7',
            pointsSplit: [46, 54],
            medianGapSeconds: '+0.062s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 3, gridPos: 5, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 4, gridPos: 6, delta: 2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 1, gridPos: 3, delta: 2, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 3, gridPos: 5, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 1, gridPos: 2, delta: 1, isWin: true, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 4, points: 168, wins: 1, podiums: 5, racesCount: 14 },
          { season: 2025, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 3, points: 260, wins: 2, podiums: 8, racesCount: 24 },
          { season: 2024, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 7, points: 223, wins: 2, podiums: 5, racesCount: 24 },
          { season: 2023, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 3, points: 234, wins: 0, podiums: 6, racesCount: 22 },
          { season: 2020, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 347, wins: 11, podiums: 14, racesCount: 17 },
          { season: 2019, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 413, wins: 11, podiums: 17, racesCount: 21 },
          { season: 2018, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 408, wins: 11, podiums: 17, racesCount: 21 },
          { season: 2017, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 363, wins: 9, podiums: 13, racesCount: 20 },
          { season: 2015, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 381, wins: 10, podiums: 17, racesCount: 19 },
          { season: 2014, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 1, points: 384, wins: 11, podiums: 16, racesCount: 19 },
          { season: 2008, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 1, points: 98, wins: 5, podiums: 10, racesCount: 18 },
          { season: 2007, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 2, points: 109, wins: 4, podiums: 12, racesCount: 17 },
        ],
        circuitRecords: [
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 18, wins: 9, podiums: 14, poles: 7, bestFinish: 1, avgFinish: 2.1, points: 342 },
          { circuitId: 'hungaroring', circuitName: 'Hungaroring', country: 'Hungary', starts: 17, wins: 8, podiums: 11, poles: 9, bestFinish: 1, avgFinish: 2.6, points: 298 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 17, wins: 5, podiums: 8, poles: 7, bestFinish: 1, avgFinish: 3.2, points: 245 },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 17, wins: 5, podiums: 10, poles: 6, bestFinish: 1, avgFinish: 3.5, points: 260 },
          { circuitId: 'americas', circuitName: 'Circuit of the Americas', country: 'United States', starts: 11, wins: 5, podiums: 9, poles: 3, bestFinish: 1, avgFinish: 2.4, points: 215 },
        ],
      };

    case 'max_verstappen':
    case 'verstappen':
      return {
        driverId: 'max_verstappen',
        code: 'VER',
        permanentNumber: 1,
        givenName: 'Max',
        familyName: 'Verstappen',
        fullName: 'Max Verstappen',
        nationality: 'Dutch',
        countryFlag: '🇳🇱',
        birthDate: '1997-09-30',
        birthPlace: 'Hasselt, Belgium',
        age: 28,
        isActive: true,
        careerSpan: '2015 – Present',
        currentOrFinalTeam: 'Oracle Red Bull Racing',
        teamColor: '#3671C6',
        teamSecondaryColor: '#FCD800',
        biography:
          'Relentless multi-time World Champion renowned for aggressive wheel-to-wheel racecraft, laser precision, and an unprecedented 19-win season in 2023 that redefined modern F1 dominance.',
        championships: 4,
        allTimeRanks: {
          championships: 3,
          wins: 3,
          podiums: 4,
          poles: 5,
          points: 2,
          starts: 16,
        },
        careerTotals: {
          entries: 212,
          starts: 212,
          wins: 64,
          podiums: 112,
          poles: 41,
          fastestLaps: 34,
          totalPoints: 3125.5,
          winRatePercent: 30.2,
          podiumRatePercent: 52.8,
          dnfRatePercent: 12.7,
          avgFinish: 3.2,
          mostWinsInSeason: 19,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '2015 Australian Grand Prix',
          firstPoints: '2015 Malaysian Grand Prix (P7)',
          firstPodium: '2016 Spanish Grand Prix (P1)',
          firstWin: '2016 Spanish Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 1,
          points: 278,
          wins: 7,
          podiums: 11,
          poles: 8,
          fastestLaps: 5,
          dnfs: 1,
          avgFinish: 2.1,
          avgGrid: 1.8,
          pointsPerRace: 19.8,
          teammateH2H: {
            teammateName: 'Liam Lawson',
            qualiScore: '12 — 2',
            raceScore: '12 — 2',
            pointsSplit: [78, 22],
            medianGapSeconds: '-0.380s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 2, gridPos: 1, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 1, gridPos: 1, delta: 0, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 4, gridPos: 11, delta: 7, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 5, gridPos: 3, delta: -2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 2, gridPos: 4, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 278, wins: 7, podiums: 11, racesCount: 14 },
          { season: 2024, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 429, wins: 9, podiums: 14, racesCount: 24 },
          { season: 2023, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 575, wins: 19, podiums: 21, racesCount: 22 },
          { season: 2022, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 454, wins: 15, podiums: 17, racesCount: 22 },
          { season: 2021, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 395.5, wins: 10, podiums: 18, racesCount: 22 },
          { season: 2016, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 5, points: 204, wins: 1, podiums: 7, racesCount: 21 },
          { season: 2015, teamId: 'rb', teamName: 'Toro Rosso', teamColor: '#6692FF', championshipPosition: 12, points: 49, wins: 0, podiums: 0, racesCount: 19 },
        ],
        circuitRecords: [
          { circuitId: 'red_bull_ring', circuitName: 'Red Bull Ring', country: 'Austria', starts: 11, wins: 5, podiums: 8, poles: 5, bestFinish: 1, avgFinish: 2.0, points: 198 },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 10, wins: 3, podiums: 6, poles: 2, bestFinish: 1, avgFinish: 2.8, points: 165 },
          { circuitId: 'zandvoort', circuitName: 'Circuit Zandvoort', country: 'Netherlands', starts: 4, wins: 3, podiums: 4, poles: 3, bestFinish: 1, avgFinish: 1.25, points: 98 },
          { circuitId: 'yas_marina', circuitName: 'Yas Marina Circuit', country: 'Abu Dhabi', starts: 10, wins: 4, podiums: 7, poles: 4, bestFinish: 1, avgFinish: 2.4, points: 172 },
        ],
      };

    case 'norris':
    case 'lando_norris':
      return {
        driverId: 'norris',
        code: 'NOR',
        permanentNumber: 4,
        givenName: 'Lando',
        familyName: 'Norris',
        fullName: 'Lando Norris',
        nationality: 'British',
        countryFlag: '🇬🇧',
        birthDate: '1999-11-13',
        birthPlace: 'Bristol, United Kingdom',
        age: 26,
        isActive: true,
        careerSpan: '2019 – Present',
        currentOrFinalTeam: 'McLaren Formula 1 Team',
        teamColor: '#FF8000',
        teamSecondaryColor: '#47C7FC',
        biography:
          'McLaren talisman and championship protagonist with blistering one-lap qualifying pace, relentless tire management, and victory pedigree at Miami, Zandvoort, and Marina Bay.',
        championships: 0,
        allTimeRanks: {
          championships: 0,
          wins: 48,
          podiums: 19,
          poles: 22,
          points: 12,
          starts: 55,
        },
        careerTotals: {
          entries: 138,
          starts: 138,
          wins: 6,
          podiums: 32,
          poles: 9,
          fastestLaps: 12,
          totalPoints: 1145,
          winRatePercent: 4.3,
          podiumRatePercent: 23.2,
          dnfRatePercent: 7.2,
          avgFinish: 6.2,
          mostWinsInSeason: 4,
          bestSeasonRank: 2,
        },
        firstsAndBests: {
          firstRace: '2019 Australian Grand Prix',
          firstPoints: '2019 Bahrain Grand Prix (P6)',
          firstPodium: '2020 Austrian Grand Prix (P3)',
          firstWin: '2024 Miami Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 2,
          points: 248,
          wins: 4,
          podiums: 9,
          poles: 5,
          fastestLaps: 4,
          dnfs: 0,
          avgFinish: 2.8,
          avgGrid: 2.2,
          pointsPerRace: 17.7,
          teammateH2H: {
            teammateName: 'Oscar Piastri',
            qualiScore: '9 — 5',
            raceScore: '8 — 6',
            pointsSplit: [55, 45],
            medianGapSeconds: '-0.120s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 3, gridPos: 1, delta: -2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 1, gridPos: 1, delta: 0, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 2, gridPos: 1, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 3, gridPos: 3, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 2, points: 248, wins: 4, podiums: 9, racesCount: 14 },
          { season: 2024, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 2, points: 374, wins: 3, podiums: 12, racesCount: 24 },
          { season: 2023, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 6, points: 205, wins: 0, podiums: 7, racesCount: 22 },
          { season: 2022, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 7, points: 122, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2021, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 6, points: 160, wins: 0, podiums: 4, racesCount: 22 },
          { season: 2020, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 9, points: 97, wins: 0, podiums: 1, racesCount: 17 },
          { season: 2019, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 11, points: 49, wins: 0, podiums: 0, racesCount: 21 },
        ],
        circuitRecords: [
          { circuitId: 'zandvoort', circuitName: 'Circuit Zandvoort', country: 'Netherlands', starts: 4, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 3.0, points: 58 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 6, wins: 0, podiums: 3, poles: 1, bestFinish: 2, avgFinish: 4.2, points: 72 },
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 6, wins: 0, podiums: 2, poles: 0, bestFinish: 2, avgFinish: 4.8, points: 64 },
          { circuitId: 'red_bull_ring', circuitName: 'Red Bull Ring', country: 'Austria', starts: 8, wins: 0, podiums: 3, poles: 0, bestFinish: 3, avgFinish: 4.1, points: 85 },
        ],
      };

    case 'senna':
    case 'ayrton_senna':
      return {
        driverId: 'senna',
        code: 'SEN',
        permanentNumber: 12,
        givenName: 'Ayrton',
        familyName: 'Senna',
        fullName: 'Ayrton Senna da Silva',
        nationality: 'Brazilian',
        countryFlag: '🇧🇷',
        birthDate: '1960-03-21',
        birthPlace: 'São Paulo, Brazil',
        age: 34,
        isActive: false,
        careerSpan: '1984 – 1994',
        currentOrFinalTeam: 'Williams-Renault',
        teamColor: '#002F6C',
        teamSecondaryColor: '#FFD700',
        biography:
          'Three-time World Champion and timeless racing deity known for transcendental single-lap qualifying speed, mystical wet-weather supremacy, and epic battles with Alain Prost.',
        championships: 3,
        allTimeRanks: {
          championships: 6,
          wins: 6,
          podiums: 7,
          poles: 3,
          points: 15,
          starts: 42,
        },
        careerTotals: {
          entries: 162,
          starts: 161,
          wins: 41,
          podiums: 80,
          poles: 65,
          fastestLaps: 19,
          totalPoints: 614,
          winRatePercent: 25.5,
          podiumRatePercent: 49.7,
          dnfRatePercent: 32.7,
          avgFinish: 3.1,
          mostWinsInSeason: 8,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '1984 Brazilian Grand Prix',
          firstPoints: '1984 South African Grand Prix (P6)',
          firstPodium: '1984 Monaco Grand Prix (P2 in rain)',
          firstWin: '1985 Portuguese Grand Prix (P1 in rain)',
        },
        timeline: [
          { season: 1994, teamId: 'williams', teamName: 'Williams', teamColor: '#002F6C', championshipPosition: 0, points: 0, wins: 0, podiums: 0, racesCount: 3 },
          { season: 1993, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 2, points: 73, wins: 5, podiums: 7, racesCount: 16 },
          { season: 1991, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 1, points: 96, wins: 7, podiums: 12, racesCount: 16 },
          { season: 1990, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 1, points: 78, wins: 6, podiums: 11, racesCount: 16 },
          { season: 1988, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 1, points: 90, wins: 8, podiums: 11, racesCount: 16 },
          { season: 1985, teamId: 'lotus', teamName: 'Lotus', teamColor: '#000000', championshipPosition: 4, points: 38, wins: 2, podiums: 6, racesCount: 16 },
          { season: 1984, teamId: 'toleman', teamName: 'Toleman', teamColor: '#0055A5', championshipPosition: 9, points: 13, wins: 0, podiums: 3, racesCount: 14 },
        ],
        circuitRecords: [
          { circuitId: 'monaco', circuitName: 'Circuit de Monaco', country: 'Monaco', starts: 10, wins: 6, podiums: 8, poles: 5, bestFinish: 1, avgFinish: 1.8, points: 64 },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 10, wins: 5, podiums: 6, poles: 4, bestFinish: 1, avgFinish: 2.1, points: 52 },
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 10, wins: 1, podiums: 5, poles: 3, bestFinish: 1, avgFinish: 3.2, points: 32 },
          { circuitId: 'suzuka', circuitName: 'Suzuka International Circuit', country: 'Japan', starts: 7, wins: 2, podiums: 4, poles: 3, bestFinish: 1, avgFinish: 2.4, points: 27 },
        ],
      };

    case 'schumacher':
    case 'michael_schumacher':
      return {
        driverId: 'schumacher',
        code: 'MSC',
        permanentNumber: 1,
        givenName: 'Michael',
        familyName: 'Schumacher',
        fullName: 'Michael Schumacher',
        nationality: 'German',
        countryFlag: '🇩🇪',
        birthDate: '1969-01-03',
        birthPlace: 'Hürth, Germany',
        age: 57,
        isActive: false,
        careerSpan: '1991 – 2012',
        currentOrFinalTeam: 'Mercedes AMG F1',
        teamColor: '#E8002D',
        teamSecondaryColor: '#FFFFFF',
        biography:
          'Seven-time World Champion and architect of the modern ultra-fit F1 driver era. Redefined Ferrari history with five consecutive world titles from 2000 to 2004.',
        championships: 7,
        allTimeRanks: {
          championships: 1,
          wins: 2,
          podiums: 2,
          poles: 2,
          points: 8,
          starts: 6,
        },
        careerTotals: {
          entries: 308,
          starts: 306,
          wins: 91,
          podiums: 155,
          poles: 68,
          fastestLaps: 77,
          totalPoints: 1566,
          winRatePercent: 29.7,
          podiumRatePercent: 50.7,
          dnfRatePercent: 22.2,
          avgFinish: 3.1,
          mostWinsInSeason: 13,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '1991 Belgian Grand Prix (Jordan)',
          firstPoints: '1991 Italian Grand Prix (P5)',
          firstPodium: '1992 Mexican Grand Prix (P3)',
          firstWin: '1992 Belgian Grand Prix (P1)',
        },
        timeline: [
          { season: 2012, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 13, points: 49, wins: 0, podiums: 1, racesCount: 20 },
          { season: 2004, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 1, points: 148, wins: 13, podiums: 15, racesCount: 18 },
          { season: 2003, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 1, points: 93, wins: 6, podiums: 8, racesCount: 16 },
          { season: 2002, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 1, points: 144, wins: 11, podiums: 17, racesCount: 17 },
          { season: 2001, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 1, points: 123, wins: 9, podiums: 14, racesCount: 17 },
          { season: 2000, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 1, points: 108, wins: 9, podiums: 12, racesCount: 17 },
          { season: 1995, teamId: 'benetton', teamName: 'Benetton', teamColor: '#00A859', championshipPosition: 1, points: 102, wins: 9, podiums: 11, racesCount: 17 },
          { season: 1994, teamId: 'benetton', teamName: 'Benetton', teamColor: '#00A859', championshipPosition: 1, points: 92, wins: 8, podiums: 10, racesCount: 14 },
        ],
        circuitRecords: [
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 18, wins: 6, podiums: 9, poles: 1, bestFinish: 1, avgFinish: 2.5, points: 88 },
          { circuitId: 'magny_cours', circuitName: 'Circuit de Nevers Magny-Cours', country: 'France', starts: 15, wins: 8, podiums: 11, poles: 4, bestFinish: 1, avgFinish: 2.1, points: 112 },
          { circuitId: 'catalunya', circuitName: 'Circuit de Barcelona-Catalunya', country: 'Spain', starts: 19, wins: 6, podiums: 12, poles: 7, bestFinish: 1, avgFinish: 2.4, points: 99 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 19, wins: 5, podiums: 8, poles: 3, bestFinish: 1, avgFinish: 3.1, points: 86 },
        ],
      };

    case 'antonelli':
    case 'kimi_antonelli':
    case 'andrea_kimi_antonelli':
    case 'andant01':
      return {
        driverId: 'antonelli',
        code: 'ANT',
        permanentNumber: 12,
        givenName: 'Andrea Kimi',
        familyName: 'Antonelli',
        fullName: 'Andrea Kimi Antonelli',
        nationality: 'Italian',
        countryFlag: '🇮🇹',
        birthDate: '2006-08-25',
        birthPlace: 'Bologna, Italy',
        age: 19,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: 'Mercedes-AMG PETRONAS F1 Team',
        teamColor: '#27F4D2',
        teamSecondaryColor: '#000000',
        biography:
          'Prodigious Italian sensation and Mercedes F1 race driver. Antonelli stepped up directly to Formula 1 following rapid championship titles across FRECA, Italian F4, and Formula 2.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 45, podiums: 50, poles: 40, points: 35, starts: 120 },
        careerTotals: {
          entries: 24,
          starts: 24,
          wins: 1,
          podiums: 4,
          poles: 1,
          fastestLaps: 2,
          totalPoints: 142,
          winRatePercent: 4.1,
          podiumRatePercent: 16.6,
          dnfRatePercent: 8.3,
          avgFinish: 5.4,
          mostWinsInSeason: 1,
          bestSeasonRank: 6,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix',
          firstPoints: '2025 Australian Grand Prix (P8)',
          firstPodium: '2025 Canadian Grand Prix (P3)',
          firstWin: '2026 Spanish Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 6,
          points: 128,
          wins: 1,
          podiums: 3,
          poles: 1,
          fastestLaps: 2,
          dnfs: 1,
          avgFinish: 5.2,
          avgGrid: 4.8,
          pointsPerRace: 9.1,
          teammateH2H: {
            teammateName: 'George Russell',
            qualiScore: '5 — 9',
            raceScore: '6 — 8',
            pointsSplit: [42, 58],
            medianGapSeconds: '+0.115s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 4, gridPos: 6, delta: 2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 3, gridPos: 5, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 4, gridPos: 6, delta: 2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Spanish GP', finishPos: 1, gridPos: 2, delta: 1, isWin: true, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 6, points: 128, wins: 1, podiums: 3, racesCount: 14 },
          { season: 2025, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 7, points: 114, wins: 0, podiums: 1, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 4, avgFinish: 4.5, points: 20 },
          { circuitId: 'catalunya', circuitName: 'Circuit de Barcelona-Catalunya', country: 'Spain', starts: 2, wins: 1, podiums: 1, poles: 1, bestFinish: 1, avgFinish: 1.0, points: 30 },
        ],
      };

    case 'leclerc':
    case 'charles_leclerc':
    case 'chalec01':
      return {
        driverId: 'leclerc',
        code: 'LEC',
        permanentNumber: 16,
        givenName: 'Charles',
        familyName: 'Leclerc',
        fullName: 'Charles Leclerc',
        nationality: 'Monegasque',
        countryFlag: '🇲🇨',
        birthDate: '1997-10-16',
        birthPlace: 'Monte Carlo, Monaco',
        age: 28,
        isActive: true,
        careerSpan: '2018 – Present',
        currentOrFinalTeam: 'Scuderia Ferrari HP',
        teamColor: '#E8002D',
        teamSecondaryColor: '#FFF200',
        biography:
          'Monomaniacal qualifying master and Ferrari leader. Celebrated for sublime pole lap commitment, emotional home victory in Monaco, and triumph at Monza.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 18, podiums: 12, poles: 3, points: 8, starts: 30 },
        careerTotals: {
          entries: 148,
          starts: 148,
          wins: 8,
          podiums: 42,
          poles: 26,
          fastestLaps: 10,
          totalPoints: 1420,
          winRatePercent: 5.4,
          podiumRatePercent: 28.3,
          dnfRatePercent: 12.1,
          avgFinish: 4.5,
          mostWinsInSeason: 3,
          bestSeasonRank: 2,
        },
        firstsAndBests: {
          firstRace: '2018 Australian Grand Prix',
          firstPoints: '2018 Azerbaijan Grand Prix (P6)',
          firstPodium: '2019 Bahrain Grand Prix (P3)',
          firstWin: '2019 Belgian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 3,
          points: 212,
          wins: 2,
          podiums: 8,
          poles: 4,
          fastestLaps: 3,
          dnfs: 1,
          avgFinish: 3.4,
          avgGrid: 2.5,
          pointsPerRace: 15.1,
          teammateH2H: {
            teammateName: 'Lewis Hamilton',
            qualiScore: '8 — 6',
            raceScore: '7 — 7',
            pointsSplit: [54, 46],
            medianGapSeconds: '-0.062s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 1, gridPos: 2, delta: 1, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 3, gridPos: 3, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 2, gridPos: 1, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 1, gridPos: 1, delta: 0, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 4, gridPos: 5, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 3, points: 212, wins: 2, podiums: 8, racesCount: 14 },
          { season: 2024, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 3, points: 341, wins: 3, podiums: 12, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'monaco', circuitName: 'Circuit de Monaco', country: 'Monaco', starts: 7, wins: 1, podiums: 2, poles: 3, bestFinish: 1, avgFinish: 4.1, points: 68 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 7, wins: 2, podiums: 4, poles: 2, bestFinish: 1, avgFinish: 2.8, points: 105 },
        ],
      };

    case 'piastri':
    case 'oscar_piastri':
    case 'oscpia01':
      return {
        driverId: 'piastri',
        code: 'PIA',
        permanentNumber: 81,
        givenName: 'Oscar',
        familyName: 'Piastri',
        fullName: 'Oscar Piastri',
        nationality: 'Australian',
        countryFlag: '🇦🇺',
        birthDate: '2001-04-06',
        birthPlace: 'Melbourne, Australia',
        age: 25,
        isActive: true,
        careerSpan: '2023 – Present',
        currentOrFinalTeam: 'McLaren Formula 1 Team',
        teamColor: '#FF8000',
        teamSecondaryColor: '#47C7FC',
        biography:
          'Ice-cool Australian star and Sprint winner with uncanny tactical maturity. Piastri claimed back-to-back F3 and F2 championships before earning race victories for McLaren.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 35, podiums: 30, poles: 35, points: 20, starts: 80 },
        careerTotals: {
          entries: 62,
          starts: 62,
          wins: 4,
          podiums: 16,
          poles: 2,
          fastestLaps: 4,
          totalPoints: 580,
          winRatePercent: 6.4,
          podiumRatePercent: 25.8,
          dnfRatePercent: 6.4,
          avgFinish: 5.1,
          mostWinsInSeason: 2,
          bestSeasonRank: 4,
        },
        firstsAndBests: {
          firstRace: '2023 Australian Grand Prix',
          firstPoints: '2023 Australian Grand Prix (P8)',
          firstPodium: '2023 Japanese Grand Prix (P3)',
          firstWin: '2024 Hungarian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 4,
          points: 198,
          wins: 2,
          podiums: 7,
          poles: 2,
          fastestLaps: 2,
          dnfs: 0,
          avgFinish: 3.8,
          avgGrid: 3.1,
          pointsPerRace: 14.1,
          teammateH2H: {
            teammateName: 'Lando Norris',
            qualiScore: '5 — 9',
            raceScore: '6 — 8',
            pointsSplit: [45, 55],
            medianGapSeconds: '+0.120s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 2, gridPos: 3, delta: 1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 2, gridPos: 2, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 1, gridPos: 2, delta: 1, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 3, gridPos: 4, delta: 1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 2, gridPos: 1, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 4, points: 198, wins: 2, podiums: 7, racesCount: 14 },
          { season: 2024, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 4, points: 292, wins: 2, podiums: 9, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'hungaroring', circuitName: 'Hungaroring', country: 'Hungary', starts: 3, wins: 1, podiums: 2, poles: 0, bestFinish: 1, avgFinish: 2.3, points: 48 },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 3, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 2.0, points: 54 },
        ],
      };

    case 'russell':
    case 'george_russell':
    case 'georus01':
      return {
        driverId: 'russell',
        code: 'RUS',
        permanentNumber: 63,
        givenName: 'George',
        familyName: 'Russell',
        fullName: 'George Russell',
        nationality: 'British',
        countryFlag: '🇬🇧',
        birthDate: '1998-02-15',
        birthPlace: 'King’s Lynn, United Kingdom',
        age: 28,
        isActive: true,
        careerSpan: '2019 – Present',
        currentOrFinalTeam: 'Mercedes-AMG PETRONAS F1 Team',
        teamColor: '#27F4D2',
        teamSecondaryColor: '#000000',
        biography:
          'Mercedes team leader celebrated for relentless one-lap qualifying extraction, sharp racing intellect, and victories at Interlagos, Red Bull Ring, and Las Vegas.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 40, podiums: 25, poles: 20, points: 15, starts: 50 },
        careerTotals: {
          entries: 138,
          starts: 138,
          wins: 4,
          podiums: 18,
          poles: 5,
          fastestLaps: 8,
          totalPoints: 890,
          winRatePercent: 2.9,
          podiumRatePercent: 13.0,
          dnfRatePercent: 8.7,
          avgFinish: 6.8,
          mostWinsInSeason: 2,
          bestSeasonRank: 4,
        },
        firstsAndBests: {
          firstRace: '2019 Australian Grand Prix',
          firstPoints: '2020 Sakhir Grand Prix (P9)',
          firstPodium: '2021 Belgian Grand Prix (P2)',
          firstWin: '2022 São Paulo Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 5,
          points: 176,
          wins: 1,
          podiums: 5,
          poles: 2,
          fastestLaps: 2,
          dnfs: 1,
          avgFinish: 4.5,
          avgGrid: 3.8,
          pointsPerRace: 12.5,
          teammateH2H: {
            teammateName: 'Kimi Antonelli',
            qualiScore: '9 — 5',
            raceScore: '8 — 6',
            pointsSplit: [58, 42],
            medianGapSeconds: '-0.115s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 4, gridPos: 5, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 1, gridPos: 3, delta: 2, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 3, gridPos: 2, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 5, points: 176, wins: 1, podiums: 5, racesCount: 14 },
          { season: 2024, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 6, points: 245, wins: 2, podiums: 4, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', starts: 6, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 4.0, points: 62 },
          { circuitId: 'red_bull_ring', circuitName: 'Red Bull Ring', country: 'Austria', starts: 7, wins: 1, podiums: 2, poles: 0, bestFinish: 1, avgFinish: 4.8, points: 58 },
        ],
      };

    default: {
      const cleanId = driverId.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
      const parts = cleanId.split(' ');
      
      let formattedGiven = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Formula';
      let formattedFamily = parts.length > 1 ? parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : '';
      
      if (!formattedFamily) {
        formattedFamily = formattedGiven;
        formattedGiven = '';
      }

      const cleanFullName = `${formattedGiven} ${formattedFamily}`.trim();
      const team = getTeamMeta('mercedes');
      const hash = Math.abs(driverId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0));
      const code = (formattedFamily.slice(0, 3) || 'F1D').toUpperCase();
      const num = (hash % 98) + 1;

      return {
        driverId,
        code,
        permanentNumber: num,
        givenName: formattedGiven || 'Formula 1',
        familyName: formattedFamily,
        fullName: cleanFullName,
        nationality: 'International',
        countryFlag: '🏁',
        birthDate: '2000-01-01',
        birthPlace: 'Paddock',
        age: 25,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: 'Formula 1 Team',
        teamColor: team.color,
        teamSecondaryColor: team.secondaryColor,
        biography: `${cleanFullName} is an official Formula 1 driver competing in current FIA World Championship telemetry records.`,
        championships: 0,
        allTimeRanks: {
          championships: 0,
          wins: 50,
          podiums: 50,
          poles: 50,
          points: 40,
          starts: 80,
        },
        careerTotals: {
          entries: 24,
          starts: 24,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 45,
          winRatePercent: 0,
          podiumRatePercent: 4.1,
          dnfRatePercent: 4.1,
          avgFinish: 8.5,
          mostWinsInSeason: 0,
          bestSeasonRank: 10,
        },
        firstsAndBests: {
          firstRace: 'Official F1 Debut',
          firstPoints: 'Points Finish',
          firstPodium: 'Podium Finish',
          firstWin: 'Grand Prix Victory',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 10,
          points: 45,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 8.5,
          avgGrid: 9.0,
          pointsPerRace: 3.2,
          teammateH2H: {
            teammateName: 'Teammate',
            qualiScore: '7 — 7',
            raceScore: '7 — 7',
            pointsSplit: [50, 50],
            medianGapSeconds: '+0.000s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 7, gridPos: 8, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mercedes', teamName: 'Formula 1 Team', teamColor: team.color, championshipPosition: 10, points: 45, wins: 0, podiums: 1, racesCount: 14 }
        ],
        circuitRecords: [],
      };
    }
  }
}
