import { getTeamMeta } from './teams';
import { Race } from './types';

export interface UserPreferences {
  favoriteDriverId: string;
  favoriteTeamId: string;
  useLocalTime: boolean;
  themeMode: 'dark' | 'light';
  savedComparisons: Array<[string, string]>;
}

const STORAGE_KEY = 'apex_f1_user_preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteDriverId: 'norris',
  favoriteTeamId: 'mclaren',
  useLocalTime: true,
  themeMode: 'dark',
  savedComparisons: [
    ['max_verstappen', 'norris'],
    ['leclerc', 'hamilton'],
  ],
};

export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load user preferences:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = loadUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Apply livery theme dynamically
    if (prefs.favoriteTeamId) {
      applyTeamLiveryTheme(prefs.favoriteTeamId);
    }

    return updated;
  } catch (e) {
    console.error('Failed to save user preferences:', e);
    return DEFAULT_PREFERENCES;
  }
}

export function applyTeamLiveryTheme(teamId: string): void {
  if (typeof document === 'undefined') return;
  const team = getTeamMeta(teamId);
  if (!team) return;

  const root = document.documentElement;
  root.style.setProperty('--accent-f1-red', team.color);
  root.style.setProperty('--accent-f1-red-glow', team.accentGlow);
}

// ==========================================
// CALENDAR REMINDERS & ICS GENERATOR
// ==========================================

export function generateGoogleCalendarUrl(
  race: Race,
  sessionName: string,
  dateStr?: string,
  timeStr?: string
): string {
  if (!dateStr) return '#';
  const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T13:00:00Z`;
  const startDate = new Date(iso);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration

  const formatGoogleTime = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const title = encodeURIComponent(`F1: ${race.raceName} — ${sessionName}`);
  const details = encodeURIComponent(
    `Formula 1 World Championship\nEvent: ${race.raceName}\nSession: ${sessionName}\nCircuit: ${race.Circuit.circuitName}\nLocation: ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`
  );
  const location = encodeURIComponent(`${race.Circuit.circuitName}, ${race.Circuit.Location.country}`);
  const dates = `${formatGoogleTime(startDate)}/${formatGoogleTime(endDate)}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(
  race: Race,
  sessionName: string,
  dateStr?: string,
  timeStr?: string
): void {
  if (typeof window === 'undefined' || !dateStr) return;
  const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T13:00:00Z`;
  const startDate = new Date(iso);
  const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

  const formatIcsTime = (d: Date) =>
    d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//APEX//Formula 1 Telemetry Hub//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:f1-${race.round}-${sessionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@apex.f1`,
    `DTSTAMP:${formatIcsTime(new Date())}`,
    `DTSTART:${formatIcsTime(startDate)}`,
    `DTEND:${formatIcsTime(endDate)}`,
    `SUMMARY:F1: ${race.raceName} - ${sessionName}`,
    `DESCRIPTION:Formula 1 World Championship: ${race.raceName} (${sessionName}) at ${race.Circuit.circuitName}.`,
    `LOCATION:${race.Circuit.circuitName}\\, ${race.Circuit.Location.country}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'DESCRIPTION:F1 Session starting in 30 minutes',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `F1_${race.round}_${race.Circuit.Location.locality}_${sessionName.replace(/\s+/g, '_')}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
