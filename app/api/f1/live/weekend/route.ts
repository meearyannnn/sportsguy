import { getWeekend } from '@/lib/f1/openf1Live';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const round = Number(searchParams.get('round')) || null;
  try {
    const data = await getWeekend(round);
    return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[live/weekend]', err);
    return Response.json({ error: 'Failed to load weekend data from OpenF1 / Jolpica' }, { status: 502 });
  }
}
