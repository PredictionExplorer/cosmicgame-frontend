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

import { UNAVAILABLE_VALUE, formatAmount, formatNumber, type AmountUnit } from './format/numbers';

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
  toIsoDateTime,
  type DateTimeOptions,
  type DateTimeTitleOptions,
  type DateTimeZone,
  type TimestampTimeZone,
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
 * Formats ETH for a card or summary: grouped, exactly 4 decimals, the unit
 * after a no-break space ("32.2939 ETH", "1,234.5000 ETH", uk "1 234.5000
 * ETH", vi "8,0735 ETH"), dust as "<0.0001 ETH". A missing or non-finite
 * value renders "0 ETH", as it always has; negatives keep their sign.
 * Delegates to `formatAmount` (`context: 'card'`).
 *
 * `locale` is required on this and the other legacy amount helpers, so a
 * call site cannot silently print English grouping on a translated page.
 */
export const formatEthValue = (value: number | null | undefined, locale: string): string =>
  formatAmount(Number.isFinite(value) ? value : 0, { unit: 'ETH', locale });

/**
 * Formats CST for a card or summary: grouped, 0–2 decimals, so a protocol
 * constant reads "1,000 CST" and a balance "60,872.26 CST"; dust renders
 * "<0.01 CST". A missing value renders "0 CST". Delegates to `formatAmount`.
 */
export const formatCSTValue = (value: number | null | undefined, locale: string): string =>
  formatAmount(Number.isFinite(value) ? value : 0, { unit: 'CST', locale });

/**
 * Formats a table amount without a unit (the column header names it): fixed
 * digits so decimals line up (ETH 4, CST 2), zero as "0", dust as "<0.0001",
 * a missing value as an em dash. Delegates to `formatAmount`
 * (`context: 'table'`).
 */
export const formatTableAmount = (
  value: number | null | undefined,
  locale: string,
  unit: AmountUnit = 'ETH',
): string => formatAmount(value, { unit, locale, context: 'table', withUnit: false });

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
 * Parses a wei/smallest-unit balance to a plain fixed-decimal string
 * ("1.2346"): a machine value for arithmetic and contract input, never for
 * display (use `formatAmount`).
 *
 * Total by construction: `BigInt()` throws on fractional numbers and
 * non-numeric strings, and `toFixed` throws on out-of-range precision, so
 * anything unparseable renders `UNAVAILABLE_VALUE` rather than escaping as an
 * uncaught RangeError/SyntaxError mid-render.
 */
export const parseBalance = (value: BigNumberish, decimals = 18, decimalsToDisplay = 4): string => {
  try {
    const parsed = parseFloat(formatUnits(BigInt(value), decimals));
    if (!Number.isFinite(parsed)) return UNAVAILABLE_VALUE;
    return parsed.toFixed(decimalsToDisplay);
  } catch {
    return UNAVAILABLE_VALUE;
  }
};

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

/** Pads numeric ID with leading zeros for display (e.g., #000123). */
export const formatId = (id: number | string): string => {
  return `#${id.toString().padStart(6, '0')}`;
};

/** Converts HTML date input value (YYYY-MM-DD) to API date param (YYYYMMDD). */
export function toYyyymmdd(isoDate: string): string {
  return isoDate.replace(/-/g, '');
}

/** Converts API date param (YYYYMMDD) to HTML date input value (YYYY-MM-DD). */
export function fromYyyymmdd(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

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

/** Min/max YYYYMMDD dates from supply history API rows. */
export function supplyHistoryDateBounds(
  records: readonly { Date: string }[],
): { from: string; to: string } | null {
  if (records.length === 0) return null;
  const first = records[0];
  if (!first) return null;
  let from = first.Date;
  let to = first.Date;
  for (let i = 1; i < records.length; i++) {
    const row = records[i];
    if (!row) continue;
    const date = row.Date;
    if (date < from) from = date;
    if (date > to) to = date;
  }
  return { from, to };
}
