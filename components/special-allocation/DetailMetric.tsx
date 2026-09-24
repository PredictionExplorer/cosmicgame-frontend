import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface DetailMetricProps {
  label: string;
  value: ReactNode;
  testId?: string;
  /**
   * `live` marks a value that is changing right now (a growing record, a
   * countdown to the next change) in the live status colour; every other
   * value stays in ink. The label is the word the colour travels with.
   */
  tone?: 'neutral' | 'live';
  /** Tighter padding for the home control desk. */
  compact?: boolean;
  /** A plain definition pair, for metrics that already sit inside a well. */
  unframed?: boolean;
  className?: string;
}

/**
 * Small label/value pair shared by special-allocation detail views.
 *
 * Keeping this primitive in the domain layer ensures the home control desk
 * and the full current-cycle cards present the same values with only density
 * changing between contexts. Framed, it is a sunken well (never a bordered
 * box inside a card); the label is a static caption in the subtle tier, and
 * the value is a tabular figure.
 */
export function DetailMetric({
  label,
  value,
  testId,
  tone = 'neutral',
  compact = false,
  unframed = false,
  className,
}: DetailMetricProps) {
  return (
    <dl
      data-testid={testId}
      className={cn(
        'min-w-0',
        !unframed && 'rounded-control bg-surface-sunken',
        !unframed && (compact ? 'px-2.5 py-1.5' : 'px-3 py-2'),
        className,
      )}
    >
      <dt className="type-caption text-subtle">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 break-words type-label tabular-nums slashed-zero',
          tone === 'live' ? 'text-live' : 'text-foreground',
        )}
      >
        {value}
      </dd>
    </dl>
  );
}
