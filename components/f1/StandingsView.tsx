'use client';

import React, { useState } from 'react';
import { DriverStanding, ConstructorStanding } from '@/lib/f1/types';
import { getTeamMeta, DRIVER_DETAILS, getDriverDetails, getNationalityFlag } from '@/lib/f1/teams';
import PaceTrace from '@/components/f1/PaceTrace';
import DriverAvatar from '@/components/f1/DriverAvatar';
import DriverIdentityCard from '@/components/f1/DriverIdentityCard';
import FreshnessBadge from '@/components/f1/FreshnessBadge';
import ContextualExplainer from '@/components/f1/ContextualExplainer';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';

interface StandingsViewProps {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  onSelectDriver?: (driverId: string) => void;
  onSelectConstructor?: (constructorId: string) => void;
  onSelectSeason?: (season: string) => void;
}

/* Position label colours */
function posColor(index: number) {
  if (index === 0) return 'var(--amber)';
  if (index === 1) return '#C0C0C0';
  if (index === 2) return '#CD7F32';
  return 'var(--text-muted)';
}

export default function StandingsView({
  driverStandings,
  constructorStandings,
  onSelectDriver,
  onSelectConstructor,
  onSelectSeason,
}: StandingsViewProps) {
  const [tab, setTab] = useState<'drivers' | 'constructors'>('drivers');
  const [selectedSeason, setSelectedSeason] = useState<string>('2026');
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  const maxDriverPoints = parseFloat(driverStandings[0]?.points || '1') || 1;
  const maxConstructorPoints = parseFloat(constructorStandings[0]?.points || '1') || 1;

  const handleSeasonChange = (year: string) => {
    setSelectedSeason(year);
    if (onSelectSeason) onSelectSeason(year);
  };

  /* ── Shared header ─────────────────────────── */
  const Header = () => (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        padding: '16px 20px',
        background: 'var(--bg-overlay)',
        borderBottom: '1px solid var(--border-dim)',
      }}
    >
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: 'clamp(22px, 4vw, 30px)',
            textTransform: 'uppercase',
            letterSpacing: '-0.01em',
            lineHeight: 1,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          {tab === 'drivers' ? 'Drivers Championship' : 'Constructors Championship'}
        </h2>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'var(--font-body)' }}>
          Official FIA Formula 1 World Championship Standings
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="flex items-center"
        style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--r-md)',
          padding: 4,
          gap: 4,
        }}
      >
        {(['drivers', 'constructors'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--r-sm)',
              background: tab === t ? 'var(--red)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-secondary)',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              transition: 'background 150ms, color 150ms',
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );

  /* ── Column header row ─────────────────────── */
  const ColHeader = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
    <div
      style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        textAlign: right ? 'right' : 'left',
      }}
    >
      {children}
    </div>
  );

  return (
    <div>
      {/* Container */}
      <div
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-dim)',
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
        }}
      >
        <Header />

        {/* ════════════════════════════════════════════
            DRIVERS TABLE
        ════════════════════════════════════════════ */}
        {tab === 'drivers' ? (
          <div>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 56px 64px',
                gap: '0 8px',
                padding: '8px 20px',
                background: 'var(--bg-overlay)',
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <ColHeader>POS</ColHeader>
              <ColHeader>Driver</ColHeader>
              <ColHeader right>Gap</ColHeader>
              <ColHeader right>PTS</ColHeader>
            </div>

            {/* Rows */}
            {driverStandings.map((standing, index) => {
              const team = standing.Constructors[0]
                ? getTeamMeta(standing.Constructors[0].constructorId)
                : getTeamMeta('ferrari');
              const driverId = standing.Driver.driverId;
              const extra = getDriverDetails(driverId);
              const points = parseFloat(standing.points) || 0;
              const gapToLeader = index === 0 ? 0 : points - maxDriverPoints;
              const percentOfLeader = Math.max(3, (points / maxDriverPoints) * 100);
              const isP1 = index === 0;
              const isExpanded = expandedDriverId === driverId;
              const driverNumber =
                extra?.number ||
                (standing.Driver.permanentNumber
                  ? parseInt(standing.Driver.permanentNumber, 10)
                  : undefined) ||
                99;

              return (
                <div
                  key={driverId}
                  style={{ borderBottom: '1px solid var(--border-dim)' }}
                >
                  <div
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        setExpandedDriverId(isExpanded ? null : driverId);
                      } else if (onSelectDriver) {
                        onSelectDriver(driverId);
                      }
                    }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '48px 1fr 56px 64px',
                      gap: '0 8px',
                      alignItems: 'center',
                      padding: '0 20px',
                      minHeight: 56,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 120ms',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-highlight)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Team color left accent */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: team.color,
                      }}
                    />

                    {/* POS */}
                    <div
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontStyle: 'italic',
                        fontSize: 20,
                        lineHeight: 1,
                        color: posColor(index),
                        textAlign: 'center',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {standing.position}
                    </div>

                    {/* Driver info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                      <DriverAvatar
                        driverId={driverId}
                        driverName={`${standing.Driver.givenName} ${standing.Driver.familyName}`}
                        permanentNumber={driverNumber}
                        teamColor={team.color}
                        size="sm"
                        mode="photo"
                        className="hidden sm:flex shrink-0"
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: 14,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {standing.Driver.givenName}{' '}
                          <strong style={{ fontWeight: 900 }}>{standing.Driver.familyName}</strong>
                          {' '}
                          <span style={{ fontSize: 12 }}>
                            {getNationalityFlag(standing.Driver.nationality) || extra?.countryFlag || ''}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-body)',
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {team.name}
                        </div>
                        {/* Mini progress bar */}
                        <div
                          style={{
                            height: 2,
                            background: 'var(--bg-base)',
                            borderRadius: 99,
                            overflow: 'hidden',
                            marginTop: 4,
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${percentOfLeader}%`,
                              background: isP1 ? 'var(--red)' : team.color,
                              transition: 'width 600ms var(--ease-snap)',
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gap */}
                    <div style={{ textAlign: 'right' }}>
                      {isP1 ? (
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            fontSize: 10,
                            letterSpacing: '0.10em',
                            textTransform: 'uppercase',
                            color: 'var(--red)',
                          }}
                        >
                          LEAD
                        </span>
                      ) : (
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {gapToLeader.toFixed(0)} pts
                        </span>
                      )}
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          color: 'var(--text-muted)',
                          marginTop: 1,
                        }}
                      >
                        {standing.wins}W
                      </div>
                    </div>

                    {/* Points */}
                    <div
                      style={{
                        textAlign: 'right',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: 'clamp(18px, 3vw, 26px)',
                        color: isP1 ? 'var(--text-primary)' : 'var(--text-primary)',
                        fontVariantNumeric: 'tabular-nums',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 6,
                      }}
                    >
                      <span>{standing.points}</span>
                      {/* Mobile expand */}
                      <span className="sm:hidden" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                        {isExpanded ? (
                          <ChevronUp style={{ width: 13, height: 13 }} />
                        ) : (
                          <ChevronDown style={{ width: 13, height: 13 }} />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Mobile expand drawer */}
                  {isExpanded && (
                    <div
                      className="sm:hidden animate-fade-in"
                      style={{
                        background: 'var(--bg-overlay)',
                        borderTop: '1px solid var(--border-dim)',
                        padding: '12px 20px',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                        {[
                          { label: 'Gap to Leader', value: isP1 ? 'LEADER' : `${gapToLeader.toFixed(0)} PTS` },
                          { label: 'Season Wins', value: `${standing.wins} ${standing.wins === '1' ? 'Win' : 'Wins'}` },
                        ].map((stat) => (
                          <div
                            key={stat.label}
                            style={{
                              padding: '10px 12px',
                              background: 'var(--bg-raised)',
                              border: '1px solid var(--border-dim)',
                              borderRadius: 'var(--r-sm)',
                            }}
                          >
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                              {stat.label}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                              {stat.value}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'var(--bg-raised)',
                          border: '1px solid var(--border-dim)',
                          borderRadius: 'var(--r-sm)',
                          marginBottom: 10,
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          5-Race Pace Form
                        </span>
                        <PaceTrace driverId={driverId} width={64} height={16} />
                      </div>
                      {onSelectDriver && (
                        <button
                          onClick={() => onSelectDriver(driverId)}
                          className="w-full btn-red flex items-center justify-center gap-1.5"
                          style={{ minHeight: 44 }}
                        >
                          Open Full Driver Dossier
                          <ChevronRight style={{ width: 13, height: 13 }} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ════════════════════════════════════════════
              CONSTRUCTORS TABLE
          ════════════════════════════════════════════ */
          <div>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr 64px 80px',
                gap: '0 8px',
                padding: '8px 20px',
                background: 'var(--bg-overlay)',
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <ColHeader>POS</ColHeader>
              <ColHeader>Constructor</ColHeader>
              <ColHeader right>Gap</ColHeader>
              <ColHeader right>PTS</ColHeader>
            </div>

            {constructorStandings.map((standing, index) => {
              const team = getTeamMeta(standing.Constructor.constructorId);
              const points = parseFloat(standing.points) || 0;
              const gapToLeader = index === 0 ? 0 : points - maxConstructorPoints;
              const percentOfLeader = Math.max(3, (points / maxConstructorPoints) * 100);
              const isP1 = index === 0;

              return (
                <div
                  key={standing.Constructor.constructorId}
                  onClick={() => onSelectConstructor && onSelectConstructor(standing.Constructor.constructorId)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr 64px 80px',
                    gap: '0 8px',
                    alignItems: 'center',
                    padding: '0 20px',
                    minHeight: 60,
                    cursor: 'pointer',
                    position: 'relative',
                    borderBottom: '1px solid var(--border-dim)',
                    transition: 'background 120ms',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-highlight)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Team color accent */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 3,
                      background: team.color,
                    }}
                  />

                  {/* POS */}
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontStyle: 'italic',
                      fontSize: 20,
                      lineHeight: 1,
                      color: posColor(index),
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {standing.position}
                  </div>

                  {/* Constructor */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: 10,
                        height: 28,
                        borderRadius: 99,
                        background: team.color,
                        flexShrink: 0,
                      }}
                    />
                    {team.carImageUrl && (
                      <img
                        src={team.carImageUrl}
                        alt={team.name}
                        className="hidden md:block"
                        style={{ height: 28, width: 'auto', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: 15,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {standing.Constructor.name}
                        {team.logoImageUrl && (
                          <img
                            src={team.logoImageUrl}
                            alt={team.name}
                            className="hidden sm:inline-block"
                            style={{ height: 14, width: 'auto', objectFit: 'contain', marginLeft: 8, opacity: 0.7, verticalAlign: 'middle' }}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        {team.powerUnit} &bull; {team.base}
                      </div>
                      <div style={{ height: 2, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden', marginTop: 4 }}>
                        <div style={{ height: '100%', width: `${percentOfLeader}%`, background: isP1 ? 'var(--red)' : team.color, transition: 'width 600ms var(--ease-snap)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Gap */}
                  <div style={{ textAlign: 'right' }}>
                    {isP1 ? (
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--red)' }}>
                        LEAD
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                        {gapToLeader.toFixed(0)} pts
                      </span>
                    )}
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                      {standing.wins}W
                    </div>
                  </div>

                  {/* Points */}
                  <div
                    style={{
                      textAlign: 'right',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      fontSize: 'clamp(20px, 3vw, 28px)',
                      color: 'var(--text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {standing.points}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
