'use client';

import { useId, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import type { CyclePhase } from '@/lib/cycleState';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';

export const CYCLE_STEPS = [
  { id: 'opening-soon', messageKey: 'openingSoon' },
  { id: 'first-gesture', messageKey: 'firstGesture' },
  { id: 'open', messageKey: 'open' },
  { id: 'final-window', messageKey: 'finalWindow' },
  { id: 'finalization', messageKey: 'finalization' },
  { id: 'allocation', messageKey: 'allocation' },
] as const;

export type CycleStepId = (typeof CYCLE_STEPS)[number]['id'];

/** Where each clock phase sits on the cycle's six steps. */
export function stepForPhase(phase: CyclePhase): CycleStepId {
  switch (phase) {
    case 'waiting-first-gesture':
      return 'first-gesture';
    case 'live':
    case 'approach':
      return 'open';
    case 'final-hour':
    case 'final-ten':
    case 'final-minute':
      return 'final-window';
    case 'confirming':
    case 'ready-to-finalize':
      return 'finalization';
    default:
      return 'opening-soon';
  }
}

export interface CyclePhaseGuideProps {
  phase: CyclePhase;
  /** Links about this cycle, listed before the walkthrough and the FAQ. */
  cycleLinks?: ReactNode;
  /** The heading's id, for the region's name. */
  headingId?: string;
  className?: string;
}

type StepState = 'passed' | 'now' | 'next';

/**
 * A text link in the guide's link list: a 24px line box at every width, so
 * it meets WCAG 2.5.8 for a mouse as well as a finger.
 */
export const PHASE_GUIDE_LINK_CLASS = cn(
  'link-quiet inline-flex items-center gap-1 type-label text-primary',
  TOUCH_TARGET_TEXT_LINK_CLASS,
);

/**
 * How this cycle works, told as where it is now: the six steps of a
 * Performance Cycle as a vertical stepper with the current one marked. From
 * 1024px every step explains itself; on narrower screens only the current
 * one does (the others keep their explanation for screen readers), so the
 * guide stays short without clipping a step or scrolling sideways. Links
 * about this cycle, the walkthrough and the FAQ close it, as a list.
 */
export function CyclePhaseGuide({
  phase,
  cycleLinks,
  headingId: headingIdProp,
  className,
}: CyclePhaseGuideProps) {
  const t = useTranslations('home');
  const generatedId = useId();
  const headingId = headingIdProp ?? generatedId;
  const activeId = stepForPhase(phase);
  const activeIndex = CYCLE_STEPS.findIndex((step) => step.id === activeId);

  return (
    <section
      aria-labelledby={headingId}
      data-testid="cycle-phase-guide"
      data-step={activeId}
      className={cn('min-w-0', className)}
    >
      <SectionHeader
        size="panel"
        headingId={headingId}
        title={t('orientation.title')}
        className="mb-4"
      />

      <ol aria-label={t('phaseGuide.timelineAria')} className="flex min-w-0 flex-col">
        {CYCLE_STEPS.map((step, index) => {
          const state: StepState =
            index < activeIndex ? 'passed' : index === activeIndex ? 'now' : 'next';
          const last = index === CYCLE_STEPS.length - 1;
          return (
            <li
              key={step.id}
              data-state-step={state}
              aria-current={state === 'now' ? 'step' : undefined}
              className={cn('relative flex min-w-0 gap-3', last ? 'pb-0' : 'pb-3 lg:pb-5')}
            >
              {/* The rail: a hairline from this marker to the next. */}
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute bottom-0 start-2.5 top-6 w-px',
                    // The stretch already travelled reads a step stronger.
                    state === 'passed' ? 'bg-subtle' : 'bg-rule',
                  )}
                />
              )}
              <span
                aria-hidden
                className={cn(
                  'relative flex size-5 shrink-0 items-center justify-center rounded-full border type-caption tabular-nums',
                  state === 'now'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : state === 'passed'
                      ? 'border-subtle bg-background text-subtle'
                      : 'border-rule bg-background text-subtle',
                )}
              >
                {state === 'passed' ? <Check className="size-3" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className={cn(
                      'type-label',
                      state === 'now' ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {t(`phaseGuide.steps.${step.messageKey}.label`)}
                  </span>
                  {state === 'now' ? (
                    <Badge tone="accent" size="sm">
                      {t('phaseGuide.stepState.now')}
                    </Badge>
                  ) : (
                    <span className={cn('type-caption text-subtle', state === 'next' && 'sr-only')}>
                      {t(`phaseGuide.stepState.${state}`)}
                    </span>
                  )}
                </p>
                {/* Every step explains itself from 1024px; below, the current
                    one does and the rest keep it for screen readers. */}
                <p
                  data-testid={state === 'now' ? 'cycle-phase-guide-current' : undefined}
                  className={cn(
                    'type-body-sm mt-1 text-muted-foreground',
                    state !== 'now' && 'max-lg:sr-only',
                  )}
                >
                  {t(`phaseGuide.steps.${step.messageKey}.detail`)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <ul
        role="list"
        className="mt-4 grid gap-x-6 gap-y-2 border-t border-rule-faint pt-3 sm:grid-cols-2"
      >
        {cycleLinks}
        <li>
          <Link href="/how-it-works" className={PHASE_GUIDE_LINK_CLASS}>
            {t('phaseGuide.explainer.walkthroughLink')}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </li>
        <li>
          <Link href="/faq" className={PHASE_GUIDE_LINK_CLASS}>
            {t('phaseGuide.explainer.faqLink')}
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </li>
      </ul>
    </section>
  );
}
