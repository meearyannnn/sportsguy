import { NextResponse } from 'next/server';
import { getScrapedTestingData } from '@/lib/f1/testingScraper';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getScrapedTestingData();
    return NextResponse.json(
      {
        success: true,
        session: data.session,
        mileage: data.mileage,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=14400',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get testing data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve testing data' },
      { status: 500 }
    );
  }
}
