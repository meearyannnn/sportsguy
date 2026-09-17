'use client';

import React, { useState, useEffect } from 'react';
import { getPitStops, ErgastPitStop, getAllDrivers } from '@/lib/f1/jolpica';
import { Wrench, Timer, RefreshCw, ShieldAlert } from 'lucide-react';

interface PitCrewLeaderboardProps {
  onSelectDriver?: (driverId: string) => void;
}

export default function PitCrewLeaderboard({ onSelectDriver }: PitCrewLeaderboardProps = {}) {
  const [pitStops, setPitStops] = useState<ErgastPitStop[]>([]);
  const [driverMap, setDriverMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRealPitStops() {
      setIsLoading(true);
      try {
        const [stops, drivers] = await Promise.all([
          getPitStops('current', 'last'),
          getAllDrivers('current'),
        ]);

        const map: Record<string, string> = {};
        if (Array.isArray(drivers)) {
          drivers.forEach((d) => {
            map[d.driverId] = `${d.givenName} ${d.familyName}`;
          });
        }
        setDriverMap(map);
        setPitStops(stops || []);
      } catch {
        setPitStops([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRealPitStops();
  }, []);

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
        <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
          <Wrench className="w-4 h-4" />
          <span>OFFICIAL PIT STOP TELEMETRY INTELLIGENCE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
          Pit Crew Telemetry & Stationary Times
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Official stationary pit stop durations sourced directly from FIA Ergast timing feeds.
        </p>
      </div>

      {isLoading ? (
        <div className="p-8 text-center bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl space-y-3 animate-pulse">
          <RefreshCw className="w-6 h-6 text-[var(--accent-f1-red)] animate-spin mx-auto" />
          <p className="text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
            Synchronizing Pit Lane Telemetry...
          </p>
        </div>
      ) : pitStops.length > 0 ? (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)] flex items-center justify-between">
            <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Latest Grand Prix Pit Stop Records
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              DATA PROVENANCE • JOLPICA F1 API
            </span>
          </div>
          <div className="divide-y divide-[var(--border-subtle)]">
            {pitStops.map((ps, idx) => {
              const driverName = driverMap[ps.driverId] || ps.driverId.toUpperCase();
              return (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-[var(--text-muted)] font-bold">#{ps.stop}</span>
                    <span className="font-hud font-bold uppercase text-[var(--text-primary)]">
                      {driverName}
                    </span>
                    <span className="text-[var(--text-muted)]">Lap {ps.lap}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-hud font-bold text-sm text-[var(--text-primary)]">
                      {ps.duration}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-hud font-bold uppercase text-[var(--text-primary)]">
            Pit Stop Telemetry Synchronizing
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            Pit stop stationary timing data is fetched live from official Ergast feeds upon session completion.
          </p>
        </div>
      )}
    </div>
  );
}

