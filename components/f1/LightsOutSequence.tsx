'use client';

import React, { useState, useEffect } from 'react';
import { playTelemetryTick } from '@/lib/f1/audio';

interface LightsOutSequenceProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function LightsOutSequence({
  isOpen,
  onComplete,
}: LightsOutSequenceProps) {
  // Step: 0 (dormant), 1..5 (illuminating), 6 (pause), 7 (extinguished/green)
  const [lightsCount, setLightsCount] = useState<number>(0);
  const [isExtinguished, setIsExtinguished] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setLightsCount(0);
      setIsExtinguished(false);
      return;
    }

    let isCancelled = false;

    // Sequence timing
    const stepInterval = 800; // 0.8s between each red light illuminating
    let currentStep = 0;

    const intervalId = setInterval(() => {
      if (isCancelled) return;
      currentStep++;
      if (currentStep <= 5) {
        setLightsCount(currentStep);
        playTelemetryTick();
      } else {
        clearInterval(intervalId);
        // Random pause between 0.8s and 1.4s, mimicking real FIA race starter
        const randomPause = 800 + Math.random() * 600;
        setTimeout(() => {
          if (isCancelled) return;
          setIsExtinguished(true);
          playTelemetryTick();
          // Auto close after celebrating moment
          setTimeout(() => {
            if (!isCancelled) {
              onComplete();
            }
          }, 1800);
        }, randomPause);
      }
    }, stepInterval);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity">
      <div className="flex flex-col items-center gap-6 p-8 max-w-lg w-full text-center">
        {/* FIA Starting Gantry */}
        <div className="p-4 sm:p-6 rounded bg-[#121214] border border-[#2A2A2D] shadow-2xl flex items-center gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5].map((gantryIdx) => {
            const isLit = !isExtinguished && lightsCount >= gantryIdx;

            return (
              <div
                key={gantryIdx}
                className="flex flex-col items-center gap-2 p-2 rounded bg-[#0A0A0C] border border-[#2A2A2D]"
              >
                {/* Double vertical light lamp */}
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border transition-all duration-150 ${
                    isLit
                      ? 'bg-[#E10600] border-[#FF3333] shadow-[0_0_16px_rgba(225,6,0,0.9)]'
                      : 'bg-[#1C1C1E] border-[#2A2A2D]'
                  }`}
                />
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border transition-all duration-150 ${
                    isLit
                      ? 'bg-[#E10600] border-[#FF3333] shadow-[0_0_16px_rgba(225,6,0,0.9)]'
                      : 'bg-[#1C1C1E] border-[#2A2A2D]'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Status Callout in Clipped Pit-Wall Typography */}
        <div className="space-y-2">
          {isExtinguished ? (
            <div className="animate-in fade-in zoom-in duration-200">
              <h2 className="text-2xl sm:text-4xl font-black font-hud tracking-tight uppercase text-emerald-400">
                LIGHTS OUT AND AWAY WE GO
              </h2>
              <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase tracking-wider mt-1">
                SESSION GREEN • RACING UNDERWAY • PIT CONFIRM
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl sm:text-2xl font-hud font-bold tracking-widest uppercase text-[var(--text-primary)]">
                FORMATION GRID COMPLETE
              </h2>
              <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase tracking-wider mt-1">
                STAND BY ON PIT WALL • GRID LIGHT SEQUENCE ARMED
              </p>
            </div>
          )}
        </div>

        {/* Skip button if user wants to bypass immediately */}
        <button
          onClick={onComplete}
          className="text-[11px] font-mono-num text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors cursor-pointer mt-4"
        >
          [ Dismiss Gantry ]
        </button>
      </div>
    </div>
  );
}
