'use client';

import React from 'react';
import { RefreshCw, Radio } from 'lucide-react';

/**
 * Timing Leaderboard Skeleton Loader
 * Sized and shaped exactly like the 10 real timing leaderboard rows.
 */
export function TimingLeaderboardSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)] animate-pulse" />
          <span>LOADING STANDINGS DATA</span>
        </span>
        <span className="font-mono-num text-[10px]">PLEASE WAIT</span>
      </div>

      {/* 10 Precision Timing Rows */}
      <div className="space-y-1.5 animate-pulse">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 sm:p-2.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] gap-2"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="font-mono-num text-xs w-4 text-center text-[var(--text-muted)]">
                {idx + 1}
              </span>
              <div className="w-1 h-5 rounded-full bg-[var(--border-subtle)]" />
              <div className="w-8 h-4 rounded bg-[var(--bg-tertiary)]" />
              <div className="h-4 w-28 sm:w-36 rounded bg-[var(--bg-tertiary)]" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]" />
              <div className="w-16 h-4 rounded bg-[var(--bg-tertiary)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stat Tiles Skeleton Loader
 * Equal 3-column grid shaped like Speed, Gear, and Power Unit tiles.
 */
export function StatTilesSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 animate-pulse text-center">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-3.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex flex-col items-center justify-between h-24"
        >
          <div className="h-2.5 w-16 bg-[var(--bg-tertiary)] rounded" />
          <div className="h-8 w-14 bg-[var(--bg-tertiary)] rounded my-1" />
          <div className="h-2 w-10 bg-[var(--bg-tertiary)] rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Custom Empty State: Flatline Telemetry Trace
 * Used when no session is live. Uses the app's own timing visual language.
 */
export function TelemetryEmptyState({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  return (
    <div className="p-8 sm:p-12 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col items-center text-center space-y-4">
      {/* Flatline Trace Graphic */}
      <div className="w-full max-w-md h-16 relative flex items-center justify-center">
        <svg
          viewBox="0 0 400 60"
          className="w-full h-full text-[var(--border-subtle)] stroke-current"
          fill="none"
          strokeWidth="2"
        >
          {/* Flat horizontal baseline running dead straight */}
          <line x1="10" y1="30" x2="390" y2="30" strokeDasharray="4 4" />
          {/* Signal dead flat cursor */}
          <circle cx="200" cy="30" r="4" fill="var(--text-muted)" />
        </svg>
      </div>

      {/* Ghosted Timing Screen Row */}
      <div className="w-full max-w-sm p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono-num text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span>P1</span>
          <span className="text-[var(--border-subtle)]">•</span>
          <span>CAR #—</span>
        </div>
        <div>GAP: —.———</div>
      </div>

      {/* Radio Phrasing */}
      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-hud font-black uppercase tracking-wider text-[var(--text-primary)]">
          NO SESSION LIVE RIGHT NOW
        </h3>
        <p className="text-xs font-mono-num text-[var(--text-muted)] max-w-md uppercase tracking-wider">
          No live track action at this moment • Standing by for next Grand Prix session
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-3.5 py-1.5 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      )}
    </div>
  );
}

/**
 * Custom Error State: Connection Loss
 */
export function TelemetryErrorState({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <div className="p-8 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col items-center text-center space-y-4">
      {/* Interrupted trace icon */}
      <div className="w-12 h-12 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-f1-red)]">
        <Radio className="w-6 h-6 animate-pulse" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base sm:text-lg font-hud font-black uppercase tracking-wider text-[var(--text-primary)]">
          DATA TEMPORARILY UNUSUABLE
        </h3>
        <p className="text-xs font-mono-num text-[var(--text-muted)] max-w-md uppercase tracking-wider">
          Unable to connect to live feed • Click below to try again
        </p>
      </div>

      <button
        onClick={onRetry}
        className="px-4 py-2 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--accent-f1-red)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] hover:text-white border border-[var(--border-subtle)] transition-colors cursor-pointer flex items-center gap-2"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
