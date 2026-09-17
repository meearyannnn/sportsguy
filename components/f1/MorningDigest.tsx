'use client';

import React from 'react';
import { Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';
import { RaceResult } from '@/lib/f1/types';

interface MorningDigestProps {
  raceName?: string;
  circuitName?: string;
  results?: RaceResult[];
  onViewResults?: () => void;
}

export default function MorningDigest({
  raceName,
  circuitName,
  results = [],
  onViewResults,
}: MorningDigestProps) {
  const displayRaceName = raceName || 'Most Recent Grand Prix';
  const displayCircuitName = circuitName || 'Official FIA Circuit';

  // Derive top 3 from actual fetched race results
  const top3 = results.slice(0, 3).map((r, i) => ({
    pos: r.position || String(i + 1),
    driver: `${r.Driver?.givenName || ''} ${r.Driver?.familyName || ''}`.trim(),
    team: r.Constructor?.name || 'F1 Team',
    gap: i === 0 ? 'WINNER' : r.Time?.time || `P${r.position}`,
  }));

  const hasResults = top3.length > 0 && top3[0].driver.length > 0;

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent-f1-red)]/10 border border-[var(--accent-f1-red)]/30 flex items-center justify-center text-[var(--accent-f1-red)] shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-black text-xs uppercase tracking-wider text-[var(--accent-f1-red)]">
                POST-RACE DEBRIEF
              </span>
              <span className="text-[10px] font-mono-num px-1.5 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                OFFICIAL CLASSIFICATION
              </span>
            </div>
            <h4 className="font-hud font-black text-base uppercase text-[var(--text-primary)]">
              {displayRaceName} • Race Summary & Podium
            </h4>
          </div>
        </div>

        {onViewResults && (
          <button
            onClick={onViewResults}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>INSPECT CLASSIFICATION</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
          <span className="font-bold text-[var(--text-primary)] font-hud uppercase">
            Circuit Summary:
          </span>{' '}
          Official post-race classification and podium finish for the {displayRaceName} at {displayCircuitName}.
        </div>

        {/* Podium Area */}
        <div className="rounded-xl border border-[var(--border-subtle)] p-4 bg-[var(--bg-primary)] space-y-2.5">
          <div className="text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
            <span>Official Podium Classification</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              FIA Confirmed
            </span>
          </div>

          {hasResults ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {top3.map((entry, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    idx === 0
                      ? 'border-amber-500/40 bg-amber-500/10'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono-num font-bold">
                    <span
                      className={`font-black ${
                        idx === 0
                          ? 'text-amber-400'
                          : idx === 1
                          ? 'text-zinc-300'
                          : 'text-amber-600'
                      }`}
                    >
                      P{entry.pos}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">{entry.gap}</span>
                  </div>
                  <div className="font-hud font-black text-sm uppercase text-[var(--text-primary)] mt-1 truncate">
                    {entry.driver}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">
                    {entry.team}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-mono-num text-[var(--text-muted)]">
              Loading official race classification...
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] font-mono-num text-[var(--text-muted)]">
            Full timing sheets, overtakes & pit telemetry available
          </span>
          {onViewResults && (
            <button
              onClick={onViewResults}
              className="font-hud font-bold text-xs uppercase tracking-wider text-[var(--accent-f1-red)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>INSPECT FULL CLASSIFICATION</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

