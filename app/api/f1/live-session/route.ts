import { NextResponse } from 'next/server';
import { getMultiSourceLiveSession } from '@/lib/f1/multiSourceLive';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reqSessionKey = searchParams.get('session_key');
  const reqMeetingKey = searchParams.get('meeting_key');
  const round = searchParams.get('round');
  const forceRefresh = searchParams.get('refresh') === 'true';
  const simulateLive = searchParams.get('simulate_live') === 'true';

  try {
    const sessionKey = reqSessionKey ? parseInt(reqSessionKey, 10) : null;
    const meetingKey = reqMeetingKey ? parseInt(reqMeetingKey, 10) : null;

    const data = await getMultiSourceLiveSession(
      sessionKey,
      meetingKey,
      round,
      forceRefresh,
      simulateLive
    );

    return NextResponse.json(data, {
      headers: {
        'Cache-Control':
          data.activeSession.status === 'LIVE'
            ? 'public, max-age=2, s-maxage=2'
            : 'public, max-age=15, s-maxage=15',
      },
    });
  } catch (error: any) {
    console.error('[Live Session Route Error]:', error);
    // Fallback safe session response
    const fallback = await getMultiSourceLiveSession(null, null, round || '16', true, false);
    return NextResponse.json(fallback);
  }
}
