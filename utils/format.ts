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

export {
  NBSP,
  UNAVAILABLE_VALUE,
  formatAmount,
  formatAmountParts,
  formatCount,
  formatExactUnits,
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
  formatDateTime,
  formatDateTimeTitle,
  formatRelativeTime,
  formatTimeZoneLabel,
  formatUnixTsLabel,
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
  formatDuration,
  formatDurationParts,
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
  type AddressFormatOptions,
  type KnownAddressKey,
} from './format/addresses';

type BigNumberish = bigint | string | number;

/** Maps app locale codes to stable Intl locales. */
export const toIntlLocale = (locale: string = 'en'): string => getLocaleConfig(locale).intlLocale;

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
