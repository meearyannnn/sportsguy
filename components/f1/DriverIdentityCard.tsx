'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  computeDriverIdentity,
  GenerativeIdentityData,
  describeSvgArc,
} from '@/lib/f1/generativeIdentity';
import { getDriverProfile, DriverCareerProfile } from '@/lib/f1/driverCareer';
import {
  Download,
  Share2,
  Sparkles,
  Trophy,
  Activity,
  Maximize2,
  Check,
  Zap,
} from 'lucide-react';

interface DriverIdentityCardProps {
  driverId: string;
  driverProfile?: DriverCareerProfile | null;
  size?: 'sm' | 'card' | 'hero';
  className?: string;
  showCaption?: boolean;
  allowExport?: boolean;
}

export default function DriverIdentityCard({
  driverId,
  driverProfile,
  size = 'card',
  className = '',
  showCaption = false,
  allowExport = false,
}: DriverIdentityCardProps) {
  const [profile, setProfile] = useState<DriverCareerProfile | null>(driverProfile || null);
  const [identity, setIdentity] = useState<GenerativeIdentityData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let isMounted = true;
    if (driverProfile) {
      setProfile(driverProfile);
      setIdentity(computeDriverIdentity(driverProfile));
    } else if (driverId) {
      getDriverProfile(driverId).then((p) => {
        if (isMounted && p) {
          setProfile(p);
          setIdentity(computeDriverIdentity(p));
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [driverId, driverProfile]);

  if (!identity || !profile) {
    // Graceful geometric skeleton placeholder
    return (
      <div
        className={`animate-pulse rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] flex items-center justify-center ${
          size === 'sm' ? 'w-9 h-9' : size === 'card' ? 'w-44 h-44' : 'w-72 h-72'
        } ${className}`}
      />
    );
  }

  // Dimension scaling
  const dimensions = {
    sm: { width: 42, height: 42, viewBox: '0 0 200 200' },
    card: { width: 190, height: 190, viewBox: '0 0 200 200' },
    hero: { width: 310, height: 310, viewBox: '0 0 200 200' },
  }[size];

  const center = 100;
  // Center wins dot radius (6px base + sqrt(wins)*2.2)
  const winsCoreRadius = Math.min(16, 5 + Math.sqrt(identity.totalWins) * 1.8);
  const primaryTeamColor = profile.teamColor || '#E10600';

  // Export SVG handler
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    setIsExporting(true);
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `APEX_${profile.familyName.toUpperCase()}_Identity_Card.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    setTimeout(() => setIsExporting(false), 800);
  };

  // Render simplified glyph for row size
  if (size === 'sm') {
    return (
      <div
        className={`relative flex items-center justify-center rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden shrink-0 ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        title={`${identity.fullName} (${identity.careerSpan}) • Identity Signature`}
      >
        <svg
          viewBox={dimensions.viewBox}
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Outer Career Points Path */}
          <path
            d={identity.pathData}
            fill={`${primaryTeamColor}35`}
            stroke={primaryTeamColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Center Wins Core */}
          <circle
            cx={center}
            cy={center}
            r={Math.max(8, winsCoreRadius)}
            fill={primaryTeamColor}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* SVG Container */}
      <div
        className="relative rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 flex items-center justify-center group overflow-hidden"
      >
        {/* Subtle Background HUD Radar Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--bg-tertiary)_0%,transparent_75%)] opacity-60 pointer-events-none" />

        <svg
          ref={svgRef}
          viewBox={dimensions.viewBox}
          width={dimensions.width}
          height={dimensions.height}
          className="relative z-10 transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <defs>
            {/* Radial Glow Filter */}
            <filter id={`glow-${identity.driverId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradient Fill for Career Points Silhouette */}
            <radialGradient id={`grad-${identity.driverId}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={primaryTeamColor} stopOpacity="0.45" />
              <stop offset="85%" stopColor={primaryTeamColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={primaryTeamColor} stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Concentric Telemetry Guide Circles */}
          <circle cx={center} cy={center} r="86" fill="none" stroke="var(--border-subtle)" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.4" />
          <circle cx={center} cy={center} r="60" fill="none" stroke="var(--border-subtle)" strokeWidth="0.75" strokeDasharray="2 3" opacity="0.3" />
          <circle cx={center} cy={center} r="34" fill="none" stroke="var(--border-subtle)" strokeWidth="0.75" opacity="0.5" />

          {/* Crosshair Axes */}
          <line x1={center} y1="8" x2={center} y2="192" stroke="var(--border-subtle)" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.3" />
          <line x1="8" y1={center} x2="192" y2={center} stroke="var(--border-subtle)" strokeWidth="0.6" strokeDasharray="2 4" opacity="0.3" />

          {/* Team Color Banding Arcs (Outer Circumference) */}
          {identity.colorSegments.map((seg, idx) => (
            <path
              key={idx}
              d={describeSvgArc(center, center, 92, seg.startAngle, seg.endAngle)}
              fill="none"
              stroke={seg.teamColor}
              strokeWidth="3.2"
              strokeLinecap="round"
              opacity="0.9"
            />
          ))}

          {/* Career Points Radial Silhouette (The Main Shape) */}
          <path
            d={identity.pathData}
            fill={`url(#grad-${identity.driverId})`}
            stroke={primaryTeamColor}
            strokeWidth="1.8"
            strokeLinejoin="round"
            filter={`url(#glow-${identity.driverId})`}
          />

          {/* Radial Spokes / Season Rays */}
          {identity.petals.map((petal, pIdx) => (
            <line
              key={pIdx}
              x1={center}
              y1={center}
              x2={petal.x}
              y2={petal.y}
              stroke={petal.teamColor}
              strokeWidth="0.75"
              opacity="0.35"
            />
          ))}

          {/* Milestone Notches (Championship Diamonds / First Win Ticks) */}
          {identity.milestones.map((m, mIdx) => {
            const rad = (m.angleDeg * Math.PI) / 180;
            const markerDist = 90;
            const mx = center + markerDist * Math.cos(rad);
            const my = center + markerDist * Math.sin(rad);

            if (m.type === 'CHAMPIONSHIP') {
              return (
                <g key={mIdx} transform={`translate(${mx}, ${my})`}>
                  {/* Golden Diamond Star */}
                  <polygon
                    points="0,-4 3,0 0,4 -3,0"
                    fill="#FFD700"
                    stroke="#B8860B"
                    strokeWidth="0.6"
                  />
                </g>
              );
            }

            return (
              <g key={mIdx} transform={`translate(${mx}, ${my})`}>
                {/* White Victory Tick */}
                <circle r="2.2" fill="#FFFFFF" stroke="var(--accent-f1-red)" strokeWidth="0.6" />
              </g>
            );
          })}

          {/* Concentric Gold Halo Rings for World Championships */}
          {Array.from({ length: identity.championships }).map((_, cIdx) => (
            <circle
              key={cIdx}
              cx={center}
              cy={center}
              r={winsCoreRadius + 4 + cIdx * 3.5}
              fill="none"
              stroke="#FFD700"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.85"
            />
          ))}

          {/* Center Core Dot (Proportional to Total Career Wins) */}
          <circle
            cx={center}
            cy={center}
            r={winsCoreRadius}
            fill={primaryTeamColor}
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />

          {/* Permanent Number inside core */}
          <text
            x={center}
            y={center + 3}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="8"
            fontFamily="var(--font-hud)"
            fontWeight="900"
            letterSpacing="-0.5"
          >
            {identity.permanentNumber || identity.code}
          </text>
        </svg>

        {/* Top-Right Quick Export Button */}
        {allowExport && (
          <button
            onClick={handleExportSvg}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-secondary)] hover:text-white transition-colors cursor-pointer z-20"
            title="Export Vector SVG Identity Card"
          >
            {isExporting ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Descriptive Data-to-Visual Telemetry Caption */}
      {showCaption && (
        <div className="w-full mt-3 p-3 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              <span className="font-hud font-black text-xs uppercase tracking-wider text-[var(--text-primary)]">
                Generative Signature
              </span>
            </div>
            <span className="font-mono-num text-[10px] text-[var(--text-muted)]">
              {identity.totalSeasons} SEASONS • {identity.careerSpan}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-hud uppercase pt-1">
            <div className="p-1.5 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] font-bold block">Petals</span>
              <span className="font-mono-num font-black text-xs text-[var(--text-primary)] mt-0.5">
                {identity.totalSeasons}
              </span>
            </div>
            <div className="p-1.5 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] font-bold block">Consistency</span>
              <span className="font-mono-num font-black text-xs text-emerald-400 mt-0.5">
                {Math.round(identity.consistencyScore * 100)}%
              </span>
            </div>
            <div className="p-1.5 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              <span className="text-[var(--text-muted)] font-bold block">Titles</span>
              <span className="font-mono-num font-black text-xs text-amber-400 mt-0.5">
                {identity.championships} [WDC]
              </span>
            </div>
          </div>

          {/* Visual Grammar Key */}
          <div className="text-[10px] text-[var(--text-secondary)] space-y-1 font-mono-num border-t border-[var(--border-subtle)] pt-1.5">
            <div className="flex items-center justify-between">
              <span>• Contour: {identity.consistencyScore > 0.45 ? 'Smooth Bézier (Low Finish Variance)' : 'Chiseled (High Finish Variance)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Radius: Proportional to Season Points Progression</span>
            </div>
            <div className="flex items-center justify-between">
              <span>• Rings: {identity.championships} Championship Halos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
