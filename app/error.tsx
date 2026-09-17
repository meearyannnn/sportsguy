'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Diagnostic logging without leaking to end-user UI
    console.error('APEX Pit-Wall Telemetry Exception:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-5 shadow-2xl">
        {/* Error Beacon */}
        <div className="w-12 h-12 rounded-xl bg-[var(--accent-f1-red)]/10 border border-[var(--accent-f1-red)]/20 flex items-center justify-center mx-auto text-[var(--accent-f1-red)]">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-mono-num font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
            TELEMETRY FEED DEGRADED • PIT WALL COMMS ERROR
          </div>
          <h2 className="text-xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Telemetry Subsystem Interrupted
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Data link lost. Box, box. An unexpected telemetry stream failure was intercepted without corrupting your session state.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--accent-f1-red)] hover:bg-[#d90429] text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Telemetry Stream</span>
          </button>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Paddock</span>
          </button>
        </div>

        {error.digest && (
          <div className="pt-2 text-[10px] font-mono-num text-[var(--text-muted)]">
            Incident Hash: {error.digest.slice(0, 12)}
          </div>
        )}
      </div>
    </div>
  );
}
