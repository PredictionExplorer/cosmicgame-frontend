/*
 * Text that third parties write and pages show: an attached NFT's metadata
 * fields, a contract's `name()` and `symbol()`. Anyone can deploy the
 * contract behind an attached token, so each string passes through
 * `cleanDisplayText` before it reaches a caption.
 */

/**
 * Characters that change how the text around them reads without being seen:
 * controls, bidirectional overrides and isolates, zero-width marks. The
 * zero-width joiner stays, because emoji sequences need it.
 */
const INVISIBLE_CHARACTERS = /(?!\u200d)[\p{Cc}\p{Cf}]/gu;

/** The longest label kept: a collection, artist or platform, a contract's `name()`. */
export const MAX_LABEL_LENGTH = 64;

/**
 * Text a third party wrote (a metadata document's fields, a contract's
 * `name()` or `symbol()`), made safe to show: one line, without invisible or
 * direction-changing characters (a right-to-left override, U+202E, placed
 * before "gnp.exe" makes it read "exe.png"), and at most `maxLength`
 * characters, cut with an ellipsis. Undefined when nothing visible is left.
 */
export function cleanDisplayText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value
    .replace(/\s+/g, ' ')
    .replace(INVISIBLE_CHARACTERS, '')
    .replace(/ {2,}/g, ' ')
    .trim();
  if (!clean) return undefined;
  const chars = Array.from(clean);
  return chars.length > maxLength ? `${chars.slice(0, maxLength - 1).join('')}…` : clean;
}
