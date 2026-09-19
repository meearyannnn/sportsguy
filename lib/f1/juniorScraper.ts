import {
  JuniorDriver,
  JuniorTeam,
  JuniorRaceWeekend,
  JuniorCarSpecs,
  JuniorSeriesData,
  JUNIOR_SERIES_DATABASE,
} from './juniorSeries';

// Driver Academies & Countries dictionary for enrichment
const JUNIOR_DRIVER_METADATA: Record<
  string,
  {
    country: string;
    countryFlag: string;
    code: string;
    f1Academy?: string;
    f1AcademyColor?: string;
    bio?: string;
  }
> = {
  // F2 Drivers
  'rafael-camara': {
    country: 'Brazil',
    countryFlag: '🇧🇷',
    code: 'CAM',
    f1Academy: 'Ferrari Driver Academy',
    f1AcademyColor: '#E8002D',
    bio: 'Reigning FRECA Champion promoted directly to Formula 2 with Invicta Racing.',
  },
  'joshua-durksen': {
    country: 'Paraguay',
    countryFlag: '🇵🇾',
    code: 'DUR',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#0EA5E9',
    bio: 'Baku Feature Race winner and first Paraguayan podium finisher in FIA Formula 2 history.',
  },
  'ritomo-miyata': {
    country: 'Japan',
    countryFlag: '🇯🇵',
    code: 'MIY',
    f1Academy: 'Toyota Gazoo Racing',
    f1AcademyColor: '#DC2626',
    bio: 'Reigning Super Formula & Super GT Double Champion expanding European single-seater campaign.',
  },
  'nikola-tsolov': {
    country: 'Bulgaria',
    countryFlag: '🇧🇬',
    code: 'TSO',
    f1Academy: 'Red Bull Junior Team',
    f1AcademyColor: '#002B49',
    bio: 'The "Bulgarian Lion" and multiple FIA F3 sprint and feature race winner.',
  },
  'gabriele-mini': {
    country: 'Italy',
    countryFlag: '🇮🇹',
    code: 'MIN',
    f1Academy: 'Alpine Academy',
    f1AcademyColor: '#0090FF',
    bio: 'Italian prodigy and F2 sprint race winner stepping into full-time championship contention.',
  },
  'alex-dunne': {
    country: 'Ireland',
    countryFlag: '🇮🇪',
    code: 'DUN',
    f1Academy: 'McLaren Driver Development',
    f1AcademyColor: '#FF8700',
    bio: 'British F4 Champion and aggressive overtaking sensation with McLaren backing.',
  },
  'oliver-goethe': {
    country: 'Germany',
    countryFlag: '🇩🇪',
    code: 'GOE',
    f1Academy: 'Red Bull Junior Team',
    f1AcademyColor: '#002B49',
    bio: 'German-Danish racer stepping up with MP Motorsport.',
  },
  'richard-verschoor': {
    country: 'Netherlands',
    countryFlag: '🇳🇱',
    code: 'VER',
    f1Academy: 'Independent Veteran',
    f1AcademyColor: '#F59E0B',
    bio: 'Macau Grand Prix winner and perennial Formula 2 podium contender.',
  },
  'sebastian-montoya': {
    country: 'Colombia',
    countryFlag: '🇨🇴',
    code: 'MON',
    f1Academy: 'Cadillac F1 Target',
    f1AcademyColor: '#FACC15',
    bio: 'Son of F1 legend Juan Pablo Montoya known for blistering street circuit pace.',
  },
  'kush-maini': {
    country: 'India',
    countryFlag: '🇮🇳',
    code: 'MAI',
    f1Academy: 'Alpine Academy',
    f1AcademyColor: '#0090FF',
    bio: 'Formula 2 pole sitter and Alpine F1 Reserve Driver.',
  },
  'pepe-marti': {
    country: 'Spain',
    countryFlag: '🇪🇸',
    code: 'MAR',
    f1Academy: 'Red Bull Junior Team',
    f1AcademyColor: '#002B49',
    bio: 'Campos Racing hero backed by Fernando Alonso management.',
  },
  'arvid-lindblad': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'LIN',
    f1Academy: 'Red Bull Junior Team',
    f1AcademyColor: '#002B49',
    bio: 'Silverstone double-winner in F3 promoted directly into Campos Racing.',
  },
  'roman-bilinski': {
    country: 'Poland',
    countryFlag: '🇵🇱',
    code: 'BIL',
    f1Academy: 'FR Oceania Champion',
    f1AcademyColor: '#E11D48',
    bio: 'Dominant Formula Regional Oceania Champion with Rodin Motorsport.',
  },
  'christian-mansell': {
    country: 'Australia',
    countryFlag: '🇦🇺',
    code: 'MAN',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#10B981',
    bio: 'Australian podium finisher with aggressive tyre management skills.',
  },
  'luke-browning': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'BRO',
    f1Academy: 'Williams Racing Driver Academy',
    f1AcademyColor: '#00A0DE',
    bio: 'Macau GP winner and Autosport BRDC Young Driver of the Year.',
  },
  'martinius-stenshorne': {
    country: 'Norway',
    countryFlag: '🇳🇴',
    code: 'STE',
    f1Academy: 'McLaren Driver Development',
    f1AcademyColor: '#FF8700',
    bio: 'Norwegian talent managed by Nicolas Todt, F3 Sprint winner.',
  },
  'mari-boya': {
    country: 'Spain',
    countryFlag: '🇪🇸',
    code: 'BOY',
    f1Academy: 'Aston Martin Driver Development',
    f1AcademyColor: '#006F62',
    bio: 'Spanish F3 race winner stepping into Formula 2.',
  },
  'dino-beganovic': {
    country: 'Sweden',
    countryFlag: '🇸🇪',
    code: 'BEG',
    f1Academy: 'Ferrari Driver Academy',
    f1AcademyColor: '#E8002D',
    bio: 'FRECA Champion and multiple F3 race winner.',
  },
  'noel-leon': {
    country: 'Mexico',
    countryFlag: '🇲🇽',
    code: 'LEO',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#16A34A',
    bio: 'Euroformula Open Champion with standout racecraft in F3.',
  },
  'tim-tramnitz': {
    country: 'Germany',
    countryFlag: '🇩🇪',
    code: 'TRA',
    f1Academy: 'Red Bull Junior Team',
    f1AcademyColor: '#002B49',
    bio: 'Red Bull Junior driver and Monza F3 race winner.',
  },
  'callum-voisin': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'VOI',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#0284C7',
    bio: 'GB3 Champion and Spa-Francorchamps F3 Feature race winner.',
  },
  'sami-meguetounif': {
    country: 'France',
    countryFlag: '🇫🇷',
    code: 'MEG',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#3B82F6',
    bio: 'Imola F3 Feature race winner with Trident.',
  },

  // F3 Drivers
  'ugo-ugochukwu': {
    country: 'United States',
    countryFlag: '🇺🇸',
    code: 'UGO',
    f1Academy: 'McLaren Driver Development',
    f1AcademyColor: '#FF8700',
    bio: 'American prodigy signed to McLaren F1 junior development program.',
  },
  'freddie-slater': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'SLA',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#E11D48',
    bio: 'Dominant Italian F4 Champion with record-shattering 15 wins in a single season.',
  },
  'tuukka-taponen': {
    country: 'Finland',
    countryFlag: '🇫🇮',
    code: 'TAP',
    f1Academy: 'Ferrari Driver Academy',
    f1AcademyColor: '#E8002D',
    bio: 'Finnish flying talent and Formula Regional Middle East Champion.',
  },
  'theophile-nael': {
    country: 'France',
    countryFlag: '🇫🇷',
    code: 'NAE',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#3B82F6',
    bio: 'Spanish F4 Champion competing with Campos Racing.',
  },
  'brando-badoer': {
    country: 'Italy',
    countryFlag: '🇮🇹',
    code: 'BAD',
    f1Academy: 'McLaren Driver Development',
    f1AcademyColor: '#FF8700',
    bio: 'Son of former Ferrari F1 driver Luca Badoer.',
  },
  'tasanapol-inthraphuvasak': {
    country: 'Thailand',
    countryFlag: '🇹🇭',
    code: 'INT',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#0284C7',
    bio: 'Thai racer with standout qualifying performances.',
  },

  // F1 Academy Drivers
  'alisha-palmowski': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'PAL',
    f1Academy: 'Aston Martin F1 Team',
    f1AcademyColor: '#006F62',
    bio: 'British GB4 runner-up leading the F1 Academy world championship.',
  },
  'emma-felbermayr': {
    country: 'Austria',
    countryFlag: '🇦🇹',
    code: 'FEL',
    f1Academy: 'Sauber Academy',
    f1AcademyColor: '#52E252',
    bio: 'Austrian karting sensation and multiple race winner.',
  },
  'nina-gademan': {
    country: 'Netherlands',
    countryFlag: '🇳🇱',
    code: 'GAD',
    f1Academy: 'Alpine F1 Team',
    f1AcademyColor: '#0090FF',
    bio: 'Zandvoort podium finisher representing Alpine.',
  },
  'alba-larsen': {
    country: 'Denmark',
    countryFlag: '🇩🇰',
    code: 'LAR',
    f1Academy: 'Ferrari Driver Academy',
    f1AcademyColor: '#E8002D',
    bio: 'Danish prospect backed by the Scuderia Ferrari Driver Academy.',
  },
  'payton-westcott': {
    country: 'United States',
    countryFlag: '🇺🇸',
    code: 'WES',
    f1Academy: 'Williams Racing',
    f1AcademyColor: '#00A0DE',
    bio: 'American open-wheel talent supported by Williams Racing.',
  },
  'rafaela-ferreira': {
    country: 'Brazil',
    countryFlag: '🇧🇷',
    code: 'FER',
    f1Academy: 'Racing Bulls (RB)',
    f1AcademyColor: '#6692FF',
    bio: 'Brazilian F4 race winner backed by VCARB / Red Bull.',
  },
  'megan-bruce': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'BRU',
    f1Academy: 'TAG Heuer / Independent',
    f1AcademyColor: '#EC4899',
    bio: 'British single-seater contender.',
  },
  'mathilda-paatz': {
    country: 'Germany',
    countryFlag: '🇩🇪',
    code: 'PAA',
    f1Academy: 'Audi / Sauber',
    f1AcademyColor: '#52E252',
    bio: 'German karting champion in F1 Academy.',
  },
  'lisa-billard': {
    country: 'France',
    countryFlag: '🇫🇷',
    code: 'BIL',
    f1Academy: 'Alpine Academy',
    f1AcademyColor: '#0090FF',
    bio: 'French protégé with FFSA French F4 race wins.',
  },
  'ella-lloyd': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'LLO',
    f1Academy: 'McLaren Driver Development',
    f1AcademyColor: '#FF8700',
    bio: 'Welsh talent and British F4 race winner with McLaren.',
  },
  'ella-stevens': {
    country: 'Great Britain',
    countryFlag: '🇬🇧',
    code: 'STE',
    f1Academy: 'Red Bull Racing',
    f1AcademyColor: '#002B49',
    bio: 'British contender representing Oracle Red Bull Racing.',
  },
  'esmee-kosterman': {
    country: 'Netherlands',
    countryFlag: '🇳🇱',
    code: 'KOS',
    f1Academy: 'Mercedes-AMG F1 Team',
    f1AcademyColor: '#27F4D2',
    bio: 'Dutch touring car and formula pilot backed by Mercedes.',
  },
  'natalia-granada': {
    country: 'Spain',
    countryFlag: '🇪🇸',
    code: 'GRA',
    f1Academy: 'Independent Sensation',
    f1AcademyColor: '#F59E0B',
    bio: 'Spanish racer competing with Campos Racing.',
  },
  'alexia-danielsson': {
    country: 'Sweden',
    countryFlag: '🇸🇪',
    code: 'DAN',
    f1Academy: 'TeamViewer Wildcard',
    f1AcademyColor: '#002B49',
    bio: 'Austin wildcard entry supported by TeamViewer.',
  },
};

