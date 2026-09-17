import React from 'react';
import GlanceMode from '@/components/f1/GlanceMode';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'APEX // Glance Mode',
  description: 'Minimal zero-distraction live Formula 1 session HUD.',
};

export default function GlancePage() {
  return (
    <main className="min-h-screen bg-[#0C0C0E]">
      <GlanceMode session={null} isStandalone={true} />
    </main>
  );
}
