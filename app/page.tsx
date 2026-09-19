'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar, { NavTab } from '@/components/f1/Navbar';
import BottomNav from '@/components/f1/BottomNav';
import HeroLiveHub from '@/components/f1/HeroLiveHub';
import CalendarView from '@/components/f1/CalendarView';
import StandingsView from '@/components/f1/StandingsView';
import RaceResultsView from '@/components/f1/RaceResultsView';
import PaddockView from '@/components/f1/PaddockView';
import LiveTelemetryHUD from '@/components/f1/LiveTelemetryHUD';
import AskApexBar from '@/components/f1/AskApexBar';
import NavigationTransition from '@/components/f1/NavigationTransition';
import MorningDigest from '@/components/f1/MorningDigest';
import { useMobileHistory } from '@/lib/f1/useMobileHistory';
import { useF1RealtimeSync } from '@/lib/f1/useF1RealtimeSync';

// Dynamic imports for heavy secondary views to minimize initial bundle size and boost Core Web Vitals
const DynamicLoadingSkeleton = () => (
  <div className="w-full py-16 flex flex-col items-center justify-center space-y-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl animate-pulse">
    <div className="w-7 h-7 rounded-full border-2 border-[var(--accent-f1-red)] border-t-transparent animate-spin" />
    <span className="font-hud font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
      Loading Data...
    </span>
  </div>
);

