/** The most a Cosmic Signature NFT name holds on-chain, in UTF-8 bytes. */
export const NFT_NAME_MAX_BYTES = 32;

/** UTF-8 bytes of one code point. */
function codePointBytes(codePoint: number): number {
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

/** How many bytes `text` takes on-chain (UTF-8). */
export function utf8ByteLength(text: string): number {
  let bytes = 0;
  for (const char of text) bytes += codePointBytes(char.codePointAt(0) ?? 0);
  return bytes;
}

/** The text's user-perceived characters, so an emoji or an accented letter is never cut in half. */
function graphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

/**
 * The longest start of `text` that fits `maxBytes` of UTF-8 without splitting
 * a character: a name typed or pasted past the limit stops at the last whole
 * character that fits, the way the contract would otherwise refuse it.
 */
export function truncateToBytes(text: string, maxBytes: number = NFT_NAME_MAX_BYTES): string {
  let bytes = 0;
  let out = '';
  for (const grapheme of graphemes(text)) {
    const size = utf8ByteLength(grapheme);
    if (bytes + size > maxBytes) break;
    bytes += size;
    out += grapheme;
  }
  return out;
}
