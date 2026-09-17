'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LiveEventItem } from '@/lib/f1/newsTypes';
import { OpenF1Session, OpenF1Interval } from '@/lib/f1/types';
import FeedCard from './FeedCard';
import { Radio, ShieldAlert } from 'lucide-react';

interface LiveUpdatesFeedProps {
  session: OpenF1Session | null;
  intervals: OpenF1Interval[];
  isSessionActive?: boolean;
}

export default function LiveUpdatesFeed({
  session,
  intervals,
  isSessionActive = false,
}: LiveUpdatesFeedProps) {
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (intervals && intervals.length > 0) {
      const liveEvents: LiveEventItem[] = intervals.slice(0, 10).map((inv, idx) => {
        const driverNum = inv.driver_number || 1;
        const gap = inv.gap_to_leader !== undefined ? `+${inv.gap_to_leader}s` : 'LEADER';
        return {
          id: `inv_${idx}_${Date.now()}`,
          timestamp: new Date(inv.date || Date.now()).toTimeString().split(' ')[0],
          lap: 0,
          type: 'battle',
          badgeText: 'TIMING INTERVAL',
          title: `Car #${driverNum} Interval Update: ${gap}`,
          detail: `Gap to ahead: ${inv.interval ? `+${inv.interval}s` : 'Leader'}`,
          driverCode: `#${driverNum}`,
          teamColor: '#FF8000',
          severity: 'normal',
        };
      });
      setEvents(liveEvents);
    } else {
      setEvents([]);
    }
  }, [intervals, session]);

  return (
    <div className="space-y-4" ref={containerRef}>
      <div className="flex items-center justify-between p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg">
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 ${isSessionActive ? 'text-red-500 animate-pulse' : 'text-[var(--text-muted)]'}`} />
          <span className="font-hud font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">
            {isSessionActive ? 'Live Telemetry Stream' : 'Live Timing Feed • Standby'}
          </span>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
          {session?.session_name || 'No Active Track Session'}
        </span>
      </div>

      {events.length > 0 ? (
        <div className="space-y-2 max-h-[480px] overflow-y-auto">
          {events.map((ev) => (
            <FeedCard key={ev.id} variant="live" event={ev} />
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg space-y-2">
          <ShieldAlert className="w-6 h-6 text-amber-500 mx-auto" />
          <p className="text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)]">
            No Active Live Session Stream
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Real-time lap event feeds activate automatically when FIA official sessions commence.
          </p>
        </div>
      )}
    </div>
  );
}
