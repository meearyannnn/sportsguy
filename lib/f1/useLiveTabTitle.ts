'use client';

import { useEffect, useRef } from 'react';

interface LiveTabOptions {
  isLive: boolean;
  leaderCode?: string;
  gap?: string;
  sessionName?: string;
}

/**
 * Hook to make the browser tab title and favicon live-aware:
 * - Live: shows small red dot on favicon + dynamic "(🔴 VER +1.4s) APEX // TIMING HUD"
 * - Idle: restores default title and favicon
 */
export function useLiveTabTitle({
  isLive,
  leaderCode = 'VER',
  gap = 'LEADER',
  sessionName,
}: LiveTabOptions) {
  const originalTitleRef = useRef<string>('APEX // Formula 1 Timing HUD');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update document title
    if (isLive) {
      const gapText = gap === 'LEADER' ? 'P1' : gap;
      document.title = `(🔴 ${leaderCode} ${gapText}) APEX // TIMING HUD`;
    } else {
      document.title = 'APEX // Formula 1 Timing HUD';
    }

    // Dynamic Favicon Generation
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // Dark background tile
        ctx.fillStyle = '#121214';
        ctx.fillRect(0, 0, 32, 32);

        // Hairline border
        ctx.strokeStyle = '#2A2A2D';
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, 31, 31);

        // Signal red left stripe
        ctx.fillStyle = '#E10600';
        ctx.fillRect(0, 0, 4, 32);

        // "A" mark in center
        ctx.fillStyle = '#EDEDED';
        ctx.font = '900 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('A', 17, 17);

        // If live: draw prominent red signal dot in top-right
        if (isLive) {
          ctx.beginPath();
          ctx.arc(26, 6, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#E10600';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(26, 6, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }

        const faviconUrl = canvas.toDataURL('image/png');
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.type = 'image/png';
        link.href = faviconUrl;
      }
    } catch {
      // Ignore canvas errors in restricted iframe environments
    }

    return () => {
      document.title = originalTitleRef.current;
    };
  }, [isLive, leaderCode, gap, sessionName]);
}
