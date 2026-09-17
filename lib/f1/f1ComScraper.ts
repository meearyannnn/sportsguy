import { NewsItem, NewsTag } from './newsTypes';

export interface F1ComDriverSummary {
  slug: string;
  driverName: string;
  driverTeam: string;
  headshotUrl: string;
  officialUrl: string;
}

export interface F1ComDriverStats {
  slug: string;
  driverName?: string;
  driverTeam?: string;
  permanentNumber?: number;
  country?: string;
  countryFlag?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  biography?: string;
  seasonPosition?: string;
  seasonPoints?: string;
  seasonWins?: string;
  seasonPodiums?: string;
  seasonPoles?: string;
  seasonDNFs?: string;
  grandPrixRaces?: string;
  grandPrixWins?: string;
  grandPrixPodiums?: string;
  grandPrixPoles?: string;
  dhlFastestLaps?: string;
  dnfs?: string;
  careerEntered?: string;
  careerPoints?: string;
  careerWins?: string;
  careerPodiums?: string;
  careerPoles?: string;
  careerChampionships?: string;
  rawStats: Record<string, string>;
}

const f1ComCache = {
  timestamp: 0,
  articles: [] as NewsItem[],
};

const driversCache = {
  timestamp: 0,
  drivers: [] as F1ComDriverSummary[],
};

const driverStatsCache = new Map<string, { timestamp: number; data: F1ComDriverStats }>();

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export async function fetchF1ComOfficialNews(): Promise<NewsItem[]> {
  const now = Date.now();
  if (f1ComCache.articles.length > 0 && now - f1ComCache.timestamp < CACHE_TTL_MS) {
    return f1ComCache.articles;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://www.formula1.com/en/latest/all', {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`Formula1.com scraper notice (${res.status})`);
      return f1ComCache.articles;
    }

    const html = await res.text();
    const articleBlocks = html.match(/<a[^>]+href="\/en\/latest\/article\/[^"]+"[\s\S]*?<\/a>/gi) || [];

    const items: NewsItem[] = [];

    for (const block of articleBlocks.slice(0, 15)) {
      const hrefMatch = block.match(/href="(\/en\/latest\/article\/[^"]+)"/);
      if (!hrefMatch) continue;

      const link = `https://www.formula1.com${hrefMatch[1]}`;

      const headlineMatch =
        block.match(/<p[^>]*class="[^"]*headline[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
        block.match(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/i) ||
        block.match(/<span[^>]*class="[^"]*headline[^"]*"[^>]*>([\s\S]*?)<\/span>/i);

      let title = headlineMatch ? headlineMatch[1].replace(/<[^>]+>/g, '').trim() : '';

      if (!title) {
        const slug = hrefMatch[1].split('/')[4]?.split('.')[0] || '';
        title = slug
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase())
          .trim();
      }

      if (!title || title.length < 8) continue;

      const tagMatch =
        block.match(/<span[^>]*class="[^"]*category[^"]*"[^>]*>([\s\S]*?)<\/span>/i) ||
        block.match(/<p[^>]*class="[^"]*meta[^"]*"[^>]*>([\s\S]*?)<\/p>/i);

      const rawCategory = tagMatch ? tagMatch[1].replace(/<[^>]+>/g, '').trim() : 'Official Feature';

      let tag: NewsTag = 'Race Weekend';
      const lower = `${title} ${rawCategory}`.toLowerCase();
      if (lower.includes('breaking') || lower.includes('official') || lower.includes('announce')) {
        tag = 'Breaking';
      } else if (lower.includes('technical') || lower.includes('engine') || lower.includes('aero') || lower.includes('power unit')) {
        tag = 'Technical';
      } else if (lower.includes('driver') || lower.includes('contract') || lower.includes('cadillac') || lower.includes('seat')) {
        tag = 'Driver Market';
      } else if (lower.includes('rule') || lower.includes('fia') || lower.includes('penalty')) {
        tag = 'Regulation';
      }

      const id = `f1com_${Math.abs(hashString(title))}`;

      items.push({
        id,
        title,
        summary: `Official Formula 1 report: ${title}. Read full story and video coverage on Formula1.com.`,
        link,
        source: 'Formula1.com Official',
        pubDate: new Date().toISOString(),
        tag,
        isBreaking: tag === 'Breaking',
        secondarySources: [],
      });
    }

    if (items.length > 0) {
      f1ComCache.timestamp = now;
      f1ComCache.articles = items;
    }

    return items;
  } catch (err) {
    console.warn('Failed to scrape Formula1.com official news:', err);
    return f1ComCache.articles;
  }
}

/**
 * Scrapes official F1 driver grid list directly from https://www.formula1.com/en/drivers
 */
