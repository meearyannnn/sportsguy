import type { Metadata, Viewport } from 'next';
import { Rajdhani, Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-hud',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://apex-f1.app'),
  title: {
    default: 'APEX // Formula 1 Timing HUD & Pit-Wall Telemetry',
    template: '%s | APEX F1 Timing HUD',
  },
  description:
    'Formula 1 timing HUD featuring live race countdowns, telemetry sparklines, real-time intervals, championship standings, full season calendar, and historical race classification archive.',
  keywords: [
    'Formula 1',
    'F1 Timing',
    'Live Telemetry',
    'Championship Standings',
    'Grand Prix Calendar',
    'Pit Wall HUD',
    'Pace Traces',
  ],
  authors: [{ name: 'APEX Pit-Wall Engineering' }],
  creator: 'APEX F1',
  publisher: 'APEX F1',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apex-f1.app',
    siteName: 'APEX Formula 1 Timing HUD',
    title: 'APEX // Formula 1 Timing HUD & Pit-Wall Telemetry',
    description:
      'High-precision Formula 1 telemetry companion: live intervals, tyre compound decay models, mathematical clinch permutations, and 75-year archive.',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'APEX F1 Timing HUD Badge',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APEX // Formula 1 Timing HUD',
    description:
      'High-precision Formula 1 telemetry companion: live intervals, tyre compound decay models, and championship permutations.',
    images: ['/icon.svg'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'APEX F1',
  },
};

export const viewport: Viewport = {
  themeColor: '#121214',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${rajdhani.variable} ${inter.variable}`}>
      <body className="bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-[var(--accent-f1-red)] selection:text-white min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
