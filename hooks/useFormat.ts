import { useMemo } from 'react';
import { useLocale } from 'next-intl';

import {
  formatAddress,
  formatAmount,
  formatCount,
  formatDuration,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  type AddressFormatOptions,
  type AmountInput,
  type AmountOptions,
  type DurationOptions,
  type NumericInput,
  type PercentOptions,
} from '@/utils/format';

/** The formatting layer bound to the active locale. */
export interface LocaleFormat {
  readonly locale: string;
  /** `formatAmount`: "32.2939 ETH", "1,000 CST" (see `AmountContext`). */
  readonly amount: (value: AmountInput, options: Omit<AmountOptions, 'locale'>) => string;
  /** `formatCount`: grouped whole number ("1,135", uk "1 135", vi "1.135"). */
  readonly count: (value: NumericInput) => string;
  /** `formatNumber`: any other number, with Intl options. */
  readonly number: (value: NumericInput, options?: Intl.NumberFormatOptions) => string;
  /** `formatPercent`: "12.5%" from percentage points (or a ratio via `scale`). */
  readonly percent: (value: number | null | undefined, options?: PercentOptions) => string;
  /** `formatDuration`: "1d 2h 30m 45s" or, with `style: 'clock'`, "6d 22:23:44". */
  readonly duration: (
    seconds: number | null | undefined,
    options?: Omit<DurationOptions, 'locale'>,
  ) => string;
  /** `formatRelativeTime`: "3 hours ago"; `now` in epoch ms, from `useNow()`. */
  readonly relativeTime: (timestamp: number | null | undefined, now: number) => string;
  /** `formatAddress`: "0x1Ec1…E990" (prefer `<AddressChip>` in markup). */
  readonly address: (value: string | null | undefined, options?: AddressFormatOptions) => string;
}

/**
 * The formatting layer for client components, bound to `useLocale()`:
 *
 *     const format = useFormat();
 *     format.amount(price, { unit: 'ETH', context: 'exact' });
 *     format.count(gestures);
 *
 * Date-times are not here on purpose: local time differs between server and
 * browser, so they render through `<DateTime>`, which is hydration-safe.
 * Server components call the functions in `@/utils/format` with
 * `await getLocale()`.
 */
export function useFormat(): LocaleFormat {
  const locale = useLocale();
  return useMemo<LocaleFormat>(
    () => ({
      locale,
      amount: (value, options) => formatAmount(value, { ...options, locale }),
      count: (value) => formatCount(value, locale),
      number: (value, options) => formatNumber(value, locale, options),
      percent: (value, options) => formatPercent(value, locale, options),
      duration: (seconds, options) => formatDuration(seconds, { ...options, locale }),
      relativeTime: (timestamp, now) => formatRelativeTime(timestamp, { locale, now }),
      address: (value, options) => formatAddress(value, options),
    }),
    [locale],
  );
}
