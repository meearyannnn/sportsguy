import { NextResponse } from 'next/server';
import { fetchF1ComPodiums } from '@/lib/f1/f1ComScraper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2026';

    const podiums = await fetchF1ComPodiums(year);

    return NextResponse.json(
      {
        year,
        podiums,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get official F1 podiums:', error);
    return NextResponse.json(
      {
        podiums: {},
        error: 'Failed to retrieve live podium data',
      },
      { status: 500 }
    );
  }
}
