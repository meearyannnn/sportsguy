import { DriverCareerProfile, DriverSeasonEntry, getDriverProfile } from './driverCareer';
import { DRIVER_DETAILS, getTeamMeta } from './teams';

export interface MilestoneNotch {
  season: number;
  angleDeg: number;
  type: 'FIRST_WIN' | 'CHAMPIONSHIP' | 'FIRST_PODIUM';
  label: string;
}

export interface RadialPetal {
  season: number;
  teamId: string;
  teamColor: string;
  points: number;
  wins: number;
  podiums: number;
  normalizedRadius: number; // 0 to 1
  angleDeg: number;
  x: number;
  y: number;
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
}

export interface GenerativeIdentityData {
  driverId: string;
  fullName: string;
  code: string;
  permanentNumber: number;
  careerSpan: string;
  totalSeasons: number;
  consistencyScore: number; // 0 (volatile) to 1 (metronomic)
  winRate: number; // 0 to 1
  podiumRate: number; // 0 to 1
  totalWins: number;
  championships: number;
  petals: RadialPetal[];
  milestones: MilestoneNotch[];
  pathData: string;
  innerPathData: string;
  colorSegments: Array<{
    teamColor: string;
    teamName: string;
    startAngle: number;
    endAngle: number;
    seasonsCount: number;
  }>;
}

// In-memory cache for fast, deterministic reuse
const identityCache = new Map<string, GenerativeIdentityData>();

/**
 * Deterministically compute a driver's generative radial identity signature
 */
