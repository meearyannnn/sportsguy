'use client';

import React from 'react';
import { Info, X } from 'lucide-react';
import { useContextualExplainer } from '@/lib/f1/useContextualExplainer';

interface ContextualExplainerProps {
  conceptId: string;
  title: string;
  description: string;
  badge?: string;
  className?: string;
}

export default function ContextualExplainer({
  conceptId,
  title,
  description,
  badge = 'DATA CONTEXT',
  className = '',
}: ContextualExplainerProps) {
  const { shouldShow, dismiss } = useContextualExplainer(conceptId);

  if (!shouldShow) return null;

  return (
    <div
      className={`rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/95 p-3 flex items-start justify-between gap-3 text-xs transition-all animate-fadeIn ${className}`}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--accent-f1-red)',
      }}
    >
      <div className="flex items-start gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded bg-[var(--accent-f1-red)]/10 text-[var(--accent-f1-red)] flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-hud font-bold text-[10px] tracking-wider uppercase text-[var(--accent-f1-red)]">
              {badge}
            </span>
            <span className="font-hud font-black text-xs uppercase text-[var(--text-primary)]">
              {title}
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
      </div>

      <button
        onClick={dismiss}
        className="px-2 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0 font-hud font-bold text-[10px] uppercase flex items-center gap-1"
        title="Don't show this explainer again"
      >
        <span>Got it</span>
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
