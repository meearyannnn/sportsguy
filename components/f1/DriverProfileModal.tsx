'use client';

import React, { useState, useEffect } from 'react';
import { getDriverProfile, DriverCareerProfile, DriverSeasonEntry } from '@/lib/f1/driverCareer';
import { OpenF1Session } from '@/lib/f1/types';
import DriverAvatar from '@/components/f1/DriverAvatar';
import DriverIdentityCard from '@/components/f1/DriverIdentityCard';
import {
  X,
  Trophy,
  Award,
  Zap,
  Flag,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Swords,
  Gauge,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  TrendingUp,
  Radio,
  Fingerprint,
} from 'lucide-react';

interface DriverProfileModalProps {
  driverId: string | null;
  isOpen: boolean;
  onClose: () => void;
  session?: OpenF1Session | null;
}

export default function DriverProfileModal({
  driverId,
  isOpen,
  onClose,
  session,
}: DriverProfileModalProps) {
  const [profile, setProfile] = useState<DriverCareerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'identity' | 'timeline' | 'circuits' | 'rivalry'>('overview');
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [compareDriverId, setCompareDriverId] = useState<string>('norris');
  const [compareProfile, setCompareProfile] = useState<DriverCareerProfile | null>(null);
  const [circuitSortField, setCircuitSortField] = useState<'wins' | 'starts' | 'podiums' | 'avgFinish'>('wins');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (driverId) {
      getDriverProfile(driverId).then((p) => {
        setProfile(p);
        // Default comparison target
        const otherId = driverId === 'norris' ? 'max_verstappen' : 'norris';
        setCompareDriverId(otherId);
        getDriverProfile(otherId).then(setCompareProfile);
      });
    }
  }, [driverId]);

  useEffect(() => {
    if (compareDriverId) {
      getDriverProfile(compareDriverId).then(setCompareProfile);
    }
  }, [compareDriverId]);

  if (!isOpen || !profile) return null;

  // Sorted circuit records
  const sortedCircuits = [...profile.circuitRecords].sort((a, b) => {
    if (circuitSortField === 'avgFinish') return a.avgFinish - b.avgFinish;
    return (b[circuitSortField] || 0) - (a[circuitSortField] || 0);
  });

  // SVG Points progression curve
  const timelineReversed = [...profile.timeline].reverse();
  const maxCareerPoints = Math.max(...profile.timeline.map((t) => t.points), 100);
  const chartWidth = 500;
  const chartHeight = 140;

  const pointsPolyline = timelineReversed
    .map((item, idx) => {
      const x = (idx / Math.max(1, timelineReversed.length - 1)) * chartWidth;
      const y = chartHeight - (item.points / maxCareerPoints) * (chartHeight - 30) - 15;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // SVG Inverted Championship position curve (P1 at the top, P20 at the bottom)
  const rankPolyline = timelineReversed
    .map((item, idx) => {
      const x = (idx / Math.max(1, timelineReversed.length - 1)) * chartWidth;
      const rank = Math.min(20, Math.max(1, item.championshipPosition || 10));
      // Invert: rank 1 => top (y=15), rank 20 => bottom (y=chartHeight-15)
      const y = 15 + ((rank - 1) / 19) * (chartHeight - 30);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      <div
        className="relative w-full max-w-4xl rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10 my-auto text-[var(--text-primary)]"
        style={{ borderLeft: `4px solid ${profile.teamColor}` }}
      >
        {/* Top Hero Banner — Flat Paddock Neutral */}
        <div className="relative p-5 sm:p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          {/* Close button (min 44x44px touch target) */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-11 h-11 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] active:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer z-30 flex items-center justify-center border border-[var(--border-subtle)]"
            title="Close Profile (Esc)"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pr-12 sm:pr-14">
            <div className="flex items-center gap-5">
              {/* Wikimedia Commons Portrait or Abstract Technical Fallback */}
              <DriverAvatar
                driverId={profile.driverId}
                driverName={`${profile.givenName} ${profile.familyName}`}
                permanentNumber={profile.permanentNumber}
                teamColor={profile.teamColor}
                size="xl"
                showCredit={true}
                className="shrink-0"
              />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{profile.countryFlag}</span>
                  <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    {profile.nationality}
                  </span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono-num">
                    {profile.age} YRS ({profile.birthDate})
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-black font-hud uppercase tracking-tight text-[var(--text-primary)] leading-tight">
                  {profile.givenName}{' '}
                  <span style={{ color: profile.teamColor }}>{profile.familyName}</span>
                </h1>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-hud font-bold uppercase tracking-wider bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {profile.currentOrFinalTeam}
                    {profile.teamTenure && (
                      <span className="ml-1.5 text-[11px] font-medium text-[var(--text-muted)] font-mono-num">
                        ({profile.teamTenure})
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono-num">
                    Career: {profile.careerSpan}
                  </span>
                  {profile.championships > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-hud font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {profile.championships}x World Champion
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Season Standing Tally or Legend Era */}
            {profile.currentSeasonSnapshot ? (
              <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-right self-stretch sm:self-center shrink-0 min-w-[140px]">
                <div className="text-[10px] font-hud font-bold uppercase text-[var(--text-muted)]">
                  2026 Championship
                </div>
                <div className="font-hud font-black text-2xl sm:text-3xl text-[var(--text-primary)] font-mono-num">
                  P{profile.currentSeasonSnapshot.currentRank}
                </div>
                <div className="text-xs font-mono-num font-bold text-amber-400">
                  {profile.currentSeasonSnapshot.points} PTS
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[var(--bg-primary)]/80 backdrop-blur-md border border-[var(--border-subtle)] text-right self-stretch sm:self-center shrink-0">
                <div className="text-[10px] font-hud font-bold uppercase text-purple-400">
                  F1 Historical Legend
                </div>
                <div className="font-hud font-black text-xl text-[var(--text-primary)]">
                  {profile.championships} TITLES
                </div>
                <div className="text-xs text-[var(--text-muted)] font-mono-num">
                  {profile.careerTotals.wins} Wins • {profile.careerTotals.podiums} Podiums
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Navigation Tabs (Horizontal touch-scroll with 44px touch targets) */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-hud font-bold uppercase tracking-wider overflow-x-auto touch-scroll">
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-[44px] py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'overview'
                ? 'border-[var(--accent-f1-red)] text-white'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('identity')}
            className={`min-h-[44px] py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'identity'
                ? 'border-[var(--accent-f1-red)] text-white'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
            <span>Identity Signature</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`min-h-[44px] py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'timeline'
                ? 'border-[var(--accent-f1-red)] text-white'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Career Timeline
          </button>
          <button
            onClick={() => setActiveTab('circuits')}
            className={`min-h-[44px] py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'circuits'
                ? 'border-[var(--accent-f1-red)] text-white'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Circuit Records
          </button>
          <button
            onClick={() => setActiveTab('rivalry')}
            className={`min-h-[44px] py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap select-none ${
              activeTab === 'rivalry'
                ? 'border-[var(--accent-f1-red)] text-white'
                : 'border-transparent text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Head-to-Head Compare
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* TAB: GENERATIVE IDENTITY SIGNATURE */}
          {activeTab === 'identity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Hero Signature Graphic */}
                <div className="md:col-span-6 flex justify-center">
                  <DriverIdentityCard
                    driverId={profile.driverId}
                    driverProfile={profile}
                    size="hero"
                    showCaption={true}
                    allowExport={true}
                  />
                </div>

                {/* Educational Visual Mapping Explanation */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider">
                      <Fingerprint className="w-4 h-4" />
                      <span>DATA-TO-VISUAL MAPPING SYSTEM</span>
                    </div>
                    <h3 className="text-lg font-black font-hud uppercase text-[var(--text-primary)]">
                      Procedural Career Anatomy
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Every curve, notch, spoke, and color band in this signature is deterministically computed from {profile.fullName}’s verified career statistics. Zero stock photography; zero arbitrary decoration.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-mono-num">
                      <div className="p-2.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5">
                        <span className="font-hud font-bold text-[var(--text-primary)] uppercase text-[11px] block">
                          [SEGMENTS] Career Length
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {profile.timeline.length} segments correspond to the full Formula 1 seasons completed.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5">
                        <span className="font-hud font-bold text-[var(--text-primary)] uppercase text-[11px] block">
                          [RADIUS] Points Progression Silhouette
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Segment length traces their points trajectory around the 360° circumference.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5">
                        <span className="font-hud font-bold text-[var(--text-primary)] uppercase text-[11px] block">
                          [LIVERY BANDS] Team History
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Circumferential bands reflect team liveries worn across their career.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-sm bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-0.5">
                        <span className="font-hud font-bold text-[var(--text-primary)] uppercase text-[11px] block">
                          [HALOS] Milestones & Championships
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Gold stars indicate World Championship seasons; concentric gold rings surround the central wins core.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 2026 Season Performance Overview (Simple & Elegant) */}
              {profile.currentSeasonSnapshot && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                      2026 Season Performance
                    </h3>
                  </div>

                  {/* 4-Stat Clean Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                        Championship Standing
                      </span>
                      <div className="font-hud font-black text-2xl text-[var(--accent-f1-red)] font-mono-num mt-1">
                        P{profile.currentSeasonSnapshot.currentRank}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                        {profile.currentSeasonSnapshot.points} Points
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                        Grand Prix Wins
                      </span>
                      <div className="font-hud font-black text-2xl text-amber-400 font-mono-num mt-1">
                        {profile.currentSeasonSnapshot.wins}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                        {profile.currentSeasonSnapshot.wins === 1 ? '1 Victory' : `${profile.currentSeasonSnapshot.wins} Victories`}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                        Podium Finishes
                      </span>
                      <div className="font-hud font-black text-2xl text-emerald-400 font-mono-num mt-1">
                        {profile.currentSeasonSnapshot.podiums}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                        Top 3 Results
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                      <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                        Pole Positions
                      </span>
                      <div className="font-hud font-black text-2xl text-purple-400 font-mono-num mt-1">
                        {profile.currentSeasonSnapshot.poles}
                      </div>
                      <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                        Qualifying P1
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Career Totals & All-Time Rankings */}
              <div className="space-y-3">
                <h3 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[var(--accent-f1-red)]" />
                  All-Time Career Statistics & Record Book Ranking
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      <span>Race Wins</span>
                      <span className="text-amber-400 font-bold">#{profile.allTimeRanks.wins} ALL-TIME</span>
                    </div>
                    <div className="font-hud font-black text-2xl text-[var(--text-primary)] font-mono-num mt-1">
                      {profile.careerTotals.wins}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                      {profile.careerTotals.winRatePercent}% Win Rate
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      <span>Podiums</span>
                      <span className="text-emerald-400 font-bold">#{profile.allTimeRanks.podiums} ALL-TIME</span>
                    </div>
                    <div className="font-hud font-black text-2xl text-[var(--text-primary)] font-mono-num mt-1">
                      {profile.careerTotals.podiums}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                      {profile.careerTotals.podiumRatePercent}% Podium Rate
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      <span>Pole Positions</span>
                      <span className="text-purple-400 font-bold">#{profile.allTimeRanks.poles} ALL-TIME</span>
                    </div>
                    <div className="font-hud font-black text-2xl text-[var(--text-primary)] font-mono-num mt-1">
                      {profile.careerTotals.poles}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                      Career Poles
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase font-semibold">
                      <span>Starts</span>
                      <span className="text-cyan-400 font-bold">#{profile.allTimeRanks.starts} ALL-TIME</span>
                    </div>
                    <div className="font-hud font-black text-2xl text-[var(--text-primary)] font-mono-num mt-1">
                      {profile.careerTotals.starts}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)] font-mono-num mt-0.5">
                      {profile.careerTotals.totalPoints} Points
                    </div>
                  </div>
                </div>
              </div>

              {/* Biography & Firsts/Bests */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2">
                  <div className="text-xs font-hud font-bold uppercase text-[var(--text-muted)]">
                    Driver Dossier & Racing Biography
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {profile.biography}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-2 text-xs">
                  <div className="font-hud font-bold uppercase text-[var(--text-muted)]">
                    Milestone Firsts & Career Peaks
                  </div>
                  <div className="space-y-1 text-[var(--text-secondary)]">
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Debut:</span> <span className="font-bold text-[var(--text-primary)]">{profile.firstsAndBests.firstRace || 'Official F1 Debut'}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">First Win:</span> <span className="font-bold text-amber-400">{profile.firstsAndBests.firstWin && profile.firstsAndBests.firstWin !== '—' && profile.firstsAndBests.firstWin !== 'Grand Prix Victory' ? profile.firstsAndBests.firstWin : '—'}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Most Wins in Season:</span> <span className="font-bold text-emerald-400">{profile.careerTotals.mostWinsInSeason}</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-muted)]">Best Title Finish:</span> <span className="font-bold text-[var(--accent-f1-red)]">{profile.careerTotals.bestSeasonRank && profile.careerTotals.bestSeasonRank > 0 ? `P${profile.careerTotals.bestSeasonRank}` : 'Rookie Season'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAREER TIMELINE & CHARTS */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              {/* Career Points Progression Curve */}
              <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between text-xs font-hud font-bold uppercase">
                  <span>Career Points per Season Trajectory</span>
                  <span className="text-emerald-400 font-mono-num">{maxCareerPoints} PTS PEAK</span>
                </div>

                <div className="w-full h-36 relative overflow-hidden flex items-end">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                  >
                    <polyline
                      fill="none"
                      stroke={profile.teamColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={pointsPolyline}
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono-num">
                  <span>Debut: {timelineReversed[0]?.season}</span>
                  <span>Career Midpoint</span>
                  <span>Latest: {timelineReversed[timelineReversed.length - 1]?.season}</span>
                </div>
              </div>

              {/* Championship Position Curve (Inverted Y-axis) */}
              <div className="p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                <div className="flex items-center justify-between text-xs font-hud font-bold uppercase">
                  <span>Championship Standings by Season (Higher = Better)</span>
                  <span className="text-amber-400 font-mono-num">P1 TITLE TARGET</span>
                </div>

                <div className="w-full h-36 relative overflow-hidden flex items-end">
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="none"
                  >
                    <line x1="0" y1="15" x2={chartWidth} y2="15" stroke="rgba(251, 191, 36, 0.4)" strokeDasharray="3 3" />
                    <polyline
                      fill="none"
                      stroke="#FCD800"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={rankPolyline}
                    />
                  </svg>
                </div>
              </div>

              {/* Season-by-Season Timeline List with Color Shifts */}
              <div className="space-y-2">
                <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Season-by-Season Career Log
                </h4>

                <div className="space-y-2">
                  {profile.timeline.map((item) => {
                    const isExpanded = expandedSeason === item.season;

                    return (
                      <div
                        key={item.season}
                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden transition-all"
                      >
                        <div
                          onClick={() => setExpandedSeason(isExpanded ? null : item.season)}
                          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-8 rounded-full" style={{ backgroundColor: item.teamColor }}></div>
                            <div>
                              <div className="font-hud font-black text-sm uppercase text-[var(--text-primary)]">
                                {item.season} • {item.teamName}
                              </div>
                              <div className="text-[10px] text-[var(--text-muted)] font-mono-num">
                                {item.racesCount} Races • {item.wins} Wins • {item.podiums} Podiums
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right font-mono-num">
                              <span className="font-hud font-black text-base text-amber-400">
                                P{item.championshipPosition}
                              </span>
                              <span className="text-xs text-[var(--text-muted)] block">
                                {item.points} PTS
                              </span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Inline Race Breakdown if real race breakdown is present */}
                        {isExpanded && item.races && item.races.length > 0 && (
                          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 text-xs font-mono-num space-y-1">
                            <div className="text-[10px] uppercase font-hud font-bold text-[var(--text-muted)] flex justify-between mb-2">
                              <span>Round & Grand Prix</span>
                              <span>Grid → Finish</span>
                            </div>
                            <div className="space-y-1">
                              {item.races.map((r, rIdx) => (
                                <div key={rIdx} className="flex justify-between py-1 border-b border-[var(--border-subtle)]/50 last:border-0">
                                  <span>R{r.round}: {r.raceName}</span>
                                  <span>P{r.grid} → <span className={`font-bold ${r.finish === 1 ? 'text-amber-400' : r.finish <= 3 ? 'text-emerald-400' : 'text-[var(--text-primary)]'}`}>P{r.finish} ({r.points} PTS)</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CIRCUIT RECORDS */}
          {activeTab === 'circuits' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Circuit Performance Dossier
                </h4>

                {/* Sort buttons */}
                <div className="flex items-center gap-1 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-subtle)] text-[10px] font-hud font-bold uppercase">
                  <button
                    onClick={() => setCircuitSortField('wins')}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      circuitSortField === 'wins' ? 'bg-[var(--accent-f1-red)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Most Wins
                  </button>
                  <button
                    onClick={() => setCircuitSortField('podiums')}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      circuitSortField === 'podiums' ? 'bg-[var(--accent-f1-red)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Podiums
                  </button>
                  <button
                    onClick={() => setCircuitSortField('avgFinish')}
                    className={`px-2 py-1 rounded cursor-pointer ${
                      circuitSortField === 'avgFinish' ? 'bg-[var(--accent-f1-red)] text-white' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Best Avg
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <table className="w-full text-left text-xs border-collapse font-mono-num">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--text-muted)] font-hud uppercase tracking-wider text-[11px]">
                      <th className="p-3">Circuit / Country</th>
                      <th className="p-3 text-center">Starts</th>
                      <th className="p-3 text-center">Wins</th>
                      <th className="p-3 text-center">Podiums</th>
                      <th className="p-3 text-center">Poles</th>
                      <th className="p-3 text-center">Avg Finish</th>
                      <th className="p-3 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {sortedCircuits.map((c) => (
                      <tr key={c.circuitId} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                        <td className="p-3 font-hud font-bold text-sm text-[var(--text-primary)]">
                          {c.circuitName}
                          <span className="text-[10px] text-[var(--text-muted)] block font-normal font-sans">
                            {c.country}
                          </span>
                        </td>
                        <td className="p-3 text-center">{c.starts}</td>
                        <td className="p-3 text-center font-bold text-amber-400">{c.wins}</td>
                        <td className="p-3 text-center text-emerald-400">{c.podiums}</td>
                        <td className="p-3 text-center text-purple-400">{c.poles}</td>
                        <td className="p-3 text-center font-bold text-[var(--text-primary)]">P{c.avgFinish}</td>
                        <td className="p-3 text-right font-hud font-bold text-sm text-[var(--accent-f1-red)]">
                          {c.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RIVALRY & COMPARISON */}
          {activeTab === 'rivalry' && compareProfile && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <span className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Compare With Rival or Historical Icon
                </span>
                <select
                  value={compareDriverId}
                  onChange={(e) => setCompareDriverId(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-subtle)] rounded-lg p-2 text-xs font-hud font-bold text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="norris">Lando Norris</option>
                  <option value="max_verstappen">Max Verstappen</option>
                  <option value="hamilton">Lewis Hamilton</option>
                  <option value="senna">Ayrton Senna (Legend)</option>
                  <option value="schumacher">Michael Schumacher (Legend)</option>
                </select>
              </div>

              {/* Side by side comparison arena */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: `${profile.teamColor}40` }}>
                  <div className="font-hud font-black text-xl uppercase text-[var(--text-primary)]">
                    {profile.fullName}
                  </div>
                  <div className="text-xs font-hud font-bold uppercase" style={{ color: profile.teamColor }}>
                    {profile.currentOrFinalTeam}
                  </div>
                </div>

                <div className="p-4 rounded-xl border space-y-1" style={{ borderColor: `${compareProfile.teamColor}40` }}>
                  <div className="font-hud font-black text-xl uppercase text-[var(--text-primary)]">
                    {compareProfile.fullName}
                  </div>
                  <div className="text-xs font-hud font-bold uppercase" style={{ color: compareProfile.teamColor }}>
                    {compareProfile.currentOrFinalTeam}
                  </div>
                </div>
              </div>

              {/* Stat Comparison Bars */}
              <div className="space-y-3 text-xs font-mono-num">
                {/* World Championships */}
                <div className="space-y-1">
                  <div className="flex justify-between font-hud font-bold uppercase text-[var(--text-muted)]">
                    <span className={profile.championships >= compareProfile.championships ? 'text-amber-400 font-bold' : ''}>
                      {profile.championships} Titles
                    </span>
                    <span>World Championships</span>
                    <span className={compareProfile.championships >= profile.championships ? 'text-amber-400 font-bold' : ''}>
                      {compareProfile.championships} Titles
                    </span>
                  </div>
                </div>

                {/* Wins */}
                <div className="space-y-1">
                  <div className="flex justify-between font-hud font-bold uppercase text-[var(--text-muted)]">
                    <span className={profile.careerTotals.wins >= compareProfile.careerTotals.wins ? 'text-emerald-400 font-bold' : ''}>
                      {profile.careerTotals.wins} Wins
                    </span>
                    <span>Grand Prix Victories</span>
                    <span className={compareProfile.careerTotals.wins >= profile.careerTotals.wins ? 'text-emerald-400 font-bold' : ''}>
                      {compareProfile.careerTotals.wins} Wins
                    </span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-[var(--bg-primary)]">
                    <div
                      className="h-full"
                      style={{
                        width: `${(profile.careerTotals.wins / Math.max(1, profile.careerTotals.wins + compareProfile.careerTotals.wins)) * 100}%`,
                        backgroundColor: profile.teamColor,
                      }}
                    ></div>
                    <div
                      className="h-full"
                      style={{
                        width: `${(compareProfile.careerTotals.wins / Math.max(1, profile.careerTotals.wins + compareProfile.careerTotals.wins)) * 100}%`,
                        backgroundColor: compareProfile.teamColor,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Win Rate */}
                <div className="space-y-1">
                  <div className="flex justify-between font-hud font-bold uppercase text-[var(--text-muted)]">
                    <span className={profile.careerTotals.winRatePercent >= compareProfile.careerTotals.winRatePercent ? 'text-emerald-400 font-bold' : ''}>
                      {profile.careerTotals.winRatePercent}%
                    </span>
                    <span>Win Rate Percentage</span>
                    <span className={compareProfile.careerTotals.winRatePercent >= profile.careerTotals.winRatePercent ? 'text-emerald-400 font-bold' : ''}>
                      {compareProfile.careerTotals.winRatePercent}%
                    </span>
                  </div>
                </div>

                {/* Podiums */}
                <div className="space-y-1">
                  <div className="flex justify-between font-hud font-bold uppercase text-[var(--text-muted)]">
                    <span className={profile.careerTotals.podiums >= compareProfile.careerTotals.podiums ? 'text-emerald-400 font-bold' : ''}>
                      {profile.careerTotals.podiums} Podiums
                    </span>
                    <span>Career Podiums</span>
                    <span className={compareProfile.careerTotals.podiums >= profile.careerTotals.podiums ? 'text-emerald-400 font-bold' : ''}>
                      {compareProfile.careerTotals.podiums} Podiums
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Legal Attribution & Compliance Notice */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <div className="space-y-0.5">
            <div className="font-hud font-bold text-[11px] text-[var(--text-secondary)] uppercase tracking-wider">
              Formula 1 Driver Dossier • Career Archive
            </div>
            <div className="text-[10px]">
              Portraits sourced legally from Wikimedia Commons under Creative Commons licensing. Teams represented abstractly via colors and clean typography.
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-[var(--text-primary)] font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer shrink-0"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
