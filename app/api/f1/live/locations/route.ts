import { getLocations } from '@/lib/f1/openf1Live';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = Number(searchParams.get('session_key'));
  const live = searchParams.get('live') === '1';
  let from = Number(searchParams.get('from'));
  let to = Number(searchParams.get('to'));
  if (!sessionKey) return Response.json({ error: 'session_key required' }, { status: 400 });
  if (live) {
    // Latest positions: look back a few seconds (feed latency).
    to = Date.now();
    from = to - 8000;
  }
  if (!from || !to || to <= from) return Response.json({ error: 'from/to required' }, { status: 400 });
  try {
    const data = await getLocations(sessionKey, from, to, live);
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[live/locations]', err);
    return Response.json({}, { status: 502 });
  }
}
