'use client';

import React from 'react';
import { NewsItem, LiveEventItem } from '@/lib/f1/newsTypes';
import { ExternalLink, Radio, Zap, Flag, Wrench, Shield, ArrowUpRight } from 'lucide-react';

interface NewsCardProps {
  variant: 'news';
  item: NewsItem;
}

interface LiveCardProps {
  variant: 'live';
  event: LiveEventItem;
}

type FeedCardProps = NewsCardProps | LiveCardProps;

export default function FeedCard(props: FeedCardProps) {
  if (props.variant === 'live') {
    const { event } = props;

    const severityStyles = {
      normal: 'border-[var(--border-subtle)] text-[var(--text-secondary)]',
      yellow: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      red: 'border-red-500/40 bg-red-500/10 text-red-400',
      purple: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
      green: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    };

    const badgeBg = {
      overtake: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      pit: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      fastest_lap: 'bg-[var(--accent-f1-red)]/15 text-[var(--accent-f1-red)] border-[var(--accent-f1-red)]/30',
      flag: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      battle: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      radio: 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-subtle)]',
    };

    return (
      <div
        className={`flex items-center justify-between p-2 sm:p-2.5 rounded border bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors gap-2 sm:gap-3 text-xs ${
          severityStyles[event.severity || 'normal']
        }`}
      >
        {/* Left: Timestamp/Lap, Badge & Event Title */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
          {event.lap ? (
            <span className="font-mono-num font-bold text-[10px] text-[var(--text-muted)] shrink-0 px-1 py-0.5 rounded bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
              L{event.lap}
            </span>
          ) : (
            <span className="font-mono-num text-[10px] text-[var(--text-muted)] shrink-0">
              {event.timestamp}
            </span>
          )}

          <span
            className={`font-hud font-black text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
              badgeBg[event.type]
            }`}
          >
            {event.badgeText}
          </span>

          <span className="font-hud font-bold uppercase text-[var(--text-primary)] truncate">
            {event.title}
          </span>

          <span className="text-[11px] text-[var(--text-secondary)] truncate hidden md:inline font-mono-num">
            — {event.detail}
          </span>
        </div>

        {/* Right: Driver Pill if present */}
        {event.driverCode && (
          <div className="flex items-center gap-1.5 shrink-0">
            {event.teamColor && (
              <span
                className="w-1.5 h-3 rounded-full"
                style={{ backgroundColor: event.teamColor }}
              />
            )}
            <span className="font-hud font-black text-[11px] text-[var(--text-primary)] font-mono-num">
              {event.driverCode}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Variant: 'news'
  const { item } = props;

  const tagColor = {
    Breaking: 'bg-red-500/15 text-red-400 border-red-500/30',
    'Race Weekend': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    'Driver Market': 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Technical: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Regulation: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  };

  const formattedTime = formatTimeAgo(item.pubDate);

  return (
    <article className="p-4 sm:p-5 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--border-hover)] transition-colors flex flex-col justify-between space-y-3 group">
      <div className="space-y-2">
        {/* Meta Bar: Source + Tag + Time */}
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="font-hud font-bold text-[10px] text-[var(--text-primary)] uppercase tracking-wider px-2 py-0.5 rounded-sm bg-[var(--bg-tertiary)] border border-[var(--border-subtle)]">
              {item.source}
            </span>
            <span
              className={`font-hud font-black text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-sm border ${
                tagColor[item.tag] || tagColor['Race Weekend']
              }`}
            >
              {item.isBreaking ? 'BREAKING' : item.tag}
            </span>
          </div>

          <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
            {formattedTime}
          </span>
        </div>

        {/* Headline */}
        <h3 className="font-hud font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-white leading-snug">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-start justify-between gap-2"
          >
            <span>{item.title}</span>
            <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0 transition-colors mt-0.5" />
          </a>
        </h3>

        {/* Summary Snippet (1-2 sentences as provided by RSS) */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
          {item.summary}
        </p>
      </div>

      {/* Footer: Secondary Outlets (Deduplication) + Original Story Link */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 flex-wrap text-[11px]">
        {item.secondarySources.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-hud text-[var(--text-muted)] uppercase">
              Also reported by:
            </span>
            {item.secondarySources.map((sec, idx) => (
              <a
                key={idx}
                href={sec.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono-num text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
              >
                {sec.name} ↗
              </a>
            ))}
          </div>
        ) : (
          <span className="text-[10px] font-mono-num text-[var(--text-muted)]">
            Single outlet dispatch
          </span>
        )}

        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-hud font-bold uppercase text-[10px] text-[var(--accent-f1-red)] hover:underline inline-flex items-center gap-1"
        >
          <span>OPEN PUBLISHER WIRE ({item.source.toUpperCase()})</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </article>
  );
}

function formatTimeAgo(isoString: string): string {
  try {
    const ms = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return 'Recent';
  }
}
