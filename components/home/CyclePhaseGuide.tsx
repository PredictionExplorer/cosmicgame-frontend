'use client';

import { useId, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { ScrollRail } from '@/components/ui/scroll-rail';
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
  /** Links about this cycle, before the learning links in the footer. */
  cycleLinks?: ReactNode;
  className?: string;
}

type StepState = 'passed' | 'now' | 'next';

const LINK_CLASS = cn(
  'link-quiet inline-flex items-center gap-1 type-label text-primary',
  TOUCH_TARGET_TEXT_LINK_CLASS,
);

/**
 * How this cycle works, told as where it is now: the six steps of a
 * Performance Cycle with the current one marked. From 1024px it is a
 * vertical stepper with every step's explanation; below, a compact rail that
 * scrolls sideways (the current step kept in view) with the current step's
 * explanation under it. Links about this cycle, the walkthrough and the FAQ
 * close it.
 */
export function CyclePhaseGuide({ phase, cycleLinks, className }: CyclePhaseGuideProps) {
  const t = useTranslations('home');
  const headingId = useId();
  const activeId = stepForPhase(phase);
  const activeIndex = CYCLE_STEPS.findIndex((step) => step.id === activeId);
  const active = CYCLE_STEPS[activeIndex]!;

  return (
    <section
      aria-labelledby={headingId}
      data-testid="cycle-phase-guide"
      data-step={activeId}
      className={cn('min-w-0', className)}
    >
      <h2 id={headingId} className="type-title text-foreground">
        {t('orientation.title')}
      </h2>

      {/* The rail stays inside the frame's padding, so a step it cuts off
          fades out before the edge instead of ending at the border. */}
      <ScrollRail
        activeSelector='[aria-current="step"]'
        className="mt-4"
        trackClassName="max-lg:snap-x max-lg:snap-mandatory lg:flex-col lg:overflow-visible"
      >
        <ol
          aria-label={t('phaseGuide.timelineAria')}
          className="flex min-w-max gap-0 lg:min-w-0 lg:flex-col"
        >
          {CYCLE_STEPS.map((step, index) => {
            const state: StepState =
              index < activeIndex ? 'passed' : index === activeIndex ? 'now' : 'next';
            const last = index === CYCLE_STEPS.length - 1;
            return (
              <li
                key={step.id}
                data-state-step={state}
                aria-current={state === 'now' ? 'step' : undefined}
                className={cn(
                  'relative flex min-w-[8.5rem] snap-start flex-col gap-2 pe-3 lg:min-w-0 lg:flex-row lg:gap-3 lg:pb-5 lg:pe-0',
                  last && 'lg:pb-0',
                )}
              >
                {/* The rail: a hairline from this marker to the next. */}
                {!last && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute max-lg:start-6 max-lg:end-0 max-lg:top-2.5 max-lg:h-px lg:bottom-0 lg:start-2.5 lg:top-6 lg:w-px',
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
                <div className="min-w-0 lg:flex-1">
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
                      <span
                        className={cn('type-caption text-subtle', state === 'next' && 'sr-only')}
                      >
                        {t(`phaseGuide.stepState.${state}`)}
                      </span>
                    )}
                  </p>
                  {/* Every step explains itself from 1024px; the rail keeps
                      it for screen readers and shows the current one below. */}
                  <p className="type-body-sm mt-1 text-muted-foreground max-lg:sr-only">
                    {t(`phaseGuide.steps.${step.messageKey}.detail`)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </ScrollRail>

      <p
        aria-hidden
        data-testid="cycle-phase-guide-current"
        className="type-body-sm mt-3 text-muted-foreground lg:hidden"
      >
        {t(`phaseGuide.steps.${active.messageKey}.detail`)}
      </p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-rule-faint pt-3">
        {cycleLinks}
        <Link href="/how-it-works" className={LINK_CLASS}>
          {t('phaseGuide.explainer.walkthroughLink')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
        <Link href="/faq" className={LINK_CLASS}>
          {t('phaseGuide.explainer.faqLink')}
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
