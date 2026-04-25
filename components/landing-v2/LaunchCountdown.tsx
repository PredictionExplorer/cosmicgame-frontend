'use client';

import { useEffect, useState } from 'react';

const LAUNCH_MS = Date.parse('2026-05-07T21:00:00-04:00');
const LAUNCH_LABEL = 'Launches May 7, 2026 · 9:00 PM ET';

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
};

function getRemaining(now: number): Remaining {
  const diff = LAUNCH_MS - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    isLive: false,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function LaunchCountdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!remaining) {
    return <div aria-hidden className="h-[88px]" />;
  }

  if (remaining.isLive) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-emerald-300 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-signature-pulse" />
        Live now
      </div>
    );
  }

  const cells: { label: string; value: number }[] = [
    { label: 'Days', value: remaining.days },
    { label: 'Hours', value: remaining.hours },
    { label: 'Min', value: remaining.minutes },
    { label: 'Sec', value: remaining.seconds },
  ];

  return (
    <div>
      <div
        className="grid w-full max-w-md grid-cols-4 gap-2"
        role="timer"
        aria-live="off"
        aria-label={LAUNCH_LABEL}
      >
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-3 text-center backdrop-blur-md"
          >
            <div className="font-mono text-2xl font-semibold tabular-nums text-white sm:text-3xl">
              {pad(cell.value)}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
              {cell.label}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white/55">
        {LAUNCH_LABEL}
      </p>
    </div>
  );
}
