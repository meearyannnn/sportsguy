'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Trophy,
  Gauge,
  Users,
  Search,
  Moon,
  Sun,
  Radio,
  Calculator,
  BookOpen,
  History,
  Palette,
  X,
  ChevronRight,
  ChevronDown,
  Flag,
  Newspaper,
  GraduationCap,
  Wrench,
  Zap,
} from 'lucide-react';
import { DriverStanding, Race } from '@/lib/f1/types';
import { F1_TEAMS, DRIVER_DETAILS, getTeamMeta } from '@/lib/f1/teams';
import PaceTrace from '@/components/f1/PaceTrace';

export type NavTab =
  | 'hub'
  | 'calendar'
  | 'standings'
  | 'results'
  | 'paddock'
  | 'analytics'
  | 'stories'
  | 'archive'
  | 'live'
  | 'news'
  | 'junior'
  | 'testing'
  | 'pitcrew'
  | 'about'
  | 'battle'
  | 'fantasy'
  | 'predict'
  | 'tyres'
  | 'timeline';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  useLocalTime: boolean;
  onToggleTimezone: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nextRaceName?: string;
  onOpenPersonalization?: () => void;
  onToggleGlance?: () => void;
  driverStandings?: DriverStanding[];
  calendar?: Race[];
  onSelectDriver?: (driverId: string) => void;
  onSelectRound?: (round: string) => void;
  isMobileSearchOpen?: boolean;
  onToggleMobileSearch?: () => void;
}

