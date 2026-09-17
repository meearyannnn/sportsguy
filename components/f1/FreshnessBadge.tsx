'use client';

import React, { useState, useEffect } from 'react';

interface FreshnessBadgeProps {
  lastUpdated?: Date | number | string;
  cadence?: 'live' | 'periodic' | 'archive' | 'static';
  sourceLabel?: string;
  className?: string;
}

export default function FreshnessBadge({
  lastUpdated,
  cadence = 'periodic',
  sourceLabel,
  className = '',
}: FreshnessBadgeProps) {
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    // Refresh elapsed timer every 5 seconds
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute elapsed string
  const timestamp = lastUpdated ? new Date(lastUpdated).getTime() : now - 45000;
  const elapsedMs = Math.max(0, now - timestamp);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  let freshnessText = '';
  let dotColor = 'bg-emerald-400';

  if (cadence === 'live') {
    freshnessText = `Updated ${elapsedSeconds < 5 ? 'just now' : `${elapsedSeconds}s ago`}`;
    dotColor = 'bg-emerald-400 animate-pulse';
  } else if (cadence === 'periodic') {
    if (elapsedMinutes < 1) {
      freshnessText = `Updated ${elapsedSeconds}s ago`;
      dotColor = 'bg-emerald-400';
    } else if (elapsedMinutes < 10) {
      freshnessText = `Updated ${elapsedMinutes}m ago`;
      dotColor = 'bg-emerald-400';
    } else {
      freshnessText = `Updated ${elapsedMinutes}m ago`;
      dotColor = 'bg-amber-400';
    }
  } else if (cadence === 'archive') {
    freshnessText = 'FIA Official Archive';
    dotColor = 'bg-zinc-500';
  } else {
    freshnessText = 'Static Model Baseline';
    dotColor = 'bg-zinc-500';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-mono-num text-[10px] text-[var(--text-muted)] tracking-wide uppercase ${className}`}
      title={lastUpdated ? `Exact timestamp: ${new Date(timestamp).toLocaleTimeString()}` : undefined}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0`}></span>
      <span>{freshnessText}</span>
    </div>
  );
}
