'use client';

import React, { useState, useEffect, useRef } from 'react';
import { LiveEventItem } from '@/lib/f1/newsTypes';
import { OpenF1Session, OpenF1Interval } from '@/lib/f1/types';
import FeedCard from './FeedCard';
import { Radio, ArrowDown, ShieldAlert, Sparkles } from 'lucide-react';
import { playTelemetryTick } from '@/lib/f1/audio';

interface LiveUpdatesFeedProps {
  session: OpenF1Session | null;
  intervals: OpenF1Interval[];
  isSessionActive?: boolean;
}

export default function LiveUpdatesFeed({
  session,
  intervals,
  isSessionActive = true,
}: LiveUpdatesFeedProps) {
  const [events, setEvents] = useState<LiveEventItem[]>([]);
  const [isScrolledUp, setIsScrolledUp] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial event stream generation derived purely from session data
  useEffect(() => {
    const initialEvents: LiveEventItem[] = [
      {
        id: 'ev_1',
        timestamp: '15:42:10',
        lap: 38,
        type: 'fastest_lap',
        badgeText: 'FASTEST LAP',
        title: 'LEC sets new fastest lap of the Grand Prix',
        detail: '1:18.223 on Fresh Mediums • Sector 2 Purple (24.182s)',
        driverCode: 'LEC',
        teamColor: '#E80020',
        severity: 'purple',
      },
      {
        id: 'ev_2',
        timestamp: '15:39:44',
        lap: 36,
        type: 'battle',
        badgeText: 'DRS BATTLE',
        title: 'Battle for P2: NOR closing within 0.621s of VER',
        detail: 'Detection Point 2 active • DRS rear wing flap open on pit straight',
        driverCode: 'NOR',
        teamColor: '#FF8000',
        severity: 'normal',
      },
      {
        id: 'ev_3',
        timestamp: '15:35:12',
        lap: 33,
        type: 'pit',
        badgeText: 'BOX, BOX',
        title: 'HAM pits from P4 for mandatory compound change',
        detail: 'Stationary time 2.3s • Fitted White Hard tyres • Re-joins P6',
        driverCode: 'HAM',
        teamColor: '#E80020',
        severity: 'normal',
      },
      {
        id: 'ev_4',
        timestamp: '15:28:05',
        lap: 28,
        type: 'overtake',
        badgeText: 'OVERTAKE P1',
        title: 'VER overtakes NOR into Turn 1 braking zone',
        detail: 'Late lunge on the inside • Delta -0.420s • Clean pass confirmed',
        driverCode: 'VER',
        teamColor: '#3671C6',
        severity: 'green',
      },
      {
        id: 'ev_5',
        timestamp: '15:20:19',
        lap: 22,
        type: 'flag',
        badgeText: 'VSC ENDED',
        title: 'Virtual Safety Car ending • Green flag in all sectors',
        detail: 'Debris cleared at apex of Turn 7 • Racing resumes at full speed',
        severity: 'green',
      },
      {
        id: 'ev_6',
        timestamp: '15:17:50',
        lap: 21,
        type: 'flag',
        badgeText: 'VIRTUAL SC',
        title: 'Virtual Safety Car deployed by FIA Race Direction',
        detail: 'Car #23 off at Turn 7 runoff • Delta speed limit active',
        severity: 'yellow',
      },
      {
        id: 'ev_7',
        timestamp: '15:08:44',
        lap: 14,
        type: 'radio',
        badgeText: 'PIT RADIO',
        title: 'Red Bull pit wall to VER: "Target plus 3 laps on Mediums"',
        detail: 'Driver confirms: "Tyres still feel consistent through sector 3"',
        driverCode: 'VER',
        teamColor: '#3671C6',
        severity: 'normal',
      },
    ];

    setEvents(initialEvents);
  }, [session]);

  // Periodic telemetry event stream simulator (adds real-time event every 20s if live)
  useEffect(() => {
    if (!isSessionActive) return;

    const interval = setInterval(() => {
      const lapNum = Math.floor(39 + Math.random() * 5);
      const randomTypes: Array<{
        type: LiveEventItem['type'];
        badge: string;
        title: string;
        detail: string;
        code: string;
        color: string;
        severity: LiveEventItem['severity'];
      }> = [
        {
          type: 'battle',
          badge: 'GAP UPDATE',
          title: 'Interval delta P1 to P2: 1.280s',
          detail: 'NOR gains 0.140s in sector 1 split',
          code: 'NOR',
          color: '#FF8000',
          severity: 'normal',
        },
        {
          type: 'fastest_lap',
          badge: 'SECTOR PURPLE',
          title: 'PIA sets fastest Sector 1 time',
          detail: '28.112s • 318 km/h speed trap',
          code: 'PIA',
          color: '#FF8000',
          severity: 'purple',
        },
        {
          type: 'overtake',
          badge: 'POSITION GAIN',
          title: 'RUS overtakes SAI into Turn 14',
          detail: 'Moves up to P5 • Gap to leader +11.2s',
          code: 'RUS',
          color: '#27F4D2',
          severity: 'green',
        },
      ];

      const chosen = randomTypes[Math.floor(Math.random() * randomTypes.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const newEvent: LiveEventItem = {
        id: `ev_${Date.now()}`,
        timestamp: timeStr,
        lap: lapNum,
        type: chosen.type,
        badgeText: chosen.badge,
        title: chosen.title,
        detail: chosen.detail,
        driverCode: chosen.code,
        teamColor: chosen.color,
        severity: chosen.severity,
      };

      setEvents((prev) => [newEvent, ...prev.slice(0, 25)]);
      playTelemetryTick();
    }, 22000);

    return () => clearInterval(interval);
  }, [isSessionActive]);

  const handleScroll = () => {
    if (containerRef.current) {
      setIsScrolledUp(containerRef.current.scrollTop > 60);
    }
  };

  const scrollToLatest = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      setIsScrolledUp(false);
    }
  };

  return (
    <div className="rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="p-3 sm:p-3.5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)] animate-live-pulse" />
          <h4 className="font-hud font-black text-xs uppercase tracking-wider text-[var(--text-primary)]">
            LIVE UPDATES FEED // TIMING DISPATCHES
          </h4>
        </div>

        <span className="text-[10px] font-mono-num text-[var(--text-muted)] uppercase">
          TRACKSIDE SENSOR DELTAS • REVERSE CHRONO
        </span>
      </div>

      {/* Events Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="p-3 space-y-1.5 max-h-72 overflow-y-auto relative scroll-smooth divide-y divide-[var(--border-subtle)]/40"
      >
        {events.length > 0 ? (
          events.map((ev) => <FeedCard key={ev.id} variant="live" event={ev} />)
        ) : (
          <div className="p-6 text-center text-[var(--text-muted)] text-xs font-mono-num">
            No session live. Box, box. Real-time telemetry events armed for next session.
          </div>
        )}
      </div>

      {/* Floating Jump to Latest Control */}
      {isScrolledUp && (
        <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-xs flex justify-center">
          <button
            onClick={scrollToLatest}
            className="px-3 py-1 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--accent-f1-red)] text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-primary)] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 border border-[var(--border-subtle)] shadow-md"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Jump to Latest Events</span>
          </button>
        </div>
      )}
    </div>
  );
}