export default function Navbar({
  activeTab,
  onTabChange,
  isDarkMode,
  onToggleTheme,
  useLocalTime,
  onToggleTimezone,
  searchQuery,
  onSearchChange,
  nextRaceName = 'Singapore Grand Prix',
  onOpenPersonalization,
  onToggleGlance,
  driverStandings = [],
  calendar = [],
  onSelectDriver,
  onSelectRound,
  isMobileSearchOpen: controlledMobileSearch,
  onToggleMobileSearch,
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [internalMobileSearch, setInternalMobileSearch] = useState(false);
  const isMobileSearchOpen =
    controlledMobileSearch !== undefined ? controlledMobileSearch : internalMobileSearch;
  const toggleMobileSearch =
    onToggleMobileSearch || (() => setInternalMobileSearch((prev) => !prev));
  const closeMobileSearch = () => {
    if (controlledMobileSearch && onToggleMobileSearch) {
      onToggleMobileSearch();
    } else {
      setInternalMobileSearch(false);
    }
  };
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const secondaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'battle',   label: 'Battle Center',             icon: Zap },
    { id: 'predict',  label: 'Prediction Engine',         icon: Calculator },
    { id: 'fantasy',  label: 'Fantasy F1',                icon: Trophy },
    { id: 'tyres',    label: 'Tire Strategy',             icon: Gauge },
    { id: 'timeline', label: 'Championship Timeline',     icon: Radio },
    { id: 'junior',   label: 'Feeder Series (F2 / F3)',  icon: GraduationCap },
    { id: 'news',     label: 'News Wire',                 icon: Newspaper },
    { id: 'pitcrew',  label: 'Pit Crew Championship',     icon: Wrench },
    { id: 'testing',  label: 'Pre-Season Testing',        icon: Gauge },
    { id: 'analytics',label: 'Intelligence',              icon: Calculator },
    { id: 'stories',  label: 'Briefings',                 icon: BookOpen },
    { id: 'archive',  label: 'Vault 1950+',               icon: History },
    { id: 'results',  label: 'Results Archive',           icon: Trophy },
    { id: 'about',    label: 'Why This Looks Like This',  icon: BookOpen },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        closeMobileSearch();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [controlledMobileSearch, onToggleMobileSearch]);

  const cleanQuery = searchQuery.trim().toLowerCase();

  const matchingDrivers = cleanQuery
    ? (driverStandings.length > 0
        ? driverStandings
            .filter((s) => {
              const d = s.Driver;
              const full = `${d.givenName} ${d.familyName}`.toLowerCase();
              const code = (d.code || '').toLowerCase();
              const num = d.permanentNumber || '';
              const team = (s.Constructors[0]?.name || '').toLowerCase();
              return (
                full.includes(cleanQuery) ||
                code.includes(cleanQuery) ||
                num === cleanQuery ||
                team.includes(cleanQuery)
              );
            })
            .slice(0, 5)
        : Object.entries(DRIVER_DETAILS)
            .filter(([id, meta]) => {
              const full = id.replace('_', ' ').toLowerCase();
              return full.includes(cleanQuery) || meta.code.toLowerCase().includes(cleanQuery);
            })
            .slice(0, 5)
            .map(([id, meta]) => ({
              position: '1',
              points: '0',
              Driver: {
                driverId: id,
                givenName: id.split('_')[0].toUpperCase(),
                familyName: id.split('_')[1]?.toUpperCase() || '',
                code: meta.code,
                permanentNumber: String(meta.number),
                nationality: 'FIA',
              },
              Constructors: [],
            })) as any[])
    : [];

  const matchingConstructors = cleanQuery
    ? Object.values(F1_TEAMS)
        .filter((t) =>
          t.name.toLowerCase().includes(cleanQuery) ||
          t.fullName.toLowerCase().includes(cleanQuery) ||
          t.id.toLowerCase().includes(cleanQuery)
        )
        .slice(0, 3)
    : [];

  const matchingRaces = cleanQuery
    ? calendar
        .filter((r) => {
          const name = r.raceName.toLowerCase();
          const circuit = r.Circuit?.circuitName?.toLowerCase() || '';
          const country = r.Circuit?.Location?.country?.toLowerCase() || '';
          return name.includes(cleanQuery) || circuit.includes(cleanQuery) || country.includes(cleanQuery);
        })
        .slice(0, 4)
    : [];

  const hasResults =
    matchingDrivers.length > 0 || matchingConstructors.length > 0 || matchingRaces.length > 0;

  const handleSelectDriverMatch = (driverId: string) => {
    if (onSelectDriver) onSelectDriver(driverId);
    onSearchChange('');
    setIsSearchOpen(false);
    closeMobileSearch();
  };

  const handleSelectConstructorMatch = () => {
    onTabChange('paddock');
    onSearchChange('');
    setIsSearchOpen(false);
    closeMobileSearch();
  };

  const handleSelectRaceMatch = (round: string) => {
    if (onSelectRound) onSelectRound(round);
    onTabChange('results');
    onSearchChange('');
    setIsSearchOpen(false);
    closeMobileSearch();
  };

  /* ── Primary nav tabs ─────────────────────── */
  const primaryTabs = [
    { id: 'hub',       label: 'Home',      icon: Radio    },
    { id: 'calendar',  label: 'Calendar',  icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Trophy   },
    { id: 'paddock',   label: 'Drivers',   icon: Users    },
    { id: 'live',      label: 'Live',      icon: Gauge    },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full" style={{ fontFamily: 'var(--font-display)' }}>
      {/* ── Ticker bar ─────────────────────────── */}
      <div
        className="w-full border-b px-4 flex items-center justify-between"
        style={{
          background: '#0B0B0E',
          borderColor: 'var(--border-dim)',
          height: '26px',
        }}
      >
        {/* Left: live dot + ticker */}
        <div className="flex items-center gap-3 overflow-hidden text-[11px]">
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="w-1.5 h-1.5 rounded-full animate-live-pulse shrink-0"
              style={{ backgroundColor: 'var(--red)' }}
            />
            <span
              className="font-bold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-primary)', fontSize: '10px' }}
            >
              LIVE FEED
            </span>
          </div>

          <span style={{ color: 'var(--border-mid)' }} className="hidden sm:inline">|</span>

          <div
            className="hidden sm:flex items-center gap-5 whitespace-nowrap overflow-hidden"
            style={{ color: 'var(--text-secondary)', fontSize: '10px', letterSpacing: '0.06em' }}
          >
            <span>
              NEXT GP:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {nextRaceName.toUpperCase()}
              </strong>
            </span>
            <span style={{ color: 'var(--border-mid)' }}>•</span>
            <span>FIA 2026 REGULATIONS</span>
            <span style={{ color: 'var(--border-mid)' }}>•</span>
            <span>PRECISION INTERVALS: 100MS</span>
          </div>
        </div>

        {/* Right: TZ toggle */}
        <button
          onClick={onToggleTimezone}
          className="flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          style={{ color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '0.06em' }}
          title="Toggle Track / Local time"
        >
          <span>TZ:</span>
          <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
            {useLocalTime ? 'LOCAL' : 'TRACK'}
          </span>
        </button>
      </div>

      {/* ── Main bar ───────────────────────────── */}
      <div
        className="border-b"
        style={{
          background: 'rgba(11,11,14,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: 'var(--border-dim)',
        }}
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-4">

          {/* Brand */}
          <button
            onClick={() => onTabChange('hub')}
            className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            {/* Red-bar A mark */}
            <div
              className="relative flex items-center justify-center overflow-hidden shrink-0"
              style={{
                width: 32,
                height: 32,
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0"
                style={{ width: 3, background: 'var(--red)' }}
              />
              <span
                className="font-bold"
                style={{ color: 'var(--text-primary)', fontSize: 14, letterSpacing: '0.06em' }}
              >
                A
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="font-black tracking-[0.14em] uppercase"
                style={{ color: 'var(--text-primary)', fontSize: 18 }}
              >
                APEX
              </span>
              <span
                className="hidden sm:inline font-bold uppercase tracking-[0.10em]"
                style={{ color: 'var(--text-muted)', fontSize: 9 }}
              >
                TIMING HUD
              </span>
            </div>
          </button>

          {/* Hairline divider */}
          <div
            className="hidden lg:block shrink-0 mx-1"
            style={{ width: 1, height: 22, background: 'var(--border-dim)' }}
            aria-hidden="true"
          />

          {/* Desktop nav pill */}
          <nav
            className="hidden lg:flex items-center gap-0.5 shrink-0"
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-dim)',
              borderRadius: 'var(--r-md)',
              padding: '4px',
            }}
          >
            {primaryTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { onTabChange(t.id as NavTab); setIsMoreOpen(false); }}
                  className="relative flex items-center gap-1.5 cursor-pointer transition-colors"
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--r-sm)',
                    background: isActive ? 'var(--bg-highlight)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    border: 'none',
                    minWidth: 72,
                    justifyContent: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon
                    className="shrink-0"
                    style={{
                      width: 13,
                      height: 13,
                      color: isActive ? 'var(--red)' : 'var(--text-muted)',
                    }}
                  />
                  <span>{t.label}</span>
                  {/* Active bottom accent */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-3 right-3 rounded-full"
                      style={{ height: 2, background: 'var(--red)', borderRadius: 99 }}
                    />
                  )}
                </button>
              );
            })}

            {/* More dropdown */}
            <div className="relative" ref={moreDropdownRef}>
              <button
                onClick={() => setIsMoreOpen((p) => !p)}
                className="relative flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--r-sm)',
                  background: isSecondaryActive ? 'var(--bg-highlight)' : 'transparent',
                  color: isSecondaryActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  border: 'none',
                  minWidth: 64,
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>
                  {isSecondaryActive
                    ? (activeTab === 'junior' ? 'F2 / F3'
                        : activeTab === 'pitcrew' ? 'Pit Crew'
                        : activeTab === 'testing' ? 'Testing'
                        : activeTab === 'news' ? 'News'
                        : activeTab === 'analytics' ? 'Intel'
                        : activeTab === 'stories' ? 'Stories'
                        : activeTab === 'archive' ? 'Archive'
                        : activeTab === 'results' ? 'Results'
                        : activeTab === 'about' ? 'About'
                        : 'More')
                    : 'More'}
                </span>
                {isSecondaryActive && (
                  <span
                    className="absolute bottom-0 left-3 right-3 rounded-full"
                    style={{ height: 2, background: 'var(--red)', borderRadius: 99 }}
                  />
                )}
                <ChevronDown
                  style={{
                    width: 12,
                    height: 12,
                    color: isSecondaryActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    transform: isMoreOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 180ms',
                  }}
                />
              </button>

              {isMoreOpen && (
                <div
                  className="absolute right-0 z-50 animate-fade-in"
                  style={{
                    top: 'calc(100% + 8px)',
                    width: 224,
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--shadow-modal)',
                    padding: '6px',
                  }}
                >
                  {secondaryTabs.map((sec) => {
                    const SecIcon = sec.icon;
                    const isSec = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => { onTabChange(sec.id); setIsMoreOpen(false); }}
                        className="w-full flex items-center gap-2 cursor-pointer transition-colors"
                        style={{
                          padding: '8px 10px',
                          borderRadius: 'var(--r-sm)',
                          background: isSec ? 'var(--red)' : 'transparent',
                          color: isSec ? '#fff' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-display)',
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: 'none',
                          textAlign: 'left',
                        }}
                      >
                        <SecIcon style={{ width: 13, height: 13, flexShrink: 0 }} />
                        <span>{sec.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0" ref={searchContainerRef}>

            {/* Desktop search */}
            <div className="relative hidden md:block" style={{ width: 200 }}>
              <Search
                className="absolute pointer-events-none"
                style={{
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 13,
                  height: 13,
                  color: 'var(--text-muted)',
                }}
              />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => { onSearchChange(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Driver, team, GP..."
                style={{
                  width: '100%',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: 'var(--r-sm)',
                  padding: '6px 28px 6px 32px',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-mid)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = isSearchOpen ? 'var(--border-mid)' : 'var(--border-dim)')}
              />
              {searchQuery && (
                <button
                  onClick={() => { onSearchChange(''); setIsSearchOpen(false); }}
                  className="absolute cursor-pointer"
                  style={{
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <X style={{ width: 12, height: 12 }} />
                </button>
              )}

              {/* Search dropdown */}
              {isSearchOpen && cleanQuery.length > 0 && (
                <div
                  className="absolute left-0 right-0 z-50 animate-fade-in overflow-hidden"
                  style={{
                    top: 'calc(100% + 6px)',
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-mid)',
                    borderRadius: 'var(--r-md)',
                    boxShadow: 'var(--shadow-modal)',
                    maxHeight: 360,
                    overflowY: 'auto',
                    fontSize: 12,
                  }}
                >
                  {hasResults ? (
                    <>
                      {matchingDrivers.length > 0 && (
                        <div style={{ padding: '8px 8px 4px' }}>
                          <div
                            style={{
                              padding: '2px 6px 6px',
                              fontSize: 10,
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>Drivers</span>
                            <span>Click for dossier</span>
                          </div>
                          {matchingDrivers.map((standing) => {
                            const d = standing.Driver;
                            const team = standing.Constructors[0]
                              ? getTeamMeta(standing.Constructors[0].constructorId)
                              : getTeamMeta('ferrari');
                            return (
                              <button
                                key={d.driverId}
                                onClick={() => handleSelectDriverMatch(d.driverId)}
                                className="w-full flex items-center justify-between gap-2 cursor-pointer transition-colors"
                                style={{
                                  padding: '7px 10px',
                                  borderRadius: 'var(--r-sm)',
                                  background: 'transparent',
                                  border: 'none',
                                  textAlign: 'left',
                                  color: 'var(--text-primary)',
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background = 'var(--bg-highlight)')
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = 'transparent')
                                }
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="shrink-0 rounded-full"
                                    style={{ width: 3, height: 16, background: team.color }}
                                  />
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: 10,
                                      color: 'var(--text-muted)',
                                      width: 24,
                                      textAlign: 'right',
                                      flexShrink: 0,
                                    }}
                                  >
                                    #{d.permanentNumber || '—'}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-display)',
                                      fontWeight: 700,
                                      fontSize: 13,
                                      letterSpacing: '0.06em',
                                      textTransform: 'uppercase',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {d.givenName} <strong>{d.familyName}</strong>
                                  </span>
                                  <span
                                    className="hidden sm:inline truncate"
                                    style={{ fontSize: 10, color: 'var(--text-muted)' }}
                                  >
                                    ({standing.Constructors[0]?.name || team.name})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <PaceTrace driverId={d.driverId} width={32} height={10} />
                                  <ChevronRight style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {matchingConstructors.length > 0 && (
                        <div
                          style={{
                            borderTop: '1px solid var(--border-dim)',
                            padding: '8px 8px 4px',
                          }}
                        >
                          <div
                            style={{
                              padding: '2px 6px 6px',
                              fontSize: 10,
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: 'var(--text-muted)',
                            }}
                          >
                            Teams &amp; Constructors
                          </div>
                          {matchingConstructors.map((c) => (
                            <button
                              key={c.id}
                              onClick={handleSelectConstructorMatch}
                              className="w-full flex items-center justify-between gap-2 cursor-pointer transition-colors"
                              style={{
                                padding: '7px 10px',
                                borderRadius: 'var(--r-sm)',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                color: 'var(--text-primary)',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = 'var(--bg-highlight)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="shrink-0"
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: '50%',
                                    background: c.color,
                                    border: '1px solid rgba(0,0,0,0.3)',
                                    display: 'inline-block',
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {c.fullName}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontSize: 10,
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 700,
                                  color: 'var(--text-muted)',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.06em',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                View Paddock →
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {matchingRaces.length > 0 && (
                        <div
                          style={{
                            borderTop: '1px solid var(--border-dim)',
                            padding: '8px 8px 4px',
                          }}
                        >
                          <div
                            style={{
                              padding: '2px 6px 6px',
                              fontSize: 10,
                              fontFamily: 'var(--font-display)',
                              fontWeight: 700,
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              color: 'var(--text-muted)',
                            }}
                          >
                            Grand Prix Schedule
                          </div>
                          {matchingRaces.map((r) => (
                            <button
                              key={r.round}
                              onClick={() => handleSelectRaceMatch(r.round)}
                              className="w-full flex items-center justify-between gap-2 cursor-pointer"
                              style={{
                                padding: '7px 10px',
                                borderRadius: 'var(--r-sm)',
                                background: 'transparent',
                                border: 'none',
                                textAlign: 'left',
                                color: 'var(--text-primary)',
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background = 'var(--bg-highlight)')
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = 'transparent')
                              }
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Flag
                                  style={{ width: 12, height: 12, color: 'var(--red)', flexShrink: 0 }}
                                />
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: 10,
                                    color: 'var(--text-muted)',
                                    flexShrink: 0,
                                  }}
                                >
                                  R{r.round}
                                </span>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {r.raceName}
                                </span>
                              </div>
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: 10,
                                  color: 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {r.date}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        padding: 16,
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: 12,
                      }}
                    >
                      <p>No match for &quot;{searchQuery}&quot;</p>
                      <p style={{ fontSize: 10, marginTop: 4 }}>
                        Try &quot;Verstappen&quot;, &quot;Norris&quot;, &quot;Ferrari&quot;, or &quot;Monaco&quot;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile search button */}
            <button
              onClick={toggleMobileSearch}
              className="md:hidden cursor-pointer transition-colors"
              style={{
                padding: '7px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Search"
              aria-label="Toggle search input"
            >
              <Search style={{ width: 14, height: 14 }} />
            </button>

            {/* Glance mode */}
            {onToggleGlance && (
              <button
                onClick={onToggleGlance}
                className="flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  padding: '6px 12px',
                  background: 'rgba(245,184,0,0.08)',
                  border: '1px solid rgba(245,184,0,0.25)',
                  borderRadius: 'var(--r-sm)',
                  color: '#F5B800',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
                title="Distraction-free Glance Mode"
              >
                <Zap style={{ width: 13, height: 13 }} />
                <span className="hidden sm:inline">Glance</span>
              </button>
            )}

            {/* Livery / Personalization */}
            {onOpenPersonalization && (
              <button
                onClick={onOpenPersonalization}
                className="flex items-center gap-1.5 cursor-pointer transition-colors"
                style={{
                  padding: '6px 12px',
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: 'var(--r-sm)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
                title="Personalize livery &amp; allegiance"
              >
                <Palette style={{ width: 13, height: 13, color: 'var(--red)' }} />
                <span className="hidden sm:inline">Livery</span>
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={onToggleTheme}
              className="cursor-pointer transition-colors flex items-center justify-center"
              style={{
                padding: '7px',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-sm)',
                color: 'var(--text-secondary)',
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <Sun style={{ width: 14, height: 14, color: '#F5B800' }} />
              ) : (
                <Moon style={{ width: 14, height: 14, color: '#6B6B78' }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Horizontal Quick-Access Strip ── */}
      <nav
        aria-label="Mobile Navigation Strip"
        className="lg:hidden w-full border-b overflow-x-auto touch-scroll no-scrollbar"
        style={{
          background: 'rgba(11,11,14,0.98)',
          borderColor: 'var(--border-dim)',
          padding: '6px 12px',
        }}
      >
        <div className="flex items-center gap-1.5 w-max">
          {[
            { id: 'hub',       label: 'Home',      icon: Radio },
            { id: 'calendar',  label: 'Calendar',  icon: Calendar },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'battle',    label: 'Battle',    icon: Zap,        badge: 'NEW' },
            { id: 'predict',   label: 'Predict',   icon: Calculator, badge: 'NEW' },
            { id: 'fantasy',   label: 'Fantasy',   icon: Trophy,     badge: 'NEW' },
            { id: 'timeline',  label: 'Timeline',  icon: Radio,      badge: 'NEW' },
            { id: 'tyres',     label: 'Tyres',     icon: Gauge,      badge: 'NEW' },
            { id: 'paddock',   label: 'Drivers',   icon: Users },
            { id: 'live',      label: 'Live',      icon: Gauge },
            { id: 'junior',    label: 'F2/F3',     icon: GraduationCap },
            { id: 'news',      label: 'News',      icon: Newspaper },
            { id: 'pitcrew',   label: 'Pit Crew',  icon: Wrench },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id as NavTab)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-hud uppercase tracking-wider font-bold shrink-0 transition-all cursor-pointer select-none"
                style={{
                  background: isActive ? 'var(--red)' : 'var(--bg-raised)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--red)' : 'var(--border-dim)'}`,
                  boxShadow: isActive ? '0 0 12px var(--red-glow)' : 'none',
                }}
              >
                <Icon style={{ width: 12, height: 12, color: isActive ? '#fff' : 'var(--text-muted)' }} />
                <span>{item.label}</span>
                {item.badge && !isActive && (
                  <span
                    className="text-[8px] font-mono px-1 rounded font-black tracking-normal"
                    style={{ background: 'var(--red-subtle)', color: 'var(--red)' }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile search drawer ─────────────────── */}
      {isMobileSearchOpen && (
        <div
          className="md:hidden border-b animate-fade-in"
          style={{
            background: 'var(--bg-raised)',
            borderColor: 'var(--border-dim)',
            padding: '10px 12px',
          }}
        >
          <div className="relative">
            <Search
              className="absolute pointer-events-none"
              style={{
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 13,
                height: 13,
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search driver, team, circuit..."
              autoFocus
              style={{
                width: '100%',
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--r-sm)',
                padding: '9px 28px 9px 32px',
                fontSize: 14,
                fontFamily: 'var(--font-body)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute cursor-pointer"
                style={{
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {cleanQuery && hasResults && (
            <div
              className="max-h-60 overflow-y-auto divide-y mt-2"
              style={{
                border: '1px solid var(--border-dim)',
                borderRadius: 'var(--r-sm)',
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-dim)',
              }}
            >
              {matchingDrivers.map((standing) => (
                <button
                  key={standing.Driver.driverId}
                  onClick={() => handleSelectDriverMatch(standing.Driver.driverId)}
                  className="w-full flex items-center justify-between cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    {standing.Driver.givenName} {standing.Driver.familyName}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Profile →
                  </span>
                </button>
              ))}
              {matchingRaces.map((r) => (
                <button
                  key={r.round}
                  onClick={() => handleSelectRaceMatch(r.round)}
                  className="w-full flex items-center justify-between cursor-pointer"
                  style={{
                    padding: '10px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    R{r.round} &bull; {r.raceName}
                  </span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Results →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
