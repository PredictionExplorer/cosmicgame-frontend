import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** One step of an ordered sequence. */
export interface StepsItem {
  /** Stable key. */
  id: string;
  title: ReactNode;
  /** The explanation under the title: text, or a short list of its own. */
  body?: ReactNode;
}

export interface StepsProps {
  items: readonly StepsItem[];
  /**
   * `list` (default): an explanatory sequence, a two-digit index in the
   * label face beside each title, `--rule-faint` hairlines between steps
   * (the art pipeline, the cycle, anchoring, the Council). `timeline`: a
   * sequence in time, a circled index on a rail joining one step to the next
   * (getting started).
   */
  layout?: 'list' | 'timeline';
  /** The heading level of each step title. */
  titleAs?: 'h3' | 'h4';
  /**
   * Spoken before a title where its place matters ("Step 2"). The drawn index
   * is decorative; the ordered list already gives the order.
   */
  stepLabel?: (n: number) => string;
  /**
   * `list` only: hairlines above the first step and below the last too, for
   * a sequence that stands on its own; without it the first and last steps
   * sit flush with what surrounds them.
   */
  framed?: boolean;
  className?: string;
}

/**
 * Steps — every numbered sequence on both hosts, one treatment per layout:
 * the index in Inter tabular figures in the subtle tier (never mono, which
 * is for identifiers, and never a display-size figure), the title at
 * `type-heading-3`, the body at `type-body-sm` in the muted tier. Server-safe.
 */
export function Steps({
  items,
  layout = 'list',
  titleAs: Title = 'h3',
  stepLabel,
  framed = false,
  className,
}: StepsProps) {
  if (layout === 'timeline') {
    return (
      <ol className={cn('min-w-0', className)}>
        {items.map((item, index) => (
          <li
            key={item.id}
            className="group/step relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-5 pb-10 last:pb-0"
          >
            {/* The rail joining this step's node to the next one. */}
            <span
              aria-hidden
              className="absolute bottom-0 left-4 top-10 w-px -translate-x-1/2 bg-rule group-last/step:hidden"
            />
            <span
              aria-hidden
              data-slot="step-index"
              className="flex size-8 items-center justify-center rounded-pill border border-rule bg-surface-raised type-label tabular-nums text-foreground"
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-1">
              {stepLabel ? <span className="sr-only">{stepLabel(index + 1)}</span> : null}
              <Title className="type-heading-3 text-foreground">{item.title}</Title>
              {item.body ? (
                <div className="mt-3 type-body-sm text-muted-foreground">{item.body}</div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol
      className={cn(
        'min-w-0 divide-y divide-rule-faint',
        framed && 'border-y border-rule-faint',
        className,
      )}
    >
      {items.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            'grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 py-5',
            !framed && 'first:pt-0 last:pb-0',
          )}
        >
          <span
            aria-hidden
            data-slot="step-index"
            className="pt-1 type-label tabular-nums text-subtle"
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            {stepLabel ? <span className="sr-only">{stepLabel(index + 1)}</span> : null}
            <Title className="type-heading-3 text-foreground">{item.title}</Title>
            {item.body ? (
              <div className="mt-1.5 type-body-sm text-muted-foreground">{item.body}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
