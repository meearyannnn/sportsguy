'use client';

import React from 'react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#121214] text-[#EDEDED] flex items-center justify-center min-h-[100dvh] p-6 font-sans antialiased">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#1C1C1E] border border-[#2A2A2D] text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#E10600]/10 border border-[#E10600]/20 flex items-center justify-center mx-auto text-[#E10600] font-black text-xl">
            ▲
          </div>
          <div className="space-y-1">
            <div className="text-[11px] font-mono font-bold text-[#E10600] uppercase tracking-wider">
              CRITICAL PIT-WALL INTERRUPT
            </div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white font-mono">
              APEX Root Signal Lost
            </h1>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Box box. A fatal application exception was caught at the system root level.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => reset()}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#E10600] hover:bg-[#c00500] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Reboot Telemetry Engine
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
