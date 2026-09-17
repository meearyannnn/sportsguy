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
} from 'lucide-react';
import { NavTab } from './Navbar';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenSearch?: () => void;
}

export default function BottomNav({
  activeTab,
  onTabChange,
  onOpenSearch,
}: BottomNavProps) {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  const primaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'hub', label: 'Home', icon: Radio },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'paddock', label: 'Drivers', icon: Users },
    { id: 'live', label: 'Live', icon: Gauge },
  ];

  const secondaryTabs: Array<{ id: NavTab; label: string; icon: any }> = [
    { id: 'junior', label: 'Feeder Series (F2 / F3)', icon: GraduationCap },
    { id: 'news', label: 'News Wire', icon: Newspaper },
    { id: 'pitcrew', label: 'Pit Crew Championship', icon: Wrench },
    { id: 'testing', label: 'Pre-Season Testing', icon: Gauge },
    { id: 'analytics', label: 'Intelligence', icon: Calculator },
    { id: 'stories', label: 'Briefings', icon: BookOpen },
    { id: 'archive', label: 'Vault 1950+', icon: History },
    { id: 'about', label: 'Why This Looks Like This', icon: BookOpen },
  ];

  const isMoreActive = secondaryTabs.some((t) => t.id === activeTab);

  return (
    <>
      {/* Secondary More Menu Drawer for Mobile (Safe-Area Bounded & Scrollable) */}
      {showMoreMenu && (
        <div
          className="xl:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fadeIn"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-[calc(env(safe-area-inset-bottom,16px)+64px)] left-3 right-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 space-y-1.5 max-h-[70vh] overflow-y-auto touch-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] px-2">
              <span className="text-[10px] font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
                More Telemetry & Archives
              </span>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1 pt-1">
              {secondaryTabs.map((sec) => {
                const SecIcon = sec.icon;
                const isSecActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      onTabChange(sec.id);
                      setShowMoreMenu(false);
                    }}
                    className={`w-full min-h-[46px] flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isSecActive
                        ? 'bg-[var(--accent-f1-red)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] active:bg-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <SecIcon className="w-4 h-4 shrink-0" />
                      <span>{sec.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick Mobile Search FAB (Thumb-friendly bottom-right corner) */}
      {onOpenSearch && (
        <button
          onClick={onOpenSearch}
          className="xl:hidden fixed bottom-[calc(env(safe-area-inset-bottom,16px)+64px)] right-4 z-40 w-12 h-12 rounded-full bg-[var(--accent-f1-red)] text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-white/20"
          aria-label="Open search"
          title="Search driver, team, circuit"
        >
          <Search className="w-5 h-5" />
        </button>
      )}

      {/* Main Bottom Bar (Enforcing 48px Touch Targets + Safe-Area-Inset) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-secondary)]/98 backdrop-blur-xl border-t border-[var(--border-subtle)] px-2 pt-1 pb-safe"
      >
        <div className="flex items-center justify-around h-14">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  setShowMoreMenu(false);
                }}
                className={`min-h-[48px] min-w-[54px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
                  isActive
                    ? 'text-[var(--accent-f1-red)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight leading-none">{tab.label}</span>
                {isActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] mt-1 animate-pulse shrink-0"></span>
                ) : (
                  <span className="w-1.5 h-1.5 mt-1 shrink-0"></span>
                )}
              </button>
            );
          })}

          {/* More Trigger (Min 48px Target) */}
          <button
            onClick={() => setShowMoreMenu((prev) => !prev)}
            className={`min-h-[48px] min-w-[54px] flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer select-none active:scale-95 ${
              isMoreActive || showMoreMenu
                ? 'text-[var(--accent-f1-red)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            aria-label="More navigation options"
            aria-expanded={showMoreMenu}
          >
            <History className="w-4 h-4 mb-0.5 shrink-0" />
            <span className="text-[10px] tracking-tight leading-none">More</span>
            {isMoreActive ? (
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-f1-red)] mt-1 shrink-0"></span>
            ) : (
              <span className="w-1.5 h-1.5 mt-1 shrink-0"></span>
            )}
          </button>
        </div>
      </nav>
    </>
  );
}
