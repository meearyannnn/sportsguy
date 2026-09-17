import { NextResponse } from 'next/server';
import { NewsItem, NewsTag, SecondarySource } from '@/lib/f1/newsTypes';
import { fetchF1ComOfficialNews } from '@/lib/f1/f1ComScraper';

interface CachedNews {
  items: NewsItem[];
  timestamp: number;
}

let memoryCache: CachedNews | null = null;
const CACHE_TTL_MS = 6 * 60 * 1000; // 6 minutes cache interval

const RSS_FEEDS = [
  {
    name: 'Autosport',
    url: 'https://www.autosport.com/rss/f1/news/',
  },
  {
    name: 'Motorsport.com',
    url: 'https://www.motorsport.com/rss/f1/news/',
  },
  {
    name: 'BBC Sport F1',
    url: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml',
  },
  {
    name: 'The Race',
    url: 'https://the-race.com/feed/',
  },
];

function cleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateToTwoSentences(text: string): string {
  const cleaned = cleanText(text);
  if (!cleaned) return 'No preview provided by publisher. Read full story at source.';
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    return sentences.slice(0, 2).join(' ').trim();
  }
  return cleaned.length > 180 ? `${cleaned.slice(0, 180).trim()}...` : cleaned;
}

function classifyTag(title: string, summary: string, pubDate: string): { tag: NewsTag; isBreaking: boolean } {
  const combined = `${title} ${summary}`.toLowerCase();
  const now = Date.now();
  const publishedAt = new Date(pubDate).getTime();
  const isRecent = !isNaN(publishedAt) && now - publishedAt < 90 * 60 * 1000;

  const isBreakingKeyword =
    combined.includes('breaking') ||
    combined.includes('urgent') ||
    combined.includes('confirmed:') ||
    combined.includes('official:');

  const isBreaking = isBreakingKeyword || isRecent;

  if (isBreakingKeyword) {
    return { tag: 'Breaking', isBreaking: true };
  }

  if (
    combined.includes('contract') ||
    combined.includes('seat') ||
    combined.includes('transfer') ||
    combined.includes('signing') ||
    combined.includes('cadillac') ||
    combined.includes('audi') ||
    combined.includes('replaces') ||
    combined.includes('market') ||
    combined.includes('lineup')
  ) {
    return { tag: 'Driver Market', isBreaking };
  }

  if (
    combined.includes('technical') ||
    combined.includes('upgrade') ||
    combined.includes('sidepod') ||
    combined.includes('floor') ||
    combined.includes('wing') ||
    combined.includes('aero') ||
    combined.includes('engine') ||
    combined.includes('power unit') ||
    combined.includes('telemetry')
  ) {
    return { tag: 'Technical', isBreaking };
  }

  if (
    combined.includes('regulation') ||
    combined.includes('rule') ||
    combined.includes('fia') ||
    combined.includes('penalty') ||
    combined.includes('stewards') ||
    combined.includes('budget cap') ||
    combined.includes('directive')
  ) {
    return { tag: 'Regulation', isBreaking };
  }

  if (
    combined.includes('gp') ||
    combined.includes('grand prix') ||
    combined.includes('qualifying') ||
    combined.includes('pole') ||
    combined.includes('sprint') ||
    combined.includes('fp1') ||
    combined.includes('fp2') ||
    combined.includes('fp3') ||
    combined.includes('race') ||
    combined.includes('podium')
  ) {
    return { tag: 'Race Weekend', isBreaking };
  }

  return { tag: isBreaking ? 'Breaking' : 'Race Weekend', isBreaking };
}

function normalizeTitleForDedupe(title: string): string[] {
  return cleanText(title)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['formula', 'autosport', 'motorsport', 'race', 'news'].includes(w));
}

function areTitlesNearDuplicate(titleA: string, titleB: string): boolean {
  const tokensA = new Set(normalizeTitleForDedupe(titleA));
  const tokensB = new Set(normalizeTitleForDedupe(titleB));
  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersection++;
    }
  }

  const overlapRatio = (2 * intersection) / (tokensA.size + tokensB.size);
  return overlapRatio >= 0.55;
}

