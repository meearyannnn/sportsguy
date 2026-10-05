'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Gauge, Zap, Wind, Activity } from 'lucide-react';
import { LapTelemetry, LiveDriver, fmtLap, speedColor } from './shared';

interface TelemetryHUDProps {
  sessionKey: number;
  driver: number | null;
  drivers: LiveDriver[];
  lapNumber?: number | null;
  onChangeLap?: (lap: number) => void;
  availableLaps?: Array<[number, number, number | null]>; // [lapNum, startMs, duration]
}

/* ---------- mini chart helpers ---------- */
type DataKey = 'speed' | 'throttle' | 'brake' | 'rpm';

function MiniChart({
  samples,
  dataKey,
  color,
  fill,
  max,
}: {
  samples: LapTelemetry['samples'];
  dataKey: DataKey;
  color: string;
  fill?: string;
  max: number;
}) {
  if (!samples.length) return null;
  const W = 300;
  const H = 52;
  const xs = samples.map((s) => (s.d / (samples[samples.length - 1].d || 1)) * W);
  const ys = samples.map((s) => H - (s[dataKey] / max) * H);

  const path =
    'M' +
    samples
      .map((s, i) => `${xs[i].toFixed(1)},${ys[i].toFixed(1)}`)
      .join(' L');

  const area = `${path} L${W},${H} L0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {fill && <path d={area} fill={fill} opacity="0.18" />}
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Gear display ---------- */
function GearDisplay({ gear, drs }: { gear: number; drs: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl"
      style={{
        background: drs ? 'var(--green-subtle)' : 'var(--bg-overlay)',
        border: `2px solid ${drs ? 'var(--green)' : 'var(--border-mid)'}`,
        width: 72,
        height: 72,
        flexShrink: 0,
      }}
    >
      <span
        className="font-display font-black tabular-nums leading-none"
        style={{ fontSize: 36, color: drs ? 'var(--green)' : 'var(--text-primary)' }}
      >
        {gear || '—'}
      </span>
      <span className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
        {drs ? 'DRS' : 'GEAR'}
      </span>
    </div>
  );
}

/* ---------- Speed arc ---------- */
function SpeedArc({ speed, max = 340 }: { speed: number; max?: number }) {
  const pct = Math.min(1, speed / max);
  const R = 54;
  const C = 70;
  const startAngle = 210;
  const sweep = 300; // degrees
  const toRad = (d: number) => (d * Math.PI) / 180;
  const arcPath = (from: number, to: number) => {
    const s = toRad(from);
    const e = toRad(to);
    const x1 = C + R * Math.cos(s);
    const y1 = C + R * Math.sin(s);
    const x2 = C + R * Math.cos(e);
    const y2 = C + R * Math.sin(e);
    const large = to - from > 180 ? 1 : 0;
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  };
  const endAngle = startAngle + sweep * pct;
  const col = speedColor(speed);
  return (
    <svg viewBox="0 0 140 140" width={140} height={140} className="flex-shrink-0">
      {/* Track */}
      <path d={arcPath(startAngle, startAngle + sweep)} fill="none" stroke="var(--border-mid)" strokeWidth="10" strokeLinecap="round" />
      {/* Value */}
      {speed > 0 && (
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" />
      )}
      {/* Text */}
      <text x="70" y="68" textAnchor="middle" fill="var(--text-primary)" fontFamily="var(--font-display)" fontWeight="900" fontSize="30">
        {Math.round(speed)}
      </text>
      <text x="70" y="86" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontSize="10">
        km/h
      </text>
    </svg>
  );
}

/* ---------- Main component ---------- */
export default function TelemetryHUD({
  sessionKey, driver, drivers, lapNumber, onChangeLap, availableLaps,
}: TelemetryHUDProps) {
  const [data, setData] = useState<LapTelemetry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<number>(0); // index into samples
  const abortRef = useRef<AbortController | null>(null);

  const driverObj = useMemo(() => drivers.find((d) => d.number === driver), [drivers, driver]);

  useEffect(() => {
    if (!driver) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    setData(null);
    setCursor(0);
    const params = new URLSearchParams({ session_key: String(sessionKey), driver: String(driver) });
    if (lapNumber) params.set('lap', String(lapNumber));
    fetch(`/api/f1/live/lap?${params}`, { signal: ctrl.signal })
      .then(async (r) => {
        const d = await r.json();
        if (ctrl.signal.aborted) return;
        if (!r.ok) { setError(d.error || 'Failed to load telemetry'); return; }
        if (!d || !d.samples?.length) { setError('No telemetry data for this lap'); return; }
        setData(d);
        setCursor(Math.floor(d.samples.length / 2));
      })
      .catch((e) => { if (e.name !== 'AbortError') setError('Network error'); })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [sessionKey, driver, lapNumber]);

  const sample = data?.samples[cursor] ?? null;

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 gap-3" style={{ color: 'var(--text-muted)' }}>
        <Gauge className="w-8 h-8 opacity-40" />
        <span className="text-xs font-mono">Select a driver to view telemetry</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Driver header */}
      <div
        className="flex items-center gap-3 px-3 py-2.5 flex-shrink-0"
        style={{
          borderBottom: '1px solid var(--border-dim)',
          background: driverObj ? `${driverObj.color}10` : undefined,
        }}
      >
        <div
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ background: driverObj?.color ?? 'var(--border-mid)' }}
        />
        <div className="min-w-0">
          <div className="font-display font-black text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {driverObj?.code ?? `#${driver}`}
          </div>
          <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
            {driverObj?.fullName} · {driverObj?.team}
          </div>
        </div>
        {data && (
          <div className="ml-auto flex items-center gap-3 text-right">
            <div>
              <div className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>LAP TIME</div>
              <div className="font-display font-black tabular-nums" style={{ color: driverObj?.color ?? 'var(--text-primary)', fontSize: 17 }}>
                {fmtLap(data.lapTime)}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>LAP</div>
              <div className="font-display font-black text-lg tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {data.lap}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lap picker */}
      {availableLaps && availableLaps.length > 1 && onChangeLap && (
        <div
          className="flex items-center gap-2 px-3 py-2 overflow-x-auto flex-shrink-0 scrollbar-none"
          style={{ borderBottom: '1px solid var(--border-dim)' }}
        >
          <span className="text-[9px] font-mono tracking-widest flex-shrink-0" style={{ color: 'var(--text-muted)' }}>LAP</span>
          {availableLaps.map(([ln, , dur]) => (
            <button
              key={ln}
              onClick={() => onChangeLap(ln)}
              className="px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 transition-colors"
              style={{
                background: lapNumber === ln ? (driverObj?.color ?? 'var(--red)') : 'var(--bg-overlay)',
                color: lapNumber === ln ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--border-dim)',
              }}
            >
              {ln}{dur ? ` ${fmtLap(dur)}` : ''}
            </button>
          ))}
        </div>
      )}

      {/* Loading / error */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-mono">Fetching telemetry…</span>
        </div>
      )}
      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center" style={{ color: 'var(--text-muted)' }}>
          <Activity className="w-6 h-6 opacity-40" />
          <span className="text-xs font-mono">{error}</span>
        </div>
      )}

      {/* Data */}
      {data && !loading && (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {/* Speed arc + gear */}
          <div className="flex items-center justify-center gap-6">
            <SpeedArc speed={sample?.speed ?? 0} />
            <div className="flex flex-col gap-3 items-center">
              <GearDisplay gear={sample?.gear ?? 0} drs={sample?.drs ?? 0} />
              <div className="text-center">
                <div className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>RPM</div>
                <div className="font-display font-black text-xl tabular-nums" style={{ color: 'var(--amber)' }}>
                  {sample?.rpm ? Math.round(sample.rpm / 100) * 100 : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Throttle/Brake bars */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-[9px] font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>THROTTLE</span>
                <span style={{ color: 'var(--green)' }}>{sample?.throttle ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${sample?.throttle ?? 0}%`, background: 'var(--green)' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>BRAKE</span>
                <span style={{ color: 'var(--red)' }}>{sample?.brake ?? 0}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${sample?.brake ?? 0}%`, background: 'var(--red)' }}
                />
              </div>
            </div>
          </div>

          {/* Sector splits */}
          {data.sectors.some((s) => s != null) && (
            <div className="grid grid-cols-3 gap-2">
              {data.sectors.map((s, i) => (
                <div
                  key={i}
                  className="rounded-lg px-2 py-2 text-center"
                  style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)' }}
                >
                  <div className="text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>S{i + 1}</div>
                  <div className="font-display font-black text-sm tabular-nums" style={{ color: 'var(--purple)' }}>
                    {s != null ? s.toFixed(3) : '—'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scrubber */}
          <div>
            <div className="flex justify-between text-[9px] font-mono mb-1" style={{ color: 'var(--text-muted)' }}>
              <span>DISTANCE  {sample?.d ?? 0}m</span>
              <span>{sample?.t.toFixed(1) ?? 0}s</span>
            </div>
            <input
              type="range"
              min={0}
              max={data.samples.length - 1}
              value={cursor}
              onChange={(e) => setCursor(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: driverObj?.color ?? 'var(--red)' }}
              aria-label="Telemetry scrubber"
              id="telemetry-scrubber"
            />
          </div>

          {/* Speed trace */}
          <div>
            <div className="flex items-center gap-1 mb-1 text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
              <Wind className="w-3 h-3" /> SPEED TRACE
            </div>
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', padding: '6px 4px' }}
            >
              <MiniChart
                samples={data.samples}
                dataKey="speed"
                color={driverObj?.color ?? 'var(--red)'}
                fill={driverObj?.color ?? 'var(--red)'}
                max={340}
              />
            </div>
          </div>

          {/* Throttle/Brake overlay traces */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>THROTTLE %</div>
              <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', padding: '6px 4px' }}>
                <MiniChart samples={data.samples} dataKey="throttle" color="var(--green)" fill="var(--green)" max={100} />
              </div>
            </div>
            <div>
              <div className="text-[9px] font-mono tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>BRAKE</div>
              <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', padding: '6px 4px' }}>
                <MiniChart samples={data.samples} dataKey="brake" color="var(--red)" fill="var(--red)" max={100} />
              </div>
            </div>
          </div>

          {/* RPM */}
          <div>
            <div className="flex items-center gap-1 mb-1 text-[9px] font-mono tracking-widest" style={{ color: 'var(--text-muted)' }}>
              <Zap className="w-3 h-3" /> ENGINE RPM
            </div>
            <div className="rounded-lg overflow-hidden" style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-dim)', padding: '6px 4px' }}>
              <MiniChart samples={data.samples} dataKey="rpm" color="var(--amber)" fill="var(--amber)" max={15000} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
