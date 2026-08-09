import { formatUnits } from 'viem';

type BigNumberish = bigint | string | number;

/**
 * Rendered wherever a numeric value cannot be shown (missing API field, NaN,
 * unparseable wei). Formatters return this instead of throwing or printing
 * `NaN`, so a single bad record never takes down the surrounding render.
 */
export const UNAVAILABLE_VALUE = '—';

/** Maps app locale codes to stable Intl locales. */
export const toIntlLocale = (locale: string = 'en'): string =>
  locale.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en-US';

/** Shortens a hex string (e.g., address) for display. */
export function shortenHex(hex: string, length = 4): string {
  if (hex) {
    return `${hex.substring(0, length + 2)}....${hex.substring(hex.length - length)}`;
  }
  return '';
}

/**
 * Parses wei/smallest-unit balance to a fixed-decimal string.
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
 * Use at display sites where the value comes from an API field that the
 * schema types as required but the backend can still omit.
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

export type TimestampTimeZone = 'local' | 'utc';

/**
 * Converts Unix timestamp to a locale-style date string.
 * `en` output is byte-identical to the historical format ("Jan 01, 12:34");
 * `zh` renders "1月1日 12:34" (docs/i18n/README.md §4).
 *
 * Browser-local time is the historical/default behavior. Pass `utc` only for
 * deterministic server snapshots; hydration-safe UI should use
 * `HydrationSafeDateTime` or `useHydrationSafeDateTime`.
 */
export const convertTimestampToDateTime = (
  timestamp: number,
  showSecond: boolean = false,
  locale: string = 'en',
  timeZone: TimestampTimeZone = 'local',
): string => {
  const month_names = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const date_ob = new Date(timestamp * 1000);
  const month = timeZone === 'utc' ? date_ob.getUTCMonth() : date_ob.getMonth();
  const day = timeZone === 'utc' ? date_ob.getUTCDate() : date_ob.getDate();
  const hour = timeZone === 'utc' ? date_ob.getUTCHours() : date_ob.getHours();
  const minute = timeZone === 'utc' ? date_ob.getUTCMinutes() : date_ob.getMinutes();
  const second = timeZone === 'utc' ? date_ob.getUTCSeconds() : date_ob.getSeconds();
  const hours = ('0' + hour).slice(-2);
  const minutes = ('0' + minute).slice(-2);
  const seconds = ('0' + second).slice(-2);

  let result: string;
  if (toIntlLocale(locale) === 'zh-CN') {
    result = `${month + 1}月${day}日 ${hours}:${minutes}`;
  } else {
    const monthName = month_names[month];
    const date = ('0' + day).slice(-2);
    result = `${monthName} ${date}, ${hours}:${minutes}`;
  }

  if (showSecond) {
    result += `:${seconds}`;
  }

  return result;
};

/** Deterministic value used for SSR and the first hydration render. */
export const convertTimestampToServerDateTime = (
  timestamp: number,
  showSecond: boolean = false,
  locale: string = 'en',
): string => convertTimestampToDateTime(timestamp, showSecond, locale, 'utc');

/**
 * Converts seconds into a human-readable duration string.
 * `en`: "1d 2h 30m 45s" (unchanged); `zh`: "1天2小时30分45秒"
 * (docs/i18n/style-guide-zh.md §5 compact duration form).
 */
export const formatSeconds = (seconds: number, locale: string = 'en'): string => {
  if (seconds < 0) return ' ';

  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  let hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  let days = Math.floor(hours / 24);
  hours = hours % 24;

  const units =
    toIntlLocale(locale) === 'zh-CN'
      ? { d: '天', h: '小时', m: '分', s: '秒', sep: '' }
      : { d: 'd', h: 'h', m: 'm', s: 's', sep: ' ' };

  let str = '';
  if (days) str += `${days}${units.d}${units.sep}`;
  if (hours || (str && (minutes || seconds))) str += `${hours}${units.h}${units.sep}`;
  if (minutes || (str && seconds)) str += `${minutes}${units.m}${units.sep}`;
  if (seconds) str += `${seconds}${units.s}`;

  return str || `0${units.s}`;
};
/**
 * Calculates the difference between the current time and a given timestamp.
 * Returns the time difference in a human-readable format (e.g., "1d 2h 30m 45s").
 */
export const calculateTimeDiff = (timestamp: number, locale: string = 'en'): string => {
  const seconds = Math.floor(Date.now() / 1000) - timestamp;
  return seconds < 0 ? '' : formatSeconds(seconds, locale);
};

/**
 * Formats ETH for display: 4 decimals when < 10, else 2.
 * Guards on finiteness rather than truthiness so a legitimate negative (a
 * net-loss ROI figure, say) renders its real value instead of "0 ETH".
 */
export const formatEthValue = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value) || value === 0) return '0 ETH';
  return value < 10 ? `${value.toFixed(4)} ETH` : `${value.toFixed(2)} ETH`;
};

/**
 * Formats a numeric table amount without the misleading `0.000000` wall that
 * fixed-precision output produces: zero renders as "0", dust renders as
 * "<0.0001", and everything else gets up to 6 decimals with trailing zeros
 * trimmed. Unit-free — append " ETH"/" CST" at the call site if needed.
 */
export const formatTableAmount = (
  value: number | null | undefined,
  locale: string = 'en',
): string => {
  if (value == null || !Number.isFinite(value)) return UNAVAILABLE_VALUE;
  if (value === 0) return '0';
  const magnitude = Math.abs(value);
  if (magnitude < 0.0001) return value > 0 ? '<0.0001' : '>-0.0001';
  return new Intl.NumberFormat(toIntlLocale(locale), {
    maximumFractionDigits: 6,
  }).format(value);
};

/** Locale-aware grouped number; Chinese data displays keep Western grouping. */
export const formatGroupedNumber = (
  value: number,
  locale: string = 'en',
  options?: Intl.NumberFormatOptions,
): string => new Intl.NumberFormat(toIntlLocale(locale), options).format(value);

/**
 * Formats CST for display: 4 decimals when < 10, else 2.
 * Finiteness guard (not truthiness) so negatives survive — see `formatEthValue`.
 */
export const formatCSTValue = (value: number | null | undefined): string => {
  if (value == null || !Number.isFinite(value) || value === 0) return '0 CST';
  return value < 10 ? `${value.toFixed(4)} CST` : `${value.toFixed(2)} CST`;
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

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** Formats YYYYMMDD for chart axis / tooltip labels. */
export function formatYyyymmddLabel(yyyymmdd: string, locale: string = 'en'): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  if (toIntlLocale(locale) === 'zh-CN') {
    return `${year}/${month + 1}/${day}`;
  }
  const monthName = MONTH_LABELS[month] ?? '';
  return `${monthName} ${day}, ${year}`;
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

/** Formats a Unix timestamp (seconds) for chart axis / tooltip labels. */
export function formatUnixTsLabel(ts: number, withTime = false, locale: string = 'en'): string {
  const d = new Date(ts * 1000);
  const day = d.getUTCDate();
  const monthIndex = d.getUTCMonth();
  const year = d.getUTCFullYear();
  if (toIntlLocale(locale) === 'zh-CN') {
    if (!withTime) {
      return `${year}/${monthIndex + 1}/${day}`;
    }
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${year}年${monthIndex + 1}月${day}日 ${hh}:${mm}（UTC）`;
  }
  const month = MONTH_LABELS[monthIndex] ?? '';
  if (!withTime) {
    return `${month} ${day}, ${year}`;
  }
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${month} ${day}, ${year} ${hh}:${mm} UTC`;
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
