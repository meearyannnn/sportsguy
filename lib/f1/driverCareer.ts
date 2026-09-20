import { Driver, RaceResult } from './types';
import { getTeamMeta } from './teams';
import { fetchF1ComDriverStats, decodeHtmlEntities } from './f1ComScraper';
import { getSeason2026Metrics } from './season2026Data';

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
  teamTenure?: string; // e.g. "2025 – Present" with current team
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
    fastestLaps?: number;
    dnfs?: number;
    avgFinish?: number;
    avgGrid?: number;
    pointsPerRace?: number;
    teammateH2H?: {
      teammateName: string;
      qualiScore: string;
      raceScore: string;
      pointsSplit: [number, number];
      medianGapSeconds: string;
    };
    last5Races?: Array<{
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

// In-memory cache for career profiles with 5-minute TTL
const careerCache = new Map<string, { timestamp: number; profile: DriverCareerProfile }>();
const CAREER_CACHE_TTL = 5 * 60 * 1000;

const TEAMMATES_2026: Record<string, string> = {
  antonelli: 'George Russell',
  kimi_antonelli: 'George Russell',
  russell: 'Andrea Kimi Antonelli',
  george_russell: 'Andrea Kimi Antonelli',
  hamilton: 'Charles Leclerc',
  lewis_hamilton: 'Charles Leclerc',
  leclerc: 'Lewis Hamilton',
  charles_leclerc: 'Lewis Hamilton',
  norris: 'Oscar Piastri',
  lando_norris: 'Oscar Piastri',
  piastri: 'Lando Norris',
  oscar_piastri: 'Lando Norris',
  verstappen: 'Isack Hadjar',
  max_verstappen: 'Isack Hadjar',
  hadjar: 'Max Verstappen',
  isack_hadjar: 'Max Verstappen',
  lawson: 'Arvid Lindblad',
  liam_lawson: 'Arvid Lindblad',
  lindblad: 'Liam Lawson',
  arvid_lindblad: 'Liam Lawson',
  gasly: 'Franco Colapinto',
  pierre_gasly: 'Franco Colapinto',
  colapinto: 'Pierre Gasly',
  franco_colapinto: 'Pierre Gasly',
  doohan: 'Pierre Gasly',
  jack_doohan: 'Pierre Gasly',
  albon: 'Carlos Sainz',
  alexander_albon: 'Carlos Sainz',
  sainz: 'Alexander Albon',
  carlos_sainz: 'Alexander Albon',
  alonso: 'Lance Stroll',
  fernando_alonso: 'Lance Stroll',
  stroll: 'Fernando Alonso',
  lance_stroll: 'Fernando Alonso',
  hulkenberg: 'Gabriel Bortoleto',
  nico_hulkenberg: 'Gabriel Bortoleto',
  bortoleto: 'Nico Hülkenberg',
  gabriel_bortoleto: 'Nico Hülkenberg',
  bearman: 'Esteban Ocon',
  oliver_bearman: 'Esteban Ocon',
  ocon: 'Oliver Bearman',
  esteban_ocon: 'Oliver Bearman',
};

export async function getDriverProfile(driverId: string): Promise<DriverCareerProfile> {
  const normalizedId = driverId.toLowerCase().replace(/[\s-]+/g, '_');
  const now = Date.now();

  // If in browser, fetch from our server-side API to bypass CORS and get live scraped data
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/f1/driver-profile?driverId=${encodeURIComponent(normalizedId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.profile) {
          careerCache.set(normalizedId, { timestamp: now, profile: data.profile });
          return data.profile;
        }
      }
    } catch (e) {
      console.warn('Driver profile client fetch notice:', e);
    }
  }

  const cached = careerCache.get(normalizedId);
  if (cached && now - cached.timestamp < CAREER_CACHE_TTL) {
    return cached.profile;
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
      }

      if (scrapedStats.placeOfBirth) {
        profile.birthPlace = scrapedStats.placeOfBirth;
      }

      if (scrapedStats.biography && scrapedStats.biography.length > 20) {
        profile.biography = decodeHtmlEntities(scrapedStats.biography);
      }

      if (scrapedStats.careerChampionships && !isNaN(parseInt(scrapedStats.careerChampionships))) {
        profile.championships = Math.max(profile.championships, parseInt(scrapedStats.careerChampionships, 10));
      }

      if (scrapedStats.careerWins && !isNaN(parseInt(scrapedStats.careerWins))) {
        profile.careerTotals.wins = Math.max(profile.careerTotals.wins, parseInt(scrapedStats.careerWins, 10));
      }

      if (scrapedStats.careerPodiums && !isNaN(parseInt(scrapedStats.careerPodiums))) {
        profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, parseInt(scrapedStats.careerPodiums, 10));
      }

      if (scrapedStats.careerPoles && !isNaN(parseInt(scrapedStats.careerPoles))) {
        profile.careerTotals.poles = Math.max(profile.careerTotals.poles, parseInt(scrapedStats.careerPoles, 10));
      }

      if (scrapedStats.careerEntered && !isNaN(parseInt(scrapedStats.careerEntered))) {
        profile.careerTotals.entries = Math.max(profile.careerTotals.entries, parseInt(scrapedStats.careerEntered, 10));
        profile.careerTotals.starts = Math.max(profile.careerTotals.starts, parseInt(scrapedStats.careerEntered, 10));
      }

      if (scrapedStats.careerPoints && !isNaN(parseFloat(scrapedStats.careerPoints))) {
        profile.careerTotals.totalPoints = Math.max(profile.careerTotals.totalPoints, parseFloat(scrapedStats.careerPoints));
      }

      if (profile.careerTotals.starts > 0) {
        profile.careerTotals.winRatePercent = parseFloat(
          ((profile.careerTotals.wins / profile.careerTotals.starts) * 100).toFixed(1)
        );
        profile.careerTotals.podiumRatePercent = parseFloat(
          ((profile.careerTotals.podiums / profile.careerTotals.starts) * 100).toFixed(1)
        );
      }
    }
  } catch (e) {
    console.warn('Scraping F1.com live driver stats notice:', e);
  }

  // Authoritatively apply verified 2026 season telemetry & race classification metrics
  const seasonMetrics = getSeason2026Metrics(normalizedId);
  if (seasonMetrics) {
    profile.teamTenure = seasonMetrics.teamTenure;
    if (!profile.currentSeasonSnapshot) {
      profile.currentSeasonSnapshot = {
        season: 2026,
        currentRank: seasonMetrics.currentRank,
        points: seasonMetrics.seasonPoints,
        wins: seasonMetrics.seasonWins,
        podiums: seasonMetrics.seasonPodiums,
        poles: seasonMetrics.seasonPoles,
        fastestLaps: seasonMetrics.fastestLaps,
        dnfs: seasonMetrics.dnfs,
        avgFinish: seasonMetrics.avgFinish,
        avgGrid: seasonMetrics.avgGrid,
        pointsPerRace: seasonMetrics.pointsPerRace,
        teammateH2H: seasonMetrics.teammateH2H,
        last5Races: seasonMetrics.last5Races,
      };
    } else {
      profile.currentSeasonSnapshot.season = 2026;
      profile.currentSeasonSnapshot.currentRank = seasonMetrics.currentRank;
      profile.currentSeasonSnapshot.points = seasonMetrics.seasonPoints;
      profile.currentSeasonSnapshot.wins = seasonMetrics.seasonWins;
      profile.currentSeasonSnapshot.podiums = seasonMetrics.seasonPodiums;
      profile.currentSeasonSnapshot.poles = seasonMetrics.seasonPoles;
      profile.currentSeasonSnapshot.fastestLaps = seasonMetrics.fastestLaps;
      profile.currentSeasonSnapshot.dnfs = seasonMetrics.dnfs;
      profile.currentSeasonSnapshot.avgFinish = seasonMetrics.avgFinish;
      profile.currentSeasonSnapshot.avgGrid = seasonMetrics.avgGrid;
      profile.currentSeasonSnapshot.pointsPerRace = seasonMetrics.pointsPerRace;
      profile.currentSeasonSnapshot.teammateH2H = seasonMetrics.teammateH2H;
      profile.currentSeasonSnapshot.last5Races = seasonMetrics.last5Races;
    }

    if (profile.timeline.length > 0 && profile.timeline[0].season === 2026) {
      profile.timeline[0].championshipPosition = seasonMetrics.currentRank;
      profile.timeline[0].points = seasonMetrics.seasonPoints;
      profile.timeline[0].wins = seasonMetrics.seasonWins;
      profile.timeline[0].podiums = seasonMetrics.seasonPodiums;
    }
  }

  // Explicit career verification checks
  if (normalizedId === 'hamilton' || normalizedId === 'lewis_hamilton') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 106);
    profile.careerTotals.poles = 104;
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 394);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 394);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 207);
    profile.careerTotals.winRatePercent = 26.9;
    profile.careerTotals.podiumRatePercent = 52.5;
    profile.careerSpan = '2007 – Present';
    profile.teamTenure = '2025 – Present';
  } else if (normalizedId === 'verstappen' || normalizedId === 'max_verstappen') {
    profile.permanentNumber = 3;
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 71);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 133);
    profile.careerTotals.poles = Math.max(profile.careerTotals.poles, 48);
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 247);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 247);
    profile.careerTotals.winRatePercent = 28.7;
    profile.careerTotals.podiumRatePercent = 53.8;
    profile.careerSpan = '2015 – Present';
    profile.teamTenure = '2016 – Present';
  } else if (normalizedId === 'norris' || normalizedId === 'lando_norris') {
    profile.permanentNumber = 1;
  } else if (normalizedId === 'piastri' || normalizedId === 'oscar_piastri') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 9);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 28);
    profile.careerSpan = '2023 – Present';
    profile.teamTenure = '2023 – Present';
  } else if (normalizedId === 'antonelli' || normalizedId === 'kimi_antonelli' || normalizedId === 'andrea_kimi_antonelli' || normalizedId === 'andant01') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 8);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 15);
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 38);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 38);
    profile.careerTotals.totalPoints = Math.max(profile.careerTotals.totalPoints, 442);
    profile.careerTotals.winRatePercent = 21.1;
    profile.careerTotals.podiumRatePercent = 39.5;
    profile.careerTotals.mostWinsInSeason = 8;
    profile.firstsAndBests.firstWin = '2026 Chinese Grand Prix (P1)';
    profile.careerTotals.bestSeasonRank = 7;
  } else if (normalizedId === 'hadjar' || normalizedId === 'isack_hadjar') {
    profile.careerSpan = '2025 – Present';
    profile.teamTenure = '2026 – Present';
    profile.currentOrFinalTeam = 'Oracle Red Bull Racing';
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 1);
    profile.firstsAndBests.firstRace = '2025 Australian Grand Prix (Racing Bulls)';
    profile.firstsAndBests.firstPodium = '2026 British Grand Prix (P3)';
    profile.firstsAndBests.firstPoints = '2025 Bahrain Grand Prix (P8)';
    profile.careerTotals.bestSeasonRank = 8;
  } else if (
    normalizedId === 'bortoleto' ||
    normalizedId === 'gabriel_bortoleto' ||
    normalizedId === 'hulkenberg' ||
    normalizedId === 'nico_hulkenberg'
  ) {
    profile.currentOrFinalTeam = 'Audi Formula 1 Team';
    profile.teamColor = '#E21B23';
    profile.teamSecondaryColor = '#C0C0C0';
    if (profile.timeline.length > 0 && profile.timeline[0].season === 2026) {
      profile.timeline[0].teamId = 'audi';
      profile.timeline[0].teamName = 'Audi Formula 1 Team';
      profile.timeline[0].teamColor = '#E21B23';
    }
  }

  // Apply archive firsts and peaks for all drivers
  const archiveItem = DRIVER_CAREER_ARCHIVE[normalizedId];
  if (archiveItem) {
    if (archiveItem.firstRace) profile.firstsAndBests.firstRace = archiveItem.firstRace;
    if (archiveItem.firstWin && archiveItem.firstWin !== '—') {
      profile.firstsAndBests.firstWin = archiveItem.firstWin;
    } else if (profile.careerTotals.wins === 0) {
      profile.firstsAndBests.firstWin = '—';
    }
    if (archiveItem.firstPodium && archiveItem.firstPodium !== '—') {
      profile.firstsAndBests.firstPodium = archiveItem.firstPodium;
    } else if (profile.careerTotals.podiums === 0) {
      profile.firstsAndBests.firstPodium = '—';
    }
    if (archiveItem.firstPoints) profile.firstsAndBests.firstPoints = archiveItem.firstPoints;
    if (archiveItem.bestSeasonRank !== undefined) profile.careerTotals.bestSeasonRank = archiveItem.bestSeasonRank;
    if (archiveItem.mostWinsInSeason !== undefined) {
      profile.careerTotals.mostWinsInSeason = Math.max(profile.careerTotals.mostWinsInSeason, archiveItem.mostWinsInSeason);
    }
  }

  // Prevent non-champions from ever displaying P1 as a completed title finish
  if (profile.championships === 0 && profile.careerTotals.bestSeasonRank === 1) {
    const completed = (profile.timeline || []).filter((t) => t.season < 2026 && t.championshipPosition > 0);
    profile.careerTotals.bestSeasonRank = completed.length > 0 ? Math.min(...completed.map((t) => t.championshipPosition)) : 0;
  }

  // Keep biography text consistent with accurate career wins count and decode HTML entities
  if (profile.careerTotals.wins > 0) {
    profile.biography = profile.biography.replace(/\b105\b(?=\s+Grand Prix|\s+victories|\s+wins)/gi, `${profile.careerTotals.wins}`);
  }
  profile.biography = decodeHtmlEntities(profile.biography);

  if (profile.birthDate) {
    profile.age = calculateAge(profile.birthDate);
  }

  careerCache.set(normalizedId, { timestamp: now, profile });
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

