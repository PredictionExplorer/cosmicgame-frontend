import type { WhitePaperTimelineStep } from '@/content/white-paper';

import { cn } from '@/lib/utils';

export interface CycleTimelineProps {
  steps: readonly WhitePaperTimelineStep[];
  className?: string;
}

/**
 * The stages of a Performance Cycle on one line: from the opening
 * Calibration Window through the gestures and the two finalization windows
 * to the next cycle. A row of five on wide screens, a vertical track on
 * phones; the countdown's end is the accent mark between the gestures and
 * the Final Gesture window.
 */
export function CycleTimeline({ steps, className }: CycleTimelineProps) {
  return (
    <ol className={cn('grid gap-0 sm:grid-cols-5', className)}>
      {steps.map((step, index) => (
        <li
          key={step.label}
          className={cn(
            'relative min-w-0 border-rule pb-6 pl-6 max-sm:border-l sm:border-t sm:pb-0 sm:pl-0 sm:pr-5 sm:pt-5',
            'last:max-sm:pb-0',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'absolute size-2.5 rounded-pill border-2 border-background max-sm:-left-[5px] max-sm:top-1 sm:-top-[5px] sm:left-0',
              // The first two stages are the live cycle; the countdown ends as stage three begins.
              index < 2 ? 'bg-primary' : index === 4 ? 'bg-subtle' : 'bg-foreground',
            )}
          />
          <p className="type-label tabular-nums text-subtle">
            {String(index + 1).padStart(2, '0')}
          </p>
          <p className="mt-1 type-title text-foreground">{step.label}</p>
          <p className="mt-1.5 type-body-sm text-muted-foreground">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}
