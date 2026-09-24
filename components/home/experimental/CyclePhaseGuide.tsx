'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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

export function phaseToTimelineId(phase: CyclePhase): TimelineStepId {
  if (phase === 'waiting-first-gesture') return 'first-gesture';
  if (phase === 'ready-to-finalize' || phase === 'confirming') return 'finalization';
  if (phase === 'final-hour' || phase === 'final-ten' || phase === 'final-minute') {
    return 'final-window';
  }
  if (phase === 'live' || phase === 'approach') return 'open';
  return 'opening-soon';
}

/**
 * Where the Performance Cycle is now, as one rail of six phases divided by
 * hairlines: the current phase is raised with a 2px primary rule and marked
 * "Now", passed phases carry a check, and the rest wait as "Next". It is the
 * page's reading of the cycle's shape; the full walkthrough is one link away.
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

  return (
    <section
      aria-labelledby="cycle-phase-guide-title"
      data-testid="cycle-phase-guide"
      className={cn('min-w-0', className)}
    >
      <SectionHeader
        as="h2"
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

      <ol
        aria-label={t('phaseGuide.timelineAria')}
        className="grid gap-px overflow-hidden rounded-surface border border-rule-faint bg-rule-faint sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        {TIMELINE_STEPS.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isComplete = index < activeIndex;
          return (
            <li
              key={step.id}
              aria-current={isActive ? 'step' : undefined}
              data-state={isActive ? 'now' : isComplete ? 'passed' : 'next'}
              className={cn(
                'relative min-w-0 px-4 py-3.5 sm:p-5',
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
                  {isComplete ? <Check className="size-3" /> : index + 1}
                </span>
                {isActive
                  ? t('phaseGuide.stepState.now')
                  : isComplete
                    ? t('phaseGuide.stepState.passed')
                    : t('phaseGuide.stepState.next')}
              </p>
              <h3
                className={cn(
                  'mt-2 type-title sm:mt-3',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {t(`phaseGuide.steps.${step.messageKey}.label`)}
              </h3>
              <p className="mt-1 type-body-sm text-muted-foreground">
                {t(`phaseGuide.steps.${step.messageKey}.detail`)}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
