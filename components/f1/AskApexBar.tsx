'use client';

import React, { useState } from 'react';
import {
  queryApexIntelligence,
  AskApexResult,
} from '@/lib/f1/askApex';
import { DriverStanding, Race, RaceResult } from '@/lib/f1/types';
import {
  Search,
  Sparkles,
  ArrowRight,
  X,
  Radio,
  CornerDownLeft,
  Flame,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface AskApexBarProps {
  driverStandings: DriverStanding[];
  calendar: Race[];
  recentResults: RaceResult[];
  onNavigateTab: (tab: NavTab) => void;
  onSelectDriver: (driverId: string) => void;
}

export default function AskApexBar({
  driverStandings,
  calendar,
  recentResults,
  onNavigateTab,
  onSelectDriver,
}: AskApexBarProps) {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<AskApexResult | null>(null);

  const handleSearch = (qToRun?: string) => {
    const text = qToRun !== undefined ? qToRun : query;
    if (!text.trim()) return;

    const res = queryApexIntelligence(
      text,
      driverStandings,
      calendar,
      recentResults
    );
    setResult(res);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  const sampleQueries = [
    'Who is leading the championship?',
    'Who has the fastest pit stop?',
    'When is the next race?',
    'How is Leclerc performing this season?',
    'Fastest lap in pre-season testing?',
    'How many wins does Norris have?',
  ];

  return (
    <div className="w-full space-y-3">
      {/* Quick Ask Input Bar */}
      <div className="relative flex items-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus-within:border-[var(--accent-f1-red)] focus-within:ring-1 focus-within:ring-[var(--accent-f1-red)] transition-all shadow-sm">
        <div className="flex items-center gap-2 pl-3.5 text-[var(--accent-f1-red)]">
          <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
          <span className="hidden sm:inline font-hud font-black text-xs uppercase tracking-wider">
            ASK APEX:
          </span>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask telemetry: 'who is leading', 'fastest pit stop', 'next race', 'Norris wins'..."
          className="flex-1 py-2.5 px-3 bg-transparent text-xs font-mono-num text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none"
        />

        <div className="flex items-center gap-1.5 pr-2">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => handleSearch()}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent-f1-red)] hover:text-white text-[var(--text-secondary)] text-[11px] font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <span>Query</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      {!result && (
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          <span className="text-[var(--text-muted)] font-hud uppercase font-bold mr-1">
            Prompt Suggestions:
          </span>
          {sampleQueries.map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setQuery(sample);
                handleSearch(sample);
              }}
              className="px-2.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-mono-num"
            >
              {sample}
            </button>
          ))}
        </div>
      )}

      {/* Inline Compact Answer Card (Not a chat thread) */}
      {result && (
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 relative transition-all animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio
                className={`w-3.5 h-3.5 ${
                  result.isAnswered ? 'text-emerald-400' : 'text-amber-400'
                }`}
              />
              <span className="font-hud font-bold text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {result.headline}
              </span>
            </div>

            <button
              onClick={() => setResult(null)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[var(--text-primary)] leading-relaxed font-mono-num">
              {result.answer}
            </p>

            {result.highlightValue && (
              <div className="shrink-0 text-left sm:text-right p-2 sm:p-0 rounded bg-[var(--bg-tertiary)] sm:bg-transparent">
                <div className="font-hud font-black text-lg text-[var(--accent-f1-red)] leading-none">
                  {result.highlightValue}
                </div>
                {result.highlightLabel && (
                  <span className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase">
                    {result.highlightLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Link to Relevant View */}
          {result.isAnswered && (result.targetTab || result.targetDriverId) && (
            <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end">
              <button
                onClick={() => {
                  if (result.targetDriverId) {
                    onSelectDriver(result.targetDriverId);
                  } else if (result.targetTab) {
                    onNavigateTab(result.targetTab);
                  }
                  setResult(null);
                }}
                className="flex items-center gap-1.5 text-xs font-hud font-bold uppercase tracking-wider text-[var(--accent-f1-red)] hover:underline cursor-pointer"
              >
                <span>{result.actionText || 'Navigate to Telemetry'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
