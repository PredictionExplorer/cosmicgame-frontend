/**
 * The formatting layer: every number, amount, date, duration and address the
 * app displays goes through here, so one figure reads the same on every card,
 * table and page, in every locale.
 *
 * | Value        | Function                              | Component       |
 * | ------------ | ------------------------------------- | --------------- |
 * | ETH/CST/USD  | `formatAmount` (precision by context) | `<Amount>`      |
 * | count        | `formatCount`                         | —               |
 * | percentage   | `formatPercent`                       | —               |
 * | date-time    | `formatDateTime`, `formatDateTimeTitle` | `<DateTime>`  |
 * | age          | `formatRelativeTime`                  | `<DateTime variant="relative">` |
 * | duration     | `formatDuration`                      | `<Duration>`    |
 * | address/hash | `formatAddress`                       | `<AddressChip>` |
 *
 * Client components get locale-bound versions from `useFormat()`
 * (hooks/useFormat.ts); server components pass `await getLocale()`.
 * Locale conventions come from `i18n/localeConfig.ts` and the style guides
 * (docs/i18n/style-guide-*.md §5); the implementation lives in `./format/`.
 */
import { formatUnits } from 'viem';

import { getLocaleConfig } from '@/i18n/localeConfig';

import { UNAVAILABLE_VALUE, formatNumber } from './format/numbers';

export {
  NBSP,
  UNAVAILABLE_VALUE,
  formatAmount,
  formatAmountParts,
  formatCount,
  formatNumber,
  formatPercent,
  type AmountContext,
  type AmountInput,
  type AmountOptions,
  type AmountParts,
  type AmountUnit,
  type NumericInput,
  type PercentOptions,
} from './format/numbers';
export {
  convertTimestampToDateTime,
  convertTimestampToServerDateTime,
  formatDateTime,
  formatDateTimeTitle,
  formatRelativeTime,
  formatTimeZoneLabel,
  formatUnixTsLabel,
  formatUtcDateTimeStamp,
  formatYyyymmddLabel,
  formatZonedDateTimeParts,
  toIsoDateTime,
  type DateTimeOptions,
  type DateTimeTitleOptions,
  type DateTimeZone,
  type TimestampTimeZone,
  type ZonedDateTimeParts,
} from './format/dates';
export {
  calculateTimeDiff,
  formatDuration,
  formatDurationTick,
  formatHoursTick,
  formatSeconds,
  toIsoDuration,
  type DurationOptions,
} from './format/durations';
export { formatId } from './format/ids';
export {
  checksumAddress,
  findKnownAddress,
  formatAddress,
  isZeroAddress,
  sameAddress,
  shortenHex,
  type AddressFormatOptions,
  type KnownAddressKey,
} from './format/addresses';

type BigNumberish = bigint | string | number;

/** Maps app locale codes to stable Intl locales. */
export const toIntlLocale = (locale: string = 'en'): string => getLocaleConfig(locale).intlLocale;

/**
 * Locale-aware grouped number (Chinese data displays keep Western grouping).
 * Delegates to `formatNumber`; prefer `formatCount` for counts.
 */
export const formatGroupedNumber = (
  value: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions,
): string => formatNumber(value, locale, options);

/**
 * `toFixed` that cannot throw. Finite input is byte-identical to
 * `value.toFixed(digits)`; null/undefined/NaN/Infinity render `fallback`.
 * A machine value (contract input, form state); displayed amounts go
 * through `formatAmount`, which groups digits and follows the locale.
 */
export const formatFixed = (
  value: number | null | undefined,
  digits: number,
  fallback: string = UNAVAILABLE_VALUE,
): string =>
  typeof value === 'number' && Number.isFinite(value) ? value.toFixed(digits) : fallback;

/**
 * Converts a wei amount to an ETH `number` without the precision loss of
 * `Number(wei) / 1e18`, which rounds the integer to a double *before*
 * dividing and so goes wrong above 2^53 wei (~0.009 ETH). Formatting the
 * exact decimal string first means only one rounding step, at the end.
 */
export const weiToEthNumber = (value: BigNumberish, fallback = 0): number => {
  try {
    const eth = Number(formatUnits(BigInt(value), 18));
    return Number.isFinite(eth) ? eth : fallback;
  } catch {
    return fallback;
  }
};

/** Returns UTC YYYYMMDD for today minus `days` calendar days. */
export function yyyymmddDaysAgoUtc(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Returns UTC YYYYMMDD for today. */
export function yyyymmddTodayUtc(): string {
  return yyyymmddDaysAgoUtc(0);
}

/** Wide date range used to bootstrap CST supply history (all available days). */
export function supplyHistoryBootstrapRange(): { from: string; to: string } {
  return { from: '19700101', to: yyyymmddTodayUtc() };
}
