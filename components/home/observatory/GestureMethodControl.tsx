'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { ValuePending } from './ValuePending';

export const GESTURE_METHODS = [
  { value: 'ETH', messageKey: 'eth' },
  { value: 'RandomWalk', messageKey: 'randomWalk' },
  { value: 'CST', messageKey: 'cst' },
] as const;

export type GestureMethodValue = (typeof GESTURE_METHODS)[number]['value'];

type GestureMethod = (typeof GESTURE_METHODS)[number];

/** A method's live Gesture Cost as a figure and its unit, so a line breaks between them. */
export interface MethodCost {
  value: string;
  unit: string;
  /**
   * Read from the dashboard snapshot while the live quote is on its way:
   * shown with "≈" until the quote replaces it.
   */
  approximate?: boolean;
}

export interface GestureMethodControlProps {
  /** The methods open in this phase (only ETH before the first Gesture). */
  methods: readonly GestureMethod[];
  selected: string;
  /** Each method's live Gesture Cost, or null while its quote is unknown. */
  costs: Record<GestureMethodValue, MethodCost | null>;
  /**
   * Whether the connected wallet holds an unused Random Walk NFT. Without
   * one the half-price option reads as subordinate, never as the best deal:
   * its price is muted and it is described by what it needs, with no
   * outline that would read as a broken or drop-zone state.
   */
  randomWalkEligible: boolean;
  onSelect: (value: string) => void;
  /**
   * Show the "Gesture method" label. Under the form's own title the control
   * speaks for itself, so the label stays for assistive technology only.
   */
  showLabel?: boolean;
  className?: string;
}

/** The next radio for an arrow, Home or End key, wrapping at the ends; null for any other key. */
function nextIndex(key: string, index: number, count: number): number | null {
  const last = count - 1;
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return index === last ? 0 : index + 1;
    case 'ArrowLeft':
    case 'ArrowUp':
      return index === 0 ? last : index - 1;
    case 'Home':
      return 0;
    case 'End':
      return last;
    default:
      return null;
  }
}

/**
 * The gesture method: one choice of three, so a radio group (one tab stop;
 * the arrow keys move and select, Home and End jump). It is drawn as a
 * sunken track whose selected segment sits on the raised surface over a
 * straight 2px primary bar, inset from the rounded corners. Each segment
 * shows its price, the thing the control exists to compare, under the
 * method's name; in a narrow panel the segments become rows with the price at
 * the end and the bar at the start, so no price or unit ever breaks.
 *
 * Each option is described by the condition that decides whether it is
 * usable ("needs an unused Random Walk NFT"), so a screen reader hears it
 * with the option as the selection moves. One line under the track repeats
 * the selected method's explanation for sighted readers; with ETH selected
 * and no eligible NFT it says what the half-price ETH + Random Walk option
 * needs.
 */
export function GestureMethodControl({
  methods,
  selected,
  costs,
  randomWalkEligible,
  onSelect,
  showLabel = true,
  className,
}: GestureMethodControlProps) {
  const t = useTranslations('home');
  const labelId = useId();
  const descriptionPrefix = useId();
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = methods.findIndex((method) => method.value === selected);
  // The one tab stop: the selected option, or the first while none is.
  const tabStop = selectedIndex >= 0 ? selectedIndex : 0;
  const offersRandomWalk = methods.some((method) => method.value === 'RandomWalk');
  const columns = methods.length > 1;

  const describe = (method: GestureMethod): string =>
    method.value === 'RandomWalk' && !randomWalkEligible
      ? t('form.method.randomWalk.desc')
      : t(`orientation.methods.${method.messageKey}`);
  const selectedMethod = selectedIndex >= 0 ? methods[selectedIndex] : undefined;
  const explanation = !selectedMethod
    ? null
    : selectedMethod.value === 'ETH' && offersRandomWalk && !randomWalkEligible
      ? t('form.method.randomWalk.desc')
      : describe(selectedMethod);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextIndex(event.key, index, methods.length);
    const method = next === null ? undefined : methods[next];
    if (next === null || !method) return;
    event.preventDefault();
    onSelect(method.value);
    radios.current[next]?.focus();
  };

  return (
    <div className={cn('min-w-0', className)}>
      <p id={labelId} className={cn('type-label text-subtle', !showLabel && 'sr-only')}>
        {t('form.methodLabel')}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        data-testid="panel-method-tabs"
        className={cn(
          'grid gap-1 rounded-control bg-surface-sunken p-1',
          columns && '@min-[30rem]/gesture:grid-cols-3',
          showLabel && 'mt-2',
        )}
      >
        {methods.map((method, index) => {
          const isSelected = index === selectedIndex;
          const subordinate = method.value === 'RandomWalk' && !randomWalkEligible;
          const cost = costs[method.value];
          return (
            <button
              key={method.value}
              ref={(node) => {
                radios.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === tabStop ? 0 : -1}
              data-testid={`panel-method-${method.messageKey}`}
              data-state={isSelected ? 'checked' : 'unchecked'}
              aria-describedby={`${descriptionPrefix}-${method.messageKey}`}
              onClick={() => onSelect(method.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                'relative flex min-h-12 min-w-0 items-center justify-between gap-x-3 gap-y-0.5 rounded-[calc(var(--radius-control)-2px)] border border-transparent px-3 py-1.5 text-start',
                columns &&
                  '@min-[30rem]/gesture:min-h-13 @min-[30rem]/gesture:flex-col @min-[30rem]/gesture:items-start @min-[30rem]/gesture:justify-center',
                'transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                isSelected
                  ? 'bg-surface-raised text-foreground'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
              {/* The selection is a straight bar inset from the corners: at the
                  start in a row, along the foot in a column. */}
              {isSelected && (
                <span
                  aria-hidden
                  data-slot="method-selected-bar"
                  className={cn(
                    'pointer-events-none absolute inset-y-2.5 start-0 w-0.5 rounded-pill bg-primary',
                    columns &&
                      '@min-[30rem]/gesture:inset-x-3 @min-[30rem]/gesture:top-auto @min-[30rem]/gesture:bottom-0 @min-[30rem]/gesture:h-0.5 @min-[30rem]/gesture:w-auto',
                  )}
                />
              )}
              <span className="type-label min-w-0">
                {t(`form.method.${method.messageKey}.label`)}
              </span>
              <span
                data-testid={`panel-method-${method.messageKey}-cost`}
                className={cn(
                  'type-figure-sm shrink-0 text-end',
                  columns && '@min-[30rem]/gesture:text-start',
                  isSelected
                    ? 'text-foreground'
                    : subordinate
                      ? 'text-subtle'
                      : 'text-muted-foreground',
                )}
              >
                {cost ? (
                  <>
                    <span className="whitespace-nowrap">
                      {cost.approximate ? '≈ ' : null}
                      {cost.value}
                    </span>{' '}
                    <span className="whitespace-nowrap">{cost.unit}</span>
                  </>
                ) : (
                  <ValuePending ch={9} />
                )}
              </span>
            </button>
          );
        })}
      </div>
      {/* What decides whether each option is usable, read with the option. */}
      {methods.map((method) => (
        <p key={method.value} id={`${descriptionPrefix}-${method.messageKey}`} hidden>
          {describe(method)}
        </p>
      ))}
      {explanation && (
        <p data-testid="panel-method-explanation" className="type-caption mt-2 text-subtle">
          {explanation}
        </p>
      )}
    </div>
  );
}
