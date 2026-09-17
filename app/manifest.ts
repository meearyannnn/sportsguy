import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'APEX // Formula 1 Timing HUD',
    short_name: 'APEX F1',
    description: 'Precision Formula 1 Timing HUD & Pit-Wall Telemetry Companion',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#121214',
    theme_color: '#121214',
    categories: ['sports', 'utilities', 'news'],
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Live Telemetry',
        short_name: 'Live',
        description: 'Open Live F1 Track Telemetry HUD',
        url: '/?tab=live',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: 'Glance Mode',
        short_name: 'Glance',
        description: 'Single-stat zero-distraction telemetry display',
        url: '/glance',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: 'Championship Standings',
        short_name: 'Standings',
        description: 'FIA World Championship Driver & Team Standings',
        url: '/?tab=standings',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
      {
        name: 'Race Calendar',
        short_name: 'Calendar',
        description: 'Full Season Schedule with Local Timezone Honesty',
        url: '/?tab=calendar',
        icons: [{ src: '/icon.svg', sizes: '192x192' }],
      },
    ],
  };
}
