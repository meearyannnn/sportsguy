import React from 'react';
import DesignManifestoView from '@/components/f1/DesignManifestoView';
import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Why This Looks Like This // APEX Design Philosophy',
  description: 'The real architectural choices, generative identity rationale, and Signal design manifesto behind APEX.',
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 sm:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-hud font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Timing HUD</span>
        </Link>
      </div>
      <DesignManifestoView />
    </main>
  );
}
