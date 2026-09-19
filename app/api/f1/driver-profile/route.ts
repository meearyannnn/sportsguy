import { NextResponse } from 'next/server';
import { getDriverProfile } from '@/lib/f1/driverCareer';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId') || searchParams.get('id');

    if (!driverId) {
      return NextResponse.json({ error: 'Missing driverId parameter' }, { status: 400 });
    }

    const profile = await getDriverProfile(driverId);

    return NextResponse.json(
      {
        driverId,
        profile,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Failed to get official driver profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve driver profile',
      },
      { status: 500 }
    );
  }
}
