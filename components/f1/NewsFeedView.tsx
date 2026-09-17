'use client';

import React, { useState, useEffect } from 'react';
import { NewsItem, NewsTag } from '@/lib/f1/newsTypes';
import FeedCard from './FeedCard';
import { Radio, RefreshCw, Filter, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

export default function NewsFeedView() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [updatedAt, setUpdatedAt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchNews = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/f1/news');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setItems(data.items || []);
      setUpdatedAt(data.updatedAt || new Date().toISOString());
    } catch {
      setErrorMsg('Telemetry carrier unstable • Paddock wire syndication standing by');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Poll on 7-minute interval
    const interval = setInterval(() => {
      fetchNews(true);
    }, 7 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const tags: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Wire' },
    { id: 'Breaking', label: 'Breaking' },
    { id: 'Race Weekend', label: 'Race Weekend' },
    { id: 'Driver Market', label: 'Driver Market' },
    { id: 'Technical', label: 'Technical' },
    { id: 'Regulation', label: 'Regulation' },
  ];

  // Pinned breaking stories
  const breakingItems = items.filter((item) => item.isBreaking).slice(0, 3);

  // Filtered stories
  const filteredItems = items.filter((item) => {
    if (selectedTag === 'All') return true;
    if (selectedTag === 'Breaking') return item.isBreaking;
    return item.tag === selectedTag;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Outlets Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div>
          <div className="flex items-center gap-2 text-xs font-hud font-bold text-[var(--accent-f1-red)] uppercase tracking-wider mb-1">
            <Radio className="w-4 h-4 animate-pulse" />
            <span>F1 PADDOCK NEWS</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-hud tracking-tight uppercase text-[var(--text-primary)]">
            Latest Motorsport News & Headlines
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Headlines & summaries from Autosport, Motorsport.com, BBC Sport, and The Race
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchNews(true)}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-sm bg-[var(--bg-tertiary)] hover:bg-[var(--border-hover)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5 border border-[var(--border-subtle)] disabled:opacity-50"
            title="Refresh news feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh News'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {tags.map((t) => {
            const isActive = selectedTag === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTag(t.id)}
                className={`px-3 py-1.5 rounded-sm text-xs font-hud font-bold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-b-2 border-[var(--accent-f1-red)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase shrink-0">
          {filteredItems.length} Articles
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3"
            >
              <div className="flex gap-2">
                <div className="w-16 h-4 bg-[var(--bg-tertiary)] rounded-sm" />
                <div className="w-20 h-4 bg-[var(--bg-tertiary)] rounded-sm" />
              </div>
              <div className="w-3/4 h-5 bg-[var(--bg-tertiary)] rounded-sm" />
              <div className="w-full h-3 bg-[var(--bg-tertiary)] rounded-sm" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Pinned Breaking News Section (If Viewing All or Breaking) */}
          {(selectedTag === 'All' || selectedTag === 'Breaking') && breakingItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-hud font-bold uppercase tracking-wider text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>BREAKING NEWS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {breakingItems.map((item) => (
                  <FeedCard key={`breaking_${item.id}`} variant="news" item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Main Chronological News Feed */}
          <div className="space-y-3">
            <div className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-muted)]">
              {selectedTag === 'All' ? 'ALL NEWS' : `${selectedTag.toUpperCase()} NEWS`}
            </div>

            {filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <FeedCard key={item.id} variant="news" item={item} />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-[var(--border-subtle)] rounded-sm bg-[var(--bg-secondary)] text-[var(--text-muted)] font-mono-num text-xs">
                No news articles found for &quot;{selectedTag}&quot;.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
