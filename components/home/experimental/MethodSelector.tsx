'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type GestureMethod = 'ETH' | 'RandomWalk' | 'CST';

export interface MethodOption {
  value: GestureMethod;
  label: string;
  /** The live Gesture Cost of this method, or a placeholder while it loads. */
  price: ReactNode;
  /** A short qualifier under the price ("Half price with …"), a few words at most. */
  note?: string;
  /**
   * The note as one sentence that names its method ("ETH + Random Walk halves
   * the ETH cost …"), for the line under the track when the segments sit side
   * by side: there it starts under the first segment, so a bare qualifier
   * would read as a note on that one. Defaults to `note`.
   */
  trackNote?: string;
}

interface MethodSelectorProps {
  options: readonly MethodOption[];
  value: string;
  onChange: (value: GestureMethod) => void;
  /** `id` of the visible label that names the group. */
  labelledBy: string;
  className?: string;
}

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

/**
 * Side by side, each segment is as wide as its content asks and the rest of
 * the track is shared out evenly, so "ETH + Random Walk" keeps one line
 * where there is room; where there is not, the segments shrink evenly and a
 * label wraps rather than overflow.
 */
const COLUMNS: Record<number, string> = {
  1: '@min-[21rem]:grid-cols-1',
  2: '@min-[21rem]:grid-cols-[repeat(2,auto)]',
  3: '@min-[21rem]:grid-cols-[repeat(3,auto)]',
};

/**
 * The gesture method as a segmented control: one sunken track, the chosen
 * method raised, and every method showing its live price inside its segment,
 * so the choice and its cost are read together. Side by side, the segments
 * share their label and price rows, so the prices sit on one line even when
 * a label wraps, and the chosen one carries a 2px primary rule along its
 * foot; a method's note reads once under the track as a sentence that names
 * its method, because inside a segment it would open an empty row under
 * every other one. Where the column is narrow (a phone, the bottom sheet) the
 * segments stack as rows with the price at the end, so a price never wraps,
 * each note runs the full row under them, and the chosen row is marked along
 * its start edge and ringed, never with a rule that could read as a row
 * divider.
 *
 * It is a radio group: one tab stop, arrow keys move the selection (and
 * wrap), Home and End jump to the ends.
 */
export function MethodSelector({
  options,
  value,
  onChange,
  labelledBy,
  className,
}: MethodSelectorProps) {
  const refs = useRef(new Map<GestureMethod, HTMLButtonElement>());
  const matched = options.findIndex((option) => option.value === value);
  const focusIndex = Math.max(0, matched);
  const noted = options.filter((option) => option.note);

  const select = (index: number) => {
    const option = options[(index + options.length) % options.length];
    if (!option) return;
    onChange(option.value);
    refs.current.get(option.value)?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (NEXT_KEYS.has(event.key)) select(index + 1);
    else if (PREVIOUS_KEYS.has(event.key)) select(index - 1);
    else if (event.key === 'Home') select(0);
    else if (event.key === 'End') select(options.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div className={cn('@container', className)}>
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        data-testid="gesture-method-selector"
        className={cn(
          'grid grid-cols-1 gap-1 rounded-control bg-surface-sunken p-1',
          COLUMNS[Math.min(options.length, 3)],
        )}
      >
        {options.map((option, index) => {
          const selected = index === matched;
          return (
            <button
              key={option.value}
              ref={(node) => {
                if (node) refs.current.set(option.value, node);
                else refs.current.delete(option.value);
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              data-method={option.value}
              className={cn(
                'focus-ring-inset grid min-h-12 min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 rounded-[calc(var(--radius-control)-2px)] px-3 py-2 text-start',
                '@min-[21rem]:row-span-2 @min-[21rem]:min-h-16 @min-[21rem]:grid-cols-1 @min-[21rem]:grid-rows-subgrid @min-[21rem]:items-start',
                'transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                selected
                  ? 'bg-surface-raised text-foreground shadow-[inset_2px_0_0_hsl(var(--primary))] ring-1 ring-inset ring-primary/40 @min-[21rem]:shadow-[inset_0_-2px_0_hsl(var(--primary))] @min-[21rem]:ring-0'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <span className="col-start-1 row-start-1 type-label">{option.label}</span>
              <span className="col-start-2 row-start-1 whitespace-nowrap text-end type-figure-sm text-foreground @min-[21rem]:col-start-1 @min-[21rem]:row-start-2 @min-[21rem]:text-start">
                {option.price}
              </span>
              {option.note ? (
                // Stacked, it runs the row's full width under the label and
                // price. Side by side it stays the segment's description for
                // screen readers; the visible copy is the one under the track.
                <span className="col-span-2 col-start-1 row-start-2 type-caption text-subtle @min-[21rem]:sr-only">
                  {option.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {noted.length > 0 ? (
        <div
          aria-hidden
          data-testid="gesture-method-notes"
          className="mt-2 hidden space-y-0.5 px-4 @min-[21rem]:block"
        >
          {noted.map((option) => (
            <p
              key={option.value}
              className={cn(
                'type-caption text-pretty',
                option.value === value ? 'text-muted-foreground' : 'text-subtle',
              )}
            >
              {option.trackNote ?? option.note}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
