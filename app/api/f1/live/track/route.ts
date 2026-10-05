import { getTrack } from '@/lib/f1/openf1Live';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = Number(searchParams.get('session_key'));
  if (!sessionKey) return Response.json({ error: 'session_key required' }, { status: 400 });
  try {
    const track = await getTrack(sessionKey);
    if (!track) return Response.json({ error: 'No GPS data for this session yet' }, { status: 404 });
    return Response.json(track, { headers: { 'Cache-Control': 'public, max-age=3600' } });
  } catch (err) {
    console.error('[live/track]', err);
    return Response.json({ error: 'Track geometry unavailable' }, { status: 502 });
  }
}
