'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getCircuitTrackData, CircuitTrackData } from '@/lib/f1/circuitPaths';
import { getTeamMeta, DRIVER_DETAILS } from '@/lib/f1/teams';
import { DriverStanding, OpenF1Session, OpenF1Interval } from '@/lib/f1/types';
import DriverAvatar from '@/components/f1/DriverAvatar';
import {
  MapPin,
  Zap,
  Gauge,
  Maximize2,
  Minimize2,
  Eye,
  Activity,
  Radio,
  Sliders,
  Flag,
  RotateCcw,
  Play,
  Pause,
  Info,
} from 'lucide-react';

interface TrackMapVisualizerProps {
  circuitId?: string;
  circuitName?: string;
  driverStandings?: DriverStanding[];
  session?: OpenF1Session | null;
  intervals?: OpenF1Interval[];
  onSelectDriver?: (driverId: string) => void;
  className?: string;
}

interface SimulatedDriver {
  driverId: string;
  code: string;
  number: number;
  name: string;
  teamId: string;
  color: string;
  progress: number; // 0.0 to 1.0 along SVG path
  speed: number; // km/h
  gear: number;
  drs: boolean;
  throttle: number; // 0 to 100%
  brake: number; // 0 to 100%
  position: number;
  gap: string;
}

export default function TrackMapVisualizer({
  circuitId = 'monza',
  circuitName,
  driverStandings = [],
  session,
  intervals = [],
  onSelectDriver,
  className = '',
}: TrackMapVisualizerProps) {
  const trackData: CircuitTrackData = getCircuitTrackData(circuitId || circuitName || 'monza');
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number>(1000);

  // View settings toggles
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [showDRS, setShowDRS] = useState<boolean>(true);
  const [showTurns, setShowTurns] = useState<boolean>(true);
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Driver simulation state
  const [drivers, setDrivers] = useState<SimulatedDriver[]>([]);

  // Calculate SVG path length once mounted
  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength();
        if (len > 0) setPathLength(len);
      } catch (e) {
        // Fallback length
      }
    }
  }, [trackData]);

  // Initialize drivers grid from standings or default 2026 grid
  useEffect(() => {
    const list = driverStandings.length > 0 ? driverStandings.slice(0, 10) : [];
    const initialDrivers: SimulatedDriver[] = list.map((s, idx) => {
      const team = s.Constructors[0] ? getTeamMeta(s.Constructors[0].constructorId) : getTeamMeta('ferrari');
      const dId = s.Driver.driverId;
      const meta = DRIVER_DETAILS[dId] || { number: idx + 1, code: s.Driver.code || 'DRV' };
      return {
        driverId: dId,
        code: meta.code || s.Driver.code || dId.slice(0, 3).toUpperCase(),
        number: meta.number || parseInt(s.position, 10) || idx + 1,
        name: `${s.Driver.givenName} ${s.Driver.familyName}`,
        teamId: team.id,
        color: team.color,
        progress: Math.max(0, (1 - idx * 0.08) % 1),
        speed: 285 - idx * 4,
        gear: 7,
        drs: idx % 2 === 0,
        throttle: 95,
        brake: 0,
        position: idx + 1,
        gap: idx === 0 ? 'LEADER' : `+${(idx * 1.4).toFixed(1)}s`,
      };
    });

    // Fallback grid if standings empty
    if (initialDrivers.length === 0) {
      const defaultList = ['max_verstappen', 'norris', 'leclerc', 'piastri', 'hamilton', 'russell', 'sainz', 'albon'];
      defaultList.forEach((id, idx) => {
        const meta = DRIVER_DETAILS[id] || { number: idx + 1, code: id.slice(0, 3).toUpperCase() };
        const team = getTeamMeta(id === 'max_verstappen' ? 'red_bull' : id === 'norris' ? 'mclaren' : 'ferrari');
        initialDrivers.push({
          driverId: id,
          code: meta.code,
          number: meta.number,
          name: id.replace('_', ' ').toUpperCase(),
          teamId: team.id,
          color: team.color,
          progress: (1 - idx * 0.1) % 1,
          speed: 310 - idx * 5,
          gear: 8,
          drs: idx < 3,
          throttle: 100,
          brake: 0,
          position: idx + 1,
          gap: idx === 0 ? 'LEADER' : `+${(idx * 1.2).toFixed(1)}s`,
        });
      });
    }

    setDrivers(initialDrivers);
    if (initialDrivers.length > 0) setSelectedDriverId(initialDrivers[0].driverId);
  }, [driverStandings]);

  // Animation Loop for live car movement
  useEffect(() => {
    if (!isSimulating) return;

    let animFrame: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setDrivers((prev) =>
        prev.map((d) => {
          // Speed variance along corners
          const nextProg = (d.progress + delta * 0.04 * (1 + (d.position % 3) * 0.05)) % 1;
          const isBrakingZone = (nextProg > 0.3 && nextProg < 0.36) || (nextProg > 0.65 && nextProg < 0.72);
          const currentSpeed = isBrakingZone ? Math.floor(110 + Math.random() * 20) : Math.floor(290 + Math.random() * 30);
          const currentGear = isBrakingZone ? 3 : 8;
          const isThrottle = !isBrakingZone;

          return {
            ...d,
            progress: nextProg,
            speed: currentSpeed,
            gear: currentGear,
            throttle: isThrottle ? Math.min(100, 85 + Math.floor(Math.random() * 15)) : 10,
            brake: isBrakingZone ? Math.min(100, 75 + Math.floor(Math.random() * 25)) : 0,
            drs: !isBrakingZone && (nextProg > 0.8 || (nextProg > 0.4 && nextProg < 0.55)),
          };
        })
      );

      animFrame = requestAnimationFrame(loop);
    };

    animFrame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrame);
  }, [isSimulating]);

  // Helper to compute SVG (x, y) point along track path
  const getPointAtPercent = (percent: number) => {
    if (!pathRef.current || pathLength <= 0) return { x: 300, y: 200 };
    try {
      const p = pathRef.current.getPointAtLength((percent % 1) * pathLength);
      return { x: p.x, y: p.y };
    } catch (e) {
      return { x: 300, y: 200 };
    }
  };

  const selectedDriver = drivers.find((d) => d.driverId === selectedDriverId) || drivers[0];

  return (
    <div
      className={`relative rounded-xl border border-[var(--border-subtle)] bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-primary)] overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none p-4 sm:p-6 bg-[var(--bg-primary)]' : className
      }`}
    >
      {/* HUD Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-f1-red)]/15 border border-[var(--accent-f1-red)]/30 text-[var(--accent-f1-red)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-hud font-black text-xs uppercase tracking-widest text-[var(--accent-f1-red)]">
                LIVE TELEMETRY TRACK MAP
              </span>
              <span className="text-[var(--text-muted)]">•</span>
              <span className="text-xs font-mono-num font-bold text-[var(--text-secondary)]">
                {trackData.shortName} CIRCUIT GPS
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-hud font-black uppercase text-[var(--text-primary)]">
              {trackData.name}
            </h3>
          </div>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Overlay Toggles */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded text-xs font-hud font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border ${
              showHeatmap
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
            }`}
            title="Toggle Speed Heatmap Overlay"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Speed Map</span>
          </button>

          <button
            onClick={() => setShowDRS(!showDRS)}
            className={`px-2.5 py-1 rounded text-xs font-hud font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border ${
              showDRS
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
            }`}
            title="Toggle DRS Zones"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>DRS Zones</span>
          </button>

          <button
            onClick={() => setShowTurns(!showTurns)}
            className={`px-2.5 py-1 rounded text-xs font-hud font-bold uppercase transition-all cursor-pointer flex items-center gap-1 border ${
              showTurns
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
            }`}
            title="Toggle Corner Turn Badges"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Turns</span>
          </button>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-1.5 rounded transition-all cursor-pointer border bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-white/20 text-[var(--text-primary)]`}
            title={isSimulating ? 'Pause Live Simulation' : 'Play Live Simulation'}
          >
            {isSimulating ? <Pause className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded transition-all cursor-pointer border bg-[var(--bg-tertiary)] border-[var(--border-subtle)] hover:border-white/20 text-[var(--text-primary)]"
            title={isFullscreen ? 'Minimize' : 'Expand Command Center'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Track Canvas & Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 items-center">
        {/* SVG Circuit Canvas (Col-span-2) */}
        <div className="lg:col-span-2 relative min-h-[300px] sm:min-h-[380px] flex items-center justify-center bg-black/40 rounded-xl border border-[var(--border-subtle)] p-4 overflow-hidden group">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* SVG Vector Circuit Path */}
          <svg
            viewBox={trackData.viewBox}
            className="w-full h-auto max-h-[360px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Neon Track Glow Filter */}
              <filter id="trackGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Leader Marker Pulse */}
              <filter id="dotPulse">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Dark Outer Track Outline */}
            <path
              d={trackData.svgPath}
              fill="none"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="24"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Primary Telemetry Track Line */}
            <path
              ref={pathRef}
              d={trackData.svgPath}
              fill="none"
              stroke={showHeatmap ? 'url(#speedHeatmapGradient)' : 'var(--border-hover)'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#trackGlow)"
            />

            {/* Sector Color Demarcations */}
            {showSectors &&
              trackData.sectors.map((sec) => (
                <path
                  key={sec.sector}
                  d={trackData.svgPath}
                  fill="none"
                  stroke={sec.color}
                  strokeWidth="3"
                  strokeDasharray={`${pathLength * (sec.endPercent - sec.startPercent)} ${pathLength}`}
                  strokeDashoffset={-pathLength * sec.startPercent}
                  opacity={0.8}
                />
              ))}

            {/* DRS Zone Overlays */}
            {showDRS &&
              trackData.drsZones.map((drs) => (
                <path
                  key={drs.id}
                  d={trackData.svgPath}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="6"
                  strokeDasharray={`${pathLength * (drs.endPercent - drs.startPercent)} ${pathLength}`}
                  strokeDashoffset={-pathLength * drs.startPercent}
                  filter="url(#trackGlow)"
                />
              ))}

            {/* Corner Turn Badges */}
            {showTurns &&
              trackData.corners.map((c) => (
                <g key={c.turn} transform={`translate(${c.x}, ${c.y})`}>
                  <circle r="10" fill="var(--bg-primary)" stroke="var(--border-subtle)" strokeWidth="1.5" />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fontSize="9"
                    fontWeight="900"
                    fill="var(--accent-f1-red)"
                    className="font-mono-num select-none"
                  >
                    T{c.turn}
                  </text>
                </g>
              ))}

            {/* Live Driver Location Dots */}
            {drivers.map((d) => {
              const pt = getPointAtPercent(d.progress);
              const isSelected = selectedDriverId === d.driverId;
              const isP1 = d.position === 1;

              return (
                <g
                  key={d.driverId}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => {
                    setSelectedDriverId(d.driverId);
                    if (onSelectDriver) onSelectDriver(d.driverId);
                  }}
                  className="cursor-pointer group/dot"
                >
                  {/* Outer Livery Color Ring */}
                  <circle
                    r={isSelected ? '14' : '10'}
                    fill="var(--bg-primary)"
                    stroke={d.color}
                    strokeWidth={isSelected ? '3' : '2'}
                    className="transition-all duration-300 filter drop-shadow-md"
                  />

                  {/* Pulsing Leader Accent */}
                  {isP1 && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="var(--accent-f1-red)"
                      strokeWidth="1.5"
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Driver Code / Number Label */}
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fontSize={isSelected ? '9' : '8'}
                    fontWeight="900"
                    fill="var(--text-primary)"
                    className="font-hud uppercase select-none pointer-events-none"
                  >
                    {d.code}
                  </text>

                  {/* Tooltip Tag on Hover */}
                  <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none" transform="translate(0, -22)">
                    <rect x="-35" y="-12" width="70" height="16" rx="3" fill="black" opacity="0.9" stroke={d.color} strokeWidth="1" />
                    <text textAnchor="middle" y="-1" fontSize="9" fontWeight="800" fill="white" className="font-hud uppercase">
                      P{d.position} • {d.speed} KM/H
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Bottom Map Legend */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-hud font-bold text-[var(--text-muted)] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> S1
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" /> S2
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" /> S3
              </span>
              {showDRS && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-3 h-1 bg-emerald-400 rounded" /> DRS Zone
                </span>
              )}
            </div>
            <span>Click driver dot to inspect telemetry</span>
          </div>
        </div>

        {/* Selected Driver Live Inspector Card (Col-span-1) */}
        {selectedDriver && (
          <div className="space-y-4 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <DriverAvatar
                  driverId={selectedDriver.driverId}
                  driverName={selectedDriver.name}
                  permanentNumber={selectedDriver.number}
                  teamColor={selectedDriver.color}
                  size="md"
                  mode="photo"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-hud font-black uppercase text-[var(--accent-f1-red)]">
                      P{selectedDriver.position}
                    </span>
                    <span className="font-hud font-black text-sm uppercase text-[var(--text-primary)]">
                      {selectedDriver.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                    GAP: {selectedDriver.gap}
                  </span>
                </div>
              </div>

              {selectedDriver.drs && (
                <span className="px-2 py-0.5 rounded text-[10px] font-hud font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                  DRS OPEN
                </span>
              )}
            </div>

            {/* Live Telemetry Sensor Gauges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[9px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                  Speed
                </span>
                <span className="text-lg font-mono-num font-black text-[var(--text-primary)]">
                  {selectedDriver.speed} <span className="text-xs text-[var(--text-muted)]">KM/H</span>
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                <span className="text-[9px] font-hud font-bold uppercase text-[var(--text-muted)] block">
                  Gear Position
                </span>
                <span className="text-lg font-mono-num font-black text-[var(--accent-f1-red)]">
                  GEAR {selectedDriver.gear}
                </span>
              </div>

              {/* Throttle Bar */}
              <div className="col-span-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-[10px] font-hud font-bold">
                  <span className="text-[var(--text-muted)] uppercase">Throttle Sensor</span>
                  <span className="text-emerald-400 font-mono-num">{selectedDriver.throttle}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${selectedDriver.throttle}%` }}
                  />
                </div>
              </div>

              {/* Brake Bar */}
              <div className="col-span-2 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-[10px] font-hud font-bold">
                  <span className="text-[var(--text-muted)] uppercase">Brake Pressure</span>
                  <span className="text-red-400 font-mono-num">{selectedDriver.brake}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${selectedDriver.brake}%` }}
                  />
                </div>
              </div>
            </div>

            {onSelectDriver && (
              <button
                onClick={() => onSelectDriver(selectedDriver.driverId)}
                className="w-full py-2 px-3 rounded-lg bg-[var(--accent-f1-red)] hover:bg-red-700 text-white text-xs font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                Inspect Driver Dossier
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
