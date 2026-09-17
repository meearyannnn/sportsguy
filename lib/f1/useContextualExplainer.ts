'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'apex_seen_concepts';

export function useContextualExplainer(conceptId: string) {
  const [hasSeen, setHasSeen] = useState<boolean>(true); // default true for SSR safety
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: string[] = stored ? JSON.parse(stored) : [];
      setHasSeen(parsed.includes(conceptId));
      setIsReady(true);
    } catch {
      setHasSeen(true);
      setIsReady(true);
    }
  }, [conceptId]);

  const dismiss = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: string[] = stored ? JSON.parse(stored) : [];
      if (!parsed.includes(conceptId)) {
        const next = [...parsed, conceptId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
      setHasSeen(true);
    } catch {
      setHasSeen(true);
    }
  }, [conceptId]);

  return {
    shouldShow: isReady && !hasSeen,
    dismiss,
  };
}

export function markConceptSeen(conceptId: string) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed: string[] = stored ? JSON.parse(stored) : [];
    if (!parsed.includes(conceptId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...parsed, conceptId]));
    }
  } catch {}
}