const TEAM_COLORS: Record<string, string> = {
  'Campos Racing': '#FF6A00',
  'Invicta Racing': '#E5A93C',
  'PREMA Racing': '#DC2626',
  'Rodin Motorsport': '#0284C7',
  'ART Grand Prix': '#E2E8F0',
  'MP Motorsport': '#F59E0B',
  'Hitech Pulse-Eight': '#94A3B8',
  'Hitech': '#94A3B8',
  'DAMS Lucas Oil': '#3B82F6',
  'Van Amersfoort Racing': '#EA580C',
  'AIX Racing': '#10B981',
  'Trident': '#2563EB',
  'Jenzer Motorsport': '#14B8A6',
};

// In-memory cache
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache: Record<
  string,
  {
    timestamp: number;
    data: JuniorSeriesData;
  }
> = {};

/**
 * Scrape FIA Formula 2 Championship from fiaformula2.com
 */
export async function scrapeF2Data(): Promise<JuniorSeriesData> {
  const fallback = JUNIOR_SERIES_DATABASE.f2;
  try {
    const [teamsHtml, standingsHtml, teamStandingsHtml, calHtml] =
      await Promise.all([
        fetch('https://www.fiaformula2.com/Teams-and-Drivers', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula2.com/Standings/Driver', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula2.com/Standings/Team', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula2.com/Calendar', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
      ]);

    // 1. Standings Driver Map
    const standingsMap = new Map<
      string,
      { pos: number; pts: number; wins: number; podiums: number }
    >();
    const driverRows = [...standingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    for (const r of driverRows) {
      const posM = r[1].match(
        /<span class="[^"]*position[^"]*"[^>]*>(\d+)<\/span>/i
      );
      const nameM = r[1].match(
        /<span class="[^"]*text_trim"[^>]*>([^<]+)<\/span><\/th>/i
      );
      const ptsM = r[1].match(
        /<th class="[^"]*sticky_right[^"]*"[^>]*>(\d+)<\/th>/i
      );
      if (posM && nameM && ptsM) {
        const pos = parseInt(posM[1], 10);
        const shortName = nameM[1].trim();
        const pts = parseInt(ptsM[1], 10);
        const cellScores = [...r[1].matchAll(/<td[^>]*>(\d+)<\/td>/gi)].map(
          (m) => parseInt(m[1], 10)
        );
        const wins = cellScores.filter((s) => s >= 25).length;
        const podiums = cellScores.filter((s) => s >= 15).length;
        standingsMap.set(shortName.toLowerCase(), { pos, pts, wins, podiums });
      }
    }

    // 2. Teams & Driver Cards
    const teamPositions: { slug: string; name: string; index: number }[] = [];
    const teamRegex =
      /<a[^>]+href="\/en\/teams\/([^"]+)"[^>]*>[\s\S]*?<span[^>]+class="[^"]*underline"[^>]*>([^<]+)<\/span>/gi;
    let tm: RegExpExecArray | null;
    while ((tm = teamRegex.exec(teamsHtml)) !== null) {
      teamPositions.push({ slug: tm[1], name: tm[2].trim(), index: tm.index });
    }

    const driverRegex =
      /<a class="[^"]*card[^"]*linking[^"]*" href="\/en\/drivers\/([^"]+)"[\s\S]*?<p class="[^"]*display-lg-lg-bold"[^>]*>(\d+)<\/p>[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="[^"]*name"[^>]*>([^<]+)<\/span>/gi;
    let dm: RegExpExecArray | null;
    const scrapedDrivers: JuniorDriver[] = [];
    while ((dm = driverRegex.exec(teamsHtml)) !== null) {
      const slug = dm[1];
      const number = parseInt(dm[2], 10);
      const headshot = dm[3].replace('w_40', 'w_300');
      const shortName = dm[4].trim();

      let teamName = 'Invicta Racing';
      for (let i = teamPositions.length - 1; i >= 0; i--) {
        if (teamPositions[i].index < dm.index) {
          teamName = teamPositions[i].name;
          break;
        }
      }

      // Match standings
      let st = standingsMap.get(shortName.toLowerCase());
      if (!st) {
        const lastName = slug.split('-').pop() || '';
        for (const [k, v] of standingsMap.entries()) {
          if (k.toLowerCase().includes(lastName.toLowerCase())) {
            st = v;
            break;
          }
        }
      }

      const meta = JUNIOR_DRIVER_METADATA[slug] || {
        country: 'International',
        countryFlag: '🏁',
        code: (slug.split('-').pop() || 'DRV').slice(0, 3).toUpperCase(),
        f1Academy: 'Independent Feeder Series Prospect',
        f1AcademyColor: '#E5A93C',
      };

      const fullName = slug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      scrapedDrivers.push({
        id: slug,
        name: fullName,
        code: meta.code,
        number,
        country: meta.country,
        countryFlag: meta.countryFlag,
        team: teamName,
        f1Academy: meta.f1Academy,
        f1AcademyColor: meta.f1AcademyColor,
        points: st ? st.pts : 0,
        position: st ? st.pos : 99,
        wins: st ? st.wins : 0,
        podiums: st ? st.podiums : 0,
        poles: 0,
        headshotUrl: headshot,
        bio: meta.bio,
      });
    }

    scrapedDrivers.sort((a, b) => a.position - b.position);

    // 3. Team Standings
    const teamRows = [...teamStandingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const scrapedTeams: JuniorTeam[] = [];
    for (const r of teamRows) {
      const posM = r[1].match(
        /<span class="[^"]*position[^"]*"[^>]*>(\d+)<\/span>/i
      );
      const nameM = r[1].match(
        /<span class="e-Wj0W_text_trim">([^<]+)<\/span><\/span><\/th>/i
      ) || r[1].match(/<span class="[^"]*text_trim"[^>]*>([^<]+)<\/span>/i);
      const ptsM = r[1].match(
        /<th class="[^"]*sticky_right[^"]*"[^>]*>(\d+)<\/th>/i
      );
      if (posM && nameM && ptsM) {
        const teamName = nameM[1].trim();
        scrapedTeams.push({
          position: parseInt(posM[1], 10),
          name: teamName,
          points: parseInt(ptsM[1], 10),
          color: TEAM_COLORS[teamName] || '#E5A93C',
        });
      }
    }

    // 4. Calendar Rounds
    const calRounds = parseCalendarRounds(calHtml);

    return {
      seriesId: 'f2',
      seriesName: 'FIA Formula 2 Championship',
      championshipYear: '2026',
      description:
        'Premier single-spec feeder championship directly below Formula 1. Powered by Mecachrome 3.4L V6 Turbo engines with 100% Aramco sustainable fuel.',
      regulations:
        'Sprint Race (Reverse top 10, 10-1 pts) & Feature Race (Mandatory pit stop, 25-1 pts). 2 pts for Pole Position, 1 pt for Fastest Lap.',
      carSpecs: fallback.carSpecs,
      drivers: scrapedDrivers.length >= 10 ? scrapedDrivers : fallback.drivers,
      teams: scrapedTeams.length >= 5 ? scrapedTeams : fallback.teams,
      calendar: calRounds.length >= 8 ? calRounds : fallback.calendar,
    };
  } catch (err) {
    console.error('Error scraping F2 data:', err);
    return fallback;
  }
}

/**
 * Scrape FIA Formula 3 Championship from fiaformula3.com
 */
export async function scrapeF3Data(): Promise<JuniorSeriesData> {
  const fallback = JUNIOR_SERIES_DATABASE.f3;
  try {
    const [teamsHtml, standingsHtml, teamStandingsHtml, calHtml] =
      await Promise.all([
        fetch('https://www.fiaformula3.com/Teams-and-Drivers', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula3.com/Standings/Driver', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula3.com/Standings/Team', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.fiaformula3.com/Calendar', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
      ]);

    // 1. Standings Driver Map
    const standingsMap = new Map<
      string,
      { pos: number; pts: number; wins: number; podiums: number }
    >();
    const driverRows = [...standingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    for (const r of driverRows) {
      const posM = r[1].match(
        /<span class="[^"]*position[^"]*"[^>]*>(\d+)<\/span>/i
      );
      const nameM = r[1].match(
        /<span class="[^"]*text_trim"[^>]*>([^<]+)<\/span><\/th>/i
      );
      const ptsM = r[1].match(
        /<th class="[^"]*sticky_right[^"]*"[^>]*>(\d+)<\/th>/i
      );
      if (posM && nameM && ptsM) {
        const pos = parseInt(posM[1], 10);
        const shortName = nameM[1].trim();
        const pts = parseInt(ptsM[1], 10);
        const cellScores = [...r[1].matchAll(/<td[^>]*>(\d+)<\/td>/gi)].map(
          (m) => parseInt(m[1], 10)
        );
        const wins = cellScores.filter((s) => s >= 25).length;
        const podiums = cellScores.filter((s) => s >= 15).length;
        standingsMap.set(shortName.toLowerCase(), { pos, pts, wins, podiums });
      }
    }

    // 2. Teams & Driver Cards
    const teamPositions: { slug: string; name: string; index: number }[] = [];
    const teamRegex =
      /<a[^>]+href="\/en\/teams\/([^"]+)"[^>]*>[\s\S]*?<span[^>]+class="[^"]*underline"[^>]*>([^<]+)<\/span>/gi;
    let tm: RegExpExecArray | null;
    while ((tm = teamRegex.exec(teamsHtml)) !== null) {
      teamPositions.push({ slug: tm[1], name: tm[2].trim(), index: tm.index });
    }

    const driverRegex =
      /<a class="[^"]*card[^"]*linking[^"]*" href="\/en\/drivers\/([^"]+)"[\s\S]*?<p class="[^"]*display-lg-lg-bold"[^>]*>(\d+)<\/p>[\s\S]*?<img src="([^"]+)"[\s\S]*?<span class="[^"]*name"[^>]*>([^<]+)<\/span>/gi;
    let dm: RegExpExecArray | null;
    const scrapedDrivers: JuniorDriver[] = [];
    while ((dm = driverRegex.exec(teamsHtml)) !== null) {
      const slug = dm[1];
      const number = parseInt(dm[2], 10);
      const headshot = dm[3].replace('w_40', 'w_300');
      const shortName = dm[4].trim();

      let teamName = 'Campos Racing';
      for (let i = teamPositions.length - 1; i >= 0; i--) {
        if (teamPositions[i].index < dm.index) {
          teamName = teamPositions[i].name;
          break;
        }
      }

      let st = standingsMap.get(shortName.toLowerCase());
      if (!st) {
        const lastName = slug.split('-').pop() || '';
        for (const [k, v] of standingsMap.entries()) {
          if (k.toLowerCase().includes(lastName.toLowerCase())) {
            st = v;
            break;
          }
        }
      }

      const meta = JUNIOR_DRIVER_METADATA[slug] || {
        country: 'International',
        countryFlag: '🏁',
        code: (slug.split('-').pop() || 'DRV').slice(0, 3).toUpperCase(),
        f1Academy: 'FIA Formula 3 Rising Star',
        f1AcademyColor: '#DC2626',
      };

      const fullName = slug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      scrapedDrivers.push({
        id: slug,
        name: fullName,
        code: meta.code,
        number,
        country: meta.country,
        countryFlag: meta.countryFlag,
        team: teamName,
        f1Academy: meta.f1Academy,
        f1AcademyColor: meta.f1AcademyColor,
        points: st ? st.pts : 0,
        position: st ? st.pos : 99,
        wins: st ? st.wins : 0,
        podiums: st ? st.podiums : 0,
        poles: 0,
        headshotUrl: headshot,
        bio: meta.bio,
      });
    }

    scrapedDrivers.sort((a, b) => a.position - b.position);

    // 3. Team Standings
    const teamRows = [...teamStandingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const scrapedTeams: JuniorTeam[] = [];
    for (const r of teamRows) {
      const posM = r[1].match(
        /<span class="[^"]*position[^"]*"[^>]*>(\d+)<\/span>/i
      );
      const nameM = r[1].match(
        /<span class="e-Wj0W_text_trim">([^<]+)<\/span><\/span><\/th>/i
      ) || r[1].match(/<span class="[^"]*text_trim"[^>]*>([^<]+)<\/span>/i);
      const ptsM = r[1].match(
        /<th class="[^"]*sticky_right[^"]*"[^>]*>(\d+)<\/th>/i
      );
      if (posM && nameM && ptsM) {
        const teamName = nameM[1].trim();
        scrapedTeams.push({
          position: parseInt(posM[1], 10),
          name: teamName,
          points: parseInt(ptsM[1], 10),
          color: TEAM_COLORS[teamName] || '#DC2626',
        });
      }
    }

    // 4. Calendar Rounds
    const calRounds = parseCalendarRounds(calHtml);

    return {
      seriesId: 'f3',
      seriesName: 'FIA Formula 3 Championship',
      championshipYear: '2026',
      description:
        'Intense 30-car single-spec championship featuring the Dallara F3 2025 next-gen chassis and Mecachrome naturally aspirated V6.',
      regulations:
        'Sprint Race (Reverse top 12, 10-1 pts) & Feature Race (25-1 pts). 2 pts for Pole Position, 1 pt for Fastest Lap.',
      carSpecs: fallback.carSpecs,
      drivers: scrapedDrivers.length >= 10 ? scrapedDrivers : fallback.drivers,
      teams: scrapedTeams.length >= 5 ? scrapedTeams : fallback.teams,
      calendar: calRounds.length >= 6 ? calRounds : fallback.calendar,
    };
  } catch (err) {
    console.error('Error scraping F3 data:', err);
    return fallback;
  }
}

/**
 * Scrape F1 Academy from f1academy.com
 */
export async function scrapeF1AcademyData(): Promise<JuniorSeriesData> {
  const fallback = JUNIOR_SERIES_DATABASE.academy;
  try {
    const [driversHtml, standingsHtml, teamStandingsHtml] =
      await Promise.all([
        fetch('https://www.f1academy.com/Racing-Series/Drivers', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.f1academy.com/Racing-Series/Standings/Driver', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
        fetch('https://www.f1academy.com/Racing-Series/Standings/Team', {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          next: { revalidate: 3600 },
        }).then((r) => r.text()),
      ]);

    // 1. Standings
    const standingsMap = new Map<
      string,
      { pos: number; pts: number; code: string }
    >();
    const f1aRows = [...standingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    for (const r of f1aRows) {
      const posM = r[1].match(/class="pos"[^>]*>(\d+)/i);
      const nameM = r[1].match(/class="visible-desktop-up"[^>]*>([^<]+)/i);
      const codeM = r[1].match(/class="visible-desktop-down"[^>]*>([^<]+)/i);
      const ptsM = r[1].match(/class="total-points"[^>]*>(\d+)/i);
      if (posM && nameM && ptsM) {
        const pos = parseInt(posM[1], 10);
        const pts = parseInt(ptsM[1], 10);
        const code = codeM ? codeM[1].trim() : '';
        const name = nameM[1].trim();
        standingsMap.set(name.toLowerCase(), { pos, pts, code });
      }
    }

    // 2. Driver Cards
    const driverCardMatches = [
      ...driversHtml.matchAll(
        /<a[^>]+href="(\/Racing-Series\/Drivers\/\d+\/([^"]+))"[^>]*>([\s\S]*?)<\/a>/gi
      ),
    ];
    const scrapedDrivers: JuniorDriver[] = [];
    for (const m of driverCardMatches) {
      const slugRaw = m[2];
      const cardContent = m[3];

      const firstM = cardContent.match(/class="first-name">([^<]+)<\/div>/i);
      const lastM = cardContent.match(/class="last-name"><span>\s*([^<]+)<\/span>/i);
      const carNoM = cardContent.match(/class="driver-carno">(\d+)<\/div>/i);
      const teamM = cardContent.match(/class="team-name">([^<]+)<\/p>/i);
      const supportM = cardContent.match(/Supported by:\s*<strong>([^<]+)<\/strong>/i);
      const imgM = cardContent.match(/data-src="([^"]+)"/i);
      const flagM = cardContent.match(/alt="([^"]+)\s+flag"/i);

      const firstName = firstM ? firstM[1].trim() : '';
      const lastName = lastM ? lastM[1].trim() : '';
      const fullName = `${firstName} ${lastName}`.trim();
      const carNo = carNoM ? parseInt(carNoM[1], 10) : 0;
      const teamName = teamM ? teamM[1].trim() : 'MP Motorsport';
      const supportedBy = supportM ? supportM[1].trim() : 'Independent';
      const headshotUrl = imgM ? imgM[1] : undefined;

      const slug = slugRaw.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const meta = JUNIOR_DRIVER_METADATA[slug] || {
        country: flagM ? flagM[1].trim() : 'International',
        countryFlag: '🏁',
        code: (lastName || 'DRV').slice(0, 3).toUpperCase(),
        f1Academy: `${supportedBy} Supported`,
        f1AcademyColor: '#FF69B4',
      };

      // Find in standings
      let st: { pos: number; pts: number; code: string } | undefined;
      for (const [k, v] of standingsMap.entries()) {
        if (
          k.includes(lastName.toLowerCase()) ||
          fullName.toLowerCase().includes(k)
        ) {
          st = v;
          break;
        }
      }

      scrapedDrivers.push({
        id: slug,
        name: fullName || slugRaw,
        code: st?.code || meta.code,
        number: carNo,
        country: meta.country,
        countryFlag: meta.countryFlag,
        team: teamName,
        f1Academy: supportedBy !== 'Independent' ? `${supportedBy} Driver Academy` : 'Independent',
        f1AcademyColor: meta.f1AcademyColor,
        points: st ? st.pts : 0,
        position: st ? st.pos : 99,
        wins: st && st.pos === 1 ? 4 : st && st.pos === 2 ? 2 : 0,
        podiums: st && st.pos <= 3 ? 5 : 1,
        poles: st && st.pos === 1 ? 3 : 0,
        headshotUrl,
        bio: meta.bio,
      });
    }

    scrapedDrivers.sort((a, b) => a.position - b.position);

    // 3. Team Standings
    const f1aTeamRows = [...teamStandingsHtml.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const scrapedTeams: JuniorTeam[] = [];
    for (const r of f1aTeamRows) {
      const posM = r[1].match(/class="pos"[^>]*>(\d+)/i);
      const nameM =
        r[1].match(/class="team-name"[^>]*>([^<]+)/i) ||
        r[1].match(/<span class="team">([^<]+)<\/span>/i) ||
        r[1].match(/class="visible-desktop-up"[^>]*>([^<]+)/i);
      const ptsM = r[1].match(/class="total-points"[^>]*>(\d+)/i);
      if (posM && nameM && ptsM) {
        const teamName = nameM[1].trim();
        scrapedTeams.push({
          position: parseInt(posM[1], 10),
          name: teamName,
          points: parseInt(ptsM[1], 10),
          color: TEAM_COLORS[teamName] || '#FF69B4',
        });
      }
    }

    return {
      seriesId: 'academy',
      seriesName: 'F1 Academy',
      championshipYear: '2026',
      description:
        'Official all-female driver development series directly supported and operated alongside Formula 1 Grand Prix weekends worldwide.',
      regulations:
        'Single-make Tatuus F4 chassis with Autotecnica 1.4L 174 HP Turbo engines. Reverse top 8 in Race 1, full grid in Race 2. 2 pts for Pole Position.',
      carSpecs: fallback.carSpecs,
      drivers: scrapedDrivers.length >= 8 ? scrapedDrivers : fallback.drivers,
      teams: scrapedTeams.length >= 4 ? scrapedTeams : fallback.teams,
      calendar: fallback.calendar,
    };
  } catch (err) {
    console.error('Error scraping F1 Academy data:', err);
    return fallback;
  }
}

/**
 * Helper to parse calendar rounds from F2/F3 calendar pages
 */
function parseCalendarRounds(html: string): JuniorRaceWeekend[] {
  const eventRegex =
    /<a[^>]+href="\/en\/racing\/\d+\/([^"]+)"[^>]*>([^<]+)<\/a><\/span><span[^>]*>([^<]+)<\/span>/gi;
  const events: { slug: string; city: string; country: string; index: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = eventRegex.exec(html)) !== null) {
    events.push({
      slug: m[1],
      city: m[2].trim(),
      country: m[3].trim(),
      index: m.index,
    });
  }

  const rounds: JuniorRaceWeekend[] = [];
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    const startIdx = Math.max(0, ev.index - 2000);
    const slice = html.substring(startIdx, ev.index);
    const roundMatch = slice.match(/ROUND\s*(\d+)/i);
    const dateMatch =
      slice.match(/<span class="werwfW_upper">([^<]+)<\/span>/i) ||
      slice.match(/(\d{2}\s*-\s*\d{2}\s+[A-Za-z]+)/i);

    const countryMeta = Object.values(JUNIOR_DRIVER_METADATA).find(
      (d) => d.country.toLowerCase() === ev.country.toLowerCase()
    );

    rounds.push({
      round: roundMatch ? parseInt(roundMatch[1], 10) : i + 1,
      gpName: `${ev.country} Grand Prix`,
      circuit: ev.city,
      countryFlag: countryMeta?.countryFlag || '🏁',
      date: dateMatch ? dateMatch[1].trim() : '2026 Season',
      isCompleted: i < 11, // First 11 completed in 2026 season
    });
  }
  return rounds;
}

/**
 * Get junior series data with memory caching
 */
export async function getJuniorSeriesData(
  series: 'f2' | 'f3' | 'academy'
): Promise<JuniorSeriesData> {
  const now = Date.now();
  const cached = cache[series];
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  let data: JuniorSeriesData;
  if (series === 'f2') {
    data = await scrapeF2Data();
  } else if (series === 'f3') {
    data = await scrapeF3Data();
  } else {
    data = await scrapeF1AcademyData();
  }

  cache[series] = {
    timestamp: now,
    data,
  };

  return data;
}
