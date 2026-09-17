'use client';

import React from 'react';
import { Gauge, ShieldAlert } from 'lucide-react';

export default function PreSeasonTestingView() {
  return (
    <div className="space-y-6">
      <div className="p-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
            <Gauge className="w-4 h-4" />
            <span>PRE-SEASON TESTING MODULE • STANDBY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Live Testing Feed Not Connected
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Pre-season testing telemetry feeds activate automatically during official FIA winter testing windows. Static simulated lap benchmark datasets have been removed in compliance with our strict telemetry accuracy policy.
          </p>
        </div>

        <div className="pt-2 text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
          DATA PROVENANCE POLICY • ONLY REAL VERIFIED API FEEDS ARE SERVED
        </div>
      </div>
    </div>
  );
}