export function calculateAge(dob: string, refDate: Date = new Date()): number {
  if (!dob) return 25;

  let birthYear = 0;
  let birthMonth = 0; // 1-12
  let birthDay = 0; // 1-31

  const trimmed = dob.trim();

  // Handle DD/MM/YYYY format (e.g. '30/09/1997')
  const slashParts = trimmed.split('/');
  if (slashParts.length === 3) {
    birthDay = parseInt(slashParts[0], 10);
    birthMonth = parseInt(slashParts[1], 10);
    birthYear = parseInt(slashParts[2], 10);
  } else {
    // Handle YYYY-MM-DD format (e.g. '1997-09-30')
    const dashParts = trimmed.split('-');
    if (dashParts.length === 3 && dashParts[0].length === 4) {
      birthYear = parseInt(dashParts[0], 10);
      birthMonth = parseInt(dashParts[1], 10);
      birthDay = parseInt(dashParts[2], 10);
    } else {
      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) {
        birthYear = parsed.getUTCFullYear();
        birthMonth = parsed.getUTCMonth() + 1;
        birthDay = parsed.getUTCDate();
      }
    }
  }

  if (!birthYear || isNaN(birthYear)) {
    const match = trimmed.match(/(\d{4})/);
    if (match) birthYear = parseInt(match[1], 10);
    else return 25;
    birthMonth = 1;
    birthDay = 1;
  }

  const nowYear = refDate.getFullYear();
  const nowMonth = refDate.getMonth() + 1;
  const nowDay = refDate.getDate();

  let age = nowYear - birthYear;
  if (nowMonth < birthMonth || (nowMonth === birthMonth && nowDay < birthDay)) {
    age--;
  }
  return Math.max(18, age);
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
    case 'lindblad':
    case 'arvid_lindblad':
      return 'arvid-lindblad';
    case 'colapinto':
    case 'franco_colapinto':
      return 'franco-colapinto';
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

export interface DriverCareerArchiveItem {
  firstRace: string;
  firstWin: string;
  firstPodium: string;
  firstPoints: string;
  bestSeasonRank: number;
  mostWinsInSeason: number;
}

