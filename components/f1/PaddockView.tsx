'use client';

import React, { useState } from 'react';
import { DriverStanding, ConstructorStanding } from '@/lib/f1/types';
import { F1_TEAMS, DRIVER_DETAILS, getTeamMeta, getDriverDetails, getIsoNationalityCode } from '@/lib/f1/teams';
import {
  Users,
  Swords,
  Shield,
  Trophy,
  Award,
  Zap,
  Check,
  ChevronRight,
  GraduationCap,
  Wrench,
} from 'lucide-react';
import DriverAvatar from '@/components/f1/DriverAvatar';
import { NavTab } from './Navbar';

interface PaddockViewProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  onSelectDriver?: (driverId: string) => void;
  onSelectConstructor?: (constructorId: string) => void;
  onNavigateTab?: (tab: NavTab) => void;
  initialSubTab?: 'h2h' | 'constructors' | 'drivers';
}

/* Stat bar row for H2H */
function StatBar({
  labelA,
  labelB,
  heading,
  colorA,
  colorB,
  fracA,
  greenA,
  greenB,
}: {
  labelA: string;
  labelB: string;
  heading: string;
  colorA: string;
  colorB: string;
  fracA: number;
  greenA?: boolean;
  greenB?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 6,
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}
      >
        <span style={{ color: greenA ? 'var(--green)' : 'var(--text-secondary)' }}>{labelA}</span>
        <span style={{ color: 'var(--text-muted)' }}>{heading}</span>
        <span style={{ color: greenB ? 'var(--green)' : 'var(--text-secondary)' }}>{labelB}</span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 99,
          overflow: 'hidden',
          background: 'var(--bg-base)',
          display: 'flex',
        }}
      >
        <div style={{ width: `${fracA * 100}%`, background: colorA, transition: 'width 500ms var(--ease-snap)' }} />
        <div style={{ flex: 1, background: colorB, transition: 'width 500ms var(--ease-snap)' }} />
      </div>
    </div>
  );
}

