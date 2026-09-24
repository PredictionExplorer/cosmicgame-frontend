'use client';

import { Fragment, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/badge';
import { LiveStatus } from '@/components/ui/live-status';
import type { CyclePhase } from '@/lib/cycleState';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

import { PHASE_TEXT_CLASS, viewForPhase } from './phaseView';
import { ValuePending } from './ValuePending';

export interface PulseBarProps {
  cycleNumber?: number | null;
  phase: CyclePhase;
  /** This cycle's Gestures; null while the count is unknown. */
  gestureCount: number | null;
  /** Preformatted relative age of the newest gesture ("12s ago"); null hides it. */
  lastGestureAge?: string | null;
  /** The connected wallet holds the Last Gesture: said once, in the first viewport. */
  youHoldLatest?: boolean;
  /** Controls placed before the "New here?" link (the attention menu). */
  aside?: ReactNode;
  className?: string;
}

/**
 * The Observatory's header strip on the shared content edge: the page H1, one
 * live pill for the Cycle, the phase in words, the gesture count, and a quiet
 * route to the walkthrough. The intro sentence stays short on phones so the
 * clock starts in the first third of the screen.
 */
export function PulseBar({
  cycleNumber = null,
  phase,
  gestureCount,
  lastGestureAge = null,
  youHoldLatest = false,
  aside = null,
  className,
}: PulseBarProps) {
  const t = useTranslations('home');
  const view = viewForPhase(phase);

  const facts: { key: string; node: ReactNode; wide?: boolean }[] = [
    {
      key: 'phase',
      node: (
        <span
          data-testid="pulse-phase-chip"
          className={cn('type-label', PHASE_TEXT_CLASS[view.tone])}
        >
          {t(`chrono.phase.${view.messageKey}.label`)}
        </span>
      ),
    },
    {
      key: 'count',
      node: (
        <span
          data-testid="pulse-gesture-count"
          className="type-label tabular-nums text-muted-foreground"
        >
          {gestureCount == null ? (
            <ValuePending ch={10} />
          ) : (
            t('observatory.pulse.gestureCount', { count: gestureCount })
          )}
        </span>
      ),
    },
  ];
  if (lastGestureAge) {
    facts.push({
      key: 'age',
      wide: true,
      node: (
        <span data-testid="pulse-last-gesture" className="type-label text-subtle">
          {t('observatory.pulse.lastGestureAge', { age: lastGestureAge })}
        </span>
      ),
    });
  }

  return (
    <div
      data-testid="home-deck-header"
      className={cn(
        'grid min-w-0 gap-x-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center xl:grid-cols-[auto_minmax(0,1fr)_auto]',
        className,
      )}
    >
      <h1 id="home-deck-title" className="type-section min-w-0 text-foreground">
        {t('deck.title')}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:mt-0">
        <Badge shape="pill" tone="neutral" className="gap-2 text-foreground">
          {/* Breathes only while the dashboard poll succeeds (liveFreshness). */}
          <LiveStatus variant="dot" />
          {cycleNumber == null
            ? t('hero.cycleFallback')
            : t('hero.cycleNumber', { number: String(cycleNumber) })}
        </Badge>
        {facts.map((fact, index) => (
          <Fragment key={fact.key}>
            {index > 0 && (
              <span
                aria-hidden
                className={cn(
                  'type-label text-subtle',
                  fact.wide && 'max-sm:hidden xl:max-2xl:hidden',
                )}
              >
                ·
              </span>
            )}
            {/* The age also reads in the ledger; it gives way where the
                strip shares its row with the H1. */}
            <span className={cn(fact.wide && 'max-sm:hidden xl:max-2xl:hidden')}>{fact.node}</span>
          </Fragment>
        ))}
        {youHoldLatest && (
          <Badge tone="positive" dot size="sm" data-testid="pulse-you-latest">
            {t('observatory.standing.positionLatest')}
          </Badge>
        )}
      </div>
      <p className="type-body-sm mt-2.5 max-w-[72ch] text-muted-foreground max-sm:line-clamp-2 sm:col-span-2 xl:col-span-3 xl:mt-2 xl:max-w-none">
        {t('deck.intro')}
      </p>
      {/* One set of routes: under the intro on phones, beside the H1 from sm. */}
      <div className="mt-2 flex items-center gap-3 sm:col-start-2 sm:row-start-1 sm:mt-0 xl:col-start-3">
        {aside}
        <Link
          href="/how-it-works"
          className={cn(
            'link-quiet inline-flex items-center gap-1.5 type-label text-primary',
            TOUCH_TARGET_TEXT_LINK_CLASS,
          )}
        >
          {t('deck.newHere')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
