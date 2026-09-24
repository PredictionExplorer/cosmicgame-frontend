/**
 * Reading a token amount a person typed ("25", "0.5", "0,5", "1 000") into
 * base units, exactly: the string is split and padded, never passed through
 * a float, so "0.1" CST is 100000000000000000 wei and not 99999999999999999.
 */

/** Why a typed amount cannot be sent. Each maps to one sentence in `forms.transfer.amount.errors`. */
export type AmountInputError = 'required' | 'format' | 'precision' | 'zero' | 'exceedsBalance';

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
  /**
   * The locale's decimal mark (`utils/format` `decimalMarkFor`). With `,`
   * (Ukrainian, Vietnamese) a comma or a dot reads as the decimal mark; with
   * `.` a comma is refused rather than guessed, since "1,000" would read as
   * one thousand to some and as one to others.
   */
  decimalMark?: '.' | ',';
}

/** Spaces a person may type or paste as a thousands separator (incl. no-break ones). */
const GROUP_SPACES = /[\s  ]/g;
const PLAIN_DECIMAL = /^(\d*)(?:\.(\d*))?$/;

/** The typed text with one `.` decimal mark, or null when the marks are ambiguous. */
function normalizeDecimal(text: string, decimalMark: '.' | ','): string | null {
  const compact = text.replace(GROUP_SPACES, '');
  const dots = compact.split('.').length - 1;
  const commas = compact.split(',').length - 1;
  if (decimalMark === '.') return commas > 0 ? null : compact;
  if (dots + commas > 1) return null;
  return compact.replace(',', '.');
}

/**
 * The typed amount in base units, or the reason it cannot be sent. Accepts
 * "25", "25.", ".5" and digits grouped with spaces ("1 000"); rejects signs,
 * exponents, letters and more fraction digits than the token has.
 */
export function parseTokenAmount(text: string, options: ParseAmountOptions = {}): ParsedAmount {
  const { decimals = 18, max = null, decimalMark = '.' } = options;
  const trimmed = text.trim();
  if (!trimmed) return { wei: null, error: 'required' };

  const normalized = normalizeDecimal(trimmed, decimalMark);
  const match = normalized === null ? null : PLAIN_DECIMAL.exec(normalized);
  const integerPart = match?.[1] ?? '';
  const fractionPart = match?.[2] ?? '';
  if (!match || (integerPart === '' && fractionPart === '')) {
    return { wei: null, error: 'format' };
  }
  if (fractionPart.length > decimals) return { wei: null, error: 'precision' };

  const wei = BigInt(`${integerPart || '0'}${fractionPart.padEnd(decimals, '0')}`);
  if (wei === 0n) return { wei, error: 'zero' };
  if (max != null && wei > max) return { wei, error: 'exceedsBalance' };
  return { wei, error: null };
}

/**
 * Base units as a plain decimal string for an input field ("1234.5"): no
 * grouping and no rounding, so "Max" fills in exactly the balance.
 */
export function toPlainDecimal(wei: bigint, decimals = 18): string {
  const negative = wei < 0n;
  const digits = (negative ? -wei : wei).toString().padStart(decimals + 1, '0');
  const integer = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, '');
  return `${negative ? '-' : ''}${integer}${fraction ? `.${fraction}` : ''}`;
}