export async function fetchF1ComDrivers(): Promise<F1ComDriverSummary[]> {
  const now = Date.now();
  if (driversCache.drivers.length > 0 && now - driversCache.timestamp < CACHE_TTL_MS) {
    return driversCache.drivers;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://www.formula1.com/en/drivers', {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return driversCache.drivers;
    }

    const html = await res.text();
    const driverBlocks = html.match(/<a[^>]+href="\/en\/drivers\/[a-z0-9-]+"[\s\S]*?<\/a>/gi) || [];

    const list: F1ComDriverSummary[] = [];

    for (const block of driverBlocks) {
      const hrefMatch = block.match(/href="(\/en\/drivers\/[a-z0-9-]+)"/);
      if (!hrefMatch) continue;

      const slug = hrefMatch[1].split('/')[3];
      const officialUrl = `https://www.formula1.com${hrefMatch[1]}`;

      let driverName = '';
      let driverTeam = '';

      const ctxMatch = block.match(/data-f1rd-a7s-context="([^"]+)"/);
      if (ctxMatch) {
        try {
          const decoded = JSON.parse(Buffer.from(ctxMatch[1], 'base64').toString('utf-8'));
          driverName = decoded.driverName || '';
          driverTeam = decoded.driverTeam || '';
        } catch {}
      }

      if (!driverName) {
        driverName = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      }

      const imgMatch = block.match(/src="([^"]+\.(?:png|jpg|webp)[^"]*)"/i) || block.match(/data-src="([^"]+)"/i);
      const headshotUrl = imgMatch ? imgMatch[1] : '';

      list.push({
        slug,
        driverName,
        driverTeam: driverTeam || 'Formula 1 Team',
        headshotUrl,
        officialUrl,
      });
    }

    if (list.length > 0) {
      driversCache.timestamp = now;
      driversCache.drivers = list;
    }

    return list;
  } catch (err) {
    console.warn('Failed to scrape Formula1.com drivers list:', err);
    return driversCache.drivers;
  }
}

/**
 * Scrapes detailed official driver stats from https://www.formula1.com/en/drivers/{slug}
 */
