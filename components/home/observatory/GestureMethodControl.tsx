'use client';

import { useId } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

import { ValuePending } from './ValuePending';

export const GESTURE_METHODS = [
  { value: 'ETH', messageKey: 'eth' },
  { value: 'RandomWalk', messageKey: 'randomWalk' },
  { value: 'CST', messageKey: 'cst' },
] as const;

export type GestureMethodValue = (typeof GESTURE_METHODS)[number]['value'];

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
  methods: readonly (typeof GESTURE_METHODS)[number][];
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

/**
 * The gesture method as one segmented control: a sunken track whose selected
 * segment sits on the raised surface with a 2px primary rule. Each segment
 * shows its price, the thing the control exists to compare, under the
 * method's name; in a narrow panel the segments become rows with the price at
 * the end, so no price or unit ever breaks. One line under the track explains
 * the selected method, and with ETH selected and no eligible NFT it says what
 * the half-price ETH + Random Walk option needs.
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
  const explanationId = useId();
  const rwlkNoteId = useId();
  const selectedMethod = methods.find((method) => method.value === selected);
  const offersRandomWalk = methods.some((method) => method.value === 'RandomWalk');
  const explanation = !selectedMethod
    ? null
    : selectedMethod.value === 'ETH' && offersRandomWalk && !randomWalkEligible
      ? t('form.method.randomWalk.desc')
      : t(`orientation.methods.${selectedMethod.messageKey}`);
  const columns = methods.length > 1;

  return (
    <div className={cn('min-w-0', className)}>
      <p id={labelId} className={cn('type-label text-subtle', !showLabel && 'sr-only')}>
        {t('form.methodLabel')}
      </p>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-describedby={explanation ? explanationId : undefined}
        data-testid="panel-method-tabs"
        className={cn(
          'grid gap-1 rounded-control bg-surface-sunken p-1',
          columns && '@min-[30rem]/gesture:grid-cols-3',
          showLabel && 'mt-2',
        )}
      >
        {methods.map((method) => {
          const isSelected = selected === method.value;
          const subordinate = method.value === 'RandomWalk' && !randomWalkEligible;
          const cost = costs[method.value];
          return (
            <button
              key={method.value}
              type="button"
              data-testid={`panel-method-${method.messageKey}`}
              aria-pressed={isSelected}
              aria-describedby={subordinate ? rwlkNoteId : undefined}
              onClick={() => onSelect(method.value)}
              className={cn(
                'relative flex min-h-12 min-w-0 items-center justify-between gap-x-3 gap-y-0.5 rounded-[calc(var(--radius-control)-2px)] border border-transparent px-3 py-1.5 text-start',
                columns &&
                  '@min-[30rem]/gesture:min-h-13 @min-[30rem]/gesture:flex-col @min-[30rem]/gesture:items-start @min-[30rem]/gesture:justify-center',
                'transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                isSelected
                  ? cn(
                      'bg-surface-raised text-foreground shadow-[inset_2px_0_0_hsl(var(--primary))]',
                      columns && '@min-[30rem]/gesture:shadow-[inset_0_-2px_0_hsl(var(--primary))]',
                    )
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground',
              )}
            >
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
                      {cost.approximate ? '≈\u00a0' : null}
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
      <p id={rwlkNoteId} hidden>
        {t('form.method.randomWalk.desc')}
      </p>
      {explanation && (
        <p
          id={explanationId}
          data-testid="panel-method-explanation"
          className="type-caption mt-2 text-subtle"
        >
          {explanation}
        </p>
      )}
    </div>
  );
}
