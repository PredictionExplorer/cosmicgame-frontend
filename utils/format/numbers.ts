import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';

/**
 * Locale-aware number formatting: counts, generic numbers, percentages and
 * token amounts, built on `Intl.NumberFormat` with the locale's Intl tag
 * from `i18n/localeConfig.ts` plus the documented conventions below.
 *
 * Import from `@/utils/format` (the public entry), not from this module.
 */

/**
 * Rendered wherever a numeric value cannot be shown (missing API field, NaN,
 * unparseable wei). Formatters return this instead of throwing or printing
 * `NaN`, so a single bad record never takes down the surrounding render.
 */
export const UNAVAILABLE_VALUE = '—';

/**
 * U+00A0 NO-BREAK SPACE. Joins a number to its unit ("0.10 ETH") and the
 * tokens of one duration ("6d 22:23:44") so a line never breaks inside a
 * value.
 */
export const NBSP = '\u00a0';

/** U+2212, the minus sign: as wide as "+" and on its axis, unlike the hyphen-minus. */
const TYPOGRAPHIC_MINUS = '\u2212';

interface NumberConventions {
  /**
   * Decimal mark for every fraction a formatter prints (token amounts,
   * percentages, generic decimals), or `null` to keep the one Intl prints.
   */
  readonly decimalMark: string | null;
}

/**
 * Where a locale's documented number style departs from `Intl`. Grouping
 * always comes from Intl (a comma in en/zh/ko/ja, a no-break space in uk, a
 * dot in vi); only the decimal mark can be overridden.
 *
 * - `uk` keeps the dot (docs/i18n/style-guide-uk.md §4, "1.2345 ETH"), so a
 *   figure reads the same in the UI, in prose, and to the numeric-claims
 *   guard; the no-break-space grouping keeps it unambiguous (1 000.5).
 * - `vi` keeps Intl's comma (style-guide-vi.md §5, "1.000 CST", "0,5 ETH"):
 *   with the dot as the thousands separator, a dot decimal would read as a
 *   thousands group.
 */
const NUMBER_CONVENTIONS: LocaleRecord<NumberConventions> = {
  en: { decimalMark: null },
  zh: { decimalMark: null },
  'zh-TW': { decimalMark: null },
  'zh-HK': { decimalMark: null },
  uk: { decimalMark: '.' },
  ko: { decimalMark: null },
  ja: { decimalMark: null },
  vi: { decimalMark: null },
};

const formatterCache = new Map<string, Intl.NumberFormat>();

/** One `Intl.NumberFormat` per (locale, options): construction is the expensive part. */
function numberFormatter(intlLocale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${intlLocale}|${JSON.stringify(options)}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale, options);
    formatterCache.set(key, formatter);
  }
  return formatter;
}

const WHITESPACE = /^\s+$/u;

/** The decimal mark formatters print for a locale. */
function decimalMarkFor(locale: string | null | undefined): string {
  const { decimalMark } = pickByLocale(NUMBER_CONVENTIONS, locale);
  if (decimalMark) return decimalMark;
  const parts = numberFormatter(getLocaleConfig(locale).intlLocale, {}).formatToParts(1.5);
  return parts.find((part) => part.type === 'decimal')?.value ?? '.';
}

/**
 * Formats with Intl, then applies the locale's conventions: the decimal-mark
 * override, U+00A0 for whitespace grouping (engines disagree between U+00A0
 * and U+202F), and no space before a percent sign (every style guide: 25%).
 */
function formatWithConventions(
  value: number | bigint,
  locale: string | null | undefined,
  options: Intl.NumberFormatOptions,
): string {
  const { decimalMark } = pickByLocale(NUMBER_CONVENTIONS, locale);
  const parts = numberFormatter(getLocaleConfig(locale).intlLocale, options).formatToParts(value);
  return parts
    .map((part, index) => {
      if (part.type === 'decimal') return decimalMark ?? part.value;
      if (part.type === 'group') return WHITESPACE.test(part.value) ? NBSP : part.value;
      if (part.type === 'literal' && WHITESPACE.test(part.value)) {
        const touchesPercent =
          parts[index - 1]?.type === 'percentSign' || parts[index + 1]?.type === 'percentSign';
        return touchesPercent ? '' : part.value;
      }
      return part.value;
    })
    .join('');
}

