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
  className?: string;
}

/** Which intro sentence a phase reads: the standing one, or the moment it explains. */
export type PulseIntro = 'default' | 'openingSoon' | 'waitingFirstGesture' | 'zero';

const BRAND = 'Cosmic Signature';

/**
 * The title with the brand name kept on one line: a narrow screen breaks
 * "The Cosmic Signature / Observatory", never "The Cosmic / Signature
 * Observatory", in every locale that writes the name in Latin letters. The
 * text (and so the heading's name) is unchanged.
 */
export function keepBrandTogether(title: string): ReactNode {
  const parts = title.split(BRAND);
  if (parts.length === 1) return title;
  return parts.flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <span key={index} className="whitespace-nowrap">
            {BRAND}
          </span>,
          part,
        ],
  );
}

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
 * The Observatory's header strip on the shared content edge: the page H1 at
 * the display size every app H1 uses, one live pill for the Cycle, the phase
 * in words, the Gesture count, and a quiet route to the walkthrough. The
 * facts follow the H1 on its line where there is room, and the route stays
 * on the H1's line whatever wraps. While Gestures run the strip says nothing
 * more: the clock's status, the form and the cycle guide already say how to
 * take part, so the desk starts high on every screen. A phase that needs
 * explaining (before the cycle opens, before its first Gesture, at zero) says
 * so in one sentence under the facts.
 */
export function PulseBar({
  cycleNumber = null,
  phase,
  gestureCount,
  lastGestureAge = null,
  youHoldLatest = false,
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
        'grid min-w-0 gap-x-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start',
        className,
      )}
    >
      {/* The H1 and the facts share a line where there is room; the facts
          wrap under the H1 where there is not. */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3">
        <h1 id="home-deck-title" className="type-display-sm min-w-0 text-balance text-foreground">
          {keepBrandTogether(t('deck.title'))}
        </h1>
        {/* The facts wrap as a list whose dot separators hang in a clipped
            gutter: a dot that would start a wrapped line is cut away, so no
            line ever ends or starts on an orphaned separator. */}
        <div className="min-w-0 overflow-hidden">
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
                  // strip is narrow.
                  fact.wide && 'max-2xl:hidden',
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
      </div>
      {intro !== 'default' && (
        <p
          data-testid="pulse-intro"
          data-intro={intro}
          className="type-body-sm mt-3 max-w-[var(--measure-lede)] text-muted-foreground sm:col-span-2"
        >
          {t(`deck.introByPhase.${intro}`)}
        </p>
      )}
      {/* The route to the walkthrough: under the facts on phones, and from sm
          centred on the H1's first line, so it stays with the title when the
          facts wrap under it. On desktop it reads short, which keeps the strip
          on one line at 1280px and the method selector in the 1280x720 first
          viewport. */}
      <div className="mt-2 flex items-center sm:col-start-2 sm:row-start-1 sm:mt-0">
        {/* An empty strut one display line tall sets the row's height. */}
        <span aria-hidden className="type-display-sm h-[1lh] w-0 max-sm:hidden" />
        <Link
          href="/how-it-works"
          data-testid="home-deck-how-it-works"
          className={cn(
            'link-quiet inline-flex items-center gap-1.5 type-label text-primary',
            TOUCH_TARGET_TEXT_LINK_CLASS,
          )}
        >
          <span className="lg:hidden">{t('deck.newHere')}</span>
          <span className="max-lg:hidden">{t('deck.howItWorks')}</span>
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
