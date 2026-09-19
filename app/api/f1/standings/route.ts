import { NextResponse } from 'next/server';
import { fetchF1ComDriverStandings, fetchF1ComConstructorStandings } from '@/lib/f1/f1ComScraper';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || '2026';

    const [drivers, constructors] = await Promise.all([
      fetchF1ComDriverStandings(year).catch(() => []),
      fetchF1ComConstructorStandings(year).catch(() => []),
    ]);

    return NextResponse.json(
      {
        year,
        drivers,
        constructors,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get official F1 standings:', error);
    return NextResponse.json(
      {
        drivers: [],
        constructors: [],
        error: 'Failed to retrieve live standings data',
      },
      { status: 500 }
    );
  }
}
