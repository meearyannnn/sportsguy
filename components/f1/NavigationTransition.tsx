'use client';

import React, { useState, useEffect } from 'react';

interface NavigationTransitionProps {
  isTransitioning: boolean;
  onTransitionComplete?: () => void;
}

/**
 * F1 Starting Lights Navigation Transition Loader
 * 
 * Rules:
 * 1. 5 small dots matching the app's accent red arranged horizontally.
 * 2. Sequential fill left-to-right over ~360ms.
 * 3. All extinguish simultaneously as the new page content fades in.
 * 4. Fast: total duration ~520ms max.
 * 5. Respects prefers-reduced-motion: instant cut without animation.
 */
export default function NavigationTransition({
  isTransitioning,
  onTransitionComplete,
}: NavigationTransitionProps) {
  const [litCount, setLitCount] = useState<number>(0);
  const [isExtinguished, setIsExtinguished] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!isTransitioning) {
      setIsVisible(false);
      setLitCount(0);
      setIsExtinguished(false);
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant transition without animation
      if (onTransitionComplete) {
        onTransitionComplete();
      }
      return;
    }

    setIsVisible(true);
    setLitCount(1);
    setIsExtinguished(false);

    // Light up 1..5 sequentially (85ms per step)
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setLitCount(2), 85));
    timers.push(setTimeout(() => setLitCount(3), 170));
    timers.push(setTimeout(() => setLitCount(4), 255));
    timers.push(setTimeout(() => setLitCount(5), 340));

    // Extinguish all 5 simultaneously
    timers.push(
      setTimeout(() => {
        setIsExtinguished(true);
      }, 420)
    );

    // Fade out overlay and complete
    timers.push(
      setTimeout(() => {
        setIsVisible(false);
        if (onTransitionComplete) {
          onTransitionComplete();
        }
      }, 520)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isTransitioning, onTransitionComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg-primary)]/90 backdrop-blur-sm transition-opacity duration-150 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-3">
        {/* Starting Gantry 5-light bar */}
        <div className="flex items-center gap-2.5 p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-xl">
          {[1, 2, 3, 4, 5].map((lightIdx) => {
            const isLit = !isExtinguished && litCount >= lightIdx;

            return (
              <div
                key={lightIdx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-100 ${
                  isLit
                    ? 'bg-[var(--accent-f1-red)] border-[#ff4d4d] shadow-[0_0_10px_rgba(225,6,0,0.8)] scale-105'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border-subtle)] scale-100'
                }`}
              />
            );
          })}
        </div>

        {/* Minimal Pit-Wall Radio Status */}
        <span className="font-hud font-bold text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          {isExtinguished ? 'LIGHTS OUT' : 'FORMATION LAP COMPLETE'}
        </span>
      </div>
    </div>
  );
}
