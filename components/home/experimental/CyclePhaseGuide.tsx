'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ScrollRail } from '@/components/ui/scroll-rail';
import { SectionHeader } from '@/components/ui/section-header';
import { getCycleState, type CyclePhase } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

interface CyclePhaseGuideProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  /** See useEndgameChainSync; omit for legacy local-clock behavior. */
  finalizationConfirmed?: boolean;
  className?: string;
}

const TIMELINE_STEPS = [
  { id: 'opening-soon', messageKey: 'openingSoon' },
  { id: 'first-gesture', messageKey: 'firstGesture' },
  { id: 'open', messageKey: 'open' },
  { id: 'final-window', messageKey: 'finalWindow' },
  { id: 'finalization', messageKey: 'finalization' },
  { id: 'allocation', messageKey: 'allocation' },
] as const;

type TimelineStepId = (typeof TIMELINE_STEPS)[number]['id'];

/** Where a step stands against the current one. */
type StepState = 'passed' | 'now' | 'next' | 'later';

export function phaseToTimelineId(phase: CyclePhase): TimelineStepId {
  if (phase === 'waiting-first-gesture') return 'first-gesture';
  if (phase === 'ready-to-finalize' || phase === 'confirming') return 'finalization';
  if (phase === 'final-hour' || phase === 'final-ten' || phase === 'final-minute') {
    return 'final-window';
  }
  if (phase === 'live' || phase === 'approach') return 'open';
  return 'opening-soon';
}

function stepState(index: number, activeIndex: number): StepState {
  if (index < activeIndex) return 'passed';
  if (index === activeIndex) return 'now';
  return index === activeIndex + 1 ? 'next' : 'later';
}

/**
 * Where the Performance Cycle is now, as one rail of six phases divided by
 * hairlines: the current phase is raised with a 2px primary rule and marked
 * "Now", passed phases carry a check, the one after it is "Next" and the rest
 * "Later". From 1280px every phase explains itself in its cell; below, the
 * rail is compact (number, state and name) and scrolls sideways with the
 * current phase kept in view, and the current phase's explanation reads as
 * one line under it. It is the page's reading of the cycle's shape; the full
 * walkthrough is one link away.
 */
export function CyclePhaseGuide({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  className,
}: CyclePhaseGuideProps) {
  const t = useTranslations('home');
  const phase = getCycleState({
    data,
    loading,
    allocationTime,
    activationTime,
    now,
    finalizationConfirmed,
  }).phase;
  const activeStepId = phaseToTimelineId(phase);
  const activeIndex = TIMELINE_STEPS.findIndex((step) => step.id === activeStepId);
  const active = TIMELINE_STEPS[activeIndex] ?? TIMELINE_STEPS[0];
  const stateLabel: Record<StepState, string> = {
    passed: t('phaseGuide.stepState.passed'),
    now: t('phaseGuide.stepState.now'),
    next: t('phaseGuide.stepState.next'),
    later: t('deck.phaseGuide.later'),
  };

  return (
    <section
      aria-labelledby="cycle-phase-guide-title"
      data-testid="cycle-phase-guide"
      data-step={activeStepId}
      className={cn('min-w-0', className)}
    >
      <SectionHeader
        as="h2"
        size="panel"
        headingId="cycle-phase-guide-title"
        eyebrow={t('phaseGuide.eyebrow')}
        title={t('phaseGuide.title')}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/how-it-works">
              {t('phaseGuide.howItWorks')}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        }
      />

      {/* The rail's cells hold no links, so while it scrolls the rail itself
          takes the keyboard. */}
      <ScrollRail
        activeSelector='[aria-current="step"]'
        keyboardScrollableLabel={t('phaseGuide.timelineAria')}
        trackClassName="focus-ring-inset rounded-surface max-xl:snap-x max-xl:snap-mandatory"
      >
        <ol
          aria-label={t('phaseGuide.timelineAria')}
          className="flex w-full min-w-max gap-px overflow-hidden rounded-surface border border-rule-faint bg-rule-faint xl:grid xl:min-w-0 xl:grid-cols-6"
        >
          {TIMELINE_STEPS.map((step, index) => {
            const state = stepState(index, activeIndex);
            const isActive = state === 'now';
            return (
              <li
                key={step.id}
                aria-current={isActive ? 'step' : undefined}
                data-state={state}
                className={cn(
                  'relative min-w-[9rem] flex-1 snap-start px-4 py-3.5 xl:min-w-0 xl:p-5',
                  isActive
                    ? 'bg-surface shadow-[inset_0_2px_0_hsl(var(--primary))]'
                    : 'bg-background',
                )}
              >
                <p
                  className={cn(
                    'flex items-center gap-2 type-caption',
                    isActive ? 'text-primary' : 'text-subtle',
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      'inline-flex size-5 shrink-0 items-center justify-center rounded-pill border tabular-nums',
                      isActive ? 'border-primary' : 'border-rule',
                    )}
                  >
                    {state === 'passed' ? <Check className="size-3" /> : index + 1}
                  </span>
                  {stateLabel[state]}
                </p>
                <h3
                  className={cn(
                    'mt-2 type-title xl:mt-3',
                    isActive ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {t(`phaseGuide.steps.${step.messageKey}.label`)}
                </h3>
                {/* Every phase explains itself from 1280px; the compact rail
                    keeps it for screen readers and shows the current one below. */}
                <p className="mt-1 type-body-sm text-muted-foreground max-xl:sr-only">
                  {t(`phaseGuide.steps.${step.messageKey}.detail`)}
                </p>
              </li>
            );
          })}
        </ol>
      </ScrollRail>

      <p
        aria-hidden
        data-testid="cycle-phase-guide-current"
        className="mt-3 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground xl:hidden"
      >
        {t(`phaseGuide.steps.${active.messageKey}.detail`)}
      </p>
    </section>
  );
}
