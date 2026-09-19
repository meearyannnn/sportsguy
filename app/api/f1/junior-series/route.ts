import { NextResponse } from 'next/server';
import { getJuniorSeriesData } from '@/lib/f1/juniorScraper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesParam = (searchParams.get('series') || 'f2').toLowerCase();

    if (seriesParam !== 'f2' && seriesParam !== 'f3' && seriesParam !== 'academy' && seriesParam !== 'all') {
      return NextResponse.json(
        { error: 'Invalid series parameter. Must be f2, f3, academy, or all.' },
        { status: 400 }
      );
    }

    if (seriesParam === 'all') {
      const [f2, f3, academy] = await Promise.all([
        getJuniorSeriesData('f2'),
        getJuniorSeriesData('f3'),
        getJuniorSeriesData('academy'),
      ]);
      return NextResponse.json(
        {
          success: true,
          data: { f2, f3, academy },
          scrapedAt: new Date().toISOString(),
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    const data = await getJuniorSeriesData(seriesParam as 'f2' | 'f3' | 'academy');

    return NextResponse.json(
      {
        success: true,
        series: seriesParam,
        data,
        scrapedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (error) {
    console.error('Failed to scrape junior series data:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve junior series data',
      },
      { status: 500 }
    );
  }
}
