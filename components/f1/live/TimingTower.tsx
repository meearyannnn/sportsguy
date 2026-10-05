'use client';

import React, { useMemo, useState } from 'react';
import { Zap, Flag, Trophy } from 'lucide-react';
import {
  TowerRow, LiveDriver, SessionPayload,
  fmtLap, fmtGap, COMPOUND_COLOR,
} from './shared';

interface TimingTowerProps {
  tower: TowerRow[];
  drivers: LiveDriver[];
  isQuali: boolean;
  isRace: boolean;
  totalLaps: number | null;
  selected: number | null;
  onSelect: (driver: number) => void;
  currentLap: number | null;
  weather: SessionPayload['weather'];
  raceControl: SessionPayload['raceControl'];
}

const STATUS_DOT: Record<TowerRow['status'], { color: string; label: string }> = {
  RUNNING: { color: 'var(--green)', label: 'RUN' },
  FINISHED: { color: 'var(--text-muted)', label: 'FIN' },
  PIT: { color: 'var(--amber)', label: 'PIT' },
  DNF: { color: 'var(--red)', label: 'DNF' },
  DNS: { color: 'var(--red)', label: 'DNS' },
  DSQ: { color: 'var(--purple)', label: 'DSQ' },
};

function TyreIcon({ compound, age }: { compound: string | null; age: number | null }) {
  if (!compound) return null;
  const color = COMPOUND_COLOR[compound] ?? 'var(--text-muted)';
  const label = compound.charAt(0);
  const isLight = ['MEDIUM', 'HARD', 'INTERMEDIATE'].includes(compound);
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-black font-mono flex-shrink-0 border"
      style={{
        background: color,
        color: isLight ? '#111' : '#fff',
        borderColor: 'rgba(255,255,255,0.15)',
      }}
      title={`${compound}${age != null ? ` (age: ${age} laps)` : ''}`}
    >
      {label}
    </span>
  );
}

function SectorPips({ sectors }: { sectors: [number | null, number | null, number | null] }) {
  return (
    <div className="flex gap-0.5 items-center">
      {sectors.map((s, i) => (
        <div
          key={i}
          className="w-1.5 h-3 rounded-sm"
          style={{ background: s != null ? 'var(--purple)' : 'var(--border-dim)' }}
          title={s != null ? `S${i + 1}: ${s.toFixed(3)}` : `S${i + 1}: —`}
        />
      ))}
    </div>
  );
}