export default function PaddockView({
  driverStandings,
  constructorStandings,
  onSelectDriver,
  onSelectConstructor,
  onNavigateTab,
  initialSubTab = 'drivers',
}: PaddockViewProps) {
  const [subTab, setSubTab] = useState<'h2h' | 'constructors' | 'drivers'>(initialSubTab);

  const [driverAId, setDriverAId] = useState<string>(
    driverStandings[0]?.Driver.driverId || 'max_verstappen'
  );
  const [driverBId, setDriverBId] = useState<string>(
    driverStandings[1]?.Driver.driverId || 'norris'
  );

  const standingA = driverStandings.find((s) => s.Driver.driverId === driverAId) || driverStandings[0];
  const standingB = driverStandings.find((s) => s.Driver.driverId === driverBId) || driverStandings[1];

  const teamA = standingA?.Constructors[0]
    ? getTeamMeta(standingA.Constructors[0].constructorId)
    : getTeamMeta('red_bull');
  const teamB = standingB?.Constructors[0]
    ? getTeamMeta(standingB.Constructors[0].constructorId)
    : getTeamMeta('mclaren');

  const metaA = getDriverDetails(standingA?.Driver.driverId || '') || {
    number: standingA?.Driver.permanentNumber ? parseInt(standingA.Driver.permanentNumber, 10) : 3,
    code: standingA?.Driver.code || 'VER', countryFlag: '', worldTitles: 4, bio: '',
  };
  const metaB = getDriverDetails(standingB?.Driver.driverId || '') || {
    number: standingB?.Driver.permanentNumber ? parseInt(standingB.Driver.permanentNumber, 10) : 1,
    code: standingB?.Driver.code || 'NOR', countryFlag: '', worldTitles: 1, bio: '',
  };

  const ptsA = parseFloat(standingA?.points || '0');
  const ptsB = parseFloat(standingB?.points || '0');
  const winsA = parseInt(standingA?.wins || '0', 10);
  const winsB = parseInt(standingB?.wins || '0', 10);
  const posA = parseInt(standingA?.position || '1', 10);
  const posB = parseInt(standingB?.position || '2', 10);

  const subTabs = [
    { id: 'drivers' as const,      label: 'Driver Grid',   icon: Award  },
    { id: 'constructors' as const, label: 'Constructors',  icon: Shield },
    { id: 'h2h' as const,          label: 'Head to Head',  icon: Swords },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header ─────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--r-lg)',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 900,
              fontSize: 'clamp(20px, 3.5vw, 28px)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              lineHeight: 1,
              color: 'var(--text-primary)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Users style={{ width: 20, height: 20, color: 'var(--red)', flexShrink: 0 }} />
            F1 Paddock &amp; Drivers
          </h2>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Compare drivers side-by-side, inspect constructors, and view the driver grid.
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-overlay)',
            border: '1px solid var(--border-dim)',
            borderRadius: 'var(--r-md)',
            padding: 4,
            gap: 4,
          }}
        >
          {subTabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setSubTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: subTab === t.id ? 'var(--red)' : 'transparent',
                  color: subTab === t.id ? '#fff' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 150ms, color 150ms',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon style={{ width: 13, height: 13, flexShrink: 0 }} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          HEAD TO HEAD
      ════════════════════════════════════════════ */}
      {subTab === 'h2h' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['A', 'B'] as const).map((side) => {
              const curId = side === 'A' ? driverAId : driverBId;
              const setter = side === 'A' ? setDriverAId : setDriverBId;
              const teamColor = side === 'A' ? teamA.color : teamB.color;
              return (
                <div
                  key={side}
                  style={{
                    background: 'var(--bg-raised)',
                    border: `1px solid ${teamColor}40`,
                    borderRadius: 'var(--r-md)',
                    padding: '12px 16px',
                  }}
                >
                  <label
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: 8,
                    }}
                  >
                    Driver {side}
                  </label>
                  <select
                    value={curId}
                    onChange={(e) => setter(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-overlay)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: 'var(--r-sm)',
                      padding: '8px 10px',
                      fontSize: 13,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {driverStandings.map((s) => (
                      <option key={s.Driver.driverId} value={s.Driver.driverId}>
                        P{s.position} • {s.Driver.givenName} {s.Driver.familyName} ({s.Constructors[0]?.name})
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          {/* VS arena */}
          <div
            className="timing-tower-rail is-live"
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--r-lg)',
              padding: 'clamp(16px, 4vw, 32px)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Ghost VS watermark */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontStyle: 'italic',
                fontSize: 'clamp(60px, 14vw, 120px)',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.04)',
                userSelect: 'none',
                pointerEvents: 'none',
                lineHeight: 1,
                letterSpacing: '-0.04em',
                zIndex: 0,
              }}
            >
              VS
            </div>

            <div
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 24,
              }}
            >
              {/* Driver A */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Number badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--r-sm)',
                    background: `${teamA.color}18`,
                    border: `1px solid ${teamA.color}50`,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 22,
                    color: teamA.color,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                >
                  #{metaA.number}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    [{getIsoNationalityCode(standingA?.Driver.nationality)}] {standingA?.Driver.nationality}
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: 'clamp(18px, 4vw, 28px)',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      lineHeight: 0.95,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {standingA?.Driver.givenName}{' '}
                    <span style={{ color: teamA.color }}>{standingA?.Driver.familyName}</span>
                  </h3>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--r-sm)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {teamA.fullName}
                </div>
                {metaA.bio && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font-body)', margin: 0 }}>
                    {metaA.bio}
                  </p>
                )}
                {standingA?.Driver && (
                  <button
                    onClick={() => onSelectDriver && onSelectDriver(standingA.Driver.driverId)}
                    className="btn-ghost flex items-center gap-1.5 self-start"
                  >
                    VIEW DOSSIER <ChevronRight style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>

              {/* Driver B */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--r-sm)',
                    background: `${teamB.color}18`,
                    border: `1px solid ${teamB.color}50`,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 900,
                    fontSize: 22,
                    color: teamB.color,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em',
                  }}
                >
                  #{metaB.number}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      marginBottom: 4,
                    }}
                  >
                    {standingB?.Driver.nationality} [{getIsoNationalityCode(standingB?.Driver.nationality)}]
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: 'clamp(18px, 4vw, 28px)',
                      textTransform: 'uppercase',
                      letterSpacing: '-0.01em',
                      lineHeight: 0.95,
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {standingB?.Driver.givenName}{' '}
                    <span style={{ color: teamB.color }}>{standingB?.Driver.familyName}</span>
                  </h3>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--r-sm)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {teamB.fullName}
                </div>
                {metaB.bio && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic', fontFamily: 'var(--font-body)', margin: 0 }}>
                    {metaB.bio}
                  </p>
                )}
                {standingB?.Driver && (
                  <button
                    onClick={() => onSelectDriver && onSelectDriver(standingB.Driver.driverId)}
                    className="btn-ghost flex items-center gap-1.5"
                  >
                    VIEW DOSSIER <ChevronRight style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
            </div>

            {/* Stat bars */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 20,
                borderTop: '1px solid var(--border-dim)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <StatBar
                labelA={`P${posA}`}
                labelB={`P${posB}`}
                heading="Championship Rank"
                colorA={teamA.color}
                colorB={teamB.color}
                fracA={posB / (posA + posB)}
                greenA={posA < posB}
                greenB={posB < posA}
              />
              <StatBar
                labelA={`${ptsA} PTS`}
                labelB={`${ptsB} PTS`}
                heading="Season Points"
                colorA={teamA.color}
                colorB={teamB.color}
                fracA={ptsA + ptsB === 0 ? 0.5 : ptsA / (ptsA + ptsB)}
                greenA={ptsA >= ptsB}
                greenB={ptsB >= ptsA}
              />
              <StatBar
                labelA={`${winsA} WINS`}
                labelB={`${winsB} WINS`}
                heading="Season Victories"
                colorA={teamA.color}
                colorB={teamB.color}
                fracA={winsA + winsB === 0 ? 0.5 : winsA / (winsA + winsB)}
                greenA={winsA >= winsB}
                greenB={winsB >= winsA}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ color: metaA.worldTitles >= metaB.worldTitles ? 'var(--amber)' : 'var(--text-secondary)' }}>
                  {metaA.worldTitles} TITLES
                </span>
                <span style={{ color: 'var(--text-muted)' }}>Career World Championships</span>
                <span style={{ color: metaB.worldTitles >= metaA.worldTitles ? 'var(--amber)' : 'var(--text-secondary)' }}>
                  {metaB.worldTitles} TITLES
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          CONSTRUCTORS GRID
      ════════════════════════════════════════════ */}
      {subTab === 'constructors' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
            gap: 12,
          }}
        >
          {Object.entries(F1_TEAMS).map(([key, team]) => (
            <div
              key={key}
              onClick={() => onSelectConstructor && onSelectConstructor(key)}
              style={{
                position: 'relative',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-lg)',
                padding: '16px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${team.color}60`;
                e.currentTarget.style.background = 'var(--bg-overlay)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-dim)';
                e.currentTarget.style.background = 'var(--bg-raised)';
              }}
            >
              {/* Top color strip */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: team.color,
                  borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
                }}
              />

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--r-sm)',
                      background: `${team.color}20`,
                      border: `1px solid ${team.color}40`,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: team.color,
                    }}
                  >
                    {team.name}
                  </span>
                  {team.logoImageUrl && (
                    <img
                      src={team.logoImageUrl}
                      alt={team.name}
                      style={{ height: 16, width: 'auto', objectFit: 'contain', opacity: 0.8 }}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    padding: '2px 8px',
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  {team.championships} {team.championships === 1 ? 'Title' : 'Titles'}
                </span>
              </div>

              {/* Full name */}
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: 15,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  color: 'var(--text-primary)',
                  margin: '0 0 2px',
                  lineHeight: 1.1,
                }}
              >
                {team.fullName}
              </h3>
              {team.chassis && (
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--red)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 10,
                  }}
                >
                  CHASSIS: {team.chassis}
                </div>
              )}

              {/* Car image */}
              {team.carImageUrl && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid var(--border-dim)',
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 8px',
                    marginBottom: 10,
                  }}
                >
                  <img
                    src={team.carImageUrl}
                    alt={`${team.name} F1 Car`}
                    style={{
                      height: 64,
                      width: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
                      transition: 'transform 300ms var(--ease-snap)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                </div>
              )}

              {/* Specs grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 6,
                  borderTop: '1px solid var(--border-dim)',
                  paddingTop: 10,
                }}
              >
                {[
                  { label: 'Power Unit', value: team.powerUnit },
                  { label: 'Base / HQ', value: team.base },
                  { label: 'Team Chief', value: team.teamPrincipal },
                  { label: 'Technical Chief', value: team.technicalChief || 'N/A' },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: '7px 8px',
                      background: 'rgba(0,0,0,0.20)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: 'var(--r-sm)',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {s.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
                {team.firstEntry && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      padding: '6px 8px',
                      background: 'rgba(0,0,0,0.20)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: 'var(--r-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      First Entry
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                      {team.firstEntry}
                    </span>
                  </div>
                )}
              </div>

              {/* Livery palette */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 9, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Livery
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span
                    style={{ width: 14, height: 14, borderRadius: '50%', background: team.color, border: '1px solid rgba(0,0,0,0.3)', display: 'inline-block' }}
                    title={`Primary: ${team.color}`}
                  />
                  <span
                    style={{ width: 14, height: 14, borderRadius: '50%', background: team.secondaryColor, border: '1px solid rgba(0,0,0,0.3)', display: 'inline-block' }}
                    title={`Secondary: ${team.secondaryColor}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════
          DRIVER GRID
      ════════════════════════════════════════════ */}
      {subTab === 'drivers' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))',
            gap: 10,
          }}
        >
          {driverStandings.map((s) => {
            const team = s.Constructors[0]
              ? getTeamMeta(s.Constructors[0].constructorId)
              : getTeamMeta('ferrari');
            const meta = getDriverDetails(s.Driver.driverId) || {
              number: s.Driver.permanentNumber ? parseInt(s.Driver.permanentNumber, 10) : 99,
              code: s.Driver.code || 'DRV',
              worldTitles: 0,
            };
            const driverNumber = meta.number || (s.Driver.permanentNumber ? parseInt(s.Driver.permanentNumber, 10) : 99);
            const isLeader = s.position === '1';

            return (
              <div
                key={s.Driver.driverId}
                onClick={() => onSelectDriver && onSelectDriver(s.Driver.driverId)}
                style={{
                  position: 'relative',
                  background: 'var(--bg-raised)',
                  border: `1px solid ${isLeader ? 'rgba(225,6,0,0.35)' : 'var(--border-dim)'}`,
                  borderRadius: 'var(--r-md)',
                  padding: '14px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 150ms, background 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${team.color}50`;
                  e.currentTarget.style.background = 'var(--bg-overlay)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isLeader ? 'rgba(225,6,0,0.35)' : 'var(--border-dim)';
                  e.currentTarget.style.background = 'var(--bg-raised)';
                }}
              >
                {/* Top strip */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: team.color,
                  }}
                />

                {/* Ghost number */}
                <div
                  className="ghost-number"
                  style={{ fontSize: 'clamp(48px, 10vw, 72px)', right: -4, opacity: 0.6 }}
                >
                  {driverNumber}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Driver avatar + nationality */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <DriverAvatar
                      driverId={s.Driver.driverId}
                      driverName={`${s.Driver.givenName} ${s.Driver.familyName}`}
                      permanentNumber={driverNumber}
                      teamColor={team.color}
                      size="md"
                      mode="photo"
                      className="shrink-0"
                    />
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 9,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: 'var(--text-muted)',
                          marginBottom: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        [{getIsoNationalityCode(s.Driver.nationality)}] &bull; {team.name}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          fontSize: 14,
                          textTransform: 'uppercase',
                          letterSpacing: '0.02em',
                          color: 'var(--text-primary)',
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {s.Driver.givenName}{' '}
                        <span style={{ color: team.color }}>{s.Driver.familyName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Number + stats bar */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-dim)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: 12,
                        fontVariantNumeric: 'tabular-nums',
                        padding: '2px 8px',
                        borderRadius: 'var(--r-sm)',
                        background: `${team.color}18`,
                        border: `1px solid ${team.color}45`,
                        color: team.color,
                      }}
                    >
                      #{driverNumber}
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        P{s.position}
                      </div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 900,
                          fontSize: 18,
                          color: 'var(--text-primary)',
                          fontVariantNumeric: 'tabular-nums',
                          lineHeight: 1,
                        }}
                      >
                        {s.points}
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 3, fontWeight: 600 }}>PTS</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
