'use client';

import { useState, useEffect } from 'react';

const LOW_DATA_STORAGE_KEY = 'apex_low_data_mode';

export interface AdaptiveTelemetryConfig {
  pollIntervalMs: number;
  isLowDataMode: boolean;
  setLowDataMode: (enabled: boolean) => void;
  isForeground: boolean;
  networkType: string;
}

export function useAdaptiveTelemetry(defaultIntervalMs: number = 2500): AdaptiveTelemetryConfig {
  const [isLowDataMode, setIsLowDataMode] = useState<boolean>(false);
  const [isForeground, setIsForeground] = useState<boolean>(true);
  const [networkType, setNetworkType] = useState<string>('wifi');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load saved low-data preference
    try {
      const stored = localStorage.getItem(LOW_DATA_STORAGE_KEY);
      if (stored !== null) {
        setIsLowDataMode(stored === 'true');
      }
    } catch {}

    // Track document visibility to pause polling on screen lock / tab switch
    const handleVisibilityChange = () => {
      setIsForeground(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Detect cellular or Save-Data header if available
    const nav = navigator as any;
    if (nav.connection) {
      if (nav.connection.saveData) {
        setIsLowDataMode(true);
      }
      if (nav.connection.effectiveType) {
        setNetworkType(nav.connection.effectiveType);
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setLowDataMode = (enabled: boolean) => {
    setIsLowDataMode(enabled);
    try {
      localStorage.setItem(LOW_DATA_STORAGE_KEY, String(enabled));
    } catch {}
  };

  // Compute adaptive interval
  let pollIntervalMs = defaultIntervalMs;

  if (!isForeground) {
    // Paused when backgrounded
    pollIntervalMs = 0;
  } else if (isLowDataMode || networkType === '2g' || networkType === '3g') {
    // Throttled to 8 seconds on slow connection or low data mode
    pollIntervalMs = 8000;
  } else if (networkType === '4g') {
    // 5 seconds on standard mobile 4G
    pollIntervalMs = 5000;
  } else {
    // 2.5 seconds on WiFi/Desktop
    pollIntervalMs = defaultIntervalMs;
  }

  return {
    pollIntervalMs,
    isLowDataMode,
    setLowDataMode,
    isForeground,
    networkType,
  };
}
