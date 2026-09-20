import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { F1_TEAMS, DRIVER_DETAILS, getTeamMeta } from '@/lib/f1/teams';
import { DriverStanding } from '@/lib/f1/types';
import {
  loadUserPreferences,
  saveUserPreferences,
  applyTeamLiveryTheme,
} from '@/lib/f1/preferences';
import {
  X,
  Palette,
  Heart,
  Shield,
  Check,
  Sparkles,
  Award,
} from 'lucide-react';

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  standings: DriverStanding[];
  onThemeApplied?: (teamId: string) => void;
}

export default function PersonalizationModal({
  isOpen,
  onClose,
  standings,
  onThemeApplied,
}: PersonalizationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [favoriteDriver, setFavoriteDriver] = useState<string>('norris');
  const [favoriteTeam, setFavoriteTeam] = useState<string>('mclaren');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const prefs = loadUserPreferences();
      setFavoriteDriver(prefs.favoriteDriverId || 'norris');
      setFavoriteTeam(prefs.favoriteTeamId || 'mclaren');
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const currentTeamMeta = getTeamMeta(favoriteTeam);

  const handleSave = () => {
    saveUserPreferences({
      favoriteDriverId: favoriteDriver,
      favoriteTeamId: favoriteTeam,
    });
    applyTeamLiveryTheme(favoriteTeam);
    if (onThemeApplied) onThemeApplied(favoriteTeam);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return createPortal(
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
      {/* Dark Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Centering wrapper */}
      <div className="flex min-h-screen sm:min-h-full items-center justify-center p-3 sm:p-4 w-full">
        <div className="relative w-full max-w-xl rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-10 text-[var(--text-primary)] animate-scale-in my-auto">
        {/* Top Accent Strip */}
        <div
          className="h-1 w-full transition-all"
          style={{ backgroundColor: currentTeamMeta.color }}
        ></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: `${currentTeamMeta.color}20`,
                color: currentTeamMeta.color,
                border: `1px solid ${currentTeamMeta.color}40`,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-hud font-black uppercase tracking-tight text-[var(--text-primary)]">
                Paddock Personalization & Team Livery
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Reskin APEX to your favorite constructor & prioritize your driver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] active:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
            aria-label="Close personalization modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Favorite Team Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" style={{ color: currentTeamMeta.color }} />
              <span>Select Your Allegiance (Constructor Livery)</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(F1_TEAMS).map(([id, team]) => {
                const isSelected = favoriteTeam === id;
                return (
                  <button
                    key={id}
                    onClick={() => setFavoriteTeam(id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                      isSelected
                        ? 'bg-[var(--bg-tertiary)] border-[var(--border-hover)] ring-2 shadow-lg'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
                    }`}
                    style={{
                      outlineColor: isSelected ? team.color : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      ></span>
                      <span className="font-hud font-bold uppercase text-xs text-[var(--text-primary)] truncate">
                        {team.name}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: team.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Favorite Driver Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              <span>Favorite Driver (Prioritized in Leaderboards & Alerts)</span>
            </label>

            <select
              value={favoriteDriver}
              onChange={(e) => setFavoriteDriver(e.target.value)}
              className="w-full p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] font-hud font-bold text-sm text-[var(--text-primary)] focus:outline-none"
            >
              {standings.map((s) => (
                <option key={s.Driver.driverId} value={s.Driver.driverId}>
                  #{s.Driver.permanentNumber || s.position} • {s.Driver.givenName} {s.Driver.familyName} ({s.Constructors[0]?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Live Preview Card */}
          <div
            className="p-4 rounded-xl border space-y-2 relative overflow-hidden"
            style={{
              backgroundColor: `${currentTeamMeta.color}0D`,
              borderColor: `${currentTeamMeta.color}35`,
            }}
          >
            <div className="flex items-center justify-between text-xs font-hud font-bold uppercase">
              <span style={{ color: currentTeamMeta.color }}>
                {currentTeamMeta.fullName} Livery Active
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Live Theme Preview</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              When saved, the entire APEX command center (accent glows, telemetry lines, buttons, and pulse meters) will reflect {currentTeamMeta.name}&apos;s official championship colors.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/70 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--text-muted)] font-mono-num">
            Saved locally in browser
          </span>

          <button
            onClick={handleSave}
            disabled={savedSuccess}
            className="px-5 py-2.5 rounded-xl text-white font-hud font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            style={{
              backgroundColor: currentTeamMeta.color,
            }}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Livery Applied!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Apply Team Livery</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>,
  document.body
);
}