/** Values the numeric formatters accept; anything else renders `UNAVAILABLE_VALUE`. */
export type NumericInput = number | bigint | null | undefined;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/**
 * A locale-formatted number with the locale's conventions applied. `options`
 * are `Intl.NumberFormat` options; prefer the purpose-built `formatCount`,
 * `formatPercent` and `formatAmount`.
 */
export function formatNumber(
  value: NumericInput,
  locale: string = 'en',
  options: Intl.NumberFormatOptions = {},
): string {
  if (typeof value !== 'bigint' && !isFiniteNumber(value)) return UNAVAILABLE_VALUE;
  return formatWithConventions(value, locale, options);
}

/**
 * A grouped whole-number count in every locale ("1,135", uk "1 135", vi
 * "1.135"); Chinese and Japanese data keep Western grouping, never 万.
 * Fractions are rounded away: a count is never "3.5 gestures".
 */
export function formatCount(value: NumericInput, locale: string = 'en'): string {
  return formatNumber(value, locale, { maximumFractionDigits: 0 });
}

export interface PercentOptions {
  /** `percent` (default) reads 12.5 as 12.5%; `ratio` reads 0.125 as 12.5%. */
  readonly scale?: 'percent' | 'ratio';
  /** Default 1: a percentage carries at most one decimal. */
  readonly maximumFractionDigits?: number;
  /** Default 0: trailing zeros are trimmed (50%, not 50.0%). */
  readonly minimumFractionDigits?: number;
  /** `exceptZero` for deltas ("+2.5%"). */
  readonly signDisplay?: 'auto' | 'exceptZero' | 'always' | 'never';
}

/**
 * A percentage with the sign attached in every locale ("12.5%", uk "12.5%",
 * vi "12,5%"). Values are percentage points by default, like the API and
 * `protocol-facts.ts` (`mainEthPercentage: 25`).
 */
export function formatPercent(
  value: number | null | undefined,
  locale: string = 'en',
  {
    scale = 'percent',
    maximumFractionDigits = 1,
    minimumFractionDigits = 0,
    signDisplay = 'auto',
  }: PercentOptions = {},
): string {
  if (!isFiniteNumber(value)) return UNAVAILABLE_VALUE;
  return formatWithConventions(scale === 'percent' ? value / 100 : value, locale, {
    style: 'percent',
    maximumFractionDigits,
    minimumFractionDigits: Math.min(minimumFractionDigits, maximumFractionDigits),
    signDisplay,
  });
}

/** Units the amount formatter knows. Tickers stay Latin in every locale (glossaries). */
export type AmountUnit = 'ETH' | 'CST' | 'USD';

/**
 * Where an amount is shown, which sets its precision:
 *
 * - `table`: ledger columns. Fixed digits so decimals line up (ETH 4, CST 2,
 *   USD 2), zero included ("0.0000" under "0.1562"), dust as a bound
 *   ("<0.0001"). Pair with `withUnit: false` when the column header names
 *   the unit. Every other context prints zero as a bare "0".
 * - `card` (default): stat cards, summaries, chart tooltips. ETH keeps a
 *   fixed 4 digits; CST shows 2, or none for a whole amount, so a protocol
 *   constant reads "1,000 CST" beside "103,782.40 CST"; USD rounds to whole
 *   dollars from 100 up.
 * - `hero`: one large readout or a figure in running prose; trailing zeros
 *   are trimmed ("1.5 ETH").
 * - `exact`: an amount the participant is about to pay or receive, which
 *   must match the wallet prompt: up to 6 digits, trimmed, never bounded;
 *   values below 0.000001 keep 4 significant digits.
 */
export type AmountContext = 'table' | 'card' | 'hero' | 'exact';

interface AmountPolicy {
  readonly minimumFractionDigits: number;
  readonly maximumFractionDigits: number;
  /** Magnitudes below this render as a bound ("<0.0001"); `null` never bounds. */
  readonly dust: number | null;
  /** From `from` up, the amount shows exactly `fractionDigits` digits instead. */
  readonly large?: { readonly from: number; readonly fractionDigits: number };
  /** A whole amount (after rounding) drops its fraction: "1,000", not "1,000.00". */
  readonly wholeWithoutFraction?: boolean;
}

const fixedDigits = (digits: number, dust: number | null): AmountPolicy => ({
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
  dust,
});

/** Fixed digits, or none when the amount is whole: every figure in a column reads alike. */
const fixedOrWhole = (digits: number, dust: number | null): AmountPolicy => ({
  ...fixedDigits(digits, dust),
  wholeWithoutFraction: true,
});

