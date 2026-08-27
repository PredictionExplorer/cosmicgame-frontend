'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GradientText } from '@/components/ui/gradient-text';
import type { CyclePhase } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

import { viewForPhase } from './phaseView';

export interface PulseBarProps {
  cycleNumber?: number | null;
  phase: CyclePhase;
  gestureCount: number;
  /** Preformatted relative age of the newest gesture ("12s ago"); null hides it. */
  lastGestureAge?: string | null;
  className?: string;
}

/**
 * The observatory masthead, compressed to a single band so the clock,
 * standings, gesture panel, and tracks all fit in the first viewport. Carries
 * the page H1 (server-rendered for SEO/LCP), the live cycle pulse for
 * observers, and the one-line orientation + walkthrough link for newcomers.
 */
export function PulseBar({
  cycleNumber = null,
  phase,
  gestureCount,
  lastGestureAge = null,
  className,
}: PulseBarProps) {
  const t = useTranslations('home');
  const view = viewForPhase(phase);

  return (
    <div
      data-testid="home-deck-header"
      className={cn('flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5', className)}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-300 animate-live-dot" />
            {cycleNumber == null
              ? t('hero.cycleFallback')
              : t('hero.cycleNumber', { number: String(cycleNumber) })}
          </span>
          <span
            data-testid="pulse-phase-chip"
            className={cn(
              'inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
              view.iconClass,
            )}
          >
            {t(`chrono.phase.${view.messageKey}.label`)}
          </span>
          <span
            data-testid="pulse-gesture-count"
            className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground"
          >
            {t('observatory.pulse.gestureCount', { count: gestureCount })}
          </span>
          {lastGestureAge && (
            <span
              data-testid="pulse-last-gesture"
              className="hidden items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium tabular-nums text-muted-foreground sm:inline-flex"
            >
              {t('observatory.pulse.lastGestureAge', { age: lastGestureAge })}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <GradientText
            as="h1"
            id="home-deck-title"
            className="font-display text-lg font-bold leading-tight tracking-tight sm:text-xl"
          >
            {t('deck.title')}
          </GradientText>
          <p className="min-w-0 max-w-3xl text-xs leading-snug text-muted-foreground">
            {t('deck.intro')}
          </p>
        </div>
      </div>
      <Link
        href="/how-it-works"
        className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
      >
        {t('deck.newHere')}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