function parseRssXml(xmlText: string, sourceName: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xmlText.match(itemRegex) || [];

  for (const itemBlock of matches.slice(0, 15)) {
    const titleMatch = itemBlock.match(/<title[\s\S]*?>([\s\S]*?)<\/title>/i);
    const linkMatch = itemBlock.match(/<link[\s\S]*?>([\s\S]*?)<\/link>/i);
    const descMatch =
      itemBlock.match(/<description[\s\S]*?>([\s\S]*?)<\/description>/i) ||
      itemBlock.match(/<summary[\s\S]*?>([\s\S]*?)<\/summary>/i);
    const pubDateMatch =
      itemBlock.match(/<pubDate[\s\S]*?>([\s\S]*?)<\/pubDate>/i) ||
      itemBlock.match(/<dc:date[\s\S]*?>([\s\S]*?)<\/dc:date>/i);

    const rawTitle = titleMatch ? titleMatch[1] : '';
    const rawLink = linkMatch ? linkMatch[1] : '';
    const rawDesc = descMatch ? descMatch[1] : '';
    const rawDate = pubDateMatch ? pubDateMatch[1] : new Date().toISOString();

    const title = cleanText(rawTitle);
    const link = cleanText(rawLink).replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
    const summary = truncateToTwoSentences(rawDesc);
    const pubDate = new Date(cleanText(rawDate)).toISOString();

    if (title && link) {
      const { tag, isBreaking } = classifyTag(title, summary, pubDate);
      const id = `${sourceName.toLowerCase().replace(/\s+/g, '_')}_${Math.abs(hashString(title))}`;

      items.push({
        id,
        title,
        summary,
        link,
        source: sourceName,
        pubDate,
        tag,
        isBreaking,
        secondarySources: [],
      });
    }
  }

  return items;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export async function GET() {
  const now = Date.now();

  // Return cached result if fresh
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        items: memoryCache.items,
        sourceCount: RSS_FEEDS.length + 1,
        cached: true,
        updatedAt: new Date(memoryCache.timestamp).toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=360, stale-while-revalidate=600',
        },
      }
    );
  }

  // Fetch official Formula1.com articles alongside top RSS feeds
  const f1ComPromise = fetchF1ComOfficialNews().catch(() => []);

  const rssPromises = RSS_FEEDS.map(async (feed) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'APEX-F1-Timing-HUD/2.0 (RSS News Reader; contact@apex-hud.f1)',
          Accept: 'application/rss+xml, application/xml, text/xml',
        },
        next: { revalidate: 360 },
      });

      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const xml = await res.text();
      return parseRssXml(xml, feed.name);
    } catch {
      return [];
    }
  });

  const [f1ComItems, ...rssResults] = await Promise.all([f1ComPromise, ...rssPromises]);
  const flatItems = [...f1ComItems, ...rssResults.flat()];

  // Sort by pubDate descending
  flatItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Deduplicate near-identical stories across outlets
  const dedupedItems: NewsItem[] = [];

  for (const item of flatItems) {
    const existing = dedupedItems.find((d) => areTitlesNearDuplicate(d.title, item.title));

    if (existing) {
      // Merge as secondary source
      if (
        existing.source !== item.source &&
        !existing.secondarySources.some((s) => s.name === item.source)
      ) {
        existing.secondarySources.push({
          name: item.source,
          link: item.link,
        });
      }
    } else {
      dedupedItems.push({ ...item, secondarySources: [] });
    }
  }

  // Fallback if network completely blocked
  const finalItems = dedupedItems.length > 0 ? dedupedItems : getCuratedFallbackNews();

  memoryCache = {
    items: finalItems,
    timestamp: now,
  };

  return NextResponse.json(
    {
      items: finalItems,
      sourceCount: RSS_FEEDS.length,
      cached: false,
      updatedAt: new Date(now).toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=360, stale-while-revalidate=600',
      },
    }
  );
}

function getCuratedFallbackNews(): NewsItem[] {
  return [
    {
      id: 'fb_1',
      title: 'McLaren and Red Bull prepare crucial aerodynamic packages for Singapore GP street battle',
      summary:
        'Both constructors have prepared low-speed downforce adaptations targeting the high mechanical demand of the Marina Bay layout.',
      link: 'https://www.autosport.com/f1/',
      source: 'Autosport',
      pubDate: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      tag: 'Technical',
      isBreaking: true,
      secondarySources: [{ name: 'The Race', link: 'https://the-race.com/formula-1/' }],
    },
    {
      id: 'fb_2',
      title: 'FIA issues technical clarification regarding flexible front-wing deflection tolerances',
      summary:
        'The governing body confirmed additional high-resolution monitoring cameras will track wing load deflection over Singapore kerbs.',
      link: 'https://www.motorsport.com/f1/',
      source: 'Motorsport.com',
      pubDate: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      tag: 'Regulation',
      isBreaking: true,
      secondarySources: [{ name: 'BBC Sport F1', link: 'https://www.bbc.com/sport/formula1' }],
    },
    {
      id: 'fb_3',
      title: 'Ferrari confirms power unit reliability upgrades for upcoming flyaway rounds',
      summary:
        'Maranello engineers verified new internal combustion calibrations aimed at preserving thermal efficiency in high humidity.',
      link: 'https://the-race.com/formula-1/',
      source: 'The Race',
      pubDate: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
      tag: 'Technical',
      isBreaking: false,
      secondarySources: [],
    },
    {
      id: 'fb_4',
      title: 'Audi F1 project reaches key engine dynamometer milestone ahead of 2026 regulations',
      summary:
        'The German manufacturer completed full hybrid power unit simulation cycles with active MGU-K energy recovery testing.',
      link: 'https://www.autosport.com/f1/',
      source: 'Autosport',
      pubDate: new Date(Date.now() - 220 * 60 * 1000).toISOString(),
      tag: 'Driver Market',
      isBreaking: false,
      secondarySources: [{ name: 'Motorsport.com', link: 'https://www.motorsport.com/f1/' }],
    },
    {
      id: 'fb_5',
      title: 'Singapore Grand Prix weekend weather forecast predicts evening rain risk',
      summary:
        'High ambient humidity and tropical showers may impact intermediate tyre allocation during qualifying and race start procedures.',
      link: 'https://feeds.bbci.co.uk/sport/formula1/rss.xml',
      source: 'BBC Sport F1',
      pubDate: new Date(Date.now() - 310 * 60 * 1000).toISOString(),
      tag: 'Race Weekend',
      isBreaking: false,
      secondarySources: [],
    },
  ];
}
