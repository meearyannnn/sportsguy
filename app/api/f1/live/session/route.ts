import { getSessionDetail } from '@/lib/f1/openf1Live';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = Number(searchParams.get('session_key'));
  const round = Number(searchParams.get('round')) || null;
  if (!sessionKey) return Response.json({ error: 'session_key required' }, { status: 400 });
  try {
    const data = await getSessionDetail(sessionKey, round);
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[live/session]', err);
    return Response.json({ error: 'OpenF1 timing data unavailable right now' }, { status: 502 });
  }
}
