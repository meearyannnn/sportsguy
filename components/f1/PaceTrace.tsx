'use client';

import React from 'react';

interface PaceTraceProps {
  /** Array of 4-6 finishing positions (1-20) or lap deltas where lower position = better */
  values?: number[];
  driverId?: string;
  color?: string;
  width?: number;
  height?: number;
  showDot?: boolean;
  className?: string;
}

// Deterministic fallback generator based on driver ID if explicit race finishes not passed
function getFallbackFinishes(driverId?: string): number[] {
  if (!driverId) return [3, 2, 1, 2, 1];
  let hash = 0;
  for (let i = 0; i < driverId.length; i++) {
    hash = (hash << 5) - hash + driverId.charCodeAt(i);
    hash |= 0;
  }
  const base = Math.abs(hash) % 8 + 1; // 1 to 8
  return [
    Math.min(20, Math.max(1, base + 2)),
    Math.min(20, Math.max(1, base + 1)),
    Math.min(20, Math.max(1, base)),
    Math.min(20, Math.max(1, base + 1)),
    Math.min(20, Math.max(1, base - 1)),
  ];
}

export default function PaceTrace({
  values,
  driverId,
  color,
  width = 38,
  height = 12,
  showDot = true,
  className = '',
}: PaceTraceProps) {
  const data = values && values.length >= 2 ? values : getFallbackFinishes(driverId);
  const minPos = 1; // P1 is the highest point visually (top of SVG)
  const maxPos = Math.max(...data, 10);

  // Map position (1 to 20) so that P1 is near y=2 and P20 is near y=height-2
  const padding = 2;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padding * 2;

  const points = data.map((pos, index) => {
    const x = padding + (index / (data.length - 1)) * usableWidth;
    // Normalized 0 (P1) to 1 (maxPos)
    const norm = (pos - minPos) / Math.max(1, maxPos - minPos);
    const y = padding + norm * usableHeight;
    return { x, y };
  });

  const pathData = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` : `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Determine trend color if not provided: if latest position is better (lower number) than previous, green
  const first = data[0];
  const last = data[data.length - 1];
  const isAscending = last <= first; // P1 <= P3 means gaining positions
  const strokeColor = color || (isAscending ? 'var(--signal-green)' : 'var(--text-muted)');
  const lastPoint = points[points.length - 1];

  return (
    <span
      className={`inline-flex items-center shrink-0 select-none ${className}`}
      title={`Recent 5-race finish trend: P${data.join(' → P')}`}
      aria-label={`Recent form pace trace: finishes ${data.join(', ')}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        className="overflow-visible"
      >
        {/* Hairline trend path */}
        <path
          d={pathData}
          stroke={strokeColor}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.85}
        />
        {/* Terminal position dot */}
        {showDot && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="1.75"
            fill={strokeColor}
          />
        )}
      </svg>
    </span>
  );
}
