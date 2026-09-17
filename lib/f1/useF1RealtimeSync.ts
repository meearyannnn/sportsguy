'use client';

import { useEffect, useRef } from 'react';

interface UseF1RealtimeSyncOptions {
  onSyncTelemetry: () => void;
  onSyncStandings: () => void;
  telemetryIntervalMs?: number;
  standingsIntervalMs?: number;
  enabled?: boolean;
}

export function useF1RealtimeSync({
  onSyncTelemetry,
  onSyncStandings,
  telemetryIntervalMs = 15000,
  standingsIntervalMs = 60000,
  enabled = true,
}: UseF1RealtimeSyncOptions) {
  const telemetryRef = useRef(onSyncTelemetry);
  const standingsRef = useRef(onSyncStandings);

  useEffect(() => {
    telemetryRef.current = onSyncTelemetry;
    standingsRef.current = onSyncStandings;
  });

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    let telemetryTimer: NodeJS.Timeout | null = null;
    let standingsTimer: NodeJS.Timeout | null = null;

    const startTimers = () => {
      if (document.visibilityState === 'hidden') return;

      if (!telemetryTimer && telemetryIntervalMs > 0) {
        telemetryTimer = setInterval(() => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            telemetryRef.current();
          }
        }, telemetryIntervalMs);
      }

      if (!standingsTimer && standingsIntervalMs > 0) {
        standingsTimer = setInterval(() => {
          if (document.visibilityState === 'visible' && navigator.onLine) {
            standingsRef.current();
          }
        }, standingsIntervalMs);
      }
    };

    const stopTimers = () => {
      if (telemetryTimer) {
        clearInterval(telemetryTimer);
        telemetryTimer = null;
      }
      if (standingsTimer) {
        clearInterval(standingsTimer);
        standingsTimer = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Trigger immediate light sync when user switches back to tab
        telemetryRef.current();
        startTimers();
      } else {
        stopTimers();
      }
    };

    startTimers();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', startTimers);
    window.addEventListener('offline', stopTimers);

    return () => {
      stopTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', startTimers);
      window.removeEventListener('offline', stopTimers);
    };
  }, [enabled, telemetryIntervalMs, standingsIntervalMs]);
}
