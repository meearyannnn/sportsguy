import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  JUNIOR_SERIES_DATABASE,
  JuniorSeriesData,
  JuniorDriver,
  JuniorTeam,
  JuniorRaceWeekend,
  JuniorCarSpecs,
} from '@/lib/f1/juniorSeries';
import {
  GraduationCap,
  Trophy,
  Calendar,
  Users,
  Cpu,
  Zap,
  ChevronRight,
  Flag,
  ShieldCheck,
  Sparkles,
  Award,
  Activity,
  Info,
  Gauge,
  CheckCircle2,
  Clock,
  Search,
  SlidersHorizontal,
  RefreshCw,
  X,
} from 'lucide-react';

type SeriesKey = 'f2' | 'f3' | 'academy';
type ViewSubTab = 'grid' | 'standings' | 'calendar' | 'specs' | 'pathway';

function JuniorDriverAvatar({
  driver,
  size = 'md',
}: {
  driver: JuniorDriver;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hasError, setHasError] = useState(false);

  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-md text-[10px]'
      : size === 'lg'
      ? 'w-16 h-16 rounded-xl text-base'
      : 'w-14 h-14 rounded-lg text-sm';

  if (!driver.headshotUrl || hasError) {
    return (
      <div
        className={`${dimensions} bg-gradient-to-br from-[var(--bg-tertiary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-hud font-black text-[var(--text-primary)] flex flex-col items-center justify-center shrink-0 relative overflow-hidden shadow-sm`}
      >
        <span className="text-[10px] leading-none mb-0.5">{driver.countryFlag}</span>
        <span className="font-mono text-[10px] tracking-wider text-[var(--accent-f1-red)] font-extrabold">{driver.code}</span>
      </div>
    );
  }

  return (
    <div
      className={`${dimensions} bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] overflow-hidden shrink-0 relative flex items-end justify-center shadow-sm`}
    >
      <img
        src={driver.headshotUrl}
        alt={driver.name}
        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function JuniorSeriesView() {
  const [activeSeries, setActiveSeries] = useState<SeriesKey>('f2');
  const [mounted, setMounted] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<ViewSubTab>('grid');
  const [driverSearch, setDriverSearch] = useState<string>('');
  const [selectedAcademyFilter, setSelectedAcademyFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<JuniorDriver | null>(null);
  const [seriesDataMap, setSeriesDataMap] = useState<Record<SeriesKey, JuniorSeriesData>>(JUNIOR_SERIES_DATABASE);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedDriver) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setSelectedDriver(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedDriver]);

  const fetchLiveJuniorData = async (series: SeriesKey) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/f1/junior-series?series=${series}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSeriesDataMap((prev) => ({
            ...prev,
            [series]: json.data,
          }));
          setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    } catch (err) {
      console.warn('Live junior series fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveJuniorData(activeSeries);
  }, [activeSeries]);

  const currentData: JuniorSeriesData = seriesDataMap[activeSeries];

  // Extract unique F1 Academies in current series for filter chips
  const academyOptions = Array.from(
    new Set(
      currentData.drivers
        .map((d) => d.f1Academy)
        .filter((a): a is string => Boolean(a))
    )
  );

  // Filtered drivers
  const filteredDrivers = currentData.drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.team.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(driverSearch.toLowerCase()) ||
      (d.f1Academy && d.f1Academy.toLowerCase().includes(driverSearch.toLowerCase()));

    const matchesAcademy =
      selectedAcademyFilter === 'all' || d.f1Academy === selectedAcademyFilter;

    return matchesSearch && matchesAcademy;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header / Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-tertiary)] to-[var(--bg-secondary)] border border-[var(--border-subtle)] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[var(--accent-f1-red)]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-hud font-bold tracking-wider uppercase bg-[var(--accent-f1-red)]/10 text-[var(--accent-f1-red)] border border-[var(--accent-f1-red)]/20">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>FIA FEEDER SERIES & ROAD TO F1</span>
              </span>
              <button
                onClick={() => fetchLiveJuniorData(activeSeries)}
                disabled={isLoading}
                title="Refresh live data from official FIA/F1 feeds"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'SYNCING OFFICIAL FEEDS...' : lastSynced ? `LIVE SYNCED ${lastSynced}` : 'OFFICIAL LIVE FEEDS'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-hud uppercase tracking-tight text-[var(--text-primary)]">
              Formula 2 & Formula 3 Hub
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed">
              Real-time driver rosters, team standings, round-by-round calendars, and Dallara chassis technical specifications for the official FIA F1 feeder ladder.
            </p>
          </div>

          {/* Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0">
            <div className="p-3 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)] text-center">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">F2 Chassis</div>
              <div className="text-xs font-bold font-mono text-[var(--text-primary)]">Dallara 2024</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)] text-center">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Fuel Specification</div>
              <div className="text-xs font-bold font-mono text-amber-400">100% Aramco Syn</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-subtle)] text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Super Licence</div>
              <div className="text-xs font-bold font-mono text-emerald-400">40 Pts Required</div>
            </div>
          </div>
        </div>
      </div>

      {/* Series Switcher Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* F2 Button */}
        <button
          onClick={() => {
            setActiveSeries('f2');
            setSelectedAcademyFilter('all');
          }}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeSeries === 'f2'
              ? 'bg-gradient-to-r from-amber-500/10 via-[var(--bg-secondary)] to-[var(--bg-secondary)] border-amber-500/50 shadow-lg shadow-amber-500/5'
              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud font-black text-xl text-[var(--text-primary)] group-hover:text-amber-400 transition-colors">
              FIA FORMULA 2
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${activeSeries === 'f2' ? 'bg-amber-500 text-black' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
              620 HP • TURBO V6
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            Direct gateway to Formula 1. Ground-effect carbon monocoque with 18-inch Pirelli tyres and 335 km/h top speed.
          </p>
          {activeSeries === 'f2' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>

        {/* F3 Button */}
        <button
          onClick={() => {
            setActiveSeries('f3');
            setSelectedAcademyFilter('all');
          }}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeSeries === 'f3'
              ? 'bg-gradient-to-r from-blue-500/10 via-[var(--bg-secondary)] to-[var(--bg-secondary)] border-blue-500/50 shadow-lg shadow-blue-500/5'
              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud font-black text-xl text-[var(--text-primary)] group-hover:text-blue-400 transition-colors">
              FIA FORMULA 3
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${activeSeries === 'f3' ? 'bg-blue-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
              380 HP • 30 CARS
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            Intense 30-car single-spec championship featuring the Dallara F3 2025 next-gen chassis and Mecachrome NA V6.
          </p>
          {activeSeries === 'f3' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
          )}
        </button>

        {/* F1 Academy Button */}
        <button
          onClick={() => {
            setActiveSeries('academy');
            setSelectedAcademyFilter('all');
          }}
          className={`p-5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
            activeSeries === 'academy'
              ? 'bg-gradient-to-r from-pink-500/10 via-[var(--bg-secondary)] to-[var(--bg-secondary)] border-pink-500/50 shadow-lg shadow-pink-500/5'
              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-hud font-black text-xl text-[var(--text-primary)] group-hover:text-pink-400 transition-colors">
              F1 ACADEMY
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${activeSeries === 'academy' ? 'bg-pink-500 text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'}`}>
              10 F1 LIVERIES
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
            Official all-female driver development series directly supported and operated alongside Formula 1 Grand Prix weekends.
          </p>
          {activeSeries === 'academy' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500" />
          )}
        </button>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'grid', label: 'Drivers Grid', icon: Users },
            { id: 'standings', label: 'Standings', icon: Trophy },
            { id: 'calendar', label: 'Calendar & Schedule', icon: Calendar },
            { id: 'specs', label: 'Car Technical Specs', icon: Cpu },
            { id: 'pathway', label: 'Road to F1 Pathway', icon: GraduationCap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as ViewSubTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-f1-red)] text-white shadow-md'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-xs font-mono text-[var(--text-muted)]">
          {currentData.seriesName} • {currentData.championshipYear} Season
        </div>
      </div>

      {/* ==================== SUB-TAB 1: DRIVERS GRID ==================== */}
      {activeSubTab === 'grid' && (
        <div className="space-y-6">
          {/* Controls & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                placeholder="Search driver, team, code, or F1 academy..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-f1-red)]"
              />
            </div>

            {/* Academy Filter Chips */}
            {academyOptions.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setSelectedAcademyFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-hud font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                    selectedAcademyFilter === 'all'
                      ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All Academies
                </button>
                {academyOptions.map((academy) => (
                  <button
                    key={academy}
                    onClick={() => setSelectedAcademyFilter(academy)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-hud font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                      selectedAcademyFilter === academy
                        ? 'bg-[var(--accent-f1-red)] text-white'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {academy}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid of Driver Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map((driver) => (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className="group relative rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-hover)] p-5 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer hover:shadow-lg"
              >
                {/* Top Accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: driver.f1AcademyColor || 'var(--accent-f1-red)' }}
                />

                <div className="space-y-4">
                  {/* Top Bar: Position, Number, Flag */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[11px] font-mono font-bold text-[var(--text-secondary)] flex items-center justify-center">
                        P{driver.position}
                      </span>
                      <span className="text-xl font-black font-hud text-[var(--text-primary)]">
                        #{driver.number}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">{driver.countryFlag}</span>
                      <span className="text-xs font-mono font-bold text-[var(--text-muted)] uppercase">
                        {driver.code}
                      </span>
                    </div>
                  </div>

                  {/* Driver Headshot & Name Header */}
                  <div className="flex items-center gap-3">
                    <JuniorDriverAvatar driver={driver} size="md" />

                    <div>
                      <h3 className="text-lg font-black font-hud text-[var(--text-primary)] group-hover:text-[var(--accent-f1-red)] transition-colors">
                        {driver.name}
                      </h3>
                      <div className="text-xs font-medium text-[var(--text-secondary)]">
                        {driver.team}
                      </div>
                    </div>
                  </div>

                  {/* F1 Academy Affiliation Pill */}
                  {driver.f1Academy && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-hud uppercase bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: driver.f1AcademyColor || '#FF1801' }}
                      />
                      <span>{driver.f1Academy}</span>
                    </div>
                  )}

                  {/* Bio */}
                  {driver.bio && (
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                      {driver.bio}
                    </p>
                  )}
                </div>

                {/* Stats Footer */}
                <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-4 gap-2 text-center bg-[var(--bg-primary)]/40 p-2 rounded-lg">
                  <div>
                    <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Points</div>
                    <div className="text-sm font-bold font-mono text-[var(--accent-f1-red)]">{driver.points}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Wins</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{driver.wins}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Podiums</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{driver.podiums}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud text-[var(--text-muted)] uppercase">Poles</div>
                    <div className="text-sm font-bold font-mono text-[var(--text-primary)]">{driver.poles}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDrivers.length === 0 && (
            <div className="p-12 text-center text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl">
              No drivers match your search query.
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-TAB 2: STANDINGS ==================== */}
      {activeSubTab === 'standings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Driver Standings Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-hud font-black text-lg uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[var(--accent-f1-red)]" />
                <span>Driver Championship Standings</span>
              </h3>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {currentData.drivers.length} Drivers
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Pos</th>
                      <th className="py-3 px-4">Driver</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4 text-center">Wins</th>
                      <th className="py-3 px-4 text-center">Podiums</th>
                      <th className="py-3 px-4 text-right pr-6">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                    {currentData.drivers.map((driver) => (
                      <tr
                        key={driver.id}
                        onClick={() => setSelectedDriver(driver)}
                        className="hover:bg-[var(--bg-tertiary)]/50 transition-colors cursor-pointer"
                        title={`Click to view ${driver.name} dossier`}
                      >
                        <td className="py-3 px-4 text-center font-bold">
                          <span className={`inline-flex w-6 h-6 items-center justify-center rounded text-xs ${
                            driver.position === 1 ? 'bg-amber-400 text-black font-black' :
                            driver.position === 2 ? 'bg-slate-300 text-black font-black' :
                            driver.position === 3 ? 'bg-amber-700 text-white font-black' :
                            'text-[var(--text-muted)]'
                          }`}>
                            {driver.position}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <JuniorDriverAvatar driver={driver} size="sm" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{driver.countryFlag}</span>
                                <span className="font-bold text-[var(--text-primary)]">{driver.name}</span>
                                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">#{driver.number}</span>
                              </div>
                              {driver.f1Academy && (
                                <div className="text-[10px] text-[var(--accent-f1-red)] font-hud font-bold">
                                  {driver.f1Academy}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)] font-sans">{driver.team}</td>
                        <td className="py-3 px-4 text-center font-bold">{driver.wins}</td>
                        <td className="py-3 px-4 text-center text-[var(--text-secondary)]">{driver.podiums}</td>
                        <td className="py-3 px-4 text-right pr-6 font-bold text-sm text-[var(--accent-f1-red)]">{driver.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Team Championship Standings Table */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-hud font-black text-lg uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span>Teams Championship</span>
              </h3>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {currentData.teams.length} Entrants
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Pos</th>
                      <th className="py-3 px-4">Team</th>
                      <th className="py-3 px-4 text-right pr-6">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                    {currentData.teams.map((team) => (
                      <tr key={team.name} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-[var(--text-muted)]">
                          P{team.position}
                        </td>
                        <td className="py-3.5 px-4 font-sans">
                          <div className="flex items-center gap-2.5">
                            <span className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: team.color }} />
                            <div>
                              <div className="font-bold text-[var(--text-primary)]">{team.name}</div>
                              {team.base && (
                                <div className="text-[10px] text-[var(--text-muted)] font-mono">{team.base}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right pr-6 font-bold text-sm text-[var(--text-primary)]">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: CALENDAR & SCHEDULE ==================== */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-hud font-black text-lg uppercase tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Official {currentData.seriesName} 2026 Calendar</span>
            </h3>
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {currentData.calendar.length} Grand Prix Rounds
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.calendar.map((race) => (
              <div
                key={race.round}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  race.isCompleted
                    ? 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]'
                    : 'bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border-[var(--accent-f1-red)]/30 shadow-md'
                }`}
              >
                <div className="space-y-3">
                  {/* Round & Status */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[var(--bg-tertiary)] text-[var(--text-muted)] uppercase">
                      Round {race.round}
                    </span>
                    {race.isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-hud font-bold text-emerald-400 uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-hud font-bold text-amber-400 uppercase animate-pulse">
                        <Clock className="w-3 h-3" />
                        <span>Upcoming</span>
                      </span>
                    )}
                  </div>

                  {/* Grand Prix Name & Circuit */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{race.countryFlag}</span>
                      <h4 className="font-hud font-black text-base text-[var(--text-primary)]">
                        {race.gpName}
                      </h4>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
                      {race.circuit}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs font-mono font-bold text-[var(--accent-f1-red)]">
                    📅 {race.date}
                  </div>
                </div>

                {/* Winners Card if Completed */}
                {race.isCompleted && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-1.5 text-[11px] font-sans">
                    {race.featureWinner && (
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)] font-hud uppercase">Feature Winner</span>
                        <span className="font-bold text-[var(--text-primary)]">{race.featureWinner}</span>
                      </div>
                    )}
                    {race.sprintWinner && (
                      <div className="flex justify-between items-center">
                        <span className="text-[var(--text-muted)] font-hud uppercase">Sprint Winner</span>
                        <span className="font-bold text-[var(--text-secondary)]">{race.sprintWinner}</span>
                      </div>
                    )}
                    {race.polePosition && (
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-[var(--text-muted)]">Pole Position</span>
                        <span className="font-mono text-amber-400">{race.polePosition}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 4: CAR TECHNICAL SPECS ==================== */}
      {activeSubTab === 'specs' && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase">
                  <Cpu className="w-4 h-4" />
                  <span>TECHNICAL REGULATIONS & AERODYNAMICS</span>
                </div>
                <h3 className="text-2xl font-black font-hud uppercase text-[var(--text-primary)] mt-1">
                  {currentData.carSpecs.model}
                </h3>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono text-xs text-[var(--text-secondary)]">
                FIA Homologated Single-Spec Chassis
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {currentData.description} {currentData.regulations}
            </p>
          </div>

          {/* Technical Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Engine Architecture</div>
              <div className="text-base font-bold font-hud text-[var(--text-primary)]">{currentData.carSpecs.engine}</div>
              <div className="text-xs font-mono text-[var(--accent-f1-red)] font-bold">{currentData.carSpecs.power}</div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Top Speed & DRS</div>
              <div className="text-base font-bold font-hud text-[var(--text-primary)]">{currentData.carSpecs.topSpeed}</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">{currentData.carSpecs.acceleration}</div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Chassis & Safety</div>
              <div className="text-xs font-sans text-[var(--text-primary)] leading-snug">{currentData.carSpecs.chassis}</div>
              <div className="text-xs font-mono text-[var(--text-muted)]">Minimum Weight: {currentData.carSpecs.weight}</div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Gearbox & Drivetrain</div>
              <div className="text-xs font-sans text-[var(--text-primary)] leading-snug">{currentData.carSpecs.gearbox}</div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Tyres & Compounds</div>
              <div className="text-xs font-sans text-[var(--text-primary)] leading-snug">{currentData.carSpecs.tyres}</div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
              <div className="text-xs font-hud font-bold text-[var(--text-muted)] uppercase">Sustainable Racing Fuel</div>
              <div className="text-xs font-sans text-amber-400 font-bold leading-snug">{currentData.carSpecs.fuel}</div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 5: ROAD TO F1 PATHWAY ==================== */}
      {activeSubTab === 'pathway' && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
            <h3 className="text-xl font-black font-hud uppercase text-[var(--text-primary)] flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-[var(--accent-f1-red)]" />
              <span>The FIA Single-Seater Pyramid & Super Licence Points</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              To compete in Formula 1, drivers must accumulate at least <strong>40 FIA Super Licence points</strong> over a three-year period. Formula 2 awards the highest number of points of any junior category.
            </p>
          </div>

          {/* Ladder Visualizer */}
          <div className="space-y-4">
            {[
              { level: 'Level 1: FIA Formula 1 World Championship', subtitle: 'Ultimate Pinnacle of Motorsport', pts: 'Target', color: 'bg-emerald-500' },
              { level: 'Level 2: FIA Formula 2 Championship', subtitle: '620 HP Dallara Turbo V6 • 18-inch Pirelli', pts: '40 Pts for Champion (Direct F1 Entry)', color: 'bg-amber-500' },
              { level: 'Level 3: FIA Formula 3 Championship', subtitle: '380 HP Mecachrome NA V6 • Equal Specs', pts: '30 Pts for Champion', color: 'bg-blue-500' },
              { level: 'Level 4: Regional F4 & F1 Academy', subtitle: 'Tatuus F4 Chassis • 174 HP Turbo', pts: '12 Pts for Champion', color: 'bg-pink-500' },
              { level: 'Level 5: International Karting (CIK-FIA)', subtitle: 'Grassroots Foundation', pts: '0 Pts', color: 'bg-slate-500' },
            ].map((step, idx) => (
              <div
                key={step.level}
                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[var(--border-hover)] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-10 rounded-full ${step.color}`} />
                  <div>
                    <h4 className="font-hud font-black text-base text-[var(--text-primary)]">
                      {step.level}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)]">
                      {step.subtitle}
                    </p>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono text-xs font-bold text-[var(--accent-f1-red)] text-right shrink-0">
                  {step.pts}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Junior Driver Detail Modal */}
      {mounted && selectedDriver && createPortal(
        <div
          className="fixed inset-0 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setSelectedDriver(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Centering wrapper */}
          <div className="flex min-h-screen sm:min-h-full items-center justify-center p-3 sm:p-4 md:p-6 w-full">
            <div
              className="relative w-full max-w-xl shadow-2xl overflow-hidden z-10 flex flex-col animate-scale-in my-auto"
              style={{
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-dim)',
                borderTop: `3px solid ${selectedDriver.f1AcademyColor || 'var(--red)'}`,
                borderRadius: 'var(--r-lg)',
                maxHeight: '90vh',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedDriver(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/80 text-[var(--text-secondary)] hover:text-white border border-white/10 transition-colors cursor-pointer"
                aria-label="Close driver details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Header Profile */}
                <div className="flex items-center gap-4 pb-4 border-b border-[var(--border-dim)]">
                  <JuniorDriverAvatar driver={selectedDriver} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedDriver.countryFlag}</span>
                      <h3 className="font-hud font-black text-2xl uppercase tracking-tight text-[var(--text-primary)] truncate">
                        {selectedDriver.name}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-[var(--text-muted)] mt-0.5">
                      #{selectedDriver.number} • {selectedDriver.code} • {selectedDriver.team}
                    </div>
                    {selectedDriver.f1Academy && (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-hud font-bold uppercase mt-2"
                        style={{
                          background: `${selectedDriver.f1AcademyColor || '#E10600'}15`,
                          color: selectedDriver.f1AcademyColor || '#E10600',
                          border: `1px solid ${selectedDriver.f1AcademyColor || '#E10600'}30`,
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedDriver.f1AcademyColor || '#E10600' }} />
                        <span>{selectedDriver.f1Academy}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Season Performance Grid */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-dim)]">
                  <div>
                    <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Championship</div>
                    <div className="text-lg font-black font-mono text-[var(--text-primary)]">P{selectedDriver.position}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Points</div>
                    <div className="text-lg font-black font-mono text-[var(--red)]">{selectedDriver.points}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Wins</div>
                    <div className="text-lg font-black font-mono text-[var(--text-primary)]">{selectedDriver.wins}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-hud uppercase tracking-wider text-[var(--text-muted)]">Podiums</div>
                    <div className="text-lg font-black font-mono text-[var(--text-primary)]">{selectedDriver.podiums}</div>
                  </div>
                </div>

                {/* Super Licence Status */}
                <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-dim)] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-hud font-bold uppercase text-[var(--text-secondary)]">FIA Super Licence Points</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {selectedDriver.position === 1 ? '40 Pts (F1 Eligible)' : selectedDriver.position === 2 ? '40 Pts' : selectedDriver.position === 3 ? '40 Pts' : selectedDriver.position === 4 ? '30 Pts' : 'Eligible'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Competing in {currentData.seriesName} with equal-spec chassis. Top championship finishers earn direct points toward their mandatory 40-point FIA F1 Super Licence.
                  </p>
                </div>

                {/* Biography */}
                {selectedDriver.bio && (
                  <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-dim)] space-y-1">
                    <div className="text-xs font-hud font-bold uppercase text-[var(--text-secondary)]">Driver Background</div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {selectedDriver.bio}
                    </p>
                  </div>
                )}

                {/* Car Spec quick reference */}
                <div className="p-3 rounded-lg bg-[var(--bg-highlight)] border border-[var(--border-dim)] flex items-center justify-between text-xs font-mono">
                  <span className="text-[var(--text-muted)]">Chassis: {currentData.carSpecs.model}</span>
                  <span className="text-[var(--text-secondary)]">{currentData.carSpecs.power}</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="shrink-0 flex items-center justify-end"
                style={{
                  padding: '12px 20px',
                  borderTop: '1px solid var(--border-dim)',
                  background: 'var(--bg-overlay)',
                }}
              >
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="px-4 py-1.5 rounded text-xs font-hud font-bold uppercase tracking-wider cursor-pointer transition-colors"
                  style={{
                    background: 'var(--bg-highlight)',
                    border: '1px solid var(--border-dim)',
                    color: 'var(--text-primary)',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
