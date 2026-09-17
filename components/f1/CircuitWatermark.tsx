'use client';

import React from 'react';

interface CircuitWatermarkProps {
  circuitId?: string;
  className?: string;
}

// Vector track polylines normalized to 500x300 viewBox
const TRACK_PATHS: Record<string, string> = {
  // Singapore Marina Bay Street Circuit
  marina_bay: 'M 70,80 L 160,80 L 190,60 L 250,60 L 270,90 L 320,90 L 350,120 L 420,120 L 450,150 L 440,210 L 380,240 L 330,230 L 300,260 L 220,260 L 180,210 L 140,230 L 90,200 L 70,140 Z',
  singapore: 'M 70,80 L 160,80 L 190,60 L 250,60 L 270,90 L 320,90 L 350,120 L 420,120 L 450,150 L 440,210 L 380,240 L 330,230 L 300,260 L 220,260 L 180,210 L 140,230 L 90,200 L 70,140 Z',
  // Silverstone Circuit
  silverstone: 'M 60,190 L 110,90 L 180,70 L 240,110 L 290,90 L 380,80 L 440,140 L 410,210 L 330,240 L 250,220 L 200,250 L 120,240 Z',
  // Circuit de Monaco
  monaco: 'M 90,140 L 160,80 L 240,90 L 290,60 L 350,80 L 420,110 L 400,180 L 330,200 L 290,160 L 260,230 L 180,250 L 120,220 Z',
  // Autodromo Nazionale Monza
  monza: 'M 60,180 L 100,80 L 240,70 L 380,80 L 440,140 L 420,220 L 340,240 L 220,230 L 140,240 Z',
  // Circuit de Spa-Francorchamps
  spa: 'M 80,180 L 130,90 L 210,60 L 300,80 L 380,70 L 440,130 L 410,220 L 350,250 L 260,230 L 180,260 L 110,230 Z',
};

export default function CircuitWatermark({
  circuitId = 'singapore',
  className = '',
}: CircuitWatermarkProps) {
  const normalizedId = circuitId.toLowerCase().replace(/[^a-z]/g, '');
  const path =
    TRACK_PATHS[normalizedId] ||
    TRACK_PATHS[Object.keys(TRACK_PATHS).find((k) => normalizedId.includes(k)) || ''] ||
    TRACK_PATHS.singapore;

  return (
    <div
      className={`pointer-events-none select-none absolute inset-0 overflow-hidden flex items-center justify-end pr-4 sm:pr-12 opacity-[0.025] dark:opacity-[0.035] transition-opacity ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 500 300"
        className="w-[480px] sm:w-[680px] h-auto max-h-full stroke-current"
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={path} />
      </svg>
    </div>
  );
}
