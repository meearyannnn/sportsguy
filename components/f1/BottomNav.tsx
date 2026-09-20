'use client';

import React from 'react';
import {
  Calendar,
  Trophy,
  Gauge,
  Users,
  Radio,
  Calculator,
  BookOpen,
  History,
  Newspaper,
  GraduationCap,
  Wrench,
  Search,
  X,
  MoreHorizontal,
  Zap,
} from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSearch?: () => void;
}

export default function BottomNav({ activeTab, onTabChange, onOpenSearch }: BottomNavProps) {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const primaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'hub',       label: 'Home',     icon: Radio    },
    { id: 'calendar',  label: 'Calendar', icon: Calendar },
    { id: 'standings', label: 'Standings',icon: Trophy   },
    { id: 'paddock',   label: 'Drivers',  icon: Users    },
    { id: 'live',      label: 'Live',     icon: Gauge    },
  ];

  const featureModes: Array<{ id: NavTab; label: string; icon: any; badge?: string; desc?: string }> = [
    { id: 'battle',   label: 'Battle Center (H2H)',    icon: Zap,        badge: 'NEW', desc: 'Driver vs Driver telemetry & radar' },
    { id: 'predict',  label: 'Prediction Engine',      icon: Calculator, badge: 'NEW', desc: 'Circuit affinity & AI win probabilities' },
    { id: 'fantasy',  label: 'Fantasy F1',             icon: Trophy,     badge: 'NEW', desc: 'Team manager with $100M budget & chips' },
    { id: 'timeline', label: 'Championship Timeline',  icon: Radio,      badge: 'NEW', desc: 'Animated round progression & gap mode' },
    { id: 'tyres',    label: 'Tire Strategy',          icon: Gauge,      badge: 'NEW', desc: 'Compound choices & pit stop timelines' },
  ];

  const archiveTabs: Array<{ id: NavTab; label: string; icon: any; desc?: string }> = [
    { id: 'junior',   label: 'Feeder Series (F2/F3)',  icon: GraduationCap, desc: 'Academy & junior ladder standings' },
    { id: 'news',     label: 'News Wire',              icon: Newspaper,     desc: 'FIA briefings & paddock updates' },
    { id: 'pitcrew',  label: 'Pit Crew Championship',  icon: Wrench,        desc: 'Sub-2s pit stop leaderboards' },
    { id: 'testing',  label: 'Pre-Season Testing',     icon: Gauge,         desc: 'Lap counts & pre-season lap times' },
    { id: 'analytics',label: 'Intelligence Vault',     icon: Calculator,    desc: 'Advanced sector telemetry' },
    { id: 'stories',  label: 'Briefings',              icon: BookOpen,      desc: 'Technical dossiers & history' },
    { id: 'archive',  label: 'Vault 1950+',            icon: History,       desc: 'Every GP & champion in history' },
    { id: 'about',    label: 'Design Statement',       icon: BookOpen,      desc: 'Why this looks like this' },
  ];

  const secondaryTabs = [...featureModes, ...archiveTabs];
  const isMoreActive = secondaryTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* ── Secondary drawer (slides up over content) ── */}
      {showMoreMenu && (
        <div
          className="xl:hidden fixed inset-0 z-40 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute left-3 right-3 touch-scroll animate-slide-up"
            style={{
              bottom: 'calc(env(safe-area-inset-bottom, 16px) + 64px)',
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-mid)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--shadow-modal)',
              padding: '14px',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between"
              style={{
                paddingBottom: 10,
                marginBottom: 8,
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 rounded-full bg-[var(--red)]" />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 12,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                  }}
                >
                  All Modes &amp; Telemetry
                </span>
              </div>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="flex items-center justify-center cursor-pointer"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--bg-highlight)',
                  border: 'none',
                  color: 'var(--text-secondary)',
                }}
                aria-label="Close menu"
              >
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>

            {/* Section 1: 2026 Features */}
            <div className="space-y-1.5 mb-3">
              <div className="text-[10px] uppercase font-hud font-bold tracking-widest text-[var(--red)] px-2 pt-1">
                2026 Feature Modes
              </div>
              <div className="grid grid-cols-1 gap-1">
                {featureModes.map((sec) => {
                  const SecIcon = sec.icon;
                  const isSec = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => { onTabChange(sec.id); setShowMoreMenu(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer"
                      style={{
                        background: isSec ? 'var(--red)' : 'var(--bg-raised)',
                        border: isSec ? '1px solid var(--red)' : '1px solid var(--border-dim)',
                        color: isSec ? '#fff' : 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SecIcon style={{ width: 15, height: 15, color: isSec ? '#fff' : 'var(--red)', shrink: 0 }} />
                        <div className="min-w-0">
                          <div className="text-xs font-hud font-bold uppercase tracking-wider truncate">
                            {sec.label}
                          </div>
                          {sec.desc && (
                            <div className="text-[9px] text-[var(--text-muted)] truncate" style={{ color: isSec ? 'rgba(255,255,255,0.75)' : undefined }}>
                              {sec.desc}
                            </div>
                          )}
                        </div>
                      </div>
                      {sec.badge && (
                        <span
                          className="text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded ml-2 shrink-0"
                          style={{
                            backgroundColor: isSec ? 'rgba(255,255,255,0.25)' : 'var(--red)',
                            color: '#fff',
                          }}
                        >
                          {sec.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Feeds & Archives */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-hud font-bold tracking-widest text-[var(--text-muted)] px-2 pt-2 border-t border-[var(--border-dim)]">
                Paddock Intelligence &amp; Feeds
              </div>
              <div className="grid grid-cols-1 gap-1">
                {archiveTabs.map((sec) => {
                  const SecIcon = sec.icon;
                  const isSec = activeTab === sec.id;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => { onTabChange(sec.id); setShowMoreMenu(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
                      style={{
                        background: isSec ? 'var(--red)' : 'transparent',
                        border: isSec ? 'none' : '1px solid transparent',
                        color: isSec ? '#fff' : 'var(--text-secondary)',
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SecIcon style={{ width: 14, height: 14, color: isSec ? '#fff' : 'var(--text-muted)', shrink: 0 }} />
                        <span className="text-xs font-hud font-bold uppercase tracking-wider truncate">
                          {sec.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating search FAB ─────────────────── */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="xl:hidden fixed z-40 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          style={{
            bottom: 'calc(env(safe-area-inset-bottom, 16px) + 70px)',
            right: 16,
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: 'var(--red)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
            boxShadow: '0 4px 20px var(--red-glow)',
          }}
          aria-label="Open search"
        >
          <Search style={{ width: 18, height: 18 }} />
        </button>
      )}

      {/* ── Main bottom bar ─────────────────────── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
        style={{
          background: 'rgba(11,11,14,0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-dim)',
        }}
      >
        <div
          className="flex items-center justify-around"
          style={{ height: 56, padding: '0 4px' }}
        >
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { onTabChange(tab.id); setShowMoreMenu(false); }}
                className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-all"
                style={{
                  minHeight: 48,
                  minWidth: 48,
                  padding: '4px 2px',
                  borderRadius: 'var(--r-md)',
                  background: 'none',
                  border: 'none',
                  color: isActive ? 'var(--red)' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: isActive ? 700 : 500,
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  style={{
                    width: 16,
                    height: 16,
                    marginBottom: 2,
                    strokeWidth: isActive ? 2.5 : 1.8,
                  }}
                />
                <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {tab.label}
                </span>
                {/* Active dot */}
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    marginTop: 2,
                    background: isActive ? 'var(--red)' : 'transparent',
                    display: 'block',
                  }}
                />
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setShowMoreMenu((p) => !p)}
            className="flex-1 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-all"
            style={{
              minHeight: 48,
              minWidth: 48,
              padding: '4px 2px',
              borderRadius: 'var(--r-md)',
              background: 'none',
              border: 'none',
              color: isMoreActive || showMoreMenu ? 'var(--red)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: isMoreActive || showMoreMenu ? 700 : 500,
            }}
            aria-label="More navigation options"
            aria-expanded={showMoreMenu}
          >
            <MoreHorizontal
              style={{
                width: 16,
                height: 16,
                marginBottom: 2,
                strokeWidth: isMoreActive || showMoreMenu ? 2.5 : 1.8,
              }}
            />
            <span style={{ fontSize: 9, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              More
            </span>
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                marginTop: 2,
                background: isMoreActive ? 'var(--red)' : 'transparent',
                display: 'block',
              }}
            />
          </button>
        </div>
      </nav>
    </>
  );
}
