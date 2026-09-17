'use client';

import React, { useState, useEffect } from 'react';
import { OpenF1Session, OpenF1Interval } from '@/lib/f1/types';
import { Maximize2, Minimize2, X, Radio, ChevronRight, ChevronLeft } from 'lucide-react';

interface GlanceModeProps {
  session: OpenF1Session | null;
  intervals?: OpenF1Interval[];
  onClose?: () => void;
  isStandalone?: boolean;
}

interface GlanceDriver {
  pos: number;
  code: string;
  name: string;
  gap: string;
  interval: string;
  tyre: 'S' | 'M' | 'H' | 'I' | 'W';
  tyreLaps: number;
  teamColor: string;
  teamName: string;
}

const DEFAULT_DRIVERS: GlanceDriver[] = [
  { pos: 1, code: 'VER', name: 'Max Verstappen', gap: 'LEADER', interval: '—', tyre: 'M', tyreLaps: 16, teamColor: '#3671C6', teamName: 'Red Bull Racing' },
  { pos: 2, code: 'NOR', name: 'Lando Norris', gap: '+1.428s', interval: '+1.428s', tyre: 'H', tyreLaps: 22, teamColor: '#FF8000', teamName: 'McLaren' },
  { pos: 3, code: 'LEC', name: 'Charles Leclerc', gap: '+3.180s', interval: '+1.752s', tyre: 'M', tyreLaps: 14, teamColor: '#E8002D', teamName: 'Ferrari' },
  { pos: 4, code: 'HAM', name: 'Lewis Hamilton', gap: '+5.640s', interval: '+2.460s', tyre: 'H', tyreLaps: 21, teamColor: '#E8002D', teamName: 'Ferrari' },
  { pos: 5, code: 'PIA', name: 'Oscar Piastri', gap: '+7.112s', interval: '+1.472s', tyre: 'M', tyreLaps: 18, teamColor: '#FF8000', teamName: 'McLaren' },
  { pos: 6, code: 'RUS', name: 'George Russell', gap: '+9.845s', interval: '+2.733s', tyre: 'S', tyreLaps: 9, teamColor: '#27F4D2', teamName: 'Mercedes' },
];

export default function GlanceMode({
  session,
  intervals = [],
  onClose,
  isStandalone = false,
}: GlanceModeProps) {
  const [driverIndex, setDriverIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Map intervals to driver view models if present
  const drivers: GlanceDriver[] = intervals.length > 0
    ? intervals.map((inv, idx) => ({
        pos: idx + 1,
        code: `D${inv.driver_number}`,
        name: `Driver #${inv.driver_number}`,
        gap: inv.gap_to_leader === 0 || inv.gap_to_leader === null ? 'LEADER' : `+${inv.gap_to_leader.toFixed(3)}s`,
        interval: inv.interval ? `+${inv.interval.toFixed(3)}s` : '—',
        tyre: 'M',
        tyreLaps: 0,
        teamColor: '#E8002D',
        teamName: 'F1 Team',
      }))
    : [];

  const activeDriver = drivers[driverIndex] || null;

  // Keyboard navigation & escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (drivers.length > 0 && (e.key === 'ArrowRight' || e.key === ' ')) {
        setDriverIndex((prev) => (prev + 1) % drivers.length);
      } else if (drivers.length > 0 && e.key === 'ArrowLeft') {
        setDriverIndex((prev) => (prev - 1 + drivers.length) % drivers.length);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, drivers.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0C0C0E] text-[#EDEDED] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden transition-colors ${
        isStandalone ? 'min-h-screen' : ''
      }`}
    >
      {/* Top Header Bar: Quiet Status + Exit / Fullscreen */}
      <div className="flex items-center justify-between text-xs font-mono-num text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="font-hud font-bold uppercase tracking-widest text-zinc-400 text-[11px]">
              GLANCE MODE
            </span>
          </div>
          <span className="text-zinc-700">/</span>
          <span className="uppercase text-zinc-400 font-hud">
            {session?.circuit_short_name || 'F1 SESSION'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleFullscreen}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded hover:bg-zinc-800/60"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1 rounded border border-zinc-800 hover:border-zinc-600 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-hud font-bold text-xs uppercase"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit (Esc)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      {activeDriver ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
          <div className="flex items-baseline justify-center gap-3 sm:gap-6">
            <span className="font-hud font-black text-6xl sm:text-8xl md:text-9xl tracking-tight opacity-40 font-mono-num text-red-500">
              P{activeDriver.pos}
            </span>
            <span className="font-hud font-black text-7xl sm:text-9xl md:text-[13rem] tracking-tighter leading-none text-white drop-shadow-2xl">
              {activeDriver.code}
            </span>
          </div>

          <div className="mt-6 sm:mt-10">
            <div className="text-4xl sm:text-6xl md:text-7xl font-mono-num font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
              {activeDriver.pos === 1 ? (
                <span className="text-emerald-400 font-hud tracking-wide font-black">LEADER</span>
              ) : (
                <span className="text-amber-400 font-mono-num">{activeDriver.gap}</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto space-y-4">
          <Radio className="w-12 h-12 text-amber-400 animate-pulse" />
          <h2 className="text-2xl sm:text-4xl font-black font-hud uppercase tracking-tight text-white">
            NO LIVE SESSION IN PROGRESS
          </h2>
          <p className="text-sm text-zinc-400 max-w-md">
            Glance Mode dynamically syncs telemetry, driver positions, and interval gaps when a live track session is active.
          </p>
        </div>
      )}

      {/* Bottom Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-4 text-xs font-mono-num text-zinc-500">
        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span>[Esc] to close</span>
        </div>
      </div>
    </div>
  );
}

