'use client';

import { useId, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { ScrollRail } from '@/components/ui/scroll-rail';
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
  /**
   * One row that scrolls sideways (a `ScrollRail` with edge fades) instead
   * of wrapping, for a long or open-ended set such as dates.
   */
  scroll?: boolean;
  className?: string;
}

/**
 * SegmentedControl — one choice among a few options that changes what a
 * chart or list shows (Daily / Hourly, a sampling interval, a range, a
 * scope), drawn as the segmented tab track with the chosen option raised
 * and underlined. It swaps no panels: a view switch that does uses `Tabs`.
 *
 * The options are native radio buttons, so the browser gives the group one
 * tab stop and moves the choice with the arrow keys; the keyboard ring is
 * drawn on the option around the focused radio. A set that does not fit
 * wraps from the start of the row, or scrolls with `scroll`.
 *
 *   <SegmentedControl label="Interval" value={v} onValueChange={setV}
 *     options={[{ value: 'day', label: 'Daily' }, { value: 'hour', label: 'Hourly' }]} />
 */
export function SegmentedControl<T extends string>({
  label,
  hideLabel = false,
  options,
  value,
  onValueChange,
  scroll = false,
  className,
}: SegmentedControlProps<T>) {
  const labelId = useId();
  const name = useId();

  const track = (
    <div
      role="radiogroup"
      aria-labelledby={labelId}
      className={cn(
        tabsListVariants({ variant: 'segmented' }),
        'justify-start',
        scroll ? 'w-max flex-nowrap' : 'max-w-full flex-wrap',
      )}
    >
      {options.map((option) => {
        const checked = option.value === value;
        return (
          <label
            key={option.value}
            data-state={checked ? 'active' : 'inactive'}
            className={cn(
              tabsTriggerVariants({ variant: 'segmented', scroll: true }),
              'focus-ring-within cursor-pointer tabular-nums max-sm:min-w-11',
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              aria-label={option.ariaLabel}
              onChange={() => onValueChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );

  return (
    <div
      className={cn('flex min-w-0 max-w-full flex-wrap items-center gap-x-3 gap-y-2', className)}
    >
      <span id={labelId} className={cn('type-label text-subtle', hideLabel && 'sr-only')}>
        {label}
      </span>
      {scroll ? (
        <ScrollRail className="min-w-0 max-w-full" activeSelector='[data-state="active"]'>
          {track}
        </ScrollRail>
      ) : (
        track
      )}
    </div>
  );
}
