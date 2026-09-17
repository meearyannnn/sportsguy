'use client';

import React, { useState, useEffect } from 'react';
import { Race, RaceResult } from '@/lib/f1/types';
import { getRaceResults, getCalendar } from '@/lib/f1/jolpica';
import { getEraPointsSystem } from '@/lib/f1/analytics';
import { getTeamMeta } from '@/lib/f1/teams';
import {
  History,
  Calendar,
  Flag,
  Trophy,
  Scale,
  Zap,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
} from 'lucide-react';
import PaceTrace from '@/components/f1/PaceTrace';

interface HistoricalArchiveViewProps {
  onSelectDriver?: (driverId: string) => void;
}

export default function HistoricalArchiveView({ onSelectDriver }: HistoricalArchiveViewProps = {}) {
  const currentYear = 2026;
  // Generate historical seasons back to 1950
  const seasons = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => String(currentYear - i));

  const [selectedSeason, setSelectedSeason] = useState<string>('2024');
  const [seasonRaces, setSeasonRaces] = useState<Race[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('1');
  const [raceData, setRaceData] = useState<Race | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [normalizePoints, setNormalizePoints] = useState<boolean>(false);
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const era = getEraPointsSystem(parseInt(selectedSeason, 10) || 2024);

  // Load calendar for the chosen season
  useEffect(() => {
    let isMounted = true;
    const loadSeasonCalendar = async () => {
      setIsLoading(true);
      try {
        const cal = await getCalendar(selectedSeason);
        if (!isMounted) return;
        setSeasonRaces(cal);
        const firstRound = cal.length > 0 ? cal[0].round : '1';
        setSelectedRound(firstRound);
        
        // Load first round results
        const res = await getRaceResults(selectedSeason, firstRound);
        if (!isMounted) return;
        setRaceData(res.race);
        setResults(res.results);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadSeasonCalendar();
    return () => {
      isMounted = false;
    };
  }, [selectedSeason]);

  // When season changes: reset scroll position to top
  const handleSeasonChange = (season: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedSeason(season);
  };

  // When round changes
  const handleSelectRound = async (round: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedRound(round);
    setIsLoading(true);
    try {
      const res = await getRaceResults(selectedSeason, round);
      setRaceData(res.race);
      setResults(res.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Era Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>1950 – PRESENT FIA WORLD CHAMPIONSHIP ARCHIVE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Formula 1 Vault: {selectedSeason} Season
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Explore every official Grand Prix classification across 75+ years of motorsport history with era-aware scoring
          </p>
        </div>

        {/* Season & Round Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Season Selector */}
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] font-hud uppercase font-bold">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-hud font-bold text-sm focus:outline-none cursor-pointer"
            >
              {seasons.map((s) => (
                <option key={s} value={s} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  {s} Season
                </option>
              ))}
            </select>
          </div>

          {/* Grand Prix Round */}
          <div className="flex items-center gap-2 bg-[var(--bg-tertiary)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)] font-hud uppercase font-bold">Round:</span>
            <select
              value={selectedRound}
              onChange={(e) => handleSelectRound(e.target.value)}
              className="bg-transparent text-[var(--text-primary)] font-hud font-bold text-sm focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              {seasonRaces.map((r) => (
                <option key={r.round} value={r.round} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                  R{r.round}: {r.raceName}
                </option>
              ))}
            </select>
          </div>

          {/* Points Normalization Toggle */}
          <button
            onClick={() => setNormalizePoints(!normalizePoints)}
            className={`px-3 py-1.5 rounded-sm text-xs font-hud font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border ${
              normalizePoints
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-white'
            }`}
            title="Normalize vintage points to modern 25-point equivalency"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>{normalizePoints ? '25-PTS NORMALIZED' : 'ERA ORIGINAL PTS'}</span>
          </button>
        </div>
      </div>

      {/* Era Scoring Context Banner */}
      <div className="p-4 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] timing-tower-rail is-live flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="font-hud font-bold uppercase text-amber-400 tracking-wider">
              {era.eraLabel} ({era.yearRange})
            </span>
            <p className="text-[var(--text-secondary)] mt-0.5">{era.scoringRule}</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-[var(--text-muted)] uppercase block font-hud font-bold">Cross-Era Multiplier</span>
          <span className="font-mono-num font-bold text-[var(--text-primary)]">
            {era.multiplierToModern}x relative to 2010+
          </span>
        </div>
      </div>

      {/* Loading Indicator or Classification Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <Loader2 className="w-8 h-8 text-[var(--accent-f1-red)] animate-spin" />
          <span className="font-hud font-bold text-xs uppercase text-[var(--text-secondary)] tracking-wider">
            Fetching Historical Telemetry Archive...
          </span>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
          <History className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <h3 className="font-hud font-bold text-sm uppercase text-[var(--text-primary)]">
            Archive Record Unavailable for Round {selectedRound}
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            Try selecting an earlier or subsequent round in the {selectedSeason} championship season.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Race Header Pill */}
          <div className="flex items-center justify-between px-2 text-xs font-mono-num text-[var(--text-muted)]">
            <span>
              {raceData?.raceName} • {raceData?.Circuit.circuitName} ({raceData?.date})
            </span>
            <span>{results.length} Classified Starters</span>
          </div>

          {/* Mobile Accordion Card View (< sm) — Zero Horizontal Scroll */}
          <div className="sm:hidden border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)] overflow-hidden">
              {results.map((res) => {
                const team = getTeamMeta(res.Constructor?.constructorId || '');
                const gridPos = parseInt(res.grid, 10) || 0;
                const finishPos = parseInt(res.position, 10) || 0;
                const delta = gridPos > 0 && finishPos > 0 ? gridPos - finishPos : 0;
                const origPts = parseFloat(res.points) || 0;
                const displayPts = normalizePoints
                  ? (origPts * era.multiplierToModern).toFixed(1)
                  : res.points;
                const isExpanded = expandedDriverId === res.Driver.driverId;

                return (
                  <div key={res.Driver.driverId} className="flex flex-col">
                    <div
                      onClick={() => setExpandedDriverId(isExpanded ? null : res.Driver.driverId)}
                      className="p-3.5 min-h-[50px] flex items-center justify-between gap-3 hover:bg-[var(--bg-tertiary)] active:bg-[var(--bg-tertiary)] transition-colors cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-hud font-black text-sm w-5 text-center font-mono-num ${
                            finishPos === 1 ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {res.positionText || res.position}
                        </span>
                        <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                        <div className="min-w-0">
                          <div className="font-hud font-bold uppercase text-xs truncate text-[var(--text-primary)]">
                            {res.Driver.givenName} <span className="font-black">{res.Driver.familyName}</span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] truncate">{res.Constructor.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono-num">
                          <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[90px]">
                            {res.Time?.time || res.status}
                          </div>
                          <div className="text-[10px] text-[var(--accent-f1-red)] font-hud font-black">
                            {displayPts} PTS
                          </div>
                        </div>
                        <div className="text-[var(--text-muted)]">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Expanded Drawer */}
                    {isExpanded && (
                      <div className="bg-[var(--bg-primary)]/90 border-t border-[var(--border-subtle)] p-3 space-y-3 animate-fadeIn">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                              Grid Delta
                            </span>
                            <span className="font-mono-num font-bold text-sm">
                              {gridPos === 0 ? 'Pitlane' : `P${gridPos}`} → P{finishPos}{' '}
                              {delta > 0 ? (
                                <span className="text-emerald-400 text-xs">(+{delta})</span>
                              ) : delta < 0 ? (
                                <span className="text-rose-400 text-xs">({delta})</span>
                              ) : (
                                <span className="text-zinc-400 text-xs">(=)</span>
                              )}
                            </span>
                          </div>

                          <div className="p-2 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                            <span className="text-[10px] text-[var(--text-muted)] font-hud uppercase font-bold block">
                              Status
                            </span>
                            <span className="font-mono-num font-bold text-sm text-[var(--text-primary)]">
                              {res.status}
                            </span>
                          </div>
                        </div>

                        {onSelectDriver && (
                          <button
                            onClick={() => onSelectDriver(res.Driver.driverId)}
                            className="w-full min-h-[44px] py-2 px-3 rounded-lg bg-[var(--accent-f1-red)] text-white text-xs font-hud font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-opacity cursor-pointer"
                          >
                            <span>Open Driver Dossier</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Full Table View (>= sm) */}
            <div className="hidden sm:block overflow-x-auto rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
              <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)] font-hud uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">Pos</th>
                  <th className="py-3 px-3 w-12 text-center">No</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Chassis / Constructor</th>
                  <th className="py-3 px-3 text-center">Grid</th>
                  <th className="py-3 px-3 text-center">Gained</th>
                  <th className="py-3 px-4">Time / Status</th>
                  <th className="py-3 px-4 text-right">
                    {normalizePoints ? 'Normalized PTS (25-scale)' : 'Original PTS'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {results.map((res) => {
                  const team = getTeamMeta(res.Constructor?.constructorId || '');
                  const gridPos = parseInt(res.grid, 10) || 0;
                  const finishPos = parseInt(res.position, 10) || 0;
                  const delta = gridPos > 0 && finishPos > 0 ? gridPos - finishPos : 0;
                  const origPts = parseFloat(res.points) || 0;
                  const displayPts = normalizePoints
                    ? (origPts * era.multiplierToModern).toFixed(1)
                    : res.points;

                  return (
                    <tr
                      key={res.Driver.driverId}
                      onClick={() => onSelectDriver && onSelectDriver(res.Driver.driverId)}
                      className="hover:bg-[var(--bg-tertiary)] transition-colors group cursor-pointer"
                      title={`Click to view ${res.Driver.givenName} ${res.Driver.familyName} profile`}
                    >
                      <td className="py-3 px-4 text-center font-hud font-black text-sm sm:text-base font-mono-num">
                        <span
                          className={
                            finishPos === 1
                              ? 'text-[var(--accent-f1-red)] font-black'
                              : 'text-[var(--text-primary)]'
                          }
                        >
                          {res.positionText || res.position}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-hud font-bold font-mono-num text-[var(--text-secondary)]">
                        #{res.number}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 rounded-full shrink-0" style={{ backgroundColor: team.color }}></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-hud font-bold uppercase text-sm text-[var(--text-primary)] group-hover:text-white">
                                {res.Driver.givenName} <span className="font-black">{res.Driver.familyName}</span>
                              </span>
                              <PaceTrace driverId={res.Driver.driverId} width={34} height={10} />
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] block sm:hidden">
                              {res.Constructor.name}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell font-medium text-[var(--text-secondary)]">
                        {res.Constructor.name}
                      </td>

                      <td className="py-3 px-3 text-center font-mono-num text-[var(--text-muted)]">
                        {res.grid === '0' ? 'Pit' : `P${res.grid}`}
                      </td>

                      <td className="py-3 px-3 text-center font-mono-num font-bold">
                        {delta > 0 ? (
                          <span className="inline-flex items-center text-emerald-400 gap-0.5 text-[11px]">
                            <ArrowUp className="w-2.5 h-2.5" />+{delta}
                          </span>
                        ) : delta < 0 ? (
                          <span className="inline-flex items-center text-rose-400 gap-0.5 text-[11px]">
                            <ArrowDown className="w-2.5 h-2.5" />{delta}
                          </span>
                        ) : (
                          <Minus className="w-3 h-3 inline text-[var(--text-muted)]" />
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono-num text-[var(--text-secondary)]">
                        {res.Time?.time || res.status}
                      </td>

                      <td className="py-3 px-4 text-right font-hud font-black text-sm sm:text-base font-mono-num">
                        {origPts > 0 ? (
                          <span className={normalizePoints ? 'text-purple-400' : 'text-[var(--accent-f1-red)]'}>
                            +{displayPts}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
