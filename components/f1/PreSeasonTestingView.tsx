'use client';

import React, { useState } from 'react';
import {
  PRESEASON_TESTING_DATA,
  PreSeasonTestingDay,
  TestingLapEntry,
  TestingIncident,
} from '@/lib/f1/testingData';
import {
  Timer,
  AlertTriangle,
  Flag,
  Gauge,
  Layers,
  Zap,
  CheckCircle2,
  Radio,
  Sliders,
  Flame,
  Info,
} from 'lucide-react';

export default function PreSeasonTestingView() {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(2); // Default to Day 3 (fastest day)
  const currentDay: PreSeasonTestingDay = PRESEASON_TESTING_DATA.days[selectedDayIndex];

  // Compound color helper
  const getCompoundStyle = (compound: string) => {
    switch (compound) {
      case 'C1':
      case 'C2':
        return 'bg-white/10 text-white border-white/30';
      case 'C3':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'C4':
      case 'C5':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      default:
        return 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Prominent Pit-Wall Fuel-Load Caveat */}
      <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
              <Gauge className="w-4 h-4" />
              <span>OFFICIAL FORMULA 1 PRE-SEASON TESTING</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
              {PRESEASON_TESTING_DATA.season} Intelligence
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {PRESEASON_TESTING_DATA.venue}
            </p>
          </div>

          {/* Day Selector Pills */}
          <div className="flex items-center p-1 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-subtle)] self-start sm:self-auto">
            {PRESEASON_TESTING_DATA.days.map((dayObj, idx) => (
              <button
                key={dayObj.day}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-hud font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedDayIndex === idx
                    ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Day {dayObj.day}
              </button>
            ))}
          </div>
        </div>

        {/* Mandatory Transparency Disclaimer Warning Banner */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--bg-tertiary)]/70 border border-amber-500/30 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-hud font-black uppercase text-amber-400 text-[11px] tracking-wider">
              PROVISIONAL TELEMETRY CAVEAT • FUEL LOADS & ENGINE MODES UNDISCLOSED
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              {PRESEASON_TESTING_DATA.provisionalNotice}
            </p>
          </div>
        </div>
      </div>

      {/* Main Timing Tower & Incidents Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timing Sheet (8 Cols) */}
        <div className="lg:col-span-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-[var(--accent-f1-red)]" />
              <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                Day {currentDay.day} Classification ({currentDay.date})
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono-num text-[var(--text-muted)]">
              <span>Track: {currentDay.trackTemp}</span>
              <span>•</span>
              <span>Air: {currentDay.airTemp}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{currentDay.totalLapsCompleted} Total Laps</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-tertiary)]/50">
                  <th className="py-2.5 px-3 w-10 text-center">POS</th>
                  <th className="py-2.5 px-3">DRIVER</th>
                  <th className="py-2.5 px-3">TEAM</th>
                  <th className="py-2.5 px-3 text-center">TYRE</th>
                  <th className="py-2.5 px-3 text-center">LAPS</th>
                  <th className="py-2.5 px-3 text-right">BEST LAP</th>
                  <th className="py-2.5 px-3 text-right">GAP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {currentDay.entries.map((entry, idx) => (
                  <tr
                    key={entry.driverId}
                    className="hover:bg-[var(--bg-tertiary)]/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-hud font-bold text-xs">
                      {idx === 0 ? (
                        <span className="text-amber-400">P1</span>
                      ) : (
                        <span className="text-[var(--text-muted)]">P{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-hud font-black text-sm text-[var(--text-primary)]">
                        {entry.driverName}
                      </div>
                      <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                        {entry.session} Run
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[var(--text-secondary)]">
                      {entry.teamName}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono-num font-bold border ${getCompoundStyle(
                          entry.compound
                        )}`}
                      >
                        {entry.compound}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono-num font-bold text-[var(--text-primary)]">
                      {entry.laps}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num font-black text-sm text-[var(--text-primary)]">
                      {entry.bestLap}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-num text-xs text-[var(--text-muted)]">
                      {entry.gap === 'LEADER' ? (
                        <span className="text-amber-400 font-bold">BENCHMARK</span>
                      ) : (
                        entry.gap
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Mileage Leaderboard & Day Incident Log (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Team Mileage Table */}
          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                  Total Mileage (3 Days)
                </h3>
              </div>
              <span className="text-[10px] font-mono-num text-[var(--text-muted)]">DISTANCE</span>
            </div>

            <div className="space-y-2">
              {PRESEASON_TESTING_DATA.mileage.map((m, idx) => (
                <div
                  key={m.teamId}
                  className="p-2.5 rounded bg-[var(--bg-tertiary)]/50 border border-[var(--border-subtle)] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-hud font-bold text-[var(--text-muted)] text-[10px] w-4">
                        P{idx + 1}
                      </span>
                      <span className="font-hud font-bold text-[var(--text-primary)]">
                        {m.teamName}
                      </span>
                    </div>
                    <span className="font-mono-num font-black text-xs text-[var(--text-primary)]">
                      {m.laps} laps ({m.kilometers} km)
                    </span>
                  </div>

                  {/* Progress bar normalized to top team */}
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(m.laps / PRESEASON_TESTING_DATA.mileage[0].laps) * 100}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Day Incidents & Reliability Log */}
          <div className="rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <Radio className="w-4 h-4 text-red-400" />
              <h3 className="font-hud font-black text-sm uppercase tracking-wider text-[var(--text-primary)]">
                Day {currentDay.day} Incident Log
              </h3>
            </div>

            <div className="space-y-2.5">
              {currentDay.incidents.map((inc, i) => (
                <div
                  key={i}
                  className="p-3 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num font-bold text-[10px] text-[var(--text-muted)]">
                      {inc.time} LOCAL
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-hud font-bold uppercase tracking-wider ${
                        inc.type === 'RED_FLAG'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : inc.type === 'RELIABILITY'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      }`}
                    >
                      {inc.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h5 className="font-hud font-black text-xs text-[var(--text-primary)]">
                    {inc.headline}
                  </h5>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {inc.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
