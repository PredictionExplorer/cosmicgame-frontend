'use client';

import type { ReactNode } from 'react';
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

/** A dot centred in the 1rem gutter before a fact; clipped when the fact starts a line. */
const FACT_SEPARATOR =
  "before:type-label before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:flex before:w-4 before:items-center before:justify-center before:text-subtle before:content-['·']";

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

/** Which intro sentence a phase reads: the standing one, or the moment it explains. */
export type PulseIntro = 'default' | 'openingSoon' | 'waitingFirstGesture' | 'zero';

/**
 * The intro follows the phase: while Gestures run it is the standing
 * sentence (how to take part); before the cycle opens, before its first
 * Gesture and at zero it explains that moment in plain words, so a newcomer
 * arriving mid-finalization learns what is happening and whether they can
 * still act.
 */
export function introForPhase(phase: CyclePhase): PulseIntro {
  switch (phase) {
    case 'opening-soon':
      return 'openingSoon';
    case 'waiting-first-gesture':
      return 'waitingFirstGesture';
    case 'confirming':
    case 'ready-to-finalize':
      return 'zero';
    default:
      return 'default';
  }
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
  const intro = introForPhase(phase);

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
      {/* The facts wrap as a list whose dot separators hang in a clipped
          gutter: a dot that would start a wrapped line is cut away, so no
          line ever ends or starts on an orphaned separator. */}
      <div className="mt-3 min-w-0 overflow-hidden sm:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:mt-0">
        <ul role="list" className="-ms-4 flex flex-wrap items-center gap-y-2">
          <li className="ps-4">
            <Badge shape="pill" tone="neutral" className="gap-2 text-foreground">
              {/* Breathes only while the dashboard poll succeeds (liveFreshness). */}
              <LiveStatus variant="dot" />
              {cycleNumber == null
                ? t('hero.cycleFallback')
                : t('hero.cycleNumber', { number: String(cycleNumber) })}
            </Badge>
          </li>
          {facts.map((fact, index) => (
            <li
              key={fact.key}
              className={cn(
                'relative ps-4',
                // The first fact follows the pill with space alone.
                index > 0 && FACT_SEPARATOR,
                // The age also reads in the ledger; it gives way where the
                // strip shares its row with the H1.
                fact.wide && 'max-sm:hidden xl:max-2xl:hidden',
              )}
            >
              {fact.node}
            </li>
          ))}
          {youHoldLatest && (
            <li className="ps-4">
              <Badge tone="positive" dot size="sm" data-testid="pulse-you-latest">
                {t('observatory.standing.positionLatest')}
              </Badge>
            </li>
          )}
        </ul>
      </div>
      <p
        data-testid="pulse-intro"
        data-intro={intro}
        className="type-body-sm mt-2.5 max-w-[72ch] text-muted-foreground sm:col-span-2 xl:col-span-3 xl:mt-2 xl:max-w-none"
      >
        {intro === 'default' ? (
          <>
            {/* Phones get a sentence written to their length (the form just
                below says how to take part), never one cut off mid-clause. A
                phase sentence explains a moment and always reads in full. */}
            <span data-testid="pulse-intro-short" className="sm:hidden">
              {t('deck.introShort')}
            </span>
            <span className="max-sm:hidden">{t('deck.intro')}</span>
          </>
        ) : (
          t(`deck.introByPhase.${intro}`)
        )}
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
