import type { HTMLAttributes } from 'react';
import { useLocale } from 'next-intl';

import {
  NBSP,
  formatAmountParts,
  type AmountContext,
  type AmountInput,
  type AmountOptions,
  type AmountUnit,
} from '@/utils/format';
import { cn } from '@/lib/utils';

export interface AmountProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title'> {
  /** Whole tokens (number or decimal string) or base units (bigint, see `decimals`). */
  value: AmountInput;
  unit: AmountUnit;
  /** Precision policy (see `AmountContext` in utils/format). Default `card`. */
  context?: AmountContext;
  /** Print the unit. Default `true`; table cells under a "(ETH)" header pass `false`. */
  showUnit?: boolean;
  /** `exceptZero` for signed deltas. */
  signDisplay?: AmountOptions['signDisplay'];
  /** Base-unit decimals of a bigint `value`. Default 18. */
  decimals?: number;
  /** Defaults to the active locale. */
  locale?: string;
  /** Classes for the unit (muted by default). */
  unitClassName?: string;
}

/**
 * One ETH/CST/USD amount by the shared precision policy: grouped in the
 * locale's style, tabular figures, the unit muted and joined by a no-break
 * space so "0.10 ETH" never splits. Rendered as `<data value>` carrying the
 * exact decimal; when the display rounds, the full value is on hover.
 * Works in server and client components.
 */
export function Amount({
  value,
  unit,
  context,
  showUnit = true,
  signDisplay,
  decimals,
  locale,
  className,
  unitClassName,
  ...rest
}: AmountProps) {
  const activeLocale = useLocale();
  const parts = formatAmountParts(value, {
    unit,
    context,
    withUnit: showUnit,
    signDisplay,
    decimals,
    locale: locale ?? activeLocale,
  });

  if (parts.machineValue == null) {
    return (
      <span className={cn('whitespace-nowrap', className)} {...rest}>
        {parts.number}
      </span>
    );
  }

  return (
    <data
      value={parts.machineValue}
      title={parts.exact ?? undefined}
      className={cn('whitespace-nowrap tabular-nums', className)}
      {...rest}
    >
      {parts.number}
      {parts.unit ? (
        <>
          {NBSP}
          <span className={cn('text-muted-foreground', unitClassName)}>{parts.unit}</span>
        </>
      ) : null}
    </data>
  );
}
