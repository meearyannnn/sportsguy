/**
 * Timezone-Honest Scheduling Utility
 * Surfaces honest, plain-language inconvenience framing of race/session timings
 * based on user local clock rather than obscuring hostile air times.
 */

export type InconvenienceTier =
  | 'graveyard'
  | 'dawn'
  | 'breakfast'
  | 'workday'
  | 'prime'
  | 'latenight';

export interface HonestSessionTime {
  localTimeString: string;
  localDateString: string;
  localHours: number;
  localMinutes: number;
  tier: InconvenienceTier;
  badgeLabel: string;
  inconvenienceAdvice: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  isHostileHour: boolean;
}

export function evaluateHonestSessionTime(
  dateStr?: string,
  timeStr?: string
): HonestSessionTime | null {
  if (!dateStr) return null;

  try {
    const combined = timeStr ? `${dateStr}T${timeStr.replace('Z', '')}Z` : `${dateStr}T12:00:00Z`;
    const d = new Date(combined);
    if (isNaN(d.getTime())) return null;

    const localHours = d.getHours();
    const localMinutes = d.getMinutes();
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const formattedTime = d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const formattedDate = d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    let tier: InconvenienceTier = 'prime';
    let badgeLabel = 'Prime Watch';
    let inconvenienceAdvice = `Airs at ${formattedTime} your time — optimal evening watch.`;
    let badgeColor = 'text-emerald-400';
    let badgeBg = 'bg-emerald-400/10';
    let badgeBorder = 'border-emerald-400/30';
    let isHostileHour = false;

    if (localHours >= 0 && localHours < 5) {
      tier = 'graveyard';
      badgeLabel = 'Graveyard Shift';
      inconvenienceAdvice = `Airs at ${formattedTime} your time — set heavy alarms or catch Morning Digest.`;
      badgeColor = 'text-purple-400';
      badgeBg = 'bg-purple-400/10';
      badgeBorder = 'border-purple-400/30';
      isHostileHour = true;
    } else if (localHours >= 5 && localHours < 8) {
      tier = 'dawn';
      badgeLabel = 'Dawn Patrol';
      inconvenienceAdvice = `Airs at ${formattedTime} your time — sunrise start, heavy coffee recommended.`;
      badgeColor = 'text-amber-400';
      badgeBg = 'bg-amber-400/10';
      badgeBorder = 'border-amber-400/30';
      isHostileHour = true;
    } else if (localHours >= 8 && localHours < 10) {
      tier = 'breakfast';
      badgeLabel = 'Breakfast GP';
      inconvenienceAdvice = `Airs at ${formattedTime} your time — breakfast & morning lights out.`;
      badgeColor = 'text-sky-400';
      badgeBg = 'bg-sky-400/10';
      badgeBorder = 'border-sky-400/30';
      isHostileHour = false;
    } else if (localHours >= 10 && localHours < 17 && !isWeekend) {
      tier = 'workday';
      badgeLabel = 'Workday Conflict';
      inconvenienceAdvice = `Airs at ${formattedTime} your time during workday hours — desk stealth mode.`;
      badgeColor = 'text-orange-400';
      badgeBg = 'bg-orange-400/10';
      badgeBorder = 'border-orange-400/30';
      isHostileHour = true;
    } else if (localHours >= 22 || localHours < 0) {
      tier = 'latenight';
      badgeLabel = 'Late Night';
      inconvenienceAdvice = `Airs at ${formattedTime} your time — late finish past midnight.`;
      badgeColor = 'text-indigo-400';
      badgeBg = 'bg-indigo-400/10';
      badgeBorder = 'border-indigo-400/30';
      isHostileHour = false;
    }

    return {
      localTimeString: formattedTime,
      localDateString: formattedDate,
      localHours,
      localMinutes,
      tier,
      badgeLabel,
      inconvenienceAdvice,
      badgeColor,
      badgeBg,
      badgeBorder,
      isHostileHour,
    };
  } catch {
    return null;
  }
}