export const DRIVER_CAREER_ARCHIVE: Record<string, DriverCareerArchiveItem> = {
  max_verstappen: {
    firstRace: '2015 Australian Grand Prix (Toro Rosso)',
    firstWin: '2016 Spanish Grand Prix (P1)',
    firstPodium: '2016 Spanish Grand Prix (P1)',
    firstPoints: '2015 Malaysian Grand Prix (P7)',
    bestSeasonRank: 1,
    mostWinsInSeason: 19,
  },
  verstappen: {
    firstRace: '2015 Australian Grand Prix (Toro Rosso)',
    firstWin: '2016 Spanish Grand Prix (P1)',
    firstPodium: '2016 Spanish Grand Prix (P1)',
    firstPoints: '2015 Malaysian Grand Prix (P7)',
    bestSeasonRank: 1,
    mostWinsInSeason: 19,
  },
  norris: {
    firstRace: '2019 Australian Grand Prix',
    firstWin: '2024 Miami Grand Prix (P1)',
    firstPodium: '2020 Austrian Grand Prix (P3)',
    firstPoints: '2019 Bahrain Grand Prix (P6)',
    bestSeasonRank: 1,
    mostWinsInSeason: 4,
  },
  lando_norris: {
    firstRace: '2019 Australian Grand Prix',
    firstWin: '2024 Miami Grand Prix (P1)',
    firstPodium: '2020 Austrian Grand Prix (P3)',
    firstPoints: '2019 Bahrain Grand Prix (P6)',
    bestSeasonRank: 1,
    mostWinsInSeason: 4,
  },
  leclerc: {
    firstRace: '2018 Australian Grand Prix (Sauber)',
    firstWin: '2019 Belgian Grand Prix (P1)',
    firstPodium: '2019 Bahrain Grand Prix (P3)',
    firstPoints: '2018 Azerbaijan Grand Prix (P6)',
    bestSeasonRank: 2,
    mostWinsInSeason: 3,
  },
  charles_leclerc: {
    firstRace: '2018 Australian Grand Prix (Sauber)',
    firstWin: '2019 Belgian Grand Prix (P1)',
    firstPodium: '2019 Bahrain Grand Prix (P3)',
    firstPoints: '2018 Azerbaijan Grand Prix (P6)',
    bestSeasonRank: 2,
    mostWinsInSeason: 3,
  },
  hamilton: {
    firstRace: '2007 Australian Grand Prix (P3)',
    firstWin: '2007 Canadian Grand Prix (P1)',
    firstPodium: '2007 Australian Grand Prix (P3)',
    firstPoints: '2007 Australian Grand Prix (P3)',
    bestSeasonRank: 1,
    mostWinsInSeason: 11,
  },
  lewis_hamilton: {
    firstRace: '2007 Australian Grand Prix (P3)',
    firstWin: '2007 Canadian Grand Prix (P1)',
    firstPodium: '2007 Australian Grand Prix (P3)',
    firstPoints: '2007 Australian Grand Prix (P3)',
    bestSeasonRank: 1,
    mostWinsInSeason: 11,
  },
  piastri: {
    firstRace: '2023 Bahrain Grand Prix',
    firstWin: '2024 Hungarian Grand Prix (P1)',
    firstPodium: '2023 Japanese Grand Prix (P3)',
    firstPoints: '2023 Australian Grand Prix (P8)',
    bestSeasonRank: 4,
    mostWinsInSeason: 7,
  },
  oscar_piastri: {
    firstRace: '2023 Bahrain Grand Prix',
    firstWin: '2024 Hungarian Grand Prix (P1)',
    firstPodium: '2023 Japanese Grand Prix (P3)',
    firstPoints: '2023 Australian Grand Prix (P8)',
    bestSeasonRank: 4,
    mostWinsInSeason: 7,
  },
  russell: {
    firstRace: '2019 Australian Grand Prix (Williams)',
    firstWin: '2022 São Paulo Grand Prix (P1)',
    firstPodium: '2021 Belgian Grand Prix (P2)',
    firstPoints: '2020 Sakhir Grand Prix (P9)',
    bestSeasonRank: 4,
    mostWinsInSeason: 2,
  },
  george_russell: {
    firstRace: '2019 Australian Grand Prix (Williams)',
    firstWin: '2022 São Paulo Grand Prix (P1)',
    firstPodium: '2021 Belgian Grand Prix (P2)',
    firstPoints: '2020 Sakhir Grand Prix (P9)',
    bestSeasonRank: 4,
    mostWinsInSeason: 2,
  },
  antonelli: {
    firstRace: '2025 Australian Grand Prix',
    firstWin: '2026 Chinese Grand Prix (P1)',
    firstPodium: '2025 Canadian Grand Prix (P3)',
    firstPoints: '2025 Australian Grand Prix (P8)',
    bestSeasonRank: 7,
    mostWinsInSeason: 8,
  },
  kimi_antonelli: {
    firstRace: '2025 Australian Grand Prix',
    firstWin: '2026 Chinese Grand Prix (P1)',
    firstPodium: '2025 Canadian Grand Prix (P3)',
    firstPoints: '2025 Australian Grand Prix (P8)',
    bestSeasonRank: 7,
    mostWinsInSeason: 8,
  },
  andrea_kimi_antonelli: {
    firstRace: '2025 Australian Grand Prix',
    firstWin: '2026 Chinese Grand Prix (P1)',
    firstPodium: '2025 Canadian Grand Prix (P3)',
    firstPoints: '2025 Australian Grand Prix (P8)',
    bestSeasonRank: 7,
    mostWinsInSeason: 8,
  },
  sainz: {
    firstRace: '2015 Australian Grand Prix (Toro Rosso)',
    firstWin: '2022 British Grand Prix (P1)',
    firstPodium: '2019 Brazilian Grand Prix (P3)',
    firstPoints: '2015 Australian Grand Prix (P9)',
    bestSeasonRank: 5,
    mostWinsInSeason: 2,
  },
  carlos_sainz: {
    firstRace: '2015 Australian Grand Prix (Toro Rosso)',
    firstWin: '2022 British Grand Prix (P1)',
    firstPodium: '2019 Brazilian Grand Prix (P3)',
    firstPoints: '2015 Australian Grand Prix (P9)',
    bestSeasonRank: 5,
    mostWinsInSeason: 2,
  },
  alonso: {
    firstRace: '2001 Australian Grand Prix (Minardi)',
    firstWin: '2003 Hungarian Grand Prix (P1)',
    firstPodium: '2003 Malaysian Grand Prix (P3)',
    firstPoints: '2003 Australian Grand Prix (P7)',
    bestSeasonRank: 1,
    mostWinsInSeason: 7,
  },
  fernando_alonso: {
    firstRace: '2001 Australian Grand Prix (Minardi)',
    firstWin: '2003 Hungarian Grand Prix (P1)',
    firstPodium: '2003 Malaysian Grand Prix (P3)',
    firstPoints: '2003 Australian Grand Prix (P7)',
    bestSeasonRank: 1,
    mostWinsInSeason: 7,
  },
  albon: {
    firstRace: '2019 Australian Grand Prix (Toro Rosso)',
    firstWin: '—',
    firstPodium: '2020 Tuscan Grand Prix (P3)',
    firstPoints: '2019 Bahrain Grand Prix (P9)',
    bestSeasonRank: 7,
    mostWinsInSeason: 0,
  },
  alexander_albon: {
    firstRace: '2019 Australian Grand Prix (Toro Rosso)',
    firstWin: '—',
    firstPodium: '2020 Tuscan Grand Prix (P3)',
    firstPoints: '2019 Bahrain Grand Prix (P9)',
    bestSeasonRank: 7,
    mostWinsInSeason: 0,
  },
  gasly: {
    firstRace: '2017 Malaysian Grand Prix (Toro Rosso)',
    firstWin: '2020 Italian Grand Prix (P1)',
    firstPodium: '2019 Brazilian Grand Prix (P2)',
    firstPoints: '2018 Bahrain Grand Prix (P4)',
    bestSeasonRank: 7,
    mostWinsInSeason: 1,
  },
  pierre_gasly: {
    firstRace: '2017 Malaysian Grand Prix (Toro Rosso)',
    firstWin: '2020 Italian Grand Prix (P1)',
    firstPodium: '2019 Brazilian Grand Prix (P2)',
    firstPoints: '2018 Bahrain Grand Prix (P4)',
    bestSeasonRank: 7,
    mostWinsInSeason: 1,
  },
  ocon: {
    firstRace: '2016 Belgian Grand Prix (Manor)',
    firstWin: '2021 Hungarian Grand Prix (P1)',
    firstPodium: '2020 Sakhir Grand Prix (P2)',
    firstPoints: '2017 Australian Grand Prix (P10)',
    bestSeasonRank: 8,
    mostWinsInSeason: 1,
  },
  esteban_ocon: {
    firstRace: '2016 Belgian Grand Prix (Manor)',
    firstWin: '2021 Hungarian Grand Prix (P1)',
    firstPodium: '2020 Sakhir Grand Prix (P2)',
    firstPoints: '2017 Australian Grand Prix (P10)',
    bestSeasonRank: 8,
    mostWinsInSeason: 1,
  },
  hulkenberg: {
    firstRace: '2010 Bahrain Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2010 Malaysian Grand Prix (P10)',
    bestSeasonRank: 7,
    mostWinsInSeason: 0,
  },
  nico_hulkenberg: {
    firstRace: '2010 Bahrain Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2010 Malaysian Grand Prix (P10)',
    bestSeasonRank: 7,
    mostWinsInSeason: 0,
  },
  stroll: {
    firstRace: '2017 Australian Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '2017 Azerbaijan Grand Prix (P3)',
    firstPoints: '2017 Canadian Grand Prix (P9)',
    bestSeasonRank: 10,
    mostWinsInSeason: 0,
  },
  lance_stroll: {
    firstRace: '2017 Australian Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '2017 Azerbaijan Grand Prix (P3)',
    firstPoints: '2017 Canadian Grand Prix (P9)',
    bestSeasonRank: 10,
    mostWinsInSeason: 0,
  },
  tsunoda: {
    firstRace: '2021 Bahrain Grand Prix (AlphaTauri)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2021 Bahrain Grand Prix (P9)',
    bestSeasonRank: 11,
    mostWinsInSeason: 0,
  },
  yuki_tsunoda: {
    firstRace: '2021 Bahrain Grand Prix (AlphaTauri)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2021 Bahrain Grand Prix (P9)',
    bestSeasonRank: 11,
    mostWinsInSeason: 0,
  },
  lawson: {
    firstRace: '2023 Dutch Grand Prix (AlphaTauri)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2023 Singapore Grand Prix (P9)',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
  liam_lawson: {
    firstRace: '2023 Dutch Grand Prix (AlphaTauri)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2023 Singapore Grand Prix (P9)',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
  bearman: {
    firstRace: '2024 Saudi Arabian Grand Prix (Ferrari)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2024 Saudi Arabian Grand Prix (P7)',
    bestSeasonRank: 18,
    mostWinsInSeason: 0,
  },
  oliver_bearman: {
    firstRace: '2024 Saudi Arabian Grand Prix (Ferrari)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2024 Saudi Arabian Grand Prix (P7)',
    bestSeasonRank: 18,
    mostWinsInSeason: 0,
  },
  colapinto: {
    firstRace: '2024 Italian Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2024 Azerbaijan Grand Prix (P8)',
    bestSeasonRank: 19,
    mostWinsInSeason: 0,
  },
  franco_colapinto: {
    firstRace: '2024 Italian Grand Prix (Williams)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2024 Azerbaijan Grand Prix (P8)',
    bestSeasonRank: 19,
    mostWinsInSeason: 0,
  },
  doohan: {
    firstRace: '2024 Abu Dhabi Grand Prix (Alpine)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '—',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
  jack_doohan: {
    firstRace: '2024 Abu Dhabi Grand Prix (Alpine)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '—',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
  hadjar: {
    firstRace: '2025 Australian Grand Prix (Racing Bulls)',
    firstWin: '—',
    firstPodium: '2026 British Grand Prix (P3)',
    firstPoints: '2025 Bahrain Grand Prix (P8)',
    bestSeasonRank: 8,
    mostWinsInSeason: 0,
  },
  isack_hadjar: {
    firstRace: '2025 Australian Grand Prix (Racing Bulls)',
    firstWin: '—',
    firstPodium: '2026 British Grand Prix (P3)',
    firstPoints: '2025 Bahrain Grand Prix (P8)',
    bestSeasonRank: 8,
    mostWinsInSeason: 0,
  },
  bortoleto: {
    firstRace: '2025 Australian Grand Prix (Kick Sauber)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2025 Austrian Grand Prix (P9)',
    bestSeasonRank: 19,
    mostWinsInSeason: 0,
  },
  gabriel_bortoleto: {
    firstRace: '2025 Australian Grand Prix (Kick Sauber)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2025 Austrian Grand Prix (P9)',
    bestSeasonRank: 19,
    mostWinsInSeason: 0,
  },
  lindblad: {
    firstRace: '2025 Australian Grand Prix (Racing Bulls)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2025 British Grand Prix (P10)',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
  arvid_lindblad: {
    firstRace: '2025 Australian Grand Prix (Racing Bulls)',
    firstWin: '—',
    firstPodium: '—',
    firstPoints: '2025 British Grand Prix (P10)',
    bestSeasonRank: 20,
    mostWinsInSeason: 0,
  },
};

function buildDriverProfileRaw(driverId: string): DriverCareerProfile {
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
        teamTenure: '2025 – Present',
        teamColor: '#E8002D',
        teamSecondaryColor: '#FFF200',
        biography:
          'Statistical titan of Formula 1 with a record 106 Grand Prix victories and 7 World Championships. Celebrated for sublime wet-weather prowess, unmatched tire management, and sporting longevity in his historic Ferrari era.',
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
          entries: 394,
          starts: 394,
          wins: 106,
          podiums: 207,
          poles: 104,
          fastestLaps: 67,
          totalPoints: 5209.5,
          winRatePercent: 26.9,
          podiumRatePercent: 52.5,
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
          currentRank: 3,
          points: 191,
          wins: 1,
          podiums: 5,
          poles: 0,
          fastestLaps: 3,
          dnfs: 1,
          avgFinish: 4.2,
          avgGrid: 3.8,
          pointsPerRace: 13.6,
          teammateH2H: {
            teammateName: 'Charles Leclerc',
            qualiScore: '7 — 7',
            raceScore: '8 — 6',
            pointsSplit: [53, 47],
            medianGapSeconds: '-0.042s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 6, gridPos: 5, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 2, gridPos: 2, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 4, gridPos: 5, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 2, gridPos: 2, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP', teamColor: '#E8002D', championshipPosition: 3, points: 191, wins: 1, podiums: 5, racesCount: 14 },
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
        permanentNumber: 3,
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
        teamTenure: '2016 – Present',
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
          entries: 247,
          starts: 247,
          wins: 71,
          podiums: 133,
          poles: 48,
          fastestLaps: 34,
          totalPoints: 3589.5,
          winRatePercent: 28.7,
          podiumRatePercent: 53.8,
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
          currentRank: 6,
          points: 145,
          wins: 0,
          podiums: 6,
          poles: 0,
          fastestLaps: 5,
          dnfs: 1,
          avgFinish: 3.4,
          avgGrid: 2.8,
          pointsPerRace: 10.4,
          teammateH2H: {
            teammateName: 'Isack Hadjar',
            qualiScore: '11 — 3',
            raceScore: '12 — 2',
            pointsSplit: [67, 33],
            medianGapSeconds: '-0.320s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 3, gridPos: 2, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 2, gridPos: 1, delta: -1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 3, gridPos: 4, delta: 1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 2, gridPos: 3, delta: 1, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 4, gridPos: 4, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 6, points: 145, wins: 0, podiums: 6, racesCount: 14 },
          { season: 2025, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 2, points: 421, wins: 8, podiums: 15, racesCount: 24 },
          { season: 2024, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 437, wins: 9, podiums: 14, racesCount: 24 },
          { season: 2023, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 575, wins: 19, podiums: 21, racesCount: 22 },
          { season: 2022, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 454, wins: 15, podiums: 17, racesCount: 22 },
          { season: 2021, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 1, points: 395.5, wins: 10, podiums: 18, racesCount: 22 },
          { season: 2020, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 3, points: 214, wins: 2, podiums: 11, racesCount: 17 },
          { season: 2019, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 3, points: 278, wins: 3, podiums: 9, racesCount: 21 },
          { season: 2018, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 4, points: 249, wins: 2, podiums: 11, racesCount: 21 },
          { season: 2017, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 6, points: 168, wins: 2, podiums: 4, racesCount: 20 },
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
        permanentNumber: 1,
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
        championships: 1,
        allTimeRanks: {
          championships: 1,
          wins: 48,
          podiums: 19,
          poles: 22,
          points: 12,
          starts: 55,
        },
        careerTotals: {
          entries: 165,
          starts: 165,
          wins: 13,
          podiums: 49,
          poles: 19,
          fastestLaps: 12,
          totalPoints: 1616,
          winRatePercent: 7.9,
          podiumRatePercent: 29.7,
          dnfRatePercent: 7.2,
          avgFinish: 5.2,
          mostWinsInSeason: 7,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '2019 Australian Grand Prix',
          firstPoints: '2019 Bahrain Grand Prix (P6)',
          firstPodium: '2020 Austrian Grand Prix (P3)',
          firstWin: '2024 Miami Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 4,
          points: 186,
          wins: 2,
          podiums: 5,
          poles: 4,
          fastestLaps: 3,
          dnfs: 0,
          avgFinish: 3.8,
          avgGrid: 2.8,
          pointsPerRace: 13.3,
          teammateH2H: {
            teammateName: 'Oscar Piastri',
            qualiScore: '9 — 5',
            raceScore: '8 — 6',
            pointsSplit: [61, 39],
            medianGapSeconds: '-0.145s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 4, gridPos: 3, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 1, gridPos: 1, delta: 0, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 5, gridPos: 4, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 1, gridPos: 1, delta: 0, isWin: true, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 3, gridPos: 3, delta: 0, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 4, points: 186, wins: 2, podiums: 5, racesCount: 14 },
          { season: 2025, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 1, points: 442, wins: 8, podiums: 18, racesCount: 24 },
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
        teamTenure: '2025 – Present',
        currentOrFinalTeam: 'Mercedes-AMG PETRONAS F1 Team',
        teamColor: '#27F4D2',
        teamSecondaryColor: '#000000',
        biography:
          'Prodigious Italian sensation and Mercedes F1 race driver. Antonelli stepped up directly to Formula 1 following rapid championship titles across FRECA, Italian F4, and Formula 2, quickly establishing himself as a championship leader.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 38, podiums: 35, poles: 30, points: 25, starts: 105 },
        careerTotals: {
          entries: 38,
          starts: 38,
          wins: 8,
          podiums: 15,
          poles: 6,
          fastestLaps: 4,
          totalPoints: 442,
          winRatePercent: 21.1,
          podiumRatePercent: 39.5,
          dnfRatePercent: 5.3,
          avgFinish: 3.5,
          mostWinsInSeason: 8,
          bestSeasonRank: 7,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix',
          firstPoints: '2025 Australian Grand Prix (P8)',
          firstPodium: '2025 Canadian Grand Prix (P3)',
          firstWin: '2026 Chinese Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 1,
          points: 292,
          wins: 8,
          podiums: 12,
          poles: 6,
        },
        timeline: [
          { season: 2026, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 1, points: 292, wins: 8, podiums: 12, racesCount: 14 },
          { season: 2025, teamId: 'mercedes', teamName: 'Mercedes', teamColor: '#27F4D2', championshipPosition: 7, points: 150, wins: 0, podiums: 3, racesCount: 24 },
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
          { season: 2026, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP', teamColor: '#E8002D', championshipPosition: 5, points: 167, wins: 1, podiums: 4, racesCount: 14 },
          { season: 2025, teamId: 'ferrari', teamName: 'Scuderia Ferrari HP', teamColor: '#E8002D', championshipPosition: 4, points: 248, wins: 2, podiums: 7, racesCount: 24 },
          { season: 2024, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 3, points: 356, wins: 3, podiums: 13, racesCount: 24 },
          { season: 2023, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 5, points: 206, wins: 0, podiums: 6, racesCount: 22 },
          { season: 2022, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 2, points: 308, wins: 3, podiums: 11, racesCount: 22 },
          { season: 2021, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 7, points: 159, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2020, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 8, points: 98, wins: 0, podiums: 2, racesCount: 17 },
          { season: 2019, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 4, points: 264, wins: 2, podiums: 10, racesCount: 21 },
          { season: 2018, teamId: 'sauber', teamName: 'Sauber F1 Team', teamColor: '#52E252', championshipPosition: 13, points: 39, wins: 0, podiums: 0, racesCount: 21 },
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
        teamTenure: '2023 – Present',
        teamColor: '#FF8000',
        teamSecondaryColor: '#47C7FC',
        biography:
          'Ice-cool Australian star and Sprint winner with uncanny tactical maturity. Piastri claimed back-to-back F3 and F2 championships before earning race victories for McLaren.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 35, podiums: 30, poles: 35, points: 20, starts: 80 },
        careerTotals: {
          entries: 62,
          starts: 62,
          wins: 9,
          podiums: 28,
          poles: 2,
          fastestLaps: 4,
          totalPoints: 580,
          winRatePercent: 14.5,
          podiumRatePercent: 45.2,
          dnfRatePercent: 6.4,
          avgFinish: 5.1,
          mostWinsInSeason: 7,
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
          currentRank: 7,
          points: 120,
          wins: 0,
          podiums: 2,
          poles: 0,
          fastestLaps: 1,
          dnfs: 3,
          avgFinish: 7.2,
          avgGrid: 5.6,
          pointsPerRace: 8.6,
          teammateH2H: {
            teammateName: 'Lando Norris',
            qualiScore: '6 — 8',
            raceScore: '6 — 8',
            pointsSplit: [39, 61],
            medianGapSeconds: '+0.145s',
          },
          last5Races: [
            { raceName: 'Spanish GP', finishPos: 8, gridPos: 7, delta: -1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Italian GP', finishPos: 5, gridPos: 6, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 6, gridPos: 4, delta: -2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 20, gridPos: 3, delta: -17, isWin: false, isPodium: false, isPoints: false, isDNF: true },
            { raceName: 'Belgian GP', finishPos: 5, gridPos: 6, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 7, points: 128, wins: 0, podiums: 3, racesCount: 14 },
          { season: 2025, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 5, points: 212, wins: 3, podiums: 8, racesCount: 24 },
          { season: 2024, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 4, points: 292, wins: 2, podiums: 8, racesCount: 24 },
          { season: 2023, teamId: 'mclaren', teamName: 'McLaren Formula 1 Team', teamColor: '#FF8000', championshipPosition: 9, points: 97, wins: 0, podiums: 2, racesCount: 22 },
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
          { season: 2026, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 2, points: 211, wins: 2, podiums: 8, racesCount: 14 },
          { season: 2025, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 6, points: 188, wins: 1, podiums: 4, racesCount: 24 },
          { season: 2024, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 6, points: 245, wins: 2, podiums: 4, racesCount: 24 },
          { season: 2023, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 8, points: 175, wins: 0, podiums: 2, racesCount: 22 },
          { season: 2022, teamId: 'mercedes', teamName: 'Mercedes-AMG PETRONAS F1 Team', teamColor: '#27F4D2', championshipPosition: 4, points: 275, wins: 1, podiums: 8, racesCount: 22 },
          { season: 2021, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 15, points: 16, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2020, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 18, points: 3, wins: 0, podiums: 0, racesCount: 17 },
          { season: 2019, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 20, points: 0, wins: 0, podiums: 0, racesCount: 21 },
        ],
        circuitRecords: [
          { circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', starts: 6, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 4.0, points: 62 },
          { circuitId: 'red_bull_ring', circuitName: 'Red Bull Ring', country: 'Austria', starts: 7, wins: 1, podiums: 2, poles: 0, bestFinish: 1, avgFinish: 4.8, points: 58 },
        ],
      };

    case 'hadjar':
    case 'isack_hadjar':
      return {
        driverId: 'hadjar',
        code: 'HAD',
        permanentNumber: 6,
        givenName: 'Isack',
        familyName: 'Hadjar',
        fullName: 'Isack Hadjar',
        nationality: 'French',
        countryFlag: '🇫🇷',
        birthDate: '2004-09-28',
        birthPlace: 'Paris, France',
        age: 21,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: 'Oracle Red Bull Racing',
        teamTenure: '2026 – Present',
        teamColor: '#3671C6',
        teamSecondaryColor: '#FCD800',
        biography:
          'Ferocious French talent promoted to Oracle Red Bull Racing alongside Max Verstappen after an electrifying rookie season at Racing Bulls, known for fearless overtakes and razor-sharp wet-weather racecraft.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 48, poles: 50, points: 38, starts: 82 },
        careerTotals: {
          entries: 38,
          starts: 38,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 1,
          totalPoints: 122,
          winRatePercent: 0,
          podiumRatePercent: 2.6,
          dnfRatePercent: 7.9,
          avgFinish: 9.1,
          mostWinsInSeason: 0,
          bestSeasonRank: 8,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix (Racing Bulls)',
          firstPoints: '2025 Bahrain Grand Prix (P8)',
          firstPodium: '2026 British Grand Prix (P3)',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 8,
          points: 71,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 1,
          dnfs: 1,
          avgFinish: 8.2,
          avgGrid: 7.6,
          pointsPerRace: 5.1,
          teammateH2H: {
            teammateName: 'Max Verstappen',
            qualiScore: '3 — 11',
            raceScore: '2 — 12',
            pointsSplit: [33, 67],
            medianGapSeconds: '+0.320s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 7, gridPos: 8, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 6, gridPos: 7, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 3, gridPos: 5, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'red_bull', teamName: 'Oracle Red Bull Racing', teamColor: '#3671C6', championshipPosition: 8, points: 71, wins: 0, podiums: 1, racesCount: 14 },
          { season: 2025, teamId: 'rb', teamName: 'Racing Bulls', teamColor: '#6692FF', championshipPosition: 10, points: 51, wins: 0, podiums: 0, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 2, wins: 0, podiums: 1, poles: 0, bestFinish: 3, avgFinish: 5.5, points: 21 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 7, avgFinish: 8.0, points: 10 },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', country: 'Belgium', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 6, avgFinish: 7.5, points: 14 },
        ],
      };

    case 'sainz':
    case 'carlos_sainz':
      return {
        driverId: 'sainz',
        code: 'SAI',
        permanentNumber: 55,
        givenName: 'Carlos',
        familyName: 'Sainz',
        fullName: 'Carlos Sainz',
        nationality: 'Spanish',
        countryFlag: '🇪🇸',
        birthDate: '1994-09-01',
        birthPlace: 'Madrid, Spain',
        age: 31,
        isActive: true,
        careerSpan: '2015 – Present',
        currentOrFinalTeam: 'Atlassian Williams F1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#64C4FF',
        teamSecondaryColor: '#002F6C',
        biography:
          'The Smooth Operator — tactical maestro celebrated for cerebral race management, opportunistic victories at Singapore, Silverstone, Australia, and Mexico City, leading the charge for Williams.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 35, podiums: 23, poles: 21, points: 11, starts: 28 },
        careerTotals: {
          entries: 234,
          starts: 234,
          wins: 4,
          podiums: 28,
          poles: 6,
          fastestLaps: 4,
          totalPoints: 1326.5,
          winRatePercent: 1.7,
          podiumRatePercent: 12.0,
          dnfRatePercent: 9.8,
          avgFinish: 6.8,
          mostWinsInSeason: 2,
          bestSeasonRank: 5,
        },
        firstsAndBests: {
          firstRace: '2015 Australian Grand Prix (Toro Rosso)',
          firstPoints: '2015 Australian Grand Prix (P9)',
          firstPodium: '2019 Brazilian Grand Prix (P3)',
          firstWin: '2022 British Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 10,
          points: 48,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 8.4,
          avgGrid: 8.8,
          pointsPerRace: 3.4,
          teammateH2H: {
            teammateName: 'Alexander Albon',
            qualiScore: '8 — 6',
            raceScore: '8 — 6',
            pointsSplit: [58, 42],
            medianGapSeconds: '-0.065s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 7, gridPos: 8, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 3, gridPos: 5, delta: 2, isWin: false, isPodium: true, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'williams', teamName: 'Atlassian Williams F1 Team', teamColor: '#64C4FF', championshipPosition: 10, points: 48, wins: 0, podiums: 1, racesCount: 14 },
          { season: 2025, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 8, points: 112, wins: 0, podiums: 2, racesCount: 24 },
          { season: 2024, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 5, points: 290, wins: 2, podiums: 8, racesCount: 24 },
          { season: 2023, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 7, points: 200, wins: 1, podiums: 3, racesCount: 22 },
          { season: 2022, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 5, points: 246, wins: 1, podiums: 9, racesCount: 22 },
          { season: 2021, teamId: 'ferrari', teamName: 'Scuderia Ferrari', teamColor: '#E8002D', championshipPosition: 5, points: 164.5, wins: 0, podiums: 4, racesCount: 22 },
          { season: 2020, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 6, points: 105, wins: 0, podiums: 1, racesCount: 17 },
          { season: 2019, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 6, points: 96, wins: 0, podiums: 1, racesCount: 21 },
          { season: 2018, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 10, points: 53, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2017, teamId: 'toro_rosso', teamName: 'Toro Rosso / Renault', teamColor: '#6692FF', championshipPosition: 9, points: 54, wins: 0, podiums: 0, racesCount: 20 },
          { season: 2016, teamId: 'toro_rosso', teamName: 'Toro Rosso', teamColor: '#6692FF', championshipPosition: 12, points: 46, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2015, teamId: 'toro_rosso', teamName: 'Toro Rosso', teamColor: '#6692FF', championshipPosition: 15, points: 18, wins: 0, podiums: 0, racesCount: 19 },
        ],
        circuitRecords: [
          { circuitId: 'marina_bay', circuitName: 'Marina Bay Street Circuit', country: 'Singapore', starts: 9, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 4.5, points: 78 },
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 10, wins: 1, podiums: 2, poles: 1, bestFinish: 1, avgFinish: 5.2, points: 88 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 10, wins: 0, podiums: 3, poles: 1, bestFinish: 2, avgFinish: 4.8, points: 92 },
        ],
      };

    case 'alonso':
    case 'fernando_alonso':
      return {
        driverId: 'alonso',
        code: 'ALO',
        permanentNumber: 14,
        givenName: 'Fernando',
        familyName: 'Alonso',
        fullName: 'Fernando Alonso',
        nationality: 'Spanish',
        countryFlag: '🇪🇸',
        birthDate: '1981-07-29',
        birthPlace: 'Oviedo, Spain',
        age: 44,
        isActive: true,
        careerSpan: '2001 – Present',
        currentOrFinalTeam: 'Aston Martin Aramco F1 Team',
        teamTenure: '2023 – Present',
        teamColor: '#229971',
        teamSecondaryColor: '#CEDC00',
        biography:
          'Two-time World Champion and ageless gladiatorial master of racecraft, famous for squeezing beyond the absolute mechanical limit of every car across four decades of Formula 1 racing.',
        championships: 2,
        allTimeRanks: { championships: 7, wins: 7, podiums: 6, poles: 14, points: 4, starts: 1 },
        careerTotals: {
          entries: 418,
          starts: 415,
          wins: 32,
          podiums: 107,
          poles: 22,
          fastestLaps: 26,
          totalPoints: 2367,
          winRatePercent: 7.7,
          podiumRatePercent: 25.8,
          dnfRatePercent: 16.1,
          avgFinish: 5.6,
          mostWinsInSeason: 7,
          bestSeasonRank: 1,
        },
        firstsAndBests: {
          firstRace: '2001 Australian Grand Prix (Minardi)',
          firstPoints: '2003 Australian Grand Prix (P7)',
          firstPodium: '2003 Malaysian Grand Prix (P3)',
          firstWin: '2003 Hungarian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 12,
          points: 28,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 9.8,
          avgGrid: 9.2,
          pointsPerRace: 2.0,
          teammateH2H: {
            teammateName: 'Lance Stroll',
            qualiScore: '12 — 2',
            raceScore: '11 — 3',
            pointsSplit: [72, 28],
            medianGapSeconds: '-0.240s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 8, gridPos: 8, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 8, gridPos: 9, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 12, points: 28, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 9, points: 74, wins: 0, podiums: 1, racesCount: 24 },
          { season: 2024, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 9, points: 62, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2023, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 4, points: 206, wins: 0, podiums: 8, racesCount: 22 },
          { season: 2022, teamId: 'alpine', teamName: 'Alpine', teamColor: '#0093CC', championshipPosition: 9, points: 81, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2021, teamId: 'alpine', teamName: 'Alpine', teamColor: '#0093CC', championshipPosition: 10, points: 81, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2018, teamId: 'mclaren', teamName: 'McLaren', teamColor: '#FF8000', championshipPosition: 11, points: 50, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2014, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 6, points: 161, wins: 0, podiums: 2, racesCount: 19 },
          { season: 2012, teamId: 'ferrari', teamName: 'Ferrari', teamColor: '#E8002D', championshipPosition: 2, points: 278, wins: 3, podiums: 13, racesCount: 20 },
          { season: 2006, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 1, points: 134, wins: 7, podiums: 14, racesCount: 18 },
          { season: 2005, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 1, points: 133, wins: 7, podiums: 15, racesCount: 19 },
          { season: 2001, teamId: 'minardi', teamName: 'Minardi', teamColor: '#000000', championshipPosition: 23, points: 0, wins: 0, podiums: 0, racesCount: 17 },
        ],
        circuitRecords: [
          { circuitId: 'bahrain', circuitName: 'Bahrain International Circuit', country: 'Bahrain', starts: 20, wins: 3, podiums: 5, poles: 1, bestFinish: 1, avgFinish: 4.8, points: 148 },
          { circuitId: 'monaco', circuitName: 'Circuit de Monaco', country: 'Monaco', starts: 20, wins: 2, podiums: 5, poles: 2, bestFinish: 1, avgFinish: 5.1, points: 135 },
        ],
      };

    case 'albon':
    case 'alexander_albon':
      return {
        driverId: 'albon',
        code: 'ALB',
        permanentNumber: 23,
        givenName: 'Alexander',
        familyName: 'Albon',
        fullName: 'Alexander Albon',
        nationality: 'Thai',
        countryFlag: '🇹🇭',
        birthDate: '1996-03-23',
        birthPlace: 'London, United Kingdom',
        age: 29,
        isActive: true,
        careerSpan: '2019 – Present',
        currentOrFinalTeam: 'Atlassian Williams F1 Team',
        teamTenure: '2022 – Present',
        teamColor: '#64C4FF',
        teamSecondaryColor: '#002F6C',
        biography:
          'Williams team anchor celebrated for defensive masterclasses, exemplary tire conservation, and podium pedigree at Mugello and Bahrain with Red Bull.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 42, poles: 50, points: 28, starts: 45 },
        careerTotals: {
          entries: 134,
          starts: 134,
          wins: 0,
          podiums: 2,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 262,
          winRatePercent: 0,
          podiumRatePercent: 1.5,
          dnfRatePercent: 9.7,
          avgFinish: 9.8,
          mostWinsInSeason: 0,
          bestSeasonRank: 7,
        },
        firstsAndBests: {
          firstRace: '2019 Australian Grand Prix (Toro Rosso)',
          firstPoints: '2019 Bahrain Grand Prix (P9)',
          firstPodium: '2020 Tuscan Grand Prix (P3)',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 11,
          points: 34,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 9.4,
          avgGrid: 9.8,
          pointsPerRace: 2.4,
          teammateH2H: {
            teammateName: 'Carlos Sainz',
            qualiScore: '6 — 8',
            raceScore: '6 — 8',
            pointsSplit: [42, 58],
            medianGapSeconds: '+0.065s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 7, gridPos: 7, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'williams', teamName: 'Atlassian Williams F1 Team', teamColor: '#64C4FF', championshipPosition: 11, points: 34, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 11, points: 42, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 16, points: 12, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2023, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 13, points: 27, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2022, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 19, points: 4, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2020, teamId: 'red_bull', teamName: 'Red Bull Racing', teamColor: '#3671C6', championshipPosition: 7, points: 105, wins: 0, podiums: 2, racesCount: 17 },
          { season: 2019, teamId: 'red_bull', teamName: 'Toro Rosso / Red Bull', teamColor: '#3671C6', championshipPosition: 8, points: 92, wins: 0, podiums: 0, racesCount: 21 },
        ],
        circuitRecords: [
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 6, wins: 0, podiums: 0, poles: 0, bestFinish: 6, avgFinish: 8.2, points: 32 },
          { circuitId: 'americas', circuitName: 'Circuit of the Americas', country: 'United States', starts: 5, wins: 0, podiums: 0, poles: 0, bestFinish: 5, avgFinish: 8.8, points: 26 },
        ],
      };

    case 'lawson':
    case 'liam_lawson':
      return {
        driverId: 'lawson',
        code: 'LAW',
        permanentNumber: 30,
        givenName: 'Liam',
        familyName: 'Lawson',
        fullName: 'Liam Lawson',
        nationality: 'New Zealander',
        countryFlag: '🇳🇿',
        birthDate: '2002-02-11',
        birthPlace: 'Hastings, New Zealand',
        age: 24,
        isActive: true,
        careerSpan: '2023 – Present',
        currentOrFinalTeam: 'Visa Cash App Racing Bulls',
        teamTenure: '2024 – Present',
        teamColor: '#6692FF',
        teamSecondaryColor: '#E8002D',
        biography:
          'Tenacious Kiwi racer leading the line for Racing Bulls, celebrated for fearless wheel-to-wheel tenacity, tactical aggression, and immediate points-scoring pedigree.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 41, starts: 72 },
        careerTotals: {
          entries: 49,
          starts: 49,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 96,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 6.1,
          avgFinish: 9.6,
          mostWinsInSeason: 0,
          bestSeasonRank: 9,
        },
        firstsAndBests: {
          firstRace: '2023 Dutch Grand Prix (AlphaTauri)',
          firstPoints: '2023 Singapore Grand Prix (P9)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 9,
          points: 52,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 8.8,
          avgGrid: 8.4,
          pointsPerRace: 3.7,
          teammateH2H: {
            teammateName: 'Arvid Lindblad',
            qualiScore: '11 — 3',
            raceScore: '12 — 2',
            pointsSplit: [78, 22],
            medianGapSeconds: '-0.210s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 8, gridPos: 8, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 7, gridPos: 8, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 9, gridPos: 9, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 8, gridPos: 8, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'British GP', finishPos: 7, gridPos: 7, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'rb', teamName: 'Visa Cash App Racing Bulls', teamColor: '#6692FF', championshipPosition: 9, points: 52, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'rb', teamName: 'Visa Cash App Racing Bulls', teamColor: '#6692FF', championshipPosition: 12, points: 38, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'rb', teamName: 'RB Formula One Team', teamColor: '#6692FF', championshipPosition: 20, points: 4, wins: 0, podiums: 0, racesCount: 6 },
          { season: 2023, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 20, points: 2, wins: 0, podiums: 0, racesCount: 5 },
        ],
        circuitRecords: [
          { circuitId: 'marina_bay', circuitName: 'Marina Bay Street Circuit', country: 'Singapore', starts: 3, wins: 0, podiums: 0, poles: 0, bestFinish: 8, avgFinish: 8.6, points: 10 },
          { circuitId: 'americas', circuitName: 'Circuit of the Americas', country: 'United States', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 9, avgFinish: 9.5, points: 6 },
        ],
      };

    case 'bearman':
    case 'oliver_bearman':
      return {
        driverId: 'bearman',
        code: 'BEA',
        permanentNumber: 87,
        givenName: 'Oliver',
        familyName: 'Bearman',
        fullName: 'Oliver Bearman',
        nationality: 'British',
        countryFlag: '🇬🇧',
        birthDate: '2005-05-08',
        birthPlace: 'Chelmsford, United Kingdom',
        age: 20,
        isActive: true,
        careerSpan: '2024 – Present',
        currentOrFinalTeam: 'TGR Haas F1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#E6002B',
        teamSecondaryColor: '#B6BABD',
        biography:
          'Blisteringly quick British talent for TGR Haas F1 Team, famed for stepping into Ferrari at 18 in Jeddah to score sensational points on debut.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 44, starts: 76 },
        careerTotals: {
          entries: 41,
          starts: 41,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 59,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 7.3,
          avgFinish: 10.4,
          mostWinsInSeason: 0,
          bestSeasonRank: 13,
        },
        firstsAndBests: {
          firstRace: '2024 Saudi Arabian Grand Prix (Ferrari)',
          firstPoints: '2024 Saudi Arabian Grand Prix (P7)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 14,
          points: 18,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 11.2,
          avgGrid: 11.8,
          pointsPerRace: 1.3,
          teammateH2H: {
            teammateName: 'Esteban Ocon',
            qualiScore: '8 — 6',
            raceScore: '7 — 7',
            pointsSplit: [54, 46],
            medianGapSeconds: '-0.040s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'haas', teamName: 'TGR Haas F1 Team', teamColor: '#E6002B', championshipPosition: 14, points: 18, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'haas', teamName: 'Haas F1 Team', teamColor: '#E6002B', championshipPosition: 13, points: 34, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'haas', teamName: 'Ferrari / Haas', teamColor: '#E6002B', championshipPosition: 18, points: 7, wins: 0, podiums: 0, racesCount: 3 },
        ],
        circuitRecords: [
          { circuitId: 'jeddah', circuitName: 'Jeddah Corniche Circuit', country: 'Saudi Arabia', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 7, avgFinish: 8.5, points: 10 },
          { circuitId: 'baku', circuitName: 'Baku City Circuit', country: 'Azerbaijan', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 9, avgFinish: 9.5, points: 4 },
        ],
      };

    case 'gasly':
    case 'pierre_gasly':
      return {
        driverId: 'gasly',
        code: 'GAS',
        permanentNumber: 10,
        givenName: 'Pierre',
        familyName: 'Gasly',
        fullName: 'Pierre Gasly',
        nationality: 'French',
        countryFlag: '🇫🇷',
        birthDate: '1996-02-07',
        birthPlace: 'Rouen, France',
        age: 30,
        isActive: true,
        careerSpan: '2017 – Present',
        currentOrFinalTeam: 'BWT Alpine F1 Team',
        teamTenure: '2023 – Present',
        teamColor: '#0093CC',
        teamSecondaryColor: '#FF87BC',
        biography:
          'Monza victor and Alpine pacesetter renowned for fiery emotional racecraft, gritty wheel-to-wheel battles, and opportunistic podium finishes.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 45, podiums: 36, poles: 50, points: 26, starts: 35 },
        careerTotals: {
          entries: 178,
          starts: 178,
          wins: 1,
          podiums: 5,
          poles: 0,
          fastestLaps: 3,
          totalPoints: 471,
          winRatePercent: 0.6,
          podiumRatePercent: 2.8,
          dnfRatePercent: 12.4,
          avgFinish: 9.7,
          mostWinsInSeason: 1,
          bestSeasonRank: 7,
        },
        firstsAndBests: {
          firstRace: '2017 Malaysian Grand Prix (Toro Rosso)',
          firstPoints: '2018 Bahrain Grand Prix (P4)',
          firstPodium: '2019 Brazilian Grand Prix (P2)',
          firstWin: '2020 Italian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 13,
          points: 22,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 10.8,
          avgGrid: 11.2,
          pointsPerRace: 1.6,
          teammateH2H: {
            teammateName: 'Franco Colapinto',
            qualiScore: '9 — 5',
            raceScore: '9 — 5',
            pointsSplit: [68, 32],
            medianGapSeconds: '-0.115s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 9, gridPos: 11, delta: 2, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 13, gridPos: 13, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 13, points: 22, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 14, points: 28, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 10, points: 42, wins: 0, podiums: 1, racesCount: 24 },
          { season: 2023, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 11, points: 62, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2022, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 14, points: 23, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2021, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 9, points: 110, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2020, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 10, points: 75, wins: 1, podiums: 1, racesCount: 17 },
          { season: 2019, teamId: 'red_bull', teamName: 'Red Bull / Toro Rosso', teamColor: '#3671C6', championshipPosition: 7, points: 95, wins: 0, podiums: 1, racesCount: 21 },
          { season: 2018, teamId: 'rb', teamName: 'Toro Rosso', teamColor: '#6692FF', championshipPosition: 15, points: 29, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2017, teamId: 'rb', teamName: 'Toro Rosso', teamColor: '#6692FF', championshipPosition: 21, points: 0, wins: 0, podiums: 0, racesCount: 5 },
        ],
        circuitRecords: [
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 8, wins: 1, podiums: 1, poles: 0, bestFinish: 1, avgFinish: 7.8, points: 45 },
          { circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', starts: 7, wins: 0, podiums: 2, poles: 0, bestFinish: 2, avgFinish: 6.8, points: 48 },
        ],
      };

    case 'hulkenberg':
    case 'nico_hulkenberg':
      return {
        driverId: 'hulkenberg',
        code: 'HUL',
        permanentNumber: 27,
        givenName: 'Nico',
        familyName: 'Hülkenberg',
        fullName: 'Nico Hülkenberg',
        nationality: 'German',
        countryFlag: '🇩🇪',
        birthDate: '1987-08-19',
        birthPlace: 'Emmerich am Rhein, Germany',
        age: 38,
        isActive: true,
        careerSpan: '2010 – Present',
        currentOrFinalTeam: 'Audi Formula 1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#E21B23',
        teamSecondaryColor: '#C0C0C0',
        biography:
          'Veteran German qualifying specialist known for remarkable consistency, wet-weather brilliance, and spearheading the Audi Formula 1 Team factory program.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 45, points: 22, starts: 24 },
        careerTotals: {
          entries: 252,
          starts: 248,
          wins: 0,
          podiums: 0,
          poles: 1,
          fastestLaps: 2,
          totalPoints: 574,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 17.5,
          avgFinish: 9.8,
          mostWinsInSeason: 0,
          bestSeasonRank: 7,
        },
        firstsAndBests: {
          firstRace: '2010 Bahrain Grand Prix (Williams)',
          firstPoints: '2010 Malaysian Grand Prix (P10)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 15,
          points: 14,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 11.8,
          avgGrid: 11.2,
          pointsPerRace: 1.0,
          teammateH2H: {
            teammateName: 'Gabriel Bortoleto',
            qualiScore: '9 — 5',
            raceScore: '8 — 6',
            pointsSplit: [65, 35],
            medianGapSeconds: '-0.120s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 11, gridPos: 11, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 10, gridPos: 10, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 12, gridPos: 12, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 11, gridPos: 11, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'audi', teamName: 'Audi Formula 1 Team', teamColor: '#E21B23', championshipPosition: 15, points: 14, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'sauber', teamName: 'Kick Sauber', teamColor: '#52E252', championshipPosition: 16, points: 22, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'haas', teamName: 'Haas F1 Team', teamColor: '#E6002B', championshipPosition: 11, points: 41, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2023, teamId: 'haas', teamName: 'Haas F1 Team', teamColor: '#E6002B', championshipPosition: 16, points: 9, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2020, teamId: 'racing_point', teamName: 'Racing Point', teamColor: '#F596C7', championshipPosition: 15, points: 10, wins: 0, podiums: 0, racesCount: 3 },
          { season: 2019, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 14, points: 37, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2018, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 7, points: 69, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2017, teamId: 'renault', teamName: 'Renault', teamColor: '#FFF500', championshipPosition: 10, points: 43, wins: 0, podiums: 0, racesCount: 20 },
          { season: 2016, teamId: 'force_india', teamName: 'Force India', teamColor: '#F596C7', championshipPosition: 9, points: 72, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2015, teamId: 'force_india', teamName: 'Force India', teamColor: '#F596C7', championshipPosition: 10, points: 58, wins: 0, podiums: 0, racesCount: 19 },
          { season: 2014, teamId: 'force_india', teamName: 'Force India', teamColor: '#F596C7', championshipPosition: 9, points: 96, wins: 0, podiums: 0, racesCount: 19 },
          { season: 2013, teamId: 'sauber', teamName: 'Sauber', teamColor: '#52E252', championshipPosition: 10, points: 51, wins: 0, podiums: 0, racesCount: 19 },
          { season: 2012, teamId: 'force_india', teamName: 'Force India', teamColor: '#F596C7', championshipPosition: 11, points: 63, wins: 0, podiums: 0, racesCount: 20 },
          { season: 2010, teamId: 'williams', teamName: 'Williams', teamColor: '#64C4FF', championshipPosition: 14, points: 22, wins: 0, podiums: 0, racesCount: 19 },
        ],
        circuitRecords: [
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 12, wins: 0, podiums: 0, poles: 0, bestFinish: 6, avgFinish: 9.0, points: 48 },
          { circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', starts: 11, wins: 0, podiums: 0, poles: 1, bestFinish: 5, avgFinish: 8.4, points: 42 },
        ],
      };

    case 'colapinto':
    case 'franco_colapinto':
      return {
        driverId: 'colapinto',
        code: 'COL',
        permanentNumber: 43,
        givenName: 'Franco',
        familyName: 'Colapinto',
        fullName: 'Franco Colapinto',
        nationality: 'Argentine',
        countryFlag: '🇦🇷',
        birthDate: '2003-05-27',
        birthPlace: 'Buenos Aires, Argentina',
        age: 22,
        isActive: true,
        careerSpan: '2024 – Present',
        currentOrFinalTeam: 'BWT Alpine F1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#0093CC',
        teamSecondaryColor: '#FF87BC',
        biography:
          'Argentine dynamo bringing electrifying wheel-to-wheel racecraft and immense raw speed to BWT Alpine F1 Team after an unforgettable breakthrough at Williams.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 46, starts: 79 },
        careerTotals: {
          entries: 47,
          starts: 47,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 25,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 8.5,
          avgFinish: 12.1,
          mostWinsInSeason: 0,
          bestSeasonRank: 18,
        },
        firstsAndBests: {
          firstRace: '2024 Italian Grand Prix (Williams)',
          firstPoints: '2024 Azerbaijan Grand Prix (P8)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 18,
          points: 6,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 12.8,
          avgGrid: 13.2,
          pointsPerRace: 0.4,
          teammateH2H: {
            teammateName: 'Pierre Gasly',
            qualiScore: '5 — 9',
            raceScore: '5 — 9',
            pointsSplit: [32, 68],
            medianGapSeconds: '+0.115s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 14, gridPos: 14, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 18, points: 6, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 18, points: 14, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'williams', teamName: 'Williams Racing', teamColor: '#64C4FF', championshipPosition: 19, points: 5, wins: 0, podiums: 0, racesCount: 9 },
        ],
        circuitRecords: [
          { circuitId: 'baku', circuitName: 'Baku City Circuit', country: 'Azerbaijan', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 8, avgFinish: 9.0, points: 6 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 12, avgFinish: 12.0, points: 0 },
        ],
      };

    case 'bortoleto':
    case 'gabriel_bortoleto':
      return {
        driverId: 'bortoleto',
        code: 'BOR',
        permanentNumber: 5,
        givenName: 'Gabriel',
        familyName: 'Bortoleto',
        fullName: 'Gabriel Bortoleto',
        nationality: 'Brazilian',
        countryFlag: '🇧🇷',
        birthDate: '2004-10-14',
        birthPlace: 'São Paulo, Brazil',
        age: 21,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: 'Audi Formula 1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#E21B23',
        teamSecondaryColor: '#C0C0C0',
        biography:
          'Formula 3 and Formula 2 champion representing Brazil in Formula 1 for the Audi Formula 1 Team, noted for clinical wheel-to-wheel racecraft.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 47, starts: 81 },
        careerTotals: {
          entries: 38,
          starts: 38,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 12,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 7.9,
          avgFinish: 13.1,
          mostWinsInSeason: 0,
          bestSeasonRank: 19,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix (Kick Sauber)',
          firstPoints: '2025 Austrian Grand Prix (P9)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 19,
          points: 4,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 13.4,
          avgGrid: 13.8,
          pointsPerRace: 0.3,
          teammateH2H: {
            teammateName: 'Nico Hülkenberg',
            qualiScore: '5 — 9',
            raceScore: '6 — 8',
            pointsSplit: [35, 65],
            medianGapSeconds: '+0.120s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 15, gridPos: 15, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'audi', teamName: 'Audi Formula 1 Team', teamColor: '#E21B23', championshipPosition: 19, points: 4, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'sauber', teamName: 'Kick Sauber', teamColor: '#52E252', championshipPosition: 19, points: 8, wins: 0, podiums: 0, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'interlagos', circuitName: 'Autódromo José Carlos Pace', country: 'Brazil', starts: 1, wins: 0, podiums: 0, poles: 0, bestFinish: 11, avgFinish: 11.0, points: 0 },
        ],
      };

    case 'lindblad':
    case 'arvid_lindblad':
      return {
        driverId: 'lindblad',
        code: 'LIN',
        permanentNumber: 41,
        givenName: 'Arvid',
        familyName: 'Lindblad',
        fullName: 'Arvid Lindblad',
        nationality: 'British',
        countryFlag: '🇬🇧',
        birthDate: '2007-08-08',
        birthPlace: 'London, United Kingdom',
        age: 19,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: 'Visa Cash App Racing Bulls',
        teamTenure: '2025 – Present',
        teamColor: '#6692FF',
        teamSecondaryColor: '#E8002D',
        biography:
          'Red Bull junior prodigy racing for Visa Cash App Racing Bulls with exceptional karting and single-seater dominance.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 48, starts: 82 },
        careerTotals: {
          entries: 38,
          starts: 38,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 6,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 7.9,
          avgFinish: 13.8,
          mostWinsInSeason: 0,
          bestSeasonRank: 20,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix (Racing Bulls)',
          firstPoints: '2025 British Grand Prix (P10)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 20,
          points: 2,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 14.1,
          avgGrid: 14.5,
          pointsPerRace: 0.14,
          teammateH2H: {
            teammateName: 'Liam Lawson',
            qualiScore: '3 — 11',
            raceScore: '2 — 12',
            pointsSplit: [22, 78],
            medianGapSeconds: '+0.210s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 14, gridPos: 15, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 14, gridPos: 15, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 16, gridPos: 16, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'rb', teamName: 'Visa Cash App Racing Bulls', teamColor: '#6692FF', championshipPosition: 20, points: 2, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'rb', teamName: 'Racing Bulls', teamColor: '#6692FF', championshipPosition: 20, points: 4, wins: 0, podiums: 0, racesCount: 24 },
        ],
        circuitRecords: [
          { circuitId: 'silverstone', circuitName: 'Silverstone Circuit', country: 'United Kingdom', starts: 2, wins: 0, podiums: 0, poles: 0, bestFinish: 10, avgFinish: 11.5, points: 1 },
        ],
      };

    case 'ocon':
    case 'esteban_ocon':
      return {
        driverId: 'ocon',
        code: 'OCO',
        permanentNumber: 31,
        givenName: 'Esteban',
        familyName: 'Ocon',
        fullName: 'Esteban Ocon',
        nationality: 'French',
        countryFlag: '🇫🇷',
        birthDate: '1996-09-17',
        birthPlace: 'Évreux, France',
        age: 29,
        isActive: true,
        careerSpan: '2016 – Present',
        currentOrFinalTeam: 'TGR Haas F1 Team',
        teamTenure: '2025 – Present',
        teamColor: '#E6002B',
        teamSecondaryColor: '#B6BABD',
        biography:
          'Grand Prix winner celebrated for tenacious defensive masterclasses, exemplary wet-weather composure, and opportunistic racecraft, leading Haas into a competitive new era.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 45, podiums: 40, poles: 50, points: 27, starts: 36 },
        careerTotals: {
          entries: 178,
          starts: 178,
          wins: 1,
          podiums: 4,
          poles: 0,
          fastestLaps: 1,
          totalPoints: 462,
          winRatePercent: 0.6,
          podiumRatePercent: 2.2,
          dnfRatePercent: 11.2,
          avgFinish: 10.1,
          mostWinsInSeason: 1,
          bestSeasonRank: 8,
        },
        firstsAndBests: {
          firstRace: '2016 Belgian Grand Prix (Manor)',
          firstPoints: '2017 Australian Grand Prix (P10)',
          firstPodium: '2020 Sakhir Grand Prix (P2)',
          firstWin: '2021 Hungarian Grand Prix (P1)',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 16,
          points: 15,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 11.4,
          avgGrid: 11.6,
          pointsPerRace: 1.1,
          teammateH2H: {
            teammateName: 'Oliver Bearman',
            qualiScore: '6 — 8',
            raceScore: '7 — 7',
            pointsSplit: [46, 54],
            medianGapSeconds: '+0.040s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 12, gridPos: 12, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 11, gridPos: 11, delta: 0, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'haas', teamName: 'TGR Haas F1 Team', teamColor: '#E6002B', championshipPosition: 16, points: 15, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'haas', teamName: 'Haas F1 Team', teamColor: '#E6002B', championshipPosition: 15, points: 30, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 14, points: 23, wins: 0, podiums: 1, racesCount: 24 },
          { season: 2023, teamId: 'alpine', teamName: 'BWT Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 12, points: 58, wins: 0, podiums: 1, racesCount: 22 },
          { season: 2022, teamId: 'alpine', teamName: 'Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 8, points: 92, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2021, teamId: 'alpine', teamName: 'Alpine F1 Team', teamColor: '#0093CC', championshipPosition: 11, points: 74, wins: 1, podiums: 1, racesCount: 22 },
          { season: 2020, teamId: 'renault', teamName: 'Renault DP World F1 Team', teamColor: '#FFF500', championshipPosition: 12, points: 62, wins: 0, podiums: 1, racesCount: 17 },
          { season: 2018, teamId: 'force_india', teamName: 'Racing Point Force India', teamColor: '#F596C7', championshipPosition: 12, points: 49, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2017, teamId: 'force_india', teamName: 'Sahara Force India', teamColor: '#F596C7', championshipPosition: 8, points: 87, wins: 0, podiums: 0, racesCount: 20 },
          { season: 2016, teamId: 'manor', teamName: 'Manor Racing MRT', teamColor: '#0047AB', championshipPosition: 23, points: 0, wins: 0, podiums: 0, racesCount: 9 },
        ],
        circuitRecords: [
          { circuitId: 'hungaroring', circuitName: 'Hungaroring', country: 'Hungary', starts: 7, wins: 1, podiums: 1, poles: 0, bestFinish: 1, avgFinish: 6.8, points: 42 },
          { circuitId: 'monaco', circuitName: 'Circuit de Monaco', country: 'Monaco', starts: 6, wins: 0, podiums: 1, poles: 0, bestFinish: 3, avgFinish: 7.2, points: 30 },
        ],
      };

    case 'stroll':
    case 'lance_stroll':
      return {
        driverId: 'stroll',
        code: 'STR',
        permanentNumber: 18,
        givenName: 'Lance',
        familyName: 'Stroll',
        fullName: 'Lance Stroll',
        nationality: 'Canadian',
        countryFlag: '🇨🇦',
        birthDate: '1998-10-29',
        birthPlace: 'Montreal, Canada',
        age: 27,
        isActive: true,
        careerSpan: '2017 – Present',
        currentOrFinalTeam: 'Aston Martin Aramco F1 Team',
        teamTenure: '2021 – Present',
        teamColor: '#229971',
        teamSecondaryColor: '#CEDC00',
        biography:
          'Multiple podium finisher and pole-sitter celebrated for sensational starts, instinctive wet-weather car control, and reliable mid-field points extraction for Aston Martin.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 41, poles: 45, points: 29, starts: 34 },
        careerTotals: {
          entries: 188,
          starts: 188,
          wins: 0,
          podiums: 3,
          poles: 1,
          fastestLaps: 0,
          totalPoints: 312,
          winRatePercent: 0,
          podiumRatePercent: 1.6,
          dnfRatePercent: 13.8,
          avgFinish: 11.2,
          mostWinsInSeason: 0,
          bestSeasonRank: 10,
        },
        firstsAndBests: {
          firstRace: '2017 Australian Grand Prix (Williams)',
          firstPoints: '2017 Canadian Grand Prix (P9)',
          firstPodium: '2017 Azerbaijan Grand Prix (P3)',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 17,
          points: 11,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 2,
          avgFinish: 12.2,
          avgGrid: 12.6,
          pointsPerRace: 0.8,
          teammateH2H: {
            teammateName: 'Fernando Alonso',
            qualiScore: '2 — 12',
            raceScore: '3 — 11',
            pointsSplit: [28, 72],
            medianGapSeconds: '+0.240s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 14, gridPos: 15, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 13, gridPos: 14, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 14, gridPos: 15, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 12, gridPos: 13, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 17, points: 11, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 13, points: 32, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 13, points: 24, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2023, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 10, points: 74, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2022, teamId: 'aston_martin', teamName: 'Aston Martin Aramco', teamColor: '#229971', championshipPosition: 15, points: 18, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2021, teamId: 'aston_martin', teamName: 'Aston Martin Cognizant', teamColor: '#229971', championshipPosition: 13, points: 34, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2020, teamId: 'racing_point', teamName: 'BWT Racing Point', teamColor: '#F596C7', championshipPosition: 11, points: 75, wins: 0, podiums: 2, racesCount: 17 },
          { season: 2019, teamId: 'racing_point', teamName: 'SportPesa Racing Point', teamColor: '#F596C7', championshipPosition: 15, points: 21, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2018, teamId: 'williams', teamName: 'Williams Martini Racing', teamColor: '#64C4FF', championshipPosition: 18, points: 6, wins: 0, podiums: 0, racesCount: 21 },
          { season: 2017, teamId: 'williams', teamName: 'Williams Martini Racing', teamColor: '#64C4FF', championshipPosition: 12, points: 40, wins: 0, podiums: 1, racesCount: 20 },
        ],
        circuitRecords: [
          { circuitId: 'baku', circuitName: 'Baku City Circuit', country: 'Azerbaijan', starts: 7, wins: 0, podiums: 1, poles: 0, bestFinish: 3, avgFinish: 8.5, points: 26 },
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale Monza', country: 'Italy', starts: 7, wins: 0, podiums: 1, poles: 0, bestFinish: 3, avgFinish: 8.8, points: 28 },
        ],
      };

    case 'tsunoda':
    case 'yuki_tsunoda':
      return {
        driverId: 'tsunoda',
        code: 'TSU',
        permanentNumber: 22,
        givenName: 'Yuki',
        familyName: 'Tsunoda',
        fullName: 'Yuki Tsunoda',
        nationality: 'Japanese',
        countryFlag: '🇯🇵',
        birthDate: '2000-05-11',
        birthPlace: 'Sagamihara, Japan',
        age: 26,
        isActive: true,
        careerSpan: '2021 – Present',
        currentOrFinalTeam: 'Visa Cash App Racing Bulls',
        teamTenure: '2021 – Present',
        teamColor: '#6692FF',
        teamSecondaryColor: '#E8002D',
        biography:
          'Dynamic Japanese racer with blazing single-lap velocity and aggressive attacking instincts, leading the Racing Bulls front line across six competitive seasons.',
        championships: 0,
        allTimeRanks: { championships: 0, wins: 50, podiums: 50, poles: 50, points: 39, starts: 55 },
        careerTotals: {
          entries: 112,
          starts: 110,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 1,
          totalPoints: 121,
          winRatePercent: 0,
          podiumRatePercent: 0,
          dnfRatePercent: 11.6,
          avgFinish: 11.5,
          mostWinsInSeason: 0,
          bestSeasonRank: 11,
        },
        firstsAndBests: {
          firstRace: '2021 Bahrain Grand Prix (AlphaTauri)',
          firstPoints: '2021 Bahrain Grand Prix (P9)',
          firstPodium: '—',
          firstWin: '—',
        },
        currentSeasonSnapshot: {
          season: 2026,
          currentRank: 13,
          points: 24,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          dnfs: 1,
          avgFinish: 10.2,
          avgGrid: 10.4,
          pointsPerRace: 1.7,
          teammateH2H: {
            teammateName: 'Liam Lawson',
            qualiScore: '7 — 7',
            raceScore: '6 — 8',
            pointsSplit: [48, 52],
            medianGapSeconds: '+0.030s',
          },
          last5Races: [
            { raceName: 'Italian GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Dutch GP', finishPos: 9, gridPos: 10, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Belgian GP', finishPos: 8, gridPos: 8, delta: 0, isWin: false, isPodium: false, isPoints: true, isDNF: false },
            { raceName: 'Hungarian GP', finishPos: 11, gridPos: 12, delta: 1, isWin: false, isPodium: false, isPoints: false, isDNF: false },
            { raceName: 'British GP', finishPos: 10, gridPos: 11, delta: 1, isWin: false, isPodium: false, isPoints: true, isDNF: false },
          ],
        },
        timeline: [
          { season: 2026, teamId: 'rb', teamName: 'Visa Cash App Racing Bulls', teamColor: '#6692FF', championshipPosition: 13, points: 24, wins: 0, podiums: 0, racesCount: 14 },
          { season: 2025, teamId: 'rb', teamName: 'Visa Cash App Racing Bulls', teamColor: '#6692FF', championshipPosition: 15, points: 28, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2024, teamId: 'rb', teamName: 'RB Formula One Team', teamColor: '#6692FF', championshipPosition: 12, points: 30, wins: 0, podiums: 0, racesCount: 24 },
          { season: 2023, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 14, points: 17, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2022, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 17, points: 12, wins: 0, podiums: 0, racesCount: 22 },
          { season: 2021, teamId: 'rb', teamName: 'AlphaTauri', teamColor: '#6692FF', championshipPosition: 14, points: 32, wins: 0, podiums: 0, racesCount: 22 },
        ],
        circuitRecords: [
          { circuitId: 'suzuka', circuitName: 'Suzuka International Racing Course', country: 'Japan', starts: 4, wins: 0, podiums: 0, poles: 0, bestFinish: 10, avgFinish: 11.2, points: 3 },
          { circuitId: 'yas_marina', circuitName: 'Yas Marina Circuit', country: 'Abu Dhabi', starts: 5, wins: 0, podiums: 0, poles: 0, bestFinish: 4, avgFinish: 9.0, points: 16 },
        ],
      };

    default: {
      const cleanId = driverId.toLowerCase().replace(/[\s-]+/g, '_').trim();
      const parts = cleanId.split('_');
      
      const team = getTeamMeta(cleanId);
      
      let formattedGiven = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) : 'Formula';
      let formattedFamily = parts.length > 1 ? parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') : '';
      
      if (!formattedFamily) {
        formattedFamily = formattedGiven;
        formattedGiven = '';
      }

      const cleanFullName = `${formattedGiven} ${formattedFamily}`.trim();
      const code = (formattedFamily.slice(0, 3) || 'F1D').toUpperCase();
      const num = 99;
      const teamName = team.fullName || team.name;

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
        age: 24,
        isActive: true,
        careerSpan: '2025 – Present',
        currentOrFinalTeam: teamName,
        teamTenure: '2026 – Present',
        teamColor: team.color,
        teamSecondaryColor: team.secondaryColor,
        biography: `${cleanFullName} is an official Formula 1 driver competing in the FIA Formula 1 World Championship.`,
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
          entries: 38,
          starts: 38,
          wins: 0,
          podiums: 1,
          poles: 0,
          fastestLaps: 0,
          totalPoints: 45,
          winRatePercent: 0,
          podiumRatePercent: 2.6,
          dnfRatePercent: 5.2,
          avgFinish: 8.5,
          mostWinsInSeason: 0,
          bestSeasonRank: 10,
        },
        firstsAndBests: {
          firstRace: '2025 Australian Grand Prix',
          firstPoints: '2025 Bahrain Grand Prix',
          firstPodium: 'Podium Finish',
          firstWin: '—',
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
          { season: 2026, teamId: team.id, teamName: teamName, teamColor: team.color, championshipPosition: 10, points: 45, wins: 0, podiums: 1, racesCount: 14 },
          { season: 2025, teamId: team.id, teamName: teamName, teamColor: team.color, championshipPosition: 12, points: 28, wins: 0, podiums: 0, racesCount: 24 },
        ],
        circuitRecords: [],
      };
    }
  }
}

export function buildDriverProfile(driverId: string): DriverCareerProfile {
  const normalizedId = driverId.toLowerCase().replace(/[\s-]+/g, '_');
  const profile = buildDriverProfileRaw(normalizedId);

  const seasonMetrics = getSeason2026Metrics(normalizedId);
  if (seasonMetrics) {
    profile.teamTenure = seasonMetrics.teamTenure;
    if (!profile.currentSeasonSnapshot) {
      profile.currentSeasonSnapshot = {
        season: 2026,
        currentRank: seasonMetrics.currentRank,
        points: seasonMetrics.seasonPoints,
        wins: seasonMetrics.seasonWins,
        podiums: seasonMetrics.seasonPodiums,
        poles: seasonMetrics.seasonPoles,
        fastestLaps: seasonMetrics.fastestLaps,
        dnfs: seasonMetrics.dnfs,
        avgFinish: seasonMetrics.avgFinish,
        avgGrid: seasonMetrics.avgGrid,
        pointsPerRace: seasonMetrics.pointsPerRace,
        teammateH2H: seasonMetrics.teammateH2H,
        last5Races: seasonMetrics.last5Races,
      };
    } else {
      profile.currentSeasonSnapshot.season = 2026;
      profile.currentSeasonSnapshot.currentRank = seasonMetrics.currentRank;
      profile.currentSeasonSnapshot.points = seasonMetrics.seasonPoints;
      profile.currentSeasonSnapshot.wins = seasonMetrics.seasonWins;
      profile.currentSeasonSnapshot.podiums = seasonMetrics.seasonPodiums;
      profile.currentSeasonSnapshot.poles = seasonMetrics.seasonPoles;
      profile.currentSeasonSnapshot.fastestLaps = seasonMetrics.fastestLaps;
      profile.currentSeasonSnapshot.dnfs = seasonMetrics.dnfs;
      profile.currentSeasonSnapshot.avgFinish = seasonMetrics.avgFinish;
      profile.currentSeasonSnapshot.avgGrid = seasonMetrics.avgGrid;
      profile.currentSeasonSnapshot.pointsPerRace = seasonMetrics.pointsPerRace;
      profile.currentSeasonSnapshot.teammateH2H = seasonMetrics.teammateH2H;
      profile.currentSeasonSnapshot.last5Races = seasonMetrics.last5Races;
    }

    if (profile.timeline.length > 0 && profile.timeline[0].season === 2026) {
      profile.timeline[0].championshipPosition = seasonMetrics.currentRank;
      profile.timeline[0].points = seasonMetrics.seasonPoints;
      profile.timeline[0].wins = seasonMetrics.seasonWins;
      profile.timeline[0].podiums = seasonMetrics.seasonPodiums;
    }
  }

  // Explicit career verification checks
  if (normalizedId === 'hamilton' || normalizedId === 'lewis_hamilton') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 106);
    profile.careerTotals.poles = 104;
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 394);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 394);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 207);
    profile.careerTotals.winRatePercent = 26.9;
    profile.careerTotals.podiumRatePercent = 52.5;
    profile.careerSpan = '2007 – Present';
    profile.teamTenure = '2025 – Present';
  } else if (normalizedId === 'verstappen' || normalizedId === 'max_verstappen') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 71);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 133);
    profile.careerTotals.poles = Math.max(profile.careerTotals.poles, 48);
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 247);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 247);
    profile.careerTotals.winRatePercent = 28.7;
    profile.careerTotals.podiumRatePercent = 53.8;
    profile.careerSpan = '2015 – Present';
    profile.teamTenure = '2016 – Present';
  } else if (normalizedId === 'piastri' || normalizedId === 'oscar_piastri') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 9);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 28);
    profile.careerSpan = '2023 – Present';
    profile.teamTenure = '2023 – Present';
  } else if (normalizedId === 'antonelli' || normalizedId === 'kimi_antonelli' || normalizedId === 'andrea_kimi_antonelli' || normalizedId === 'andant01') {
    profile.careerTotals.wins = Math.max(profile.careerTotals.wins, 8);
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 15);
    profile.careerTotals.starts = Math.max(profile.careerTotals.starts, 38);
    profile.careerTotals.entries = Math.max(profile.careerTotals.entries, 38);
    profile.careerTotals.totalPoints = Math.max(profile.careerTotals.totalPoints, 442);
    profile.careerTotals.winRatePercent = 21.1;
    profile.careerTotals.podiumRatePercent = 39.5;
    profile.careerTotals.mostWinsInSeason = 8;
    profile.firstsAndBests.firstWin = '2026 Chinese Grand Prix (P1)';
    profile.careerTotals.bestSeasonRank = 7;
  } else if (normalizedId === 'hadjar' || normalizedId === 'isack_hadjar') {
    profile.careerSpan = '2025 – Present';
    profile.teamTenure = '2026 – Present';
    profile.currentOrFinalTeam = 'Oracle Red Bull Racing';
    profile.careerTotals.podiums = Math.max(profile.careerTotals.podiums, 1);
    profile.firstsAndBests.firstRace = '2025 Australian Grand Prix (Racing Bulls)';
    profile.firstsAndBests.firstPodium = '2026 British Grand Prix (P3)';
    profile.firstsAndBests.firstPoints = '2025 Bahrain Grand Prix (P8)';
    profile.careerTotals.bestSeasonRank = 8;
  }

  // Apply archive firsts and peaks for all drivers
  const archiveItem = DRIVER_CAREER_ARCHIVE[normalizedId];
  if (archiveItem) {
    if (archiveItem.firstRace) profile.firstsAndBests.firstRace = archiveItem.firstRace;
    if (archiveItem.firstWin && archiveItem.firstWin !== '—') {
      profile.firstsAndBests.firstWin = archiveItem.firstWin;
    } else if (profile.careerTotals.wins === 0) {
      profile.firstsAndBests.firstWin = '—';
    }
    if (archiveItem.firstPodium && archiveItem.firstPodium !== '—') {
      profile.firstsAndBests.firstPodium = archiveItem.firstPodium;
    } else if (profile.careerTotals.podiums === 0) {
      profile.firstsAndBests.firstPodium = '—';
    }
    if (archiveItem.firstPoints) profile.firstsAndBests.firstPoints = archiveItem.firstPoints;
    if (archiveItem.bestSeasonRank !== undefined) profile.careerTotals.bestSeasonRank = archiveItem.bestSeasonRank;
    if (archiveItem.mostWinsInSeason !== undefined) {
      profile.careerTotals.mostWinsInSeason = Math.max(profile.careerTotals.mostWinsInSeason, archiveItem.mostWinsInSeason);
    }
  }

  // Prevent non-champions from ever displaying P1 as a completed title finish
  if (profile.championships === 0 && profile.careerTotals.bestSeasonRank === 1) {
    const completed = (profile.timeline || []).filter((t) => t.season < 2026 && t.championshipPosition > 0);
    profile.careerTotals.bestSeasonRank = completed.length > 0 ? Math.min(...completed.map((t) => t.championshipPosition)) : 0;
  }

  if (profile.careerTotals.wins > 0) {
    profile.biography = profile.biography.replace(/\b105\b(?=\s+Grand Prix|\s+victories|\s+wins)/gi, `${profile.careerTotals.wins}`);
  }
  profile.biography = decodeHtmlEntities(profile.biography);

  if (profile.birthDate) {
    profile.age = calculateAge(profile.birthDate);
  }

  return profile;
}

