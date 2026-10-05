/**
 * Reading a token amount a person typed ("25", "0.5", vi "0,5", "1 000") into
 * base units, exactly: the string is split and padded, never passed through
 * a float, so "0.1" CST is 100000000000000000 wei and not 99999999999999999.
 *
 * This is the one parser for every irreversible send (CST transfers, the
 * Outreach Reserve's payReward, ETH contributions). It reads the marks the
 * way the reader's locale prints them and refuses what it would have to
 * guess: the locale's own thousands mark is never read as a decimal mark, so
 * a Vietnamese "1.000" or an English "1,000" is refused, never sent as 1.
 */
import { getLocaleConfig } from '@/i18n/localeConfig';
import { formatNumber } from '@/utils/format';

/** Why a typed amount cannot be sent. Each maps to one sentence in `forms.transfer.amount.errors`. */
export type AmountInputError =
  | 'required'
  | 'format'
  | 'grouping'
  | 'precision'
  | 'zero'
  | 'exceedsBalance';

export interface ParsedAmount {
  /** The amount in base units, or null when it cannot be read. */
  wei: bigint | null;
  error: AmountInputError | null;
}

export interface ParseAmountOptions {
  /** Base-unit decimals of the token. Default 18 (ETH and CST). */
  decimals?: number;
  /** The most that can be sent (a balance), in base units; `null` while unknown. */
  max?: bigint | null;
  /** The reader's locale, which decides the decimal and thousands marks. Default 'en'. */
  locale?: string;
}

/** The marks a locale reads in a typed amount. */
export interface AmountMarks {
  /** The thousands mark the locale prints: ',' (en, zh, ko, ja), '.' (vi) or ' ' (uk). */
  group: ',' | '.' | ' ';
  /** Every mark read as the decimal point, the one the app prints first. Never `group`. */
  decimals: readonly ('.' | ',')[];
}

/** Spaces a person may type or paste between digit groups (incl. no-break ones). */
const SPACE = /[\s  ]/;
const SPACES = /[\s  ]/g;
const DIGITS = /^\d*$/;
/** An integer part grouped in threes by spaces: "1 000", "12 500 000". */
const SPACE_GROUPED = /^\d{1,3}(?:[\s  ]\d{3})+$/;

const marksCache = new Map<string, AmountMarks>();

const isMark = (value: string): value is '.' | ',' => value === '.' || value === ',';

/**
 * The marks of a locale, from the numbers the app itself prints: the
 * thousands mark from `Intl` (as the format layer groups), and as decimal
 * marks the one the app prints (a dot in uk, by its style guide), the one
 * `Intl` prints (a comma in uk and vi), and a dot wherever a dot cannot group.
 */
export function amountMarks(locale: string = 'en'): AmountMarks {
  const cached = marksCache.get(locale);
  if (cached) return cached;

  const { intlLocale } = getLocaleConfig(locale);
  const parts = new Intl.NumberFormat(intlLocale).formatToParts(10_000.5);
  const groupPart = parts.find((part) => part.type === 'group')?.value ?? ',';
  const group: AmountMarks['group'] = SPACE.test(groupPart) ? ' ' : groupPart === '.' ? '.' : ',';
  const intlDecimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const printedDecimal = formatNumber(1.5, locale).replace(/\d/g, '');
  const decimals = Array.from(new Set([printedDecimal, intlDecimal, '.']))
    .filter(isMark)
    .filter((mark) => mark !== group);
  const marks: AmountMarks = { group, decimals };
  marksCache.set(locale, marks);
  return marks;
}

/**
 * The typed amount in base units, or the reason it cannot be sent. Accepts
 * "25", "25.", ".5", the locale's decimal mark ("0,5" in uk and vi) and digits
 * grouped in threes with spaces ("1 000"). Refuses the locale's thousands
 * mark ('grouping' for "1,000" in en and "1.000" in vi), two marks, signs,
 * exponents, letters and more fraction digits than the token has.
 */
export function parseTokenAmount(text: string, options: ParseAmountOptions = {}): ParsedAmount {
  const { decimals = 18, max = null, locale = 'en' } = options;
  const trimmed = text.trim();
  if (!trimmed) return { wei: null, error: 'required' };

  const marks = amountMarks(locale);
  if (marks.group !== ' ' && trimmed.includes(marks.group)) {
    // The locale's own thousands mark: the reader may mean a thousand, so it
    // is never read as a decimal point. Say so when it groups three digits.
    const grouped = marks.group === '.' ? /\d\.\d{3}(?!\d)/ : /\d,\d{3}(?!\d)/;
    return { wei: null, error: grouped.test(trimmed) ? 'grouping' : 'format' };
  }

  const markIndexes = [...trimmed].flatMap((char, index) => (isMark(char) ? [index] : []));
  if (markIndexes.length > 1) return { wei: null, error: 'format' };
  const markIndex = markIndexes[0] ?? -1;
  const mark = trimmed.charAt(markIndex);
  if (markIndex >= 0 && !(isMark(mark) && marks.decimals.includes(mark))) {
    return { wei: null, error: 'format' };
  }

  const rawInteger = markIndex >= 0 ? trimmed.slice(0, markIndex) : trimmed;
  const fractionPart = markIndex >= 0 ? trimmed.slice(markIndex + 1) : '';
  if (SPACE.test(rawInteger) && !SPACE_GROUPED.test(rawInteger)) {
    return { wei: null, error: 'format' };
  }
  const integerPart = rawInteger.replace(SPACES, '');
  if (
    !DIGITS.test(integerPart) ||
    !DIGITS.test(fractionPart) ||
    (integerPart === '' && fractionPart === '')
  ) {
    return { wei: null, error: 'format' };
  }
  if (fractionPart.length > decimals) return { wei: null, error: 'precision' };

  const wei = BigInt(`${integerPart || '0'}${fractionPart.padEnd(decimals, '0')}`);
  if (wei === 0n) return { wei, error: 'zero' };
  if (max != null && wei > max) return { wei, error: 'exceedsBalance' };
  return { wei, error: null };
}

/**
 * Base units as a plain decimal for an input field ("1234.5", vi "1234,5"):
 * no grouping and no rounding, in the locale's first decimal mark, so "Max"
 * fills in exactly the balance and reads back in every locale.
 */
export function toPlainDecimal(wei: bigint, decimals = 18, locale: string = 'en'): string {
  const negative = wei < 0n;
  const digits = (negative ? -wei : wei).toString().padStart(decimals + 1, '0');
  const integer = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, '');
  const mark = amountMarks(locale).decimals[0] ?? '.';
  return `${negative ? '-' : ''}${integer}${fraction ? `${mark}${fraction}` : ''}`;
}
