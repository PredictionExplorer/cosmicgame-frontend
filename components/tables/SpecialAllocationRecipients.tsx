'use client';

import { useState, useEffect } from 'react';
import { Crown, Swords, Coins } from 'lucide-react';

import { formatSeconds } from '@/utils';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useCurrentSpecialRecipients } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';
import type { SpecialRecipients } from '@/services/api/types';

function EnduranceCountdown({ duration }: { duration: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentDuration = duration + elapsed;
  return (
    <span className="font-mono text-sm tabular-nums text-emerald-400">
      {formatSeconds(currentDuration)}
    </span>
  );
}

/**
 * Minimal static markup only for @media print / Save as PDF. Chrome’s Skia pipeline often drops
 * the interactive layout on the home page (`/`) even when on-screen CSS looks fine; this block is
 * `hidden` on screen and `display:block` when printing so addresses reliably appear in the PDF.
 */
function SpecialAllocationLeadersPrintFallback({
  data,
}: {
  data: SpecialRecipients | null | undefined;
}) {
  const sw = data;
  const dur = sw?.EnduranceChampionDuration ?? 0;
  const enduranceAddr = sw?.EnduranceChampionAddress;
  const lastCst = sw?.LastCstBidderAddress;

  return (
    <div
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-special-allocation-leaders-print
    >
      <h3 className="mb-4 border-b border-foreground/30 pb-2 font-display text-base font-bold">
        Special Allocation Leaders
      </h3>
      <dl className="space-y-4">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Endurance Champion
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {enduranceAddr ?? '—'}
          </dd>
          {dur > 0 && <dd className="mt-1 text-xs">Held for {formatSeconds(dur)}</dd>}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Chrono Warrior
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">
            {enduranceAddr ?? '—'}
          </dd>
          {dur > 0 && <dd className="mt-1 text-xs">Duration: {formatSeconds(dur)}</dd>}
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wide text-foreground/90">
            Final CST Gesture
          </dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed">{lastCst ?? '—'}</dd>
        </div>
      </dl>
    </div>
  );
}

export const SpecialAllocationRecipients = () => {
  const { data: specialWinners } = useCurrentSpecialRecipients();

  const hasEndurance = !!specialWinners?.EnduranceChampionAddress;
  const hasLastCst = !!specialWinners?.LastCstBidderAddress;

  const cards = [
    {
      key: 'endurance',
      icon: <Crown className="h-5 w-5" />,
      title: 'Endurance Champion',
      tooltip:
        'The participant who remained the most recent gesture maker for the longest consecutive interval. Receives Recognition CST and a Cosmic Signature NFT.',
      address: specialWinners?.EnduranceChampionAddress,
      extra: hasEndurance && (specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Held for</span>
          <EnduranceCountdown duration={specialWinners?.EnduranceChampionDuration ?? 0} />
        </div>
      ),
      accent: true,
      urgency: hasEndurance && (
        <div className="mt-3 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/20 px-3 py-2">
          <p className="text-xs text-emerald-400/90 animate-urgency-pulse">
            This Endurance Window grows every second a new gesture doesn\u2019t arrive.
          </p>
        </div>
      ),
    },
    {
      key: 'chrono',
      icon: <Swords className="h-5 w-5" />,
      title: 'Chrono-Warrior',
      tooltip:
        'The participant who held the Endurance Champion position for the longest consecutive interval. Receives a percentage of the Cycle Reserve.',
      address: specialWinners?.EnduranceChampionAddress,
      extra: hasEndurance && (specialWinners?.EnduranceChampionDuration ?? 0) > 0 && (
        <div className="mt-3">
          <span className="text-xs text-muted-foreground">Duration: </span>
          <span className="font-mono text-sm tabular-nums text-primary">
            {formatSeconds(specialWinners?.EnduranceChampionDuration ?? 0)}
          </span>
        </div>
      ),
      accent: false,
      urgency: null,
    },
    {
      key: 'lastcst',
      icon: <Coins className="h-5 w-5" />,
      title: 'Final CST Gesture',
      tooltip:
        'The participant who made the last CST gesture of the cycle receives Recognition CST and a Cosmic Signature NFT.',
      address: specialWinners?.LastCstBidderAddress,
      extra: null,
      accent: false,
      urgency: !hasLastCst && (
        <div className="mt-3 rounded-lg bg-accent/[0.06] border border-accent/20 px-3 py-2">
          <p className="text-xs text-accent/80">No CST gestures yet \u2014 be the first.</p>
        </div>
      ),
    },
  ];

  const printDuplex =
    process.env.NODE_ENV !== 'test' ? (
      <SpecialAllocationLeadersPrintFallback data={specialWinners} />
    ) : null;

  return (
    <>
      <section
        className="min-h-[2rem] space-y-4 print:min-h-0 print:hidden"
        data-special-allocation-leaders
        aria-label="Special allocation leaders"
      >
        <div className="flex items-center gap-2">
          <h3
            data-testid="special-allocation-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground print:!text-foreground"
          >
            Special Allocation Leaders
          </h3>
          <span className="print:hidden">
            <InfoTooltip content="These participants are currently in line to receive special allocations when the cycle finalizes. Positions can change with every new gesture." />
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {cards.map((card) => (
            <div
              key={card.key}
              data-special-allocation-card
              className={cn(
                'rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.04] print:border print:border-border print:animate-none',
                card.accent &&
                  'border-primary/40 bg-primary/[0.04] shadow-[0_0_20px_-8px_rgba(21,191,253,0.35)] animate-pulse-glow',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    card.accent
                      ? 'bg-gradient-to-br from-primary/20 to-accent/20 text-primary'
                      : 'bg-white/[0.06] text-muted-foreground',
                  )}
                >
                  {card.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'text-xs font-medium uppercase tracking-wider',
                        card.accent ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {card.title}
                    </span>
                    <span className="print:hidden">
                      <InfoTooltip content={card.tooltip} />
                    </span>
                  </div>
                  {card.address ? (
                    <a
                      href={`/user/${card.address}`}
                      className="mt-1 block break-all font-mono text-sm text-foreground print:!text-foreground transition-colors hover:text-primary"
                    >
                      {card.address}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground/50 italic">No holder yet</p>
                  )}
                  {card.extra}
                </div>
              </div>
              {card.urgency}
            </div>
          ))}
        </div>
      </section>
      {printDuplex}
    </>
  );
};