const AnalyticsHub = dynamic(() => import('@/components/f1/AnalyticsHub'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const StorytellingHub = dynamic(() => import('@/components/f1/StorytellingHub'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const HistoricalArchiveView = dynamic(() => import('@/components/f1/HistoricalArchiveView'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const NewsFeedView = dynamic(() => import('@/components/f1/NewsFeedView'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const JuniorSeriesView = dynamic(() => import('@/components/f1/JuniorSeriesView'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const PreSeasonTestingView = dynamic(() => import('@/components/f1/PreSeasonTestingView'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const PitCrewLeaderboard = dynamic(() => import('@/components/f1/PitCrewLeaderboard'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const DesignManifestoView = dynamic(() => import('@/components/f1/DesignManifestoView'), {
  loading: () => <DynamicLoadingSkeleton />,
});
const PersonalizationModal = dynamic(() => import('@/components/f1/PersonalizationModal'));
const DriverProfileModal = dynamic(() => import('@/components/f1/DriverProfileModal'));
const ConstructorDetailModal = dynamic(() => import('@/components/f1/ConstructorDetailModal'));
const GlanceMode = dynamic(() => import('@/components/f1/GlanceMode'));
import {
  getCalendar,
  getDriverStandings,
  getConstructorStandings,
  getRaceResults,
} from '@/lib/f1/jolpica';
import {
  getLatestSession,
  getSessionWeather,
  getSessionIntervals,
} from '@/lib/f1/openf1';
import {
  Race,
  DriverStanding,
  ConstructorStanding,
  RaceResult,
  OpenF1Session,
  OpenF1Weather,
  OpenF1Interval,
} from '@/lib/f1/types';
import {
  loadUserPreferences,
  applyTeamLiveryTheme,
} from '@/lib/f1/preferences';
import { AlertTriangle, Radio } from 'lucide-react';
import { useLiveTabTitle } from '@/lib/f1/useLiveTabTitle';
import { TimingLeaderboardSkeleton, TelemetryErrorState } from '@/components/f1/SkeletonLoaders';

export default function ApexHome() {
  const [activeTab, setActiveTab] = useState<NavTab>('hub');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [useLocalTime, setUseLocalTime] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState<boolean>(false);
  const [selectedDriverProfileId, setSelectedDriverProfileId] = useState<string | null>(null);
  const [selectedConstructorProfileId, setSelectedConstructorProfileId] = useState<string | null>(null);
  const [isGlanceModeOpen, setIsGlanceModeOpen] = useState<boolean>(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState<boolean>(false);

  // Mobile Hardware Back-Button & Swipe Gesture Stack Handler
  useMobileHistory({
    hasOpenModal: Boolean(selectedConstructorProfileId || selectedDriverProfileId || isPersonalizationOpen || isGlanceModeOpen || isMobileSearchOpen),
    onDismissTopModal: () => {
      if (selectedConstructorProfileId) {
        setSelectedConstructorProfileId(null);
      } else if (selectedDriverProfileId) {
        setSelectedDriverProfileId(null);
      } else if (isPersonalizationOpen) {
        setIsPersonalizationOpen(false);
      } else if (isGlanceModeOpen) {
        setIsGlanceModeOpen(false);
      } else if (isMobileSearchOpen) {
        setIsMobileSearchOpen(false);
      }
    },
  });

  // Primary Data State
  const [calendar, setCalendar] = useState<Race[]>([]);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [recentRace, setRecentRace] = useState<Race | null>(null);
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('current');
  const [selectedRound, setSelectedRound] = useState<string>('last');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('');

  // OpenF1 Live State
  const [latestSession, setLatestSession] = useState<OpenF1Session | null>(null);
  const [weather, setWeather] = useState<OpenF1Weather | null>(null);
  const [intervals, setIntervals] = useState<OpenF1Interval[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Navigation Transition State & Scroll Management
  const [isNavTransitioning, setIsNavTransitioning] = useState<boolean>(false);

  // Sync tab with URL query param on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') as NavTab;
      if (
        tabParam &&
        ['hub', 'calendar', 'standings', 'results', 'paddock', 'analytics', 'stories', 'archive', 'live', 'news', 'junior', 'testing', 'pitcrew', 'about'].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Listen for browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const targetTab =
        (e.state?.tab as NavTab) ||
        (new URLSearchParams(window.location.search).get('tab') as NavTab) ||
        'hub';

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        setActiveTab(targetTab);
        return;
      }

      setIsNavTransitioning(true);
      setActiveTab(targetTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fresh forward navigation
  const handleTabChange = (nextTab: NavTab) => {
    if (nextTab === activeTab) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setActiveTab(nextTab);
      try {
        window.history.pushState({ tab: nextTab }, '', `?tab=${nextTab}`);
      } catch {}
      return;
    }

    setIsNavTransitioning(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setActiveTab(nextTab);
      try {
        window.history.pushState({ tab: nextTab }, '', `?tab=${nextTab}`);
      } catch {}
    }, 380);
  };

  // Live-aware browser tab title and dynamic favicon
  const isSessionLive = Boolean(latestSession && latestSession.session_name);
  const liveLeader = driverStandings[0]?.Driver?.code || 'VER';
  useLiveTabTitle({
    isLive: isSessionLive,
    leaderCode: liveLeader,
    gap: 'LEADER',
    sessionName: latestSession?.session_name,
  });

  // Respect user theme override
  useEffect(() => {
    try {
      const savedOverride = localStorage.getItem('apex_theme_override');
      let isDark = true;

      if (savedOverride === 'light') {
        isDark = false;
      } else if (savedOverride === 'dark') {
        isDark = true;
      } else if (typeof window !== 'undefined' && window.matchMedia) {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    } catch {}
  }, []);

  // Apply saved personalization on load
  useEffect(() => {
    const prefs = loadUserPreferences();
    if (prefs.favoriteTeamId) {
      applyTeamLiveryTheme(prefs.favoriteTeamId);
    }
    if (prefs.useLocalTime !== undefined) {
      setUseLocalTime(prefs.useLocalTime);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('apex_theme_override', next ? 'dark' : 'light');
      } catch {}
      if (next) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      return next;
    });
  };

  const toggleTimezone = () => {
    setUseLocalTime((prev) => !prev);
  };
  const fetchAllData = async () => {
    if (calendar.length === 0 && driverStandings.length === 0) {
      setIsLoading(true);
    }
    setErrorMsg(null);
    try {
      const [calData, drvData, constData, openSession, resultsData] = await Promise.all([
        getCalendar(selectedSeason),
        getDriverStandings(selectedSeason),
        getConstructorStandings(selectedSeason),
        getLatestSession().catch(() => null),
        getRaceResults(selectedSeason, selectedRound).catch(() => ({ race: null, results: [] })),
      ]);

      setCalendar(calData);
      setDriverStandings(drvData);
      setConstructorStandings(constData);
      setLatestSession(openSession);
      setRecentRace(resultsData.race);
      setRaceResults(resultsData.results);
      setLastUpdatedAt(new Date().toISOString());

      // Secondary live session metrics in background
      if (openSession?.session_key) {
        Promise.all([
          getSessionWeather(openSession.session_key).catch(() => null),
          getSessionIntervals(openSession.session_key).catch(() => []),
        ]).then(([wData, iData]) => {
          setWeather(wData);
          setIntervals(iData);
        });
      }
    } catch (err: any) {
      console.error('Failed to load F1 data:', err);
      setErrorMsg('Some telemetry feeds are currently synchronizing or experiencing rate limits.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [selectedSeason]);

  // Real-time automatic background synchronization
  useF1RealtimeSync({
    onSyncTelemetry: async () => {
      try {
        const session = await getLatestSession();
        if (session) {
          setLatestSession(session);
          if (session.session_key) {
            const [wData, iData] = await Promise.all([
              getSessionWeather(session.session_key).catch(() => null),
              getSessionIntervals(session.session_key).catch(() => []),
            ]);
            if (wData) setWeather(wData);
            if (iData && iData.length > 0) setIntervals(iData);
          }
        }
      } catch (e) {
        console.warn('Background telemetry sync:', e);
      }
    },
    onSyncStandings: async () => {
      try {
        const [drvData, constData] = await Promise.all([
          getDriverStandings(selectedSeason),
          getConstructorStandings(selectedSeason),
        ]);
        if (drvData && drvData.length > 0) setDriverStandings(drvData);
        if (constData && constData.length > 0) setConstructorStandings(constData);
        setLastUpdatedAt(new Date().toISOString());
      } catch (e) {
        console.warn('Background standings sync:', e);
      }
    },
    telemetryIntervalMs: 15000,
    standingsIntervalMs: 60000,
    enabled: !isLoading,
  });

  // When round changes: reset viewport to top so user lands at top of classifications
  const handleSelectRound = async (round: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedRound(round);
    setIsRefreshing(true);
    try {
      const res = await getRaceResults(selectedSeason, round);
      setRecentRace(res.race);
      setRaceResults(res.results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // When season changes: reset viewport to top
  const handleSelectSeason = (season: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedSeason(season);
  };

  // Calculate Next Upcoming Race
  const now = new Date().getTime();
  const nextRace =
    calendar.find((r) => {
      const iso = r.time ? `${r.date}T${r.time}` : `${r.date}T13:00:00Z`;
      return new Date(iso).getTime() > now;
    }) || calendar[calendar.length - 1] || null;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors pb-16 md:pb-0">
      {/* F1 Starting Lights Navigation Transition Loader */}
      <NavigationTransition
        isTransitioning={isNavTransitioning}
        onTransitionComplete={() => setIsNavTransitioning(false)}
      />

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        useLocalTime={useLocalTime}
        onToggleTimezone={toggleTimezone}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        nextRaceName={nextRace?.raceName || 'Singapore Grand Prix'}
        onOpenPersonalization={() => setIsPersonalizationOpen(true)}
        onToggleGlance={() => setIsGlanceModeOpen(true)}
        driverStandings={driverStandings}
        calendar={calendar}
        onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
        onSelectRound={handleSelectRound}
        isMobileSearchOpen={isMobileSearchOpen}
        onToggleMobileSearch={() => setIsMobileSearchOpen((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 ${activeTab === 'hub' ? `timing-tower-rail ${latestSession ? 'is-live' : ''}` : ''}`}>
        {/* Real Content-Shaped Skeleton with Pit-Wall Radio Phrasing */}
        {isLoading ? (
          <TimingLeaderboardSkeleton />
        ) : (
          <>
            {/* Pit-Wall Radio Status Warning if API desynced */}
            {errorMsg && (
              <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-secondary)] border border-[var(--accent-f1-red)]/35 text-[var(--accent-f1-red)] text-xs font-hud font-bold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse shrink-0" />
                  <span>TELEMETRY SIGNAL UNSTABLE • RE-ESTABLISHING PIT RADIO CARRIER</span>
                </div>
                <button
                  onClick={() => fetchAllData()}
                  className="px-2.5 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] transition-colors cursor-pointer text-[10px] font-mono-num font-bold uppercase"
                >
                  RETRY LINK
                </button>
              </div>
            )}


            {/* TAB CONTENT: RACE HUB */}
            {activeTab === 'hub' && (
              <div className="space-y-8">
                {/* Hero / Countdown / Next GP Section */}
                <HeroLiveHub
                  nextRace={nextRace}
                  latestSession={latestSession}
                  weather={weather}
                  useLocalTime={useLocalTime}
                  onNavigateTab={handleTabChange}
                  onToggleGlance={() => setIsGlanceModeOpen(true)}
                />

                {/* No-Spoiler Morning Digest (Concealed podium for time-zone delayed viewers) */}
                <MorningDigest
                  raceName={recentRace?.raceName}
                  circuitName={recentRace?.Circuit?.circuitName}
                  results={raceResults}
                  onViewResults={() => handleTabChange('results')}
                />


                {/* Quick 2-Column Split: Standings Preview & Latest Race Classification */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Top Drivers Championship Snapshot */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)]"></span>
                        <h3 className="font-hud font-black text-lg uppercase tracking-tight text-[var(--text-primary)]">
                          Championship Leaders
                        </h3>
                      </div>
                      <button
                        onClick={() => handleTabChange('standings')}
                        className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--accent-f1-red)] hover:underline cursor-pointer"
                      >
                        Full Standings →
                      </button>
                    </div>

                    <StandingsView
                      driverStandings={driverStandings.slice(0, 6)}
                      constructorStandings={constructorStandings.slice(0, 5)}
                      onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                    />
                  </div>

                  {/* Right: Telemetry / Live Session Snapshot */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <h3 className="font-hud font-black text-lg uppercase tracking-tight text-[var(--text-primary)]">
                          Live Track Telemetry
                        </h3>
                      </div>
                      <button
                        onClick={() => handleTabChange('live')}
                        className="text-xs font-hud font-bold uppercase tracking-wider text-emerald-400 hover:underline cursor-pointer"
                      >
                        Full Telemetry HUD →
                      </button>
                    </div>

                    <LiveTelemetryHUD
                      session={latestSession}
                      initialWeather={weather}
                      initialIntervals={intervals}
                      onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                      showFeed={false}
                      onToggleGlance={() => setIsGlanceModeOpen(true)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CALENDAR */}
            {activeTab === 'calendar' && (
              <CalendarView
                races={calendar}
                useLocalTime={useLocalTime}
                onSelectRace={() => {}}
                onViewResults={(round) => {
                  handleSelectRound(round);
                  handleTabChange('results');
                }}
              />
            )}

            {/* TAB: STANDINGS */}
            {activeTab === 'standings' && (
              <StandingsView
                driverStandings={driverStandings}
                constructorStandings={constructorStandings}
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                onSelectConstructor={(constructorId) => setSelectedConstructorProfileId(constructorId)}
              />
            )}

            {/* TAB: RESULTS */}
            {activeTab === 'results' && (
              <RaceResultsView
                currentRace={recentRace}
                results={raceResults}
                availableRaces={calendar}
                selectedRound={selectedRound}
                selectedSeason={selectedSeason}
                onSelectRound={handleSelectRound}
                onSelectSeason={handleSelectSeason}
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
              />
            )}

            {/* TAB: ANALYTICS & INTELLIGENCE */}
            {activeTab === 'analytics' && (
              <AnalyticsHub
                standings={driverStandings}
                constructorStandings={constructorStandings}
                calendar={calendar}
                recentResults={raceResults}
                recentRaceName={recentRace?.raceName}
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
              />
            )}

            {/* TAB: STORYTELLING & BRIEFINGS */}
            {activeTab === 'stories' && (
              <StorytellingHub
                nextRace={nextRace}
                standings={driverStandings}
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
              />
            )}

            {/* TAB: 1950+ HISTORICAL VAULT */}
            {activeTab === 'archive' && (
              <HistoricalArchiveView
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
              />
            )}

            {/* TAB: PADDOCK & H2H */}
            {activeTab === 'paddock' && (
              <PaddockView
                driverStandings={driverStandings}
                constructorStandings={constructorStandings}
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                onSelectConstructor={(constructorId) => setSelectedConstructorProfileId(constructorId)}
                onNavigateTab={handleTabChange}
              />
            )}

            {/* TAB: LIVE TELEMETRY HUD */}
            {activeTab === 'live' && (
              <div className="space-y-6">
                <AskApexBar
                  driverStandings={driverStandings}
                  calendar={calendar}
                  recentResults={raceResults}
                  onNavigateTab={handleTabChange}
                  onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                />
                <LiveTelemetryHUD
                  session={latestSession}
                  initialWeather={weather}
                  initialIntervals={intervals}
                  driverStandings={driverStandings}
                  onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                  showFeed={true}
                  onToggleGlance={() => setIsGlanceModeOpen(true)}
                />
              </div>
            )}

            {/* TAB: NEWS WIRE FEED */}
            {activeTab === 'news' && <NewsFeedView />}

            {/* TAB: JUNIOR SERIES TRACKER (F2 / F3 / F1 ACADEMY) */}
            {activeTab === 'junior' && (
              <JuniorSeriesView />
            )}

            {/* TAB: PRE-SEASON TESTING TRACKER */}
            {activeTab === 'testing' && (
              <PreSeasonTestingView
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                onSelectConstructor={(constructorId) => setSelectedConstructorProfileId(constructorId)}
              />
            )}

            {/* TAB: PIT CREW LEADERBOARD */}
            {activeTab === 'pitcrew' && (
              <PitCrewLeaderboard
                onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
                onSelectConstructor={(constructorId) => setSelectedConstructorProfileId(constructorId)}
              />
            )}

            {/* TAB: WHY THIS LOOKS LIKE THIS (DESIGN MANIFESTO) */}
            {activeTab === 'about' && (
              <DesignManifestoView />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] mt-12 py-8 px-4 sm:px-6 lg:px-8 text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-hud font-black text-base tracking-widest text-[var(--text-primary)]">
              APEX
            </span>
            <span>•</span>
            <span>Formula 1 Telemetry Companion</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span>Official FIA Timing & Telemetry Data Feed</span>
            <span>•</span>
            <span>Stale-While-Revalidate Engine</span>
            <span>•</span>
            <button
              onClick={() => handleTabChange('about')}
              className="text-[var(--accent-f1-red)] hover:underline cursor-pointer font-bold font-hud uppercase"
            >
              Why This Looks Like This (Design Statement)
            </button>
            <span>•</span>
            <span className="text-[var(--text-secondary)]">
              Unofficial fan application. F1, FORMULA ONE, and GRAND PRIX are trademarks of Formula One Licensing B.V.
            </span>
          </div>
        </div>
      </footer>

      {/* Driver Deep-Dive Dossier Modal */}
      <DriverProfileModal
        driverId={selectedDriverProfileId}
        isOpen={!!selectedDriverProfileId}
        onClose={() => setSelectedDriverProfileId(null)}
        session={latestSession}
      />

      {/* Constructor Dossier Modal */}
      <ConstructorDetailModal
        constructorId={selectedConstructorProfileId}
        isOpen={!!selectedConstructorProfileId}
        onClose={() => setSelectedConstructorProfileId(null)}
        onSelectDriver={(driverId) => setSelectedDriverProfileId(driverId)}
        constructorStandings={constructorStandings}
      />

      {/* Personalization & Livery Modal */}
      <PersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        standings={driverStandings}
        onThemeApplied={(teamId) => {
          applyTeamLiveryTheme(teamId);
        }}
      />

      {/* Mobile Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSearch={() => setIsMobileSearchOpen(true)}
      />

      {/* Glance Mode Zen Overlay */}
      {isGlanceModeOpen && (
        <GlanceMode
          session={latestSession}
          intervals={intervals}
          onClose={() => setIsGlanceModeOpen(false)}
        />
      )}
    </div>
  );
}
