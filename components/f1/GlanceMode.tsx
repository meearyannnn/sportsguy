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
  const [currentLap, setCurrentLap] = useState(38);
  const totalLaps = 57;
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeDriver = DEFAULT_DRIVERS[driverIndex] || DEFAULT_DRIVERS[0];

  // Quiet refresh simulation
  useEffect(() => {
    const timer = setInterval(() => {
      // quiet heartbeat
    }, 2500);

    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation & escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        setDriverIndex((prev) => (prev + 1) % DEFAULT_DRIVERS.length);
      } else if (e.key === 'ArrowLeft') {
        setDriverIndex((prev) => (prev - 1 + DEFAULT_DRIVERS.length) % DEFAULT_DRIVERS.length);
      } else if (e.key === 'f') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const tyreBadgeColor = (tyre: string) => {
    switch (tyre) {
      case 'S':
        return 'text-red-500 border-red-500 bg-red-500/10';
      case 'M':
        return 'text-amber-400 border-amber-400 bg-amber-400/10';
      case 'H':
        return 'text-zinc-200 border-zinc-200 bg-zinc-200/10';
      case 'I':
        return 'text-emerald-400 border-emerald-400 bg-emerald-400/10';
      default:
        return 'text-blue-400 border-blue-400 bg-blue-400/10';
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0C0C0E] text-[#EDEDED] flex flex-col justify-between p-6 sm:p-12 select-none overflow-hidden transition-colors ${
        isStandalone ? 'min-h-screen' : ''
      }`}
      style={{
        backgroundImage: `radial-gradient(ellipse 60% 40% at 50% 50%, ${activeDriver.teamColor}15 0%, transparent 80%)`,
      }}
    >
      {/* Top Header Bar: Quiet Status + Exit / Fullscreen */}
      <div className="flex items-center justify-between text-xs font-mono-num text-zinc-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)] animate-ping"></span>
            <span className="font-hud font-bold uppercase tracking-widest text-zinc-400 text-[11px]">
              GLANCE MODE
            </span>
          </div>
          <span className="text-zinc-700">/</span>
          <span className="uppercase text-zinc-400 font-hud">
            {session?.circuit_short_name || 'SINGAPORE GP'}
          </span>
          <span className="text-zinc-700 hidden sm:inline">•</span>
          <span className="hidden sm:inline font-mono-num text-[11px]">
            LAP {currentLap}/{totalLaps}
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
          {isStandalone && (
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-1 rounded border border-zinc-800 hover:border-zinc-600 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer font-hud font-bold text-xs uppercase"
            >
              <X className="w-3.5 h-3.5" />
              <span>Hub</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Focus: The One Number / One Glance Reading */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
        {/* Position & Driver Code Hero */}
        <div className="flex items-baseline justify-center gap-3 sm:gap-6">
          <span
            className="font-hud font-black text-6xl sm:text-8xl md:text-9xl tracking-tight opacity-40 font-mono-num"
            style={{ color: activeDriver.teamColor }}
          >
            P{activeDriver.pos}
          </span>
          <span className="font-hud font-black text-7xl sm:text-9xl md:text-[13rem] tracking-tighter leading-none text-white drop-shadow-2xl">
            {activeDriver.code}
          </span>
        </div>

        {/* Full Name & Team */}
        <div className="mt-2 sm:mt-4 flex items-center justify-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activeDriver.teamColor }}
          />
          <h2 className="text-lg sm:text-2xl font-hud font-bold uppercase tracking-wider text-zinc-300">
            {activeDriver.name}
          </h2>
        </div>

        {/* Vital Metric: Delta / Gap */}
        <div className="mt-6 sm:mt-10">
          <div className="text-4xl sm:text-6xl md:text-7xl font-mono-num font-extrabold tracking-tight text-white flex items-center justify-center gap-3">
            {activeDriver.pos === 1 ? (
              <span className="text-emerald-400 font-hud tracking-wide font-black">LEADER</span>
            ) : (
              <span className="text-amber-400 font-mono-num">{activeDriver.gap}</span>
            )}
          </div>
          {activeDriver.pos > 1 && (
            <div className="text-xs sm:text-sm font-mono-num text-zinc-500 mt-1 uppercase tracking-wider">
              GAP TO P{activeDriver.pos - 1}: {activeDriver.interval}
            </div>
          )}
        </div>

        {/* Minimal Auxiliary Pill: Tyre Compound + Lap */}
        <div className="mt-8 sm:mt-12 flex items-center justify-center gap-4">
          <div
            className={`px-3 py-1 rounded border text-xs font-mono-num font-black uppercase flex items-center gap-1.5 ${tyreBadgeColor(
              activeDriver.tyre
            )}`}
          >
            <span>{activeDriver.tyre}</span>
            <span className="text-zinc-500 font-normal">L{activeDriver.tyreLaps}</span>
          </div>

          <div className="px-3 py-1 rounded border border-zinc-800 bg-zinc-900/60 text-xs font-mono-num text-zinc-400">
            LAP {currentLap}/{totalLaps}
          </div>

          <div className="px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900/60 text-xs font-mono-num text-zinc-400 flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px]">LIVE SYNC</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Bar: Quick Driver Carousel Navigation & Instructions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 pt-4 text-xs font-mono-num text-zinc-500">
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setDriverIndex((prev) => (prev - 1 + DEFAULT_DRIVERS.length) % DEFAULT_DRIVERS.length)
            }
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Previous Driver (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5">
            {DEFAULT_DRIVERS.map((d, i) => (
              <button
                key={d.code}
                onClick={() => setDriverIndex(i)}
                className={`px-2 py-0.5 rounded text-[11px] font-hud font-bold transition-all cursor-pointer ${
                  i === driverIndex
                    ? 'bg-white text-black'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                P{d.pos} {d.code}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDriverIndex((prev) => (prev + 1) % DEFAULT_DRIVERS.length)}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Next Driver (Right Arrow / Space)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-zinc-600">
          <span>Tap [Space] or [←/→] to cycle drivers</span>
          <span>•</span>
          <span>[Esc] to close</span>
        </div>
      </div>
    </div>
  );
}