export async function fetchF1ComDriverStats(slug: string): Promise<F1ComDriverStats | null> {
  const cleanSlug = slug.toLowerCase().trim();
  const now = Date.now();

  const cached = driverStatsCache.get(cleanSlug);
  if (cached && now - cached.timestamp < CACHE_TTL_MS * 2) {
    return cached.data;
  }

  try {
    const url = `https://www.formula1.com/en/drivers/${cleanSlug}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return cached?.data || null;
    }

    const html = await res.text();
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const line = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

    let driverName = '';
    let driverTeam = '';
    let country = '';
    let permanentNumber = 0;

    // Base64 Data Context
    const ctxMatch = html.match(/data-f1rd-a7s-context="([^"]+)"/);
    if (ctxMatch) {
      try {
        const decoded = JSON.parse(Buffer.from(ctxMatch[1], 'base64').toString('utf-8'));
        if (decoded.driverName) driverName = decoded.driverName;
        if (decoded.driverTeam) driverTeam = decoded.driverTeam;
      } catch {}
    }

    // Header pattern match for Flag of
    const flagIdx = line.indexOf('Flag of ');
    if (flagIdx !== -1) {
      const beforeFlag = line.slice(Math.max(0, flagIdx - 50), flagIdx).trim();
      const nameMatch = beforeFlag.match(/([A-Z][a-z'-]+(?:\s+[A-Z][a-z'-]+)+)$/);
      if (nameMatch && !driverName) {
        driverName = nameMatch[1];
      }

      const afterFlag = line.slice(flagIdx + 8).trim();
      const countryMatch = afterFlag.match(
        /^([A-Za-z\s]+?)\s+(Italy|Great Britain|United Kingdom|Spain|Netherlands|Germany|Australia|Monaco|Canada|Japan|Thailand|France|Mexico|Brazil|New Zealand|Argentina|Finland|Denmark|Switzerland|China|United States)\s+([A-Za-z0-9\s-]+?)\s+(\d{1,2})/i
      );

      if (countryMatch) {
        country = countryMatch[2];
        if (!driverTeam) driverTeam = countryMatch[3];
        if (!permanentNumber) permanentNumber = parseInt(countryMatch[4], 10);
      }
    }

    const lines = clean.replace(/<[^>]+>/g, '\n').split('\n').map((s) => s.trim()).filter(Boolean);

    let dateOfBirth = '';
    let placeOfBirth = '';
    let seasonPosition = '';
    let seasonPoints = '';
    let seasonWins = '';
    let seasonPodiums = '';
    let seasonPoles = '';
    let seasonDNFs = '';
    let careerEntered = '';
    let careerPoints = '';
    let careerPodiums = '';
    let careerPoles = '';
    let careerChampionships = '';

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l === 'Date of Birth' && lines[i + 1]) dateOfBirth = lines[i + 1];
      if (l === 'Place of Birth' && lines[i + 1]) placeOfBirth = lines[i + 1];
      if (l === 'Country' && lines[i + 1] && !country) country = lines[i + 1];
      if ((l === 'Teams' || l === 'Team') && lines[i + 1] && !driverTeam) driverTeam = lines[i + 1];

      // Season stats
      if (l === 'Season Position' && lines[i + 1]) seasonPosition = lines[i + 1];
      if (l === 'Season Points' && lines[i + 1]) seasonPoints = lines[i + 1];
      if (l === 'Grand Prix Wins' && lines[i + 1]) seasonWins = lines[i + 1];
      if (l === 'Grand Prix Podiums' && lines[i + 1]) seasonPodiums = lines[i + 1];
      if (l === 'Grand Prix Poles' && lines[i + 1]) seasonPoles = lines[i + 1];
      if (l === 'DNFs' && lines[i + 1] && !seasonDNFs) seasonDNFs = lines[i + 1];

      // Career stats
      if (l === 'Grands Prix Entered' && lines[i + 1]) careerEntered = lines[i + 1];
      if (l === 'Career Points' && lines[i + 1]) careerPoints = lines[i + 1];
      if (l === 'Podiums' && lines[i + 1]) careerPodiums = lines[i + 1];
      if (l === 'Pole Positions' && lines[i + 1]) careerPoles = lines[i + 1];
      if (l === 'World Championships' && lines[i + 1]) careerChampionships = lines[i + 1];
    }

    // Parse Highest Race Finish for career wins e.g. "1 (x8)"
    let careerWins = '0';
    const winMatch = clean.match(/Highest Race Finish\s*1\s*\(x(\d+)\)/i);
    if (winMatch) {
      careerWins = winMatch[1];
    } else if (clean.includes('Highest Race Finish 1')) {
      careerWins = '1';
    }

    // Extract official biography paragraphs
    const bioParagraphs: string[] = [];
    const pTags = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    for (const p of pTags) {
      const text = p.replace(/<[^>]+>/g, '').trim();
      if (
        text.length > 80 &&
        !text.includes('Cookie') &&
        !text.includes('Rights') &&
        !text.includes('STATISTICS') &&
        !text.includes('Sign In') &&
        !text.includes('Next image') &&
        !text.includes('Download')
      ) {
        bioParagraphs.push(text);
      }
    }

    const biography = bioParagraphs.length > 0 ? bioParagraphs.slice(0, 3).join(' ') : '';

    const statsData: F1ComDriverStats = {
      slug: cleanSlug,
      driverName: driverName || undefined,
      driverTeam: driverTeam || undefined,
      permanentNumber: permanentNumber || undefined,
      country: country || undefined,
      dateOfBirth: dateOfBirth || undefined,
      placeOfBirth: placeOfBirth || undefined,
      biography: biography || undefined,
      seasonPosition: seasonPosition || undefined,
      seasonPoints: seasonPoints || undefined,
      seasonWins: seasonWins || undefined,
      seasonPodiums: seasonPodiums || undefined,
      seasonPoles: seasonPoles || undefined,
      seasonDNFs: seasonDNFs || undefined,
      careerEntered: careerEntered || undefined,
      careerPoints: careerPoints || undefined,
      careerWins: careerWins || undefined,
      careerPodiums: careerPodiums || undefined,
      careerPoles: careerPoles || undefined,
      careerChampionships: careerChampionships || undefined,
      rawStats: {},
    };

    driverStatsCache.set(cleanSlug, { timestamp: now, data: statsData });
    return statsData;
  } catch (err) {
    console.warn(`Failed to scrape F1.com driver stats for ${cleanSlug}:`, err);
    return cached?.data || null;
  }
}

export interface F1ComCircuitSpecs {
  circuitId: string;
  countrySlug: string;
  circuitLengthKm?: number;
  corners?: number;
  drsZones?: number;
  laps?: number;
  raceDistanceKm?: number;
  lapRecord?: string;
  recordHolder?: string;
  recordYear?: string;
  firstGpYear?: string;
  sessions?: Record<string, string>;
}

const circuitSpecsCache = new Map<string, { timestamp: number; data: F1ComCircuitSpecs }>();

export async function fetchF1ComCircuitSpecs(slugOrCircuitId: string): Promise<F1ComCircuitSpecs | null> {
  const norm = slugOrCircuitId.toLowerCase().trim().replace(/[\s_]+/g, '-');
  const countrySlug = getF1ComCountrySlug(norm);
  const now = Date.now();

  const cached = circuitSpecsCache.get(countrySlug);
  if (cached && now - cached.timestamp < CACHE_TTL_MS * 2) {
    return cached.data;
  }

  try {
    const url = `https://www.formula1.com/en/racing/2026/${countrySlug}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return cached?.data || null;
    }

    const html = await res.text();
    const clean = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
    const lines = clean.replace(/<[^>]+>/g, '\n').split('\n').map((s) => s.trim()).filter(Boolean);

    let circuitLengthKm: number | undefined;
    let laps: number | undefined;
    let raceDistanceKm: number | undefined;
    let lapRecord: string | undefined;
    let recordHolder: string | undefined;
    let recordYear: string | undefined;
    let firstGpYear: string | undefined;
    const sessions: Record<string, string> = {};

    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l === 'Circuit Length' && lines[i + 1]) {
        const val = parseFloat(lines[i + 1]);
        if (!isNaN(val)) circuitLengthKm = val;
      }
      if (l === 'Number of Laps' && lines[i + 1]) {
        const val = parseInt(lines[i + 1], 10);
        if (!isNaN(val)) laps = val;
      }
      if (l === 'Race Distance' && lines[i + 1]) {
        const val = parseFloat(lines[i + 1]);
        if (!isNaN(val)) raceDistanceKm = val;
      }
      if (l === 'First Grand Prix' && lines[i + 1]) {
        firstGpYear = lines[i + 1];
      }

      const recordMatch = l.match(/^(\d+:\d+\.\d+)$/);
      if (recordMatch && lines[i + 1] && (lines[i + 1].includes('(') || lines[i + 1].includes('20'))) {
        lapRecord = recordMatch[1];
        const holderMatch = lines[i + 1].match(/^([^(]+)(?:\((\d{4})\))?/);
        if (holderMatch) {
          recordHolder = holderMatch[1].trim();
          recordYear = holderMatch[2] || undefined;
        }
      }

      if ((l === 'Practice 1' || l === 'Practice 2' || l === 'Practice 3' || l === 'Qualifying' || l === 'Sprint' || l === 'Race') && lines[i + 1]) {
        if (/^\d{2}:\d{2}$/.test(lines[i + 1])) {
          sessions[l] = lines[i + 1];
        }
      }
    }

    const result: F1ComCircuitSpecs = {
      circuitId: slugOrCircuitId,
      countrySlug,
      circuitLengthKm,
      laps,
      raceDistanceKm,
      lapRecord,
      recordHolder,
      recordYear,
      firstGpYear,
      sessions: Object.keys(sessions).length > 0 ? sessions : undefined,
    };

    circuitSpecsCache.set(countrySlug, { timestamp: now, data: result });
    return result;
  } catch (err) {
    console.warn(`Failed to scrape F1.com circuit specs for ${countrySlug}:`, err);
    return cached?.data || null;
  }
}

