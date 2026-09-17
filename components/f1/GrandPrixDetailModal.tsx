'use client';

import React, { useEffect } from 'react';
import { Race } from '@/lib/f1/types';
import { CIRCUIT_EXTRAS } from '@/lib/f1/teams';
import { generateGoogleCalendarUrl, downloadIcsFile } from '@/lib/f1/preferences';
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
  Flag,
  ArrowRight,
  Shield,
  Gauge,
  Trophy,
} from 'lucide-react';

interface GrandPrixDetailModalProps {
  race: Race | null;
  isOpen: boolean;
  onClose: () => void;
  useLocalTime: boolean;
  onViewResults?: (round: string) => void;
}

export default function GrandPrixDetailModal({
  race,
  isOpen,
  onClose,
  useLocalTime,
  onViewResults,
}: GrandPrixDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !race) return null;

  const now = new Date().getTime();
  const raceIso = race.time ? `${race.date}T${race.time}` : `${race.date}T13:00:00Z`;
  const isPast = new Date(raceIso).getTime() < now;

  const circuitId = race.Circuit?.circuitId || '';
  const circuitMeta = CIRCUIT_EXTRAS[circuitId] || {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.3,
    lapRecord: '1:28.000',
    recordHolder: 'Track Record',
    recordYear: '2024',
  };

  const estimatedLaps = Math.round(305 / circuitMeta.lengthKm);
  const totalDistanceKm = (estimatedLaps * circuitMeta.lengthKm).toFixed(1);

  const formatSession = (dateStr?: string, timeStr?: string) => {
    if (!dateStr) return 'TBA';
    const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T12:00:00Z`;
    const d = new Date(iso);
    if (useLocalTime) {
      return d.toLocaleTimeString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return `${dateStr} • ${timeStr ? timeStr.slice(0, 5) + ' UTC' : 'TBA'}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10 my-auto text-[var(--text-primary)]">
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-[var(--accent-f1-red)]"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-sm text-xs font-hud font-black uppercase tracking-wider bg-[var(--accent-f1-red)]/20 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/30">
                ROUND {race.round}
              </span>
              {isPast ? (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded-sm border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" />
                  COMPLETED GRAND PRIX
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/30 px-2 py-0.5 rounded-sm border border-amber-800/40">
                  <Calendar className="w-3 h-3" />
                  UPCOMING SESSION
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-hud font-black uppercase text-[var(--text-primary)] tracking-tight">
              {race.raceName}
            </h2>

            <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              <span>
                {race.Circuit.circuitName}, {race.Circuit.Location.locality},{' '}
                {race.Circuit.Location.country}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Circuit Specs Matrix */}
          <div>
            <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              Circuit Telemetry Specifications
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Circuit Length
                </div>
                <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-0.5">
                  {circuitMeta.lengthKm} KM
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Corners
                </div>
                <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-0.5">
                  {circuitMeta.corners} Turns
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  DRS Zones
                </div>
                <div className="font-hud font-black text-xl text-[var(--accent-f1-red)] font-mono-num mt-0.5">
                  {circuitMeta.drsZones} Zones
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-center">
                <div className="text-[10px] uppercase font-semibold text-[var(--text-muted)]">
                  Race Distance
                </div>
                <div className="font-hud font-black text-xl text-[var(--text-primary)] font-mono-num mt-0.5">
                  {estimatedLaps} Laps
                </div>
              </div>
            </div>

            {/* Lap Record Highlight */}
            <div className="mt-3 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-hud uppercase tracking-wider text-purple-300 font-bold">
                    Official All-Time Lap Record
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    Set by <span className="font-bold text-[var(--text-primary)]">{circuitMeta.recordHolder}</span> ({circuitMeta.recordYear})
                  </div>
                </div>
              </div>

              <div className="font-hud font-black text-lg sm:text-xl text-purple-400 font-mono-num">
                {circuitMeta.lapRecord}
              </div>
            </div>
          </div>

          {/* Full Weekend Timetable */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                Official Session Timetable
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <a
                  href={generateGoogleCalendarUrl(race, 'Grand Prix Race', race.date, race.time)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
                >
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Google Cal</span>
                </a>

                <button
                  onClick={() => downloadIcsFile(race, 'Grand Prix Race', race.date, race.time)}
                  className="px-2 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-[10px] uppercase flex items-center gap-1 transition-all cursor-pointer"
                  title="Download .ics calendar reminder with 30-minute pre-race alert"
                >
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Download .ICS (Alarm)</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] divide-y divide-[var(--border-subtle)] text-xs overflow-hidden">
              {race.FirstPractice && (
                <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                  <div className="font-medium text-[var(--text-secondary)]">Practice 1 (FP1)</div>
                  <div className="font-mono-num font-bold text-[var(--text-primary)]">
                    {formatSession(race.FirstPractice.date, race.FirstPractice.time)}
                  </div>
                </div>
              )}

              {race.SecondPractice && (
                <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                  <div className="font-medium text-[var(--text-secondary)]">Practice 2 (FP2)</div>
                  <div className="font-mono-num font-bold text-[var(--text-primary)]">
                    {formatSession(race.SecondPractice.date, race.SecondPractice.time)}
                  </div>
                </div>
              )}

              {race.ThirdPractice && (
                <div className="p-3 flex items-center justify-between hover:bg-[var(--bg-secondary)]/50">
                  <div className="font-medium text-[var(--text-secondary)]">Practice 3 (FP3)</div>
                  <div className="font-mono-num font-bold text-[var(--text-primary)]">
                    {formatSession(race.ThirdPractice.date, race.ThirdPractice.time)}
                  </div>
                </div>
              )}

              {race.SprintQualifying && (
                <div className="p-3 flex items-center justify-between bg-orange-950/15 text-orange-400">
                  <div className="font-bold">Sprint Shootout (Qualifying)</div>
                  <div className="font-mono-num font-bold">
                    {formatSession(race.SprintQualifying.date, race.SprintQualifying.time)}
                  </div>
                </div>
              )}

              {race.Sprint && (
                <div className="p-3 flex items-center justify-between bg-orange-950/25 text-orange-400">
                  <div className="font-bold">Sprint Race</div>
                  <div className="font-mono-num font-bold">
                    {formatSession(race.Sprint.date, race.Sprint.time)}
                  </div>
                </div>
              )}

              {race.Qualifying && (
                <div className="p-3 flex items-center justify-between bg-amber-950/15 text-amber-400">
                  <div className="font-bold">Grand Prix Qualifying</div>
                  <div className="font-mono-num font-black">
                    {formatSession(race.Qualifying.date, race.Qualifying.time)}
                  </div>
                </div>
              )}

              <div className="p-3.5 flex items-center justify-between bg-[var(--accent-f1-red)]/15 border-t border-[var(--accent-f1-red)]/30 text-[var(--accent-f1-red)]">
                <div className="font-hud font-black uppercase tracking-wider text-sm flex items-center gap-1.5">
                  <Flag className="w-4 h-4" />
                  MAIN GRAND PRIX RACE
                </div>
                <div className="font-mono-num font-black text-sm">
                  {formatSession(race.date, race.time)}
                </div>
              </div>
            </div>
          </div>

          {/* Circuit Characteristics & Fast Facts */}
          <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 text-xs">
            <h4 className="font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              Circuit Insights & Technical Characteristics
            </h4>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              {race.Circuit.circuitName} features {circuitMeta.corners} distinct corners spanning {circuitMeta.lengthKm} km of high-speed technical asphalt. Drivers experience intense lateral G-forces with {circuitMeta.drsZones} DRS overtaking zones designed for maximum wheel-to-wheel drama. Total Grand Prix distance spans approximately {totalDistanceKm} km.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-muted)] font-mono-num">
            Round {race.round} of 24 • FIA Formula 1 World Championship
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isPast && onViewResults && (
              <button
                onClick={() => {
                  onClose();
                  onViewResults(race.round);
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-sm bg-[var(--accent-f1-red)] text-white font-hud font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>INSPECT OFFICIAL CLASSIFICATION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              CLOSE DOSSIER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