const upToDigits = (digits: number, dust: number | null): AmountPolicy => ({
  minimumFractionDigits: 0,
  maximumFractionDigits: digits,
  dust,
});

const USD_APPROXIMATION: AmountPolicy = {
  ...fixedDigits(2, 0.01),
  large: { from: 100, fractionDigits: 0 },
};

/** The precision policy: one table for every amount on every page. */
const AMOUNT_POLICY: Record<AmountUnit, Record<AmountContext, AmountPolicy>> = {
  ETH: {
    table: fixedDigits(4, 0.0001),
    card: fixedDigits(4, 0.0001),
    hero: upToDigits(4, 0.0001),
    exact: upToDigits(6, null),
  },
  CST: {
    table: fixedDigits(2, 0.01),
    card: fixedOrWhole(2, 0.01),
    hero: fixedOrWhole(2, 0.01),
    exact: upToDigits(6, null),
  },
  USD: {
    table: fixedDigits(2, 0.01),
    card: USD_APPROXIMATION,
    hero: USD_APPROXIMATION,
    exact: fixedDigits(2, null),
  },
};

/**
 * An amount: a number of whole tokens, a decimal string ("0.1021"), or a
 * bigint of base units (wei for ETH and CST; see `decimals`).
 */
export type AmountInput = number | bigint | string | null | undefined;

export interface AmountOptions {
  readonly unit: AmountUnit;
  readonly locale?: string;
  /** Default `card`. */
  readonly context?: AmountContext;
  /** Default `true`. Table cells under a header that names the unit pass `false`. */
  readonly withUnit?: boolean;
  /** `exceptZero` for signed deltas ("+0.0100 ETH"). */
  readonly signDisplay?: 'auto' | 'exceptZero' | 'always' | 'never';
  /** Base-unit decimals of a bigint input. Default 18 (wei). */
  readonly decimals?: number;
}

/** A formatted amount split for styling: `<Amount>` sets the unit in its own span. */
export interface AmountParts {
  /** The number, a bound ("<0.0001"), or `UNAVAILABLE_VALUE`. */
  readonly number: string;
  /** The unit to print after a no-break space, or `null` when omitted or unavailable. */
  readonly unit: AmountUnit | null;
  /**
   * Full precision, grouped, with the unit ("0.102113456789 ETH") when the
   * display rounds the value, for a title or tooltip; `null` when the display
   * is already exact.
   */
  readonly exact: string | null;
  /** Plain decimal for `<data value>` ("0.102113456789"), or `null` when unavailable. */
  readonly machineValue: string | null;
}

const DECIMAL_STRING = /^-?\d+(?:\.\d+)?$/;

/** Significant digits kept for a nonzero `exact` amount too small for its fraction digits. */
const TINY_SIGNIFICANT_DIGITS = 4;

/** Fraction digits of a plain decimal string after trailing zeros ("1.2500" → 2). */
const significantFractionLength = (decimal: string): number =>
  (decimal.split('.')[1] ?? '').replace(/0+$/, '').length;

/**
 * A bigint of base units as a plain decimal string ("1234000000000000000005"
 * wei → "1234.000000000000000005"), trailing fraction zeros trimmed. The same
 * result as viem's `formatUnits`, written here so the formatting layer, which
 * the landing's client islands import, never pulls viem into the marketing
 * bundle (app/[locale]/(app)/__tests__/landing-shell-no-web3.test.ts).
 */
function baseUnitsToDecimal(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(decimals + 1, '0');
  const integer = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, '');
  return `${negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}`;
}

/** Plain decimal string of an amount input, or `null` when it is not a number. */
function toDecimalString(value: AmountInput, decimals: number): string | null {
  if (value == null) return null;
  if (typeof value === 'bigint') return baseUnitsToDecimal(value, decimals);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    // Intl prints the shortest round-trip form and never exponent notation.
    return numberFormatter('en-US', { useGrouping: false, maximumFractionDigits: 20 }).format(
      value,
    );
  }
  const trimmed = value.trim();
  return DECIMAL_STRING.test(trimmed) ? trimmed : null;
}

/**
 * Full-precision rendering of a plain decimal string in the locale's
 * conventions. Works on the string, so a wei amount keeps all 18 digits.
 */
function formatExactDecimal(decimal: string, locale: string | null | undefined): string {
  const negative = decimal.startsWith('-');
  const [integer = '0', fraction = ''] = (negative ? decimal.slice(1) : decimal).split('.');
  const significantFraction = fraction.replace(/0+$/, '');
  const grouped = formatWithConventions(BigInt(integer), locale, {});
  const fractionText = significantFraction ? `${decimalMarkFor(locale)}${significantFraction}` : '';
  return `${negative ? '-' : ''}${grouped}${fractionText}`;
}