function getF1ComCountrySlug(circuitOrCountry: string): string {
  switch (circuitOrCountry) {
    case 'albert-park':
    case 'australia':
    case 'melbourne':
      return 'australia';
    case 'shanghai':
    case 'china':
      return 'china';
    case 'suzuka':
    case 'japan':
      return 'japan';
    case 'miami':
      return 'miami';
    case 'villeneuve':
    case 'canada':
    case 'montreal':
      return 'canada';
    case 'monaco':
    case 'monte-carlo':
      return 'monaco';
    case 'catalunya':
    case 'spain':
    case 'barcelona':
      return 'spain';
    case 'red-bull-ring':
    case 'austria':
    case 'spielberg':
      return 'austria';
    case 'silverstone':
    case 'great-britain':
    case 'uk':
      return 'great-britain';
    case 'hungaroring':
    case 'hungary':
    case 'budapest':
      return 'hungary';
    case 'spa':
    case 'belgium':
      return 'belgium';
    case 'zandvoort':
    case 'netherlands':
    case 'dutch':
      return 'netherlands';
    case 'monza':
    case 'italy':
      return 'italy';
    case 'baku':
    case 'azerbaijan':
      return 'azerbaijan';
    case 'marina-bay':
    case 'singapore':
      return 'singapore';
    case 'americas':
    case 'united-states':
    case 'us':
    case 'austin':
      return 'united-states';
    case 'rodriguez':
    case 'mexico':
      return 'mexico';
    case 'interlagos':
    case 'brazil':
      return 'brazil';
    case 'vegas':
    case 'las-vegas':
      return 'las-vegas';
    case 'losail':
    case 'qatar':
      return 'qatar';
    case 'yas-marina':
    case 'abu-dhabi':
      return 'abu-dhabi';
    case 'bahrain':
    case 'sakhir':
      return 'bahrain';
    case 'jeddah':
    case 'saudi-arabia':
      return 'saudi-arabia';
    case 'imola':
    case 'emilia-romagna':
      return 'emilia-romagna';
    default:
      return circuitOrCountry;
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
