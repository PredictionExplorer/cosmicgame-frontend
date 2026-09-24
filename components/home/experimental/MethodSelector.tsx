'use client';

import { useRef, type KeyboardEvent, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type GestureMethod = 'ETH' | 'RandomWalk' | 'CST';

export interface MethodOption {
  value: GestureMethod;
  label: string;
  /** The live Gesture Cost of this method, or a placeholder while it loads. */
  price: ReactNode;
  /** A short qualifier beside the price ("50% discount"). */
  note?: string;
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

const COLUMNS: Record<number, string> = {
  1: '@min-[21rem]:grid-cols-1',
  2: '@min-[21rem]:grid-cols-2',
  3: '@min-[21rem]:grid-cols-3',
};

/**
 * The gesture method as a segmented control: one sunken track, the chosen
 * method raised with a 2px primary rule, and every method showing its live
 * price inside its segment, so the choice and its cost are read together.
 * Where the column is narrow (a phone, the bottom sheet) the segments stack
 * as rows with the price at the end, so a price never wraps.
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
                '@min-[21rem]:min-h-16 @min-[21rem]:grid-cols-1 @min-[21rem]:content-center @min-[21rem]:items-start',
                'transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                selected
                  ? 'bg-surface-raised text-foreground shadow-[inset_0_-2px_0_hsl(var(--primary))]'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              <span className="col-start-1 row-start-1 type-label">{option.label}</span>
              <span className="col-start-2 row-span-2 row-start-1 whitespace-nowrap text-end type-figure-sm text-foreground @min-[21rem]:col-start-1 @min-[21rem]:row-span-1 @min-[21rem]:row-start-2 @min-[21rem]:text-start">
                {option.price}
              </span>
              {option.note ? (
                <span className="col-start-1 row-start-2 type-caption text-subtle @min-[21rem]:row-start-3">
                  {option.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