export function computeDriverIdentity(profile: DriverCareerProfile): GenerativeIdentityData {
  if (identityCache.has(profile.driverId)) {
    return identityCache.get(profile.driverId)!;
  }

  const timeline = profile.timeline && profile.timeline.length > 0 ? profile.timeline : [];
  const careerTotals = profile.careerTotals;

  // 1. Calculate Seasons & Petals
  // If career has fewer than 3 recorded seasons (rookie or historical single season),
  // create synthetic segmented lobes based on race entries to ensure rich geometry.
  let seasonData: Array<{
    season: number;
    teamId: string;
    teamName: string;
    teamColor: string;
    points: number;
    wins: number;
    podiums: number;
    championshipPosition: number;
  }> = [];

  if (timeline.length >= 3) {
    seasonData = timeline.map((t) => ({
      season: t.season,
      teamId: t.teamId,
      teamName: t.teamName,
      teamColor: t.teamColor || '#E10600',
      points: t.points,
      wins: t.wins,
      podiums: t.podiums,
      championshipPosition: t.championshipPosition,
    }));
  } else if (timeline.length > 0) {
    // Expand single or 2 seasons into minimum 4 sectors across rounds
    const baseEntry = timeline[0];
    const lobes = 4;
    for (let i = 0; i < lobes; i++) {
      seasonData.push({
        season: baseEntry.season,
        teamId: baseEntry.teamId,
        teamName: baseEntry.teamName,
        teamColor: baseEntry.teamColor || '#E10600',
        points: Math.max(10, Math.round((baseEntry.points / lobes) * (0.8 + i * 0.15))),
        wins: Math.floor(baseEntry.wins / lobes),
        podiums: Math.floor(baseEntry.podiums / lobes),
        championshipPosition: baseEntry.championshipPosition,
      });
    }
  } else {
    // Graceful fallback for minimal records
    const defaultColor = profile.teamColor || '#E10600';
    for (let i = 0; i < 5; i++) {
      seasonData.push({
        season: 2024 - (4 - i),
        teamId: 'f1',
        teamName: 'Formula 1',
        teamColor: defaultColor,
        points: 25 * (i + 1),
        wins: 0,
        podiums: 0,
        championshipPosition: 10,
      });
    }
  }

  const N = seasonData.length;
  const maxPoints = Math.max(...seasonData.map((s) => s.points), 50);

  // 2. Consistency Score (Inverse of finishing/standing variance)
  // Highly consistent drivers (low variance in positions) approach 0.9. Volatile approach 0.2.
  const positions = seasonData.map((s) => Math.min(20, Math.max(1, s.championshipPosition || 10)));
  const meanPos = positions.reduce((a, b) => a + b, 0) / positions.length;
  const variance =
    positions.reduce((acc, p) => acc + Math.pow(p - meanPos, 2), 0) / positions.length;
  const consistencyScore = Math.max(0.15, Math.min(0.95, 1 - Math.sqrt(variance) / 12));

  // 3. Polar to Cartesian generator
  const center = 100; // viewBox 200x200
  const minR = 32;    // inner base radius
  const maxR = 86;    // outer max radius

  const petals: RadialPetal[] = [];
  const milestones: MilestoneNotch[] = [];

  let hasFoundFirstWin = false;

  for (let i = 0; i < N; i++) {
    const s = seasonData[i];
    const angleDeg = (i / N) * 360 - 90; // Start 12 o'clock
    const angleRad = (angleDeg * Math.PI) / 180;

    // Radius proportional to points scored that season
    const normalizedPoints = Math.min(1, Math.max(0.15, s.points / maxPoints));
    const r = minR + normalizedPoints * (maxR - minR);

    const x = center + r * Math.cos(angleRad);
    const y = center + r * Math.sin(angleRad);

    // Control points for cubic bezier spline based on consistency
    // Higher consistency = smoother tangential control points
    // Lower consistency = acute, tighter spiky teeth
    const tension = consistencyScore * 0.45;
    const tangentAngle = angleRad + Math.PI / 2;
    const cpDist = (2 * Math.PI * r * tension) / N;

    const cp1x = x - cpDist * Math.cos(tangentAngle);
    const cp1y = y - cpDist * Math.sin(tangentAngle);
    const cp2x = x + cpDist * Math.cos(tangentAngle);
    const cp2y = y + cpDist * Math.sin(tangentAngle);

    petals.push({
      season: s.season,
      teamId: s.teamId,
      teamColor: s.teamColor,
      points: s.points,
      wins: s.wins,
      podiums: s.podiums,
      normalizedRadius: normalizedPoints,
      angleDeg,
      x,
      y,
      cp1x,
      cp1y,
      cp2x,
      cp2y,
    });

    // Milestones detection
    if (s.championshipPosition === 1) {
      milestones.push({
        season: s.season,
        angleDeg,
        type: 'CHAMPIONSHIP',
        label: `${s.season} World Champion`,
      });
    } else if (s.wins > 0 && !hasFoundFirstWin) {
      hasFoundFirstWin = true;
      milestones.push({
        season: s.season,
        angleDeg,
        type: 'FIRST_WIN',
        label: `${s.season} Maiden Victory`,
      });
    }
  }

  // 4. Generate closed SVG Path String
  let pathData = '';
  if (petals.length > 0) {
    pathData = `M ${petals[0].x.toFixed(2)} ${petals[0].y.toFixed(2)} `;
    for (let i = 0; i < N; i++) {
      const current = petals[i];
      const next = petals[(i + 1) % N];

      if (consistencyScore > 0.45) {
        // Smooth spline
        pathData += `C ${current.cp2x.toFixed(2)} ${current.cp2y.toFixed(2)}, ${next.cp1x.toFixed(
          2
        )} ${next.cp1y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
      } else {
        // Jagged chiseled teeth for volatile performance
        pathData += `L ${next.x.toFixed(2)} ${next.y.toFixed(2)} `;
      }
    }
    pathData += 'Z';
  }

  // Inner hub baseline ring
  let innerPathData = '';
  if (petals.length > 0) {
    const innerPetals = petals.map((p) => {
      const rad = (p.angleDeg * Math.PI) / 180;
      return {
        x: center + (minR - 4) * Math.cos(rad),
        y: center + (minR - 4) * Math.sin(rad),
      };
    });
    innerPathData = `M ${innerPetals[0].x.toFixed(2)} ${innerPetals[0].y.toFixed(2)} `;
    for (let i = 1; i < innerPetals.length; i++) {
      innerPathData += `L ${innerPetals[i].x.toFixed(2)} ${innerPetals[i].y.toFixed(2)} `;
    }
    innerPathData += 'Z';
  }

  // 5. Color banding around the ring (Teams career history)
  const colorSegments: Array<{
    teamColor: string;
    teamName: string;
    startAngle: number;
    endAngle: number;
    seasonsCount: number;
  }> = [];

  let currentGroup: {
    teamColor: string;
    teamName: string;
    startIdx: number;
    count: number;
  } | null = null;

  for (let i = 0; i < N; i++) {
    const s = seasonData[i];
    if (!currentGroup || currentGroup.teamColor !== s.teamColor) {
      if (currentGroup) {
        const startAngle = (currentGroup.startIdx / N) * 360 - 90;
        const endAngle = ((currentGroup.startIdx + currentGroup.count) / N) * 360 - 90;
        colorSegments.push({
          teamColor: currentGroup.teamColor,
          teamName: currentGroup.teamName,
          startAngle,
          endAngle,
          seasonsCount: currentGroup.count,
        });
      }
      currentGroup = {
        teamColor: s.teamColor,
        teamName: s.teamName,
        startIdx: i,
        count: 1,
      };
    } else {
      currentGroup.count++;
    }
  }

  if (currentGroup) {
    const startAngle = (currentGroup.startIdx / N) * 360 - 90;
    const endAngle = ((currentGroup.startIdx + currentGroup.count) / N) * 360 - 90;
    colorSegments.push({
      teamColor: currentGroup.teamColor,
      teamName: currentGroup.teamName,
      startAngle,
      endAngle,
      seasonsCount: currentGroup.count,
    });
  }

  const result: GenerativeIdentityData = {
    driverId: profile.driverId,
    fullName: profile.fullName || `${profile.givenName} ${profile.familyName}`,
    code: profile.code,
    permanentNumber: profile.permanentNumber,
    careerSpan: profile.careerSpan,
    totalSeasons: N,
    consistencyScore,
    winRate: careerTotals.winRatePercent / 100,
    podiumRate: careerTotals.podiumRatePercent / 100,
    totalWins: careerTotals.wins,
    championships: profile.championships,
    petals,
    milestones,
    pathData,
    innerPathData,
    colorSegments,
  };

  identityCache.set(profile.driverId, result);
  return result;
}

/**
 * Helper to compute an SVG arc path between two angles
 */
export function describeSvgArc(
  x: number,
  y: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  const startX = x + radius * Math.cos(startRad);
  const startY = y + radius * Math.sin(startRad);
  const endX = x + radius * Math.cos(endRad);
  const endY = y + radius * Math.sin(endRad);

  const angleDelta = endAngleDeg - startAngleDeg;
  const largeArcFlag = angleDelta > 180 ? 1 : 0;

  return `M ${startX.toFixed(2)} ${startY.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX.toFixed(
    2
  )} ${endY.toFixed(2)}`;
}