export default function TimingTower({
  tower, drivers, isQuali, isRace, totalLaps, selected, onSelect, currentLap, weather, raceControl,
}: TimingTowerProps) {
  const [showRC, setShowRC] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const driverMap = useMemo(() => {
    const m = new Map<number, LiveDriver>();
    for (const d of drivers) m.set(d.number, d);
    return m;
  }, [drivers]);

  const flagRow = raceControl.find((m) => m.flag && m.flag !== 'GREEN');

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-dim)' }}
      >
        <div className="flex items-center gap-2">
          <Flag className="w-3.5 h-3.5" style={{ color: 'var(--red)' }} />
          <span className="text-xs font-mono font-bold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
            {isQuali ? 'Qualifying' : isRace ? 'Race Classification' : 'Timing Tower'}
          </span>
          {currentLap && totalLaps && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
              style={{ background: 'var(--red-subtle)', color: 'var(--red)' }}
            >
              LAP {currentLap}/{totalLaps}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {weather && (
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
              <span title="Track temperature">Track {weather.track}&deg;C</span>
              <span title="Air temperature">Air {weather.air}&deg;C</span>
              {weather.rain && <span title="Rain">WET</span>}
            </div>
          )}
          {raceControl.length > 0 && (
            <button
              onClick={() => setShowRC((p) => !p)}
              className="px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors"
              style={{
                background: showRC ? 'var(--amber-subtle)' : 'var(--bg-overlay)',
                color: showRC ? 'var(--amber)' : 'var(--text-secondary)',
                border: '1px solid var(--border-dim)',
              }}
            >
              RC {showRC ? 'hide' : 'show'}
            </button>
          )}
        </div>
      </div>

      {/* Flag Banner */}
      {flagRow && (
        <div
          className="px-3 py-1.5 text-[10px] font-mono font-bold tracking-wider flex items-center gap-2 flex-shrink-0"
          style={{
            background: flagRow.flag === 'RED' ? 'rgba(225,6,0,0.15)' : flagRow.flag === 'YELLOW' ? 'rgba(245,184,0,0.13)' : 'rgba(155,95,250,0.12)',
            color: flagRow.flag === 'RED' ? 'var(--red)' : flagRow.flag === 'YELLOW' ? 'var(--amber)' : 'var(--purple)',
            borderBottom: '1px solid var(--border-dim)',
          }}
        >
          <span className="truncate">{flagRow.message}</span>
        </div>
      )}

      {/* Race Control Feed */}
      {showRC && (
        <div
          className="px-3 py-2 space-y-1 overflow-y-auto flex-shrink-0"
          style={{ maxHeight: 160, borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-overlay)' }}
        >
          {raceControl.slice(0, 15).map((m, i) => (
            <div key={i} className="flex gap-2 items-start text-[10px] font-mono" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                {m.lap ? `L${m.lap}` : '--'}
              </span>
              <span
                className="truncate"
                style={{
                  color: m.flag === 'RED' ? 'var(--red)' : m.flag === 'YELLOW' ? 'var(--amber)' : m.category === 'SafetyCar' ? 'var(--blue)' : 'var(--text-secondary)',
                }}
              >
                {m.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Column Headers */}
      <div
        className="grid px-3 py-1.5 text-[9px] font-mono font-bold tracking-widest uppercase flex-shrink-0"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border-dim)',
          gridTemplateColumns: isQuali
            ? '28px 42px 1fr 70px 70px 70px'
            : '28px 42px 1fr 60px 60px 55px 30px',
        }}
      >
        <span>POS</span>
        <span>NO.</span>
        <span>DRIVER</span>
        {isQuali ? (
          <>
            <span className="text-right">Q1</span>
            <span className="text-right">Q2</span>
            <span className="text-right">Q3</span>
          </>
        ) : (
          <>
            <span className="text-right">GAP</span>
            <span className="text-right">BEST</span>
            <span className="text-right">LAST</span>
            <span className="text-right">PIT</span>
          </>
        )}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto">
        {tower.length === 0 && (
          <div className="py-12 text-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            No timing data available yet
          </div>
        )}
        {tower.map((row) => {
          const driver = driverMap.get(row.driver);
          if (!driver) return null;
          const dot = STATUS_DOT[row.status];
          const isSel = row.driver === selected;
          const isExp = expanded === row.driver;
          const isDnfStyle = ['DNF', 'DNS', 'DSQ'].includes(row.status);
          const isFastest = row.fastestLap;

          return (
            <div key={row.driver} style={{ borderBottom: '1px solid var(--border-dim)' }}>
              <div
                className="grid px-3 items-center cursor-pointer transition-colors"
                style={{
                  gridTemplateColumns: isQuali
                    ? '28px 42px 1fr 70px 70px 70px'
                    : '28px 42px 1fr 60px 60px 55px 30px',
                  paddingTop: 7,
                  paddingBottom: 7,
                  background: isSel
                    ? `${driver.color}14`
                    : isExp
                    ? 'var(--bg-overlay)'
                    : 'transparent',
                  opacity: isDnfStyle ? 0.55 : 1,
                }}
                onClick={() => {
                  onSelect(row.driver);
                  setExpanded(isExp ? null : row.driver);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Driver ${driver.code} position ${row.position}`}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(row.driver)}
              >
                {/* Position */}
                <span
                  className="text-sm font-black font-display tabular-nums"
                  style={{
                    color: row.position === 1 ? 'var(--amber)' : row.position != null && row.position <= 3 ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  {row.position ?? '—'}
                </span>

                {/* Driver number badge */}
                <span
                  className="text-[11px] font-black font-mono px-1.5 py-0.5 rounded-sm w-fit"
                  style={{ background: `${driver.color}28`, color: driver.color }}
                >
                  {row.driver}
                </span>

                {/* Driver name + status */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ background: driver.color }} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-display font-black text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {driver.code}
                      </span>
                      {isFastest && <Zap className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--purple)' }} />}
                      {row.position === 1 && !isFastest && <Trophy className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--amber)' }} />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono truncate" style={{ color: 'var(--text-muted)' }}>
                        {driver.team}
                      </span>
                      <span
                        className="text-[8px] font-mono font-bold px-1 rounded flex-shrink-0"
                        style={{ background: `${dot.color}22`, color: dot.color }}
                      >
                        {row.statusText ?? dot.label}
                      </span>
                    </div>
                  </div>
                </div>

                {isQuali ? (
                  (row.q ?? [null, null, null]).concat([null, null, null]).slice(0, 3).map((t, qi) => (
                    <span
                      key={qi}
                      className="text-right text-[11px] font-mono tabular-nums"
                      style={{ color: t != null ? 'var(--text-primary)' : 'var(--text-muted)' }}
                    >
                      {fmtLap(t)}
                    </span>
                  ))
                ) : (
                  <>
                    <span
                      className="text-right text-[11px] font-mono font-bold tabular-nums"
                      style={{
                        color: row.position === 1 ? 'var(--amber)' : isDnfStyle ? 'var(--red)' : 'var(--text-secondary)',
                      }}
                    >
                      {row.position === 1 ? 'LEADER' : fmtGap(row.gap)}
                    </span>
                    <span
                      className="text-right text-[11px] font-mono tabular-nums"
                      style={{ color: isFastest ? 'var(--purple)' : 'var(--text-secondary)' }}
                    >
                      {fmtLap(row.bestLap)}
                    </span>
                    <span className="text-right text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {fmtLap(row.lastLap)}
                    </span>
                    <span className="text-right text-[11px] font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
                      {row.pits || '—'}
                    </span>
                  </>
                )}
              </div>

              {/* Expanded detail */}
              {isExp && (
                <div
                  className="px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-2"
                  style={{ background: 'var(--bg-overlay)', borderTop: '1px solid var(--border-dim)' }}
                >
                  {!isQuali && (
                    <div className="flex items-center gap-2">
                      <TyreIcon compound={row.compound} age={row.tyreAge} />
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {row.compound ?? '—'} · {row.tyreAge != null ? `${row.tyreAge} laps` : '—'}
                      </span>
                    </div>
                  )}
                  {!isQuali && row.sectors.some((s) => s != null) && (
                    <div className="flex items-center gap-2">
                      <SectorPips sectors={row.sectors} />
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {row.sectors.map((s, i) => (s != null ? `S${i + 1}: ${s.toFixed(3)}` : `S${i + 1}: —`)).join('  ')}
                      </span>
                    </div>
                  )}
                  {row.grid != null && (
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      Grid: P{row.grid}
                    </span>
                  )}
                  {row.points != null && (
                    <span className="text-[10px] font-mono font-bold" style={{ color: 'var(--amber)' }}>
                      +{row.points} pts
                    </span>
                  )}
                  {row.laps > 0 && (
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                      Laps: {row.laps}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
