import { getLapTelemetry } from '@/lib/f1/openf1Live';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = Number(searchParams.get('session_key'));
  const driver = Number(searchParams.get('driver'));
  const lap = Number(searchParams.get('lap')) || null;
  if (!sessionKey || !driver) return Response.json({ error: 'session_key and driver required' }, { status: 400 });
  try {
    const data = await getLapTelemetry(sessionKey, driver, lap);
    if (!data) return Response.json({ error: 'No timed lap for this driver' }, { status: 404 });
    return Response.json(data, { headers: { 'Cache-Control': 'public, max-age=600' } });
  } catch (err) {
    console.error('[live/lap]', err);
    return Response.json({ error: 'Telemetry unavailable' }, { status: 502 });
  }
}
