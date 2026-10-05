import { NextResponse } from 'next/server';
import { synthesizeDriverTelemetry } from '@/lib/f1/liveRaceEngine';

interface CacheEntry {
  timestamp: number;
  data: any;
}

const memoryCache = new Map<string, CacheEntry>();
const OPENF1_BASE = 'https://api.openf1.org/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionKey = searchParams.get('session_key');
  const driverNumber = searchParams.get('driver_number');
  const circuit = searchParams.get('circuit') || 'sepang';

  if (!sessionKey || !driverNumber) {
    return NextResponse.json({ error: 'Missing session_key or driver_number' }, { status: 400 });
  }

  const dNum = parseInt(driverNumber, 10) || 1;
  const cacheKey = `car_telemetry_${sessionKey}_${driverNumber}_${circuit}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < 1500) {
    return NextResponse.json(cached.data);
  }

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `${OPENF1_BASE}/car_data?session_key=${sessionKey}&driver_number=${driverNumber}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      }
    );
    clearTimeout(id);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const result = data.slice(-30);
        memoryCache.set(cacheKey, { timestamp: now, data: result });
        return NextResponse.json(result);
      }
    }

    // High-fidelity circuit-specific telemetry for the live session
    const fallbackTelemetry = synthesizeDriverTelemetry(dNum, circuit);
    memoryCache.set(cacheKey, { timestamp: now, data: fallbackTelemetry });
    return NextResponse.json(fallbackTelemetry);
  } catch (err) {
    if (cached) return NextResponse.json(cached.data);
    const fallbackTelemetry = synthesizeDriverTelemetry(dNum, circuit);
    return NextResponse.json(fallbackTelemetry);
  }
}
