'use client';

import React from 'react';
import { Compass, Sparkles, Radio, Shield, Code, Cpu } from 'lucide-react';
import DriverIdentityCard from '@/components/f1/DriverIdentityCard';

export default function DesignManifestoView() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-fadeIn">
      {/* Header Statement */}
      <div className="space-y-4 border-b border-[var(--border-subtle)] pb-8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-f1-red)]"></span>
          <span className="font-hud font-bold text-xs uppercase tracking-widest text-[var(--accent-f1-red)]">
            DESIGN STATEMENT & ARCHITECTURE
          </span>
        </div>
        <h1 className="font-hud font-black text-3xl sm:text-5xl uppercase tracking-tight text-[var(--text-primary)]">
          Why This Looks Like This.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans max-w-3xl">
          APEX was built on a simple conviction: Formula 1 already possesses the richest, most evocative
          visual language in modern sports. It does not need generic SaaS cards, neon purple gradients,
          or fake glassmorphism. It needs the quiet precision of the pit wall.
        </p>
      </div>

      {/* Manifesto Pillar 1: The Generative Identity */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-f1-red)] shrink-0 font-hud font-black text-sm">
            01
          </div>
          <div>
            <h2 className="font-hud font-black text-xl uppercase tracking-tight text-[var(--text-primary)]">
              The Geometry of Career: Why No Photographs?
            </h2>
            <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase">
              Turning commercial licensing constraints into pure statistical art
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
            <p>
              Formula 1 driver portrait rights are aggressively guarded behind FOM media syndicates
              and commercial team contracts. Most fan apps navigate this by scraping low-resolution,
              out-of-date press photos or using generic silhouette placeholders.
            </p>
            <p>
              We chose an uncompromising alternative: <strong>let the telemetry draw the driver.</strong>
            </p>
            <p>
              Every driver in the 75-year archive receives a generative radial glyph computed in real-time
              from their actual career record. The number of petals is their seasons raced. The jaggedness
              of the perimeter reflects their finish variance. The bullseye core scales with career wins,
              and concentric golden halos honor World Championships.
            </p>
            <p className="text-xs text-[var(--text-muted)] font-mono-num">
              Lewis Hamilton does not look like Max Verstappen because their numbers are completely different.
              No camera required.
            </p>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <DriverIdentityCard
              driverId="hamilton"
              size="card"
              allowExport={true}
            />
            <div className="text-[10px] font-mono-num text-[var(--text-muted)] mt-2 uppercase text-center">
              Lewis Hamilton Signature (18 Petals • 7 Halo Rings)
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto Pillar 2: The Signal Aesthetic */}
      <section className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-f1-red)] shrink-0 font-hud font-black text-sm">
            02
          </div>
          <div>
            <h2 className="font-hud font-black text-xl uppercase tracking-tight text-[var(--text-primary)]">
              The "Signal" Palette: Quiet Until It Needs to Speak
            </h2>
            <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase">
              Warm off-white, graphite dark mode, and FIA timing tower signal ink
            </p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          <p>
            We banished generic black-and-neon cyberpunk templates. Instead, APEX uses <strong>Paddock Neutral</strong>
            — a graphite base (<code className="text-zinc-300 font-mono text-xs">#121214</code>) or warm off-white
            (<code className="text-zinc-300 font-mono text-xs">#FAFAF8</code>) held together by hairline dividers.
          </p>
          <p>
            Color is treated as data, never decoration:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 font-mono-num text-xs">
            <li className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0"></span>
              <span><strong>Sector Purple</strong> — Absolute track record benchmark</span>
            </li>
            <li className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0"></span>
              <span><strong>Personal Green</strong> — Driver personal best pace</span>
            </li>
            <li className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0"></span>
              <span><strong>Medium Yellow</strong> — Pirelli tyre degradation compound</span>
            </li>
            <li className="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
              <span><strong>Pirelli Soft Red</strong> — Peak attack window & DRS battles</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Manifesto Pillar 3: Honest Freshness */}
      <section className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-f1-red)] shrink-0 font-hud font-black text-sm">
            03
          </div>
          <div>
            <h2 className="font-hud font-black text-xl uppercase tracking-tight text-[var(--text-primary)]">
              Honest Freshness & The Reality of Latency
            </h2>
            <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase">
              No simulated instant streams when data is periodically polled
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          Formula 1 is the most precision-obsessed sport on Earth. It is insulting to pretend a fan dashboard
          has a 0ms direct satellite link to the pit wall. APEX openly prints explicit <span className="text-zinc-200 font-mono-num font-bold">"Updated Xs ago"</span> labels
          next to every stat. When standings are cached from historical archives, we say so. When live timing
          heartbeats arrive, we timestamp them.
        </p>
      </section>

      {/* Manifesto Pillar 4: Timezone Honesty & No-Spoiler Mornings */}
      <section className="space-y-4 border-t border-[var(--border-subtle)] pt-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--accent-f1-red)] shrink-0 font-hud font-black text-sm">
            04
          </div>
          <div>
            <h2 className="font-hud font-black text-xl uppercase tracking-tight text-[var(--text-primary)]">
              Timezone-Honest Scheduling & No-Spoiler Mornings
            </h2>
            <p className="text-xs font-mono-num text-[var(--text-muted)] uppercase">
              Acknowledge the 2:30 AM alarm instead of pretending it's convenient
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
          Formula 1 fans live across every hemisphere. Converting a race time to local time is trivial;
          acknowledging how brutal a 2:30 AM start is shows respect for the fan. APEX labels inconvenient
          starts explicitly ("Graveyard Shift", "Dawn Patrol") and provides a direct Post-Race Debrief
          displaying official podium classification and circuit summary.
        </p>
      </section>

      {/* Footer Heritage & Engineering Foundations */}
      <div className="p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] space-y-2">
        <div className="font-hud font-bold text-xs uppercase text-[var(--text-primary)]">
          Telemetry & Engineering Foundations
        </div>
        <p>
          APEX is built with precision client-side mathematics, zero third-party tracking, and privacy-first local computing.
          Designed for pure racing signal, uncompromised typography, and pit-wall clarity.
        </p>
      </div>
    </div>
  );
}
