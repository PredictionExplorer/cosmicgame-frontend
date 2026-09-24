'use client';

import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';

export interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
  /** The option's name when `label` is not text alone ("1d" → "1 day"). */
  ariaLabel?: string;
}

export interface SegmentedControlProps<T extends string> {
  /** The visible name of the choice ("Interval"), set before the track. */
  label: string;
  /** Hide the label visually; it still names the group. */
  hideLabel?: boolean;
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
}

const KEY_STEP: Readonly<Record<string, number>> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/**
 * SegmentedControl — one choice among a few options that changes what a
 * chart or list shows (Daily / Hourly, a sampling interval, a sort order).
 * It is the one toggle style on the statistics pages: the segmented tab
 * track, with the chosen option raised and underlined.
 *
 * A radio group for assistive technology: one tab stop, the arrow keys move
 * the choice, Home and End jump to the ends. View switches that swap whole
 * panels use `Tabs` instead.
 */
export function SegmentedControl<T extends string>({
  label,
  hideLabel = false,
  options,
  value,
  onValueChange,
  className,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onValueChange(option.value);
    buttons.current[index]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = options.length - 1;
    let next: number | null = null;
    if (event.key in KEY_STEP)
      next = (selected + KEY_STEP[event.key]! + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    choose(next);
  };

  return (
    <div className={cn('flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2', className)}>
      <span id={labelId} className={cn('type-label text-subtle', hideLabel && 'sr-only')}>
        {label}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        onKeyDown={onKeyDown}
        className={cn(tabsListVariants({ variant: 'segmented' }), 'max-w-full flex-wrap')}
      >
        {options.map((option, index) => {
          const checked = index === selected;
          return (
            <button
              key={option.value}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={option.ariaLabel}
              tabIndex={checked ? 0 : -1}
              data-state={checked ? 'active' : 'inactive'}
              onClick={() => choose(index)}
              className={cn(
                tabsTriggerVariants({ variant: 'segmented', scroll: true }),
                'max-sm:min-w-11 tabular-nums',
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
