import { NextResponse } from 'next/server';
import { RECENT_PIT_STOPS_DATA } from '@/lib/f1/pitstops';

interface CacheEntry {
  timestamp: number;
  data: any;
}

const memoryCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

const JOLPICA_BASE = 'https://api.jolpi.ca/ergast/f1';
const OPENF1_BASE = 'https://api.openf1.org/v1';

// Normalizes compound string to standard F1 compound names
function normalizeCompound(raw?: string): 'SOFT' | 'MEDIUM' | 'HARD' | 'INTERMEDIATE' | 'WET' | 'UNKNOWN' {
  if (!raw) return 'UNKNOWN';
  const upper = raw.toUpperCase().trim();
  if (upper.includes('SOFT')) return 'SOFT';
  if (upper.includes('MED')) return 'MEDIUM';
  if (upper.includes('HARD')) return 'HARD';
  if (upper.includes('INTER')) return 'INTERMEDIATE';
  if (upper.includes('WET')) return 'WET';
  return 'UNKNOWN';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seasonParam = searchParams.get('season') || 'current';
  const roundParam = searchParams.get('round') || 'last';
  const customSessionKey = searchParams.get('sessionKey');

  const cacheKey = `stints_v2_${seasonParam}_${roundParam}_${customSessionKey || 'auto'}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  try {
    const targetSeason = seasonParam === 'current' ? 'current' : seasonParam;

    // 1. Fetch official race classification from Jolpica
    const raceRes = await fetch(
      `${JOLPICA_BASE}/${targetSeason}/${roundParam}/results.json?limit=35`,
      { next: { revalidate: 3600 } }
    );

    if (!raceRes.ok) {
      throw new Error(`Jolpica results returned status ${raceRes.status}`);
    }

    const raceJson = await raceRes.json();
    const races = raceJson?.MRData?.RaceTable?.Races;
    if (!races || races.length === 0) {
      return NextResponse.json({
        race: null,
        sessionKey: null,
        isVerified: false,
        dataSource: 'No official race results found',
        maxLaps: 0,
        totalStops: 0,
        strategies: [],
        stats: null,
      });
    }

    const race = races[0];
    const rawResults = race.Results || [];
    const resolvedRound = race.round;
    const raceDate = race.date;
    const raceYear = parseInt(race.season || (seasonParam === 'current' ? '2026' : seasonParam), 10);
    const locality = race.Circuit?.Location?.locality || '';

    // Strictly enforce FIA official classification order (P1, P2, P3... P22)
    // Never reorder or swap adjacent finishers under any circumstance.
    const sortedResults = [...rawResults].sort((a: any, b: any) => {
      const posA = parseInt(a.position, 10) || 999;
      const posB = parseInt(b.position, 10) || 999;
      return posA - posB;
    });

    const totalRaceLaps = Math.max(...sortedResults.map((r: any) => parseInt(r.laps, 10) || 0), 50);

    // 2. Resolve OpenF1 session_key for official telemetry
    let sessionKey: number | null = customSessionKey ? parseInt(customSessionKey, 10) : null;

    if (!sessionKey) {
      try {
        const sessionsRes = await fetch(
          `${OPENF1_BASE}/sessions?year=${raceYear}&session_name=Race`,
          { next: { revalidate: 86400 } }
        );

        if (sessionsRes.ok) {
          const sessions = await sessionsRes.json();
          if (Array.isArray(sessions) && sessions.length > 0) {
            sessions.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

            // Match by exact date
            if (raceDate) {
              const byDate = sessions.find((s) => s.date_start?.slice(0, 10) === raceDate);
              if (byDate) sessionKey = byDate.session_key;
            }

            // Match by locality
            if (!sessionKey && locality) {
              const locLower = locality.toLowerCase();
              const byLoc = sessions.find(
                (s) =>
                  s.location?.toLowerCase().includes(locLower) ||
                  locLower.includes(s.location?.toLowerCase() || '')
              );
              if (byLoc) sessionKey = byLoc.session_key;
            }

            // Match by round index
            if (!sessionKey) {
              const rNum = parseInt(resolvedRound, 10);
              if (!isNaN(rNum) && rNum > 0 && rNum <= sessions.length) {
                sessionKey = sessions[rNum - 1].session_key;
              } else {
                sessionKey = sessions[sessions.length - 1].session_key;
              }
            }
          }
        }
      } catch (err) {
        console.warn('OpenF1 session lookup warning:', err);
      }
    }

    // 3. Fetch Stints & Pit telemetry in parallel
    let rawStints: any[] = [];
    let rawOpenPits: any[] = [];
    let rawJolpicaPits: any[] = [];

    const fetchPromises: Promise<void>[] = [];

    if (sessionKey) {
      fetchPromises.push(
        fetch(`${OPENF1_BASE}/stints?session_key=${sessionKey}`, { next: { revalidate: 3600 } })
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => {
            if (Array.isArray(data)) rawStints = data;
          })
          .catch(() => {})
      );

      fetchPromises.push(
        fetch(`${OPENF1_BASE}/pit?session_key=${sessionKey}`, { next: { revalidate: 3600 } })
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => {
            if (Array.isArray(data)) rawOpenPits = data;
          })
          .catch(() => {})
      );
    }

    fetchPromises.push(
      fetch(`${JOLPICA_BASE}/${targetSeason}/${resolvedRound}/pitstops.json?limit=70`, {
        next: { revalidate: 3600 },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const pitList = data?.MRData?.RaceTable?.Races?.[0]?.PitStops;
          if (Array.isArray(pitList)) rawJolpicaPits = pitList;
        })
        .catch(() => {})
    );

    await Promise.all(fetchPromises);

    const hasVerifiedTelemetry = rawStints.length > 0;

    // 4. Build strictly verified strategy per driver adhering to official FIA classification
    const strategies = sortedResults.map((result: any) => {
      const position = parseInt(result.position, 10);
      const positionText = result.positionText || String(position);
      const driverNumber = parseInt(result.number || result.Driver?.permanentNumber || '0', 10);
      const driverId = result.Driver.driverId;
      const driverCode = result.Driver.code || result.Driver.familyName.slice(0, 3).toUpperCase();
      const driverName = `${result.Driver.givenName} ${result.Driver.familyName}`;
      const constructorId = result.Constructor.constructorId;
      const constructorName = result.Constructor.name;

      const gridRaw = result.grid ? parseInt(result.grid, 10) : null;
      const isPitLaneStart = gridRaw === 0;
      const gridPosition = isPitLaneStart ? null : gridRaw;

      const lapsCompleted = parseInt(result.laps, 10) || 0;
      const statusRaw = result.status || 'Finished';
      const isLapped = statusRaw === 'Lapped' || statusRaw.startsWith('+');
      const isDNF = statusRaw !== 'Finished' && !isLapped;
      const retirementLap = isDNF ? lapsCompleted : null;
      const retirementReason = isDNF ? (statusRaw === 'Retired' ? 'Retired' : statusRaw) : null;

      // Find driver pit stops from Jolpica & OpenF1
      const driverJolpicaPits = rawJolpicaPits.filter((p: any) => p.driverId === driverId);
      const driverOpenPits = rawOpenPits.filter((p: any) => p.driver_number === driverNumber);

      // DHL stationary pit stop times lookup
      const dhlStops = RECENT_PIT_STOPS_DATA.filter(
        (p) => p.driverId === driverId || p.driverNumber === driverNumber
      );

      let stints: any[] = [];
      let strategyAvailable = false;

      if (hasVerifiedTelemetry) {
        // Use strictly verified OpenF1 stints
        const driverRawStints = rawStints
          .filter((s: any) => s.driver_number === driverNumber)
          .sort((a: any, b: any) => a.stint_number - b.stint_number);

        if (driverRawStints.length > 0) {
          strategyAvailable = true;

          stints = driverRawStints
            .map((s: any, idx: number) => {
              const rawStart = s.lap_start;
              let rawEnd = s.lap_end;

              // If driver retired (DNF), strictly cap stint to retirement lap!
              if (isDNF && retirementLap !== null) {
                if (rawStart > retirementLap) return null; // Stint started after retirement
                if (rawEnd > retirementLap) rawEnd = retirementLap;
              }

              const startLap = rawStart;
              const endLap = Math.max(startLap, rawEnd);
              const duration = Math.max(1, endLap - startLap + 1);
              const compound = normalizeCompound(s.compound);
              const tyreAgeAtStart = s.tyre_age_at_start ?? 0;
              const isNew = tyreAgeAtStart === 0;

              // Match pit stop on endLap citing exact lap number
              const matchingOpenPit = driverOpenPits.find((p: any) => p.lap_number === endLap);
              const matchingJolpicaPit = driverJolpicaPits.find(
                (p: any) => parseInt(p.lap, 10) === endLap
              );
              const matchingDhl = dhlStops.find((p) => p.lap === endLap);

              let pitInfo: any = null;
              if (idx < driverRawStints.length - 1 || matchingOpenPit || matchingJolpicaPit) {
                const pitLaneDuration =
                  matchingOpenPit?.pit_duration?.toFixed(2) ??
                  matchingJolpicaPit?.duration ??
                  matchingDhl?.pitLaneDuration ??
                  null;

                const stationaryDuration =
                  matchingDhl?.stationaryDuration ??
                  (matchingOpenPit?.stop_duration ? matchingOpenPit.stop_duration.toFixed(2) : null);

                pitInfo = {
                  lap: endLap,
                  pitLaneDuration: pitLaneDuration ? `${pitLaneDuration}s` : null,
                  stationaryDuration: stationaryDuration ? `${stationaryDuration}s` : null,
                };
              }

              return {
                stintNumber: s.stint_number || idx + 1,
                compound,
                startLap,
                endLap,
                duration,
                tyreAgeAtStart,
                isNew,
                pitStop: pitInfo,
              };
            })
            .filter(Boolean);
        }
      }

      // If verified stint data does NOT exist, do NOT fabricate or guess S/M/H sequences!
      // StrategyAvailable remains false and stints empty, allowing UI to explicitly show "Strategy data unavailable".

      return {
        driverId,
        driverCode,
        driverName,
        driverNumber,
        constructorId,
        constructorName,
        position,
        positionText,
        gridPosition,
        isPitLaneStart,
        isDNF,
        retirementLap,
        retirementReason,
        isLapped,
        lapsCompleted,
        strategyAvailable,
        totalLaps: isDNF && retirementLap !== null ? retirementLap : lapsCompleted || totalRaceLaps,
        status: statusRaw,
        stints,
      };
    });

    // 5. Compute race aggregate statistics ONLY if verified telemetry is available
    let stats: any = null;

    if (hasVerifiedTelemetry) {
      const compoundLaps: Record<string, number> = {
        SOFT: 0,
        MEDIUM: 0,
        HARD: 0,
        INTERMEDIATE: 0,
        WET: 0,
      };
      const compoundStintCounts: Record<string, number> = {
        SOFT: 0,
        MEDIUM: 0,
        HARD: 0,
        INTERMEDIATE: 0,
        WET: 0,
      };

      let totalLapsAllDrivers = 0;
      let totalStopsCount = 0;

      strategies.forEach((strat: any) => {
        strat.stints.forEach((st: any) => {
          if (compoundLaps[st.compound] !== undefined) {
            compoundLaps[st.compound] += st.duration;
            compoundStintCounts[st.compound] += 1;
            totalLapsAllDrivers += st.duration;
          }
          if (st.pitStop) totalStopsCount++;
        });
      });

      const compoundShare: Record<string, number> = {};
      const avgStintLength: Record<string, number> = {};

      Object.keys(compoundLaps).forEach((c) => {
        compoundShare[c] = totalLapsAllDrivers > 0 ? Math.round((compoundLaps[c] / totalLapsAllDrivers) * 100) : 0;
        avgStintLength[c] =
          compoundStintCounts[c] > 0
            ? Math.round((compoundLaps[c] / compoundStintCounts[c]) * 10) / 10
            : 0;
      });

      // Fastest pit stop lookup
      const allStopsWithDuration: Array<{
        driverName: string;
        driverCode: string;
        constructorName: string;
        lap: number;
        duration: number;
        durationStr: string;
        stationaryStr?: string;
      }> = [];

      strategies.forEach((strat: any) => {
        strat.stints.forEach((st: any) => {
          if (st.pitStop?.pitLaneDuration) {
            const val = parseFloat(st.pitStop.pitLaneDuration);
            if (!isNaN(val) && val > 0) {
              allStopsWithDuration.push({
                driverName: strat.driverName,
                driverCode: strat.driverCode,
                constructorName: strat.constructorName,
                lap: st.pitStop.lap,
                duration: val,
                durationStr: st.pitStop.pitLaneDuration,
                stationaryStr: st.pitStop.stationaryDuration,
              });
            }
          }
        });
      });

      allStopsWithDuration.sort((a, b) => a.duration - b.duration);
      const fastestStop = allStopsWithDuration[0] || null;

      stats = {
        compoundShare,
        avgStintLength,
        compoundLaps,
        fastestStop,
      };
    }

    const totalStopsCount = strategies.reduce(
      (acc: number, s: any) => acc + s.stints.filter((st: any) => st.pitStop !== null).length,
      0
    );

    const responseData = {
      race: {
        season: race.season,
        round: race.round,
        raceName: race.raceName,
        circuitName: race.Circuit?.circuitName,
        locality: race.Circuit?.Location?.locality,
        country: race.Circuit?.Location?.country,
        date: race.date,
      },
      sessionKey,
      isVerified: hasVerifiedTelemetry,
      dataSource: hasVerifiedTelemetry
        ? 'Official FIA / Pirelli Telemetry (OpenF1 Timing)'
        : 'Telemetry Unavailable for Session',
      maxLaps: totalRaceLaps,
      totalStops: totalStopsCount,
      stats,
      strategies,
    };

    memoryCache.set(cacheKey, { timestamp: now, data: responseData });

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error in tire strategy route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch tire strategy' },
      { status: 500 }
    );
  }
}