/**
 * An amount split into styled parts; see `formatAmount` for the rules. Use it
 * where the unit needs its own markup, as `<Amount>` does.
 */
export function formatAmountParts(value: AmountInput, options: AmountOptions): AmountParts {
  const {
    unit,
    locale = 'en',
    context = 'card',
    withUnit = true,
    signDisplay = 'auto',
    decimals = 18,
  } = options;
  const decimal = toDecimalString(value, decimals);
  const numeric = decimal == null ? Number.NaN : Number(decimal);
  if (decimal == null || !Number.isFinite(numeric)) {
    return { number: UNAVAILABLE_VALUE, unit: null, exact: null, machineValue: null };
  }

  const policy = AMOUNT_POLICY[unit][context];
  const magnitude = Math.abs(numeric);
  const fractionLength = significantFractionLength(decimal);

  let number: string;
  let lossy: boolean;
  if (numeric === 0) {
    // A ledger column keeps its digits for zero too, so every row's decimal
    // point lines up; a card or a sentence says a plain "0".
    const digits = context === 'table' ? policy.minimumFractionDigits : 0;
    number = formatWithConventions(0, locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    lossy = false;
  } else if (policy.dust != null && magnitude < policy.dust) {
    const bound = formatWithConventions(policy.dust, locale, {
      minimumFractionDigits: policy.maximumFractionDigits,
      maximumFractionDigits: policy.maximumFractionDigits,
    });
    number = numeric > 0 ? `<${bound}` : `>-${bound}`;
    lossy = true;
  } else if (policy.dust == null && magnitude < 10 ** -policy.maximumFractionDigits) {
    number = formatWithConventions(numeric, locale, {
      maximumSignificantDigits: TINY_SIGNIFICANT_DIGITS,
      signDisplay,
    });
    lossy = decimal.replace(/^-?0\.0*/, '').replace(/0+$/, '').length > TINY_SIGNIFICANT_DIGITS;
  } else {
    const scale = 10 ** policy.maximumFractionDigits;
    const roundsToWhole = Math.round(magnitude * scale) % scale === 0;
    let digits: number | null = null;
    if (policy.large && magnitude >= policy.large.from) digits = policy.large.fractionDigits;
    else if (policy.wholeWithoutFraction && roundsToWhole) digits = 0;
    const maximumFractionDigits = digits ?? policy.maximumFractionDigits;
    number = formatWithConventions(numeric, locale, {
      minimumFractionDigits: digits ?? policy.minimumFractionDigits,
      maximumFractionDigits,
      signDisplay,
    });
    lossy = fractionLength > maximumFractionDigits;
  }

  return {
    // A signed delta sits beside "+" in a tabular column: the hyphen-minus
    // is shorter and lower than the plus, so it takes the true minus sign.
    number: signDisplay === 'auto' ? number : number.replace(/-/g, TYPOGRAPHIC_MINUS),
    unit: withUnit ? unit : null,
    exact: lossy ? `${formatExactDecimal(decimal, locale)}${NBSP}${unit}` : null,
    machineValue: decimal,
  };
}

/**
 * Base units at full precision in the locale's conventions, with no unit:
 * 1000n * 10n ** 18n with 18 decimals is "1,000" (en), "1.000" (vi) or
 * "1 000" (uk); 1234567n with 6 decimals is "1.234567". For an amount a
 * person confirms exactly, such as the allowance an approval grants, where
 * the rounding of `formatAmount`'s policies would misstate it.
 */
export function formatExactUnits(
  value: bigint,
  { decimals, locale }: { decimals: number; locale?: string | null },
): string {
  return formatExactDecimal(baseUnitsToDecimal(value, decimals), locale);
}

/**
 * One amount by the shared precision policy (`AmountContext`), grouped in
 * the locale's style with the unit after a no-break space: "32.2939 ETH",
 * uk "60 872.26 CST", vi "8,0735 ETH", table dust "<0.0001".
 * Pure and synchronous: safe in server components (with `await getLocale()`)
 * and client components (`useFormat()` binds the locale).
 */
export function formatAmount(value: AmountInput, options: AmountOptions): string {
  const parts = formatAmountParts(value, options);
  return parts.unit ? `${parts.number}${NBSP}${parts.unit}` : parts.number;
}
