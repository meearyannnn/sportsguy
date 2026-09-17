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
  | 'about';

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
  const isMobileSearchOpen = controlledMobileSearch !== undefined ? controlledMobileSearch : internalMobileSearch;
  const toggleMobileSearch = onToggleMobileSearch || (() => setInternalMobileSearch((prev) => !prev));
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

  // Close more dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const secondaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'junior', label: 'Feeder Series (F2 / F3)', icon: GraduationCap },
    { id: 'news', label: 'News Wire', icon: Newspaper },
    { id: 'pitcrew', label: 'Pit Crew Championship', icon: Wrench },
    { id: 'testing', label: 'Pre-Season Testing', icon: Gauge },
    { id: 'analytics', label: 'Intelligence', icon: Calculator },
    { id: 'stories', label: 'Briefings', icon: BookOpen },
    { id: 'archive', label: 'Vault 1950+', icon: History },
    { id: 'results', label: 'Results Archive', icon: Trophy },
    { id: 'about', label: 'Why This Looks Like This', icon: BookOpen },
  ];

  const isSecondaryActive = secondaryTabs.some((t) => t.id === activeTab);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Esc closes search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        closeMobileSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [controlledMobileSearch, onToggleMobileSearch]);

  const cleanQuery = searchQuery.trim().toLowerCase();

  // Search Results Filtering
  const matchingDrivers = cleanQuery
    ? (driverStandings.length > 0
        ? driverStandings
            .filter((s) => {
              const d = s.Driver;
              const full = `${d.givenName} ${d.familyName}`.toLowerCase();
              const code = (d.code || '').toLowerCase();
              const num = d.permanentNumber || '';
              const team = (s.Constructors[0]?.name || '').toLowerCase();
              return full.includes(cleanQuery) || code.includes(cleanQuery) || num === cleanQuery || team.includes(cleanQuery);
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
        .filter((t) => {
          return (
            t.name.toLowerCase().includes(cleanQuery) ||
            t.fullName.toLowerCase().includes(cleanQuery) ||
            t.id.toLowerCase().includes(cleanQuery)
          );
        })
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
    if (onSelectDriver) {
      onSelectDriver(driverId);
    }
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
    if (onSelectRound) {
      onSelectRound(round);
    }
    onTabChange('results');
    onSearchChange('');
    setIsSearchOpen(false);
    closeMobileSearch();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] transition-colors">
      {/* Top Precision Timing Ticker */}
      <div className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)] py-1 px-4 text-xs flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden text-[11px] font-mono-num">
          {/* Signal Indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] animate-live-pulse"></span>
            <span className="font-hud font-bold text-[var(--text-primary)] uppercase tracking-wider text-[10px]">
              LIVE TELEMETRY FEED
            </span>
          </div>

          <span className="text-[var(--border-subtle)] hidden sm:inline">|</span>

          {/* Ticker marquee */}
          <div className="hidden sm:flex items-center gap-4 text-[var(--text-secondary)] whitespace-nowrap overflow-hidden">
            <span>NEXT GP: <strong className="text-[var(--text-primary)]">{nextRaceName.toUpperCase()}</strong></span>
            <span>•</span>
            <span>PRECISION TIMING INTERVALS: <strong>100MS</strong></span>
            <span>•</span>
            <span>FIA 2026 WORLD CHAMPIONSHIP REGULATIONS</span>
          </div>
        </div>

        {/* Timezone Switcher Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleTimezone}
            className="flex items-center gap-1 text-[10px] font-mono-num text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Toggle between Track Local Time & Your System Time"
          >
            <span>TZ:</span>
            <span className="font-bold text-[var(--text-primary)]">
              {useLocalTime ? 'LOCAL' : 'TRACK'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">
        {/* Left: APEX Brand Identifier & Explicit Separator */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => onTabChange('hub')}
          >
            {/* Flat timing symbol with signal red accent */}
            <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center font-hud font-black text-sm text-[var(--text-primary)] relative overflow-hidden group-hover:border-[var(--border-hover)] transition-colors shrink-0">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-f1-red)]"></div>
              <span>A</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-hud font-black text-xl tracking-widest text-[var(--text-primary)]">
                APEX
              </span>
              <span className="text-[9px] font-mono-num text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline">
                TIMING HUD
              </span>
            </div>
          </div>

          {/* Explicit Hairline Divider */}
          <div className="hidden lg:block h-6 w-px bg-[var(--border-subtle)] mx-1 shrink-0" aria-hidden="true" />
        </div>

        {/* Desktop Navigation Tabs — 5 Primary Items + Secondary Dropdown */}
        <nav className="hidden lg:flex items-center gap-1 border border-[var(--border-subtle)] rounded p-1 bg-[var(--bg-secondary)] shrink-0">
          {[
            { id: 'hub', label: 'Home', icon: Radio },
            { id: 'calendar', label: 'Calendar', icon: Calendar },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'paddock', label: 'Drivers', icon: Users },
            { id: 'live', label: 'Live', icon: Gauge },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onTabChange(t.id as NavTab);
                  setIsMoreOpen(false);
                }}
                className={`px-3 py-1.5 min-w-[76px] justify-center rounded text-xs font-hud font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[var(--accent-f1-red)]' : 'text-[var(--text-muted)]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}

          {/* Secondary "More" Dropdown */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`px-3 py-1.5 min-w-[72px] justify-center rounded text-xs font-hud font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                isSecondaryActive
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <span>{isSecondaryActive ? secondaryTabs.find((s) => s.id === activeTab)?.label || 'More' : 'More'}</span>
              <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute left-0 mt-1.5 w-48 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-1 z-50 divide-y divide-[var(--border-subtle)]">
                <div className="space-y-0.5 pb-1">
                  {secondaryTabs.map((sec) => {
                    const SecIcon = sec.icon;
                    const isSecActive = activeTab === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => {
                          onTabChange(sec.id);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-sm flex items-center justify-between text-xs font-hud font-bold uppercase transition-colors cursor-pointer ${
                          isSecActive
                            ? 'bg-[var(--accent-f1-red)] text-white'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <SecIcon className="w-3.5 h-3.5 shrink-0" />
                          <span>{sec.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right: Search, Theme & Actions (Fixed width, never clipped) */}
        <div className="flex items-center gap-2 shrink-0" ref={searchContainerRef}>
          {/* Desktop Search Box with Instant Dropdown */}
          <div className="relative hidden md:block w-48 xl:w-56 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search driver, team, GP..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded pl-8 pr-7 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--text-muted)] transition-colors font-hud"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  onSearchChange('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Instant Search Dropdown Palette */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-sm z-50 overflow-hidden text-xs max-h-96 overflow-y-auto">
                {hasResults ? (
                  <div className="divide-y divide-[var(--border-subtle)]">
                    {/* Drivers Matches */}
                    {matchingDrivers.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                          <span>Drivers</span>
                          <span>Click for dossier</span>
                        </div>
                        <div className="space-y-0.5">
                          {matchingDrivers.map((standing) => {
                            const d = standing.Driver;
                            const team = standing.Constructors[0]
                              ? getTeamMeta(standing.Constructors[0].constructorId)
                              : getTeamMeta('ferrari');
                            return (
                              <button
                                key={d.driverId}
                                onClick={() => handleSelectDriverMatch(d.driverId)}
                                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[var(--bg-tertiary)] flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className="w-1 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: team.color }}
                                  ></div>
                                  <span className="font-mono-num font-bold text-[11px] text-[var(--text-muted)] w-5 text-right shrink-0">
                                    #{d.permanentNumber || '—'}
                                  </span>
                                  <span className="font-hud font-bold uppercase truncate text-[var(--text-primary)] group-hover:text-white">
                                    {d.givenName} <strong>{d.familyName}</strong>
                                  </span>
                                  <span className="text-[10px] text-[var(--text-muted)] truncate hidden sm:inline">
                                    ({standing.Constructors[0]?.name || team.name})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <PaceTrace driverId={d.driverId} width={32} height={10} />
                                  <ChevronRight className="w-3 h-3 text-[var(--text-muted)] group-hover:text-white" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Constructors Matches */}
                    {matchingConstructors.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
                          Teams & Constructors
                        </div>
                        <div className="space-y-0.5">
                          {matchingConstructors.map((c) => (
                            <button
                              key={c.id}
                              onClick={handleSelectConstructorMatch}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[var(--bg-tertiary)] flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/30"
                                  style={{ backgroundColor: c.color }}
                                ></span>
                                <span className="font-hud font-bold uppercase truncate text-[var(--text-primary)] group-hover:text-white">
                                  {c.fullName}
                                </span>
                              </div>
                              <span className="text-[10px] font-hud text-[var(--text-muted)] group-hover:text-white uppercase">
                                View Paddock →
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grand Prix Calendar Matches */}
                    {matchingRaces.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-hud font-bold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">
                          Grand Prix Schedule
                        </div>
                        <div className="space-y-0.5">
                          {matchingRaces.map((r) => (
                            <button
                              key={r.round}
                              onClick={() => handleSelectRaceMatch(r.round)}
                              className="w-full text-left px-2.5 py-1.5 rounded hover:bg-[var(--bg-tertiary)] flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <Flag className="w-3 h-3 text-[var(--accent-f1-red)] shrink-0" />
                                <span className="font-mono-num text-[11px] text-[var(--text-muted)] shrink-0">
                                  R{r.round}
                                </span>
                                <span className="font-hud font-bold uppercase truncate text-[var(--text-primary)] group-hover:text-white">
                                  {r.raceName}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
                                {r.date}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-center text-[var(--text-muted)] space-y-1">
                    <p className="text-xs">No matching driver, team, or circuit for &quot;{searchQuery}&quot;</p>
                    <p className="text-[10px]">Try &quot;Verstappen&quot;, &quot;Norris&quot;, &quot;Ferrari&quot;, or &quot;Monaco&quot;</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={toggleMobileSearch}
            className="md:hidden p-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Search"
            aria-label="Toggle search input"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Glance Mode Zen Toggle Button */}
          {onToggleGlance && (
            <button
              onClick={onToggleGlance}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-hud font-bold uppercase tracking-wider"
              title="Open distraction-free Glance Mode"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Glance</span>
            </button>
          )}

          {/* Personalization / Livery Selector */}
          {onOpenPersonalization && (
            <button
              onClick={onOpenPersonalization}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-hud font-bold uppercase tracking-wider"
              title="Personalize driver, team allegiance & livery theme"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
              <span className="hidden sm:inline">Livery</span>
            </button>
          )}

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 sm:p-2 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Drawer (collapsible under main bar) */}
      {isMobileSearchOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search driver, team, circuit..."
              autoFocus
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded pl-8 pr-7 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-hud"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Mobile Results */}
          {cleanQuery && hasResults && (
            <div className="max-h-60 overflow-y-auto divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded bg-[var(--bg-primary)]">
              {matchingDrivers.map((standing) => (
                <button
                  key={standing.Driver.driverId}
                  onClick={() => handleSelectDriverMatch(standing.Driver.driverId)}
                  className="w-full text-left p-2 hover:bg-[var(--bg-tertiary)] flex items-center justify-between text-xs"
                >
                  <span className="font-hud font-bold uppercase text-[var(--text-primary)]">
                    {standing.Driver.givenName} {standing.Driver.familyName}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">Profile →</span>
                </button>
              ))}
              {matchingRaces.map((r) => (
                <button
                  key={r.round}
                  onClick={() => handleSelectRaceMatch(r.round)}
                  className="w-full text-left p-2 hover:bg-[var(--bg-tertiary)] flex items-center justify-between text-xs"
                >
                  <span className="font-hud font-bold uppercase text-[var(--text-primary)]">
                    R{r.round} • {r.raceName}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">Results →</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
