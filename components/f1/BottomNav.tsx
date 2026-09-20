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

  const secondaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'junior',   label: 'Feeder Series (F2/F3)', icon: GraduationCap },
    { id: 'news',     label: 'News Wire',              icon: Newspaper     },
    { id: 'pitcrew',  label: 'Pit Crew Championship',  icon: Wrench        },
    { id: 'testing',  label: 'Pre-Season Testing',     icon: Gauge         },
    { id: 'analytics',label: 'Intelligence',           icon: Calculator    },
    { id: 'stories',  label: 'Briefings',              icon: BookOpen      },
    { id: 'archive',  label: 'Vault 1950+',            icon: History       },
    { id: 'about',    label: 'Why This Looks Like This',icon: BookOpen     },
  ];

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
              padding: '12px',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div
              className="flex items-center justify-between"
              style={{
                paddingBottom: 10,
                marginBottom: 6,
                borderBottom: '1px solid var(--border-dim)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                More Telemetry &amp; Archives
              </span>
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

            {/* Drawer items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {secondaryTabs.map((sec) => {
                const SecIcon = sec.icon;
                const isSec = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => { onTabChange(sec.id); setShowMoreMenu(false); }}
                    className="flex items-center gap-3 cursor-pointer transition-colors"
                    style={{
                      minHeight: 46,
                      padding: '10px 12px',
                      borderRadius: 'var(--r-md)',
                      background: isSec ? 'var(--red)' : 'transparent',
                      border: isSec ? 'none' : '1px solid transparent',
                      color: isSec ? '#fff' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSec) e.currentTarget.style.background = 'var(--bg-highlight)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSec) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <SecIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
                    <span>{sec.label}</span>
                  </button>
                );
              })}
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
