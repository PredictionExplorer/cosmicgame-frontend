/**
 * Script-aware term matchers shared by the lexicon scanner and the
 * terminology gate.
 *
 * JavaScript's `\b` only understands ASCII word characters, so a banned or
 * drifting term needs a different boundary strategy per writing system:
 *
 *   - `latin-word`     — `\b`-bounded, case-insensitive. English.
 *   - `cjk-substring`  — plain substring; CJK text has no word boundaries.
 *   - `unicode-word`   — whole words bounded by any Unicode letter/mark/digit,
 *                        case-insensitive under the `u` flag. Terms are full
 *                        inflected forms (see `inflect`). Cyrillic and other
 *                        alphabetic scripts.
 *   - `unicode-stem`   — the term must START a word and may continue with any
 *                        letters, so one stem covers every inflected suffix
 *                        (`лотере` → лотерея, лотереї, лотерейний). Only for
 *                        stems that no unrelated word begins with; ambiguous
 *                        roots (`приз` vs. призначення) belong in a
 *                        `unicode-word` list of explicit forms instead.
 *
 * Every builder returns a global regex suitable for `String#match` and for
 * the scanners in lexicon-scan-core.ts (which read full matches, not groups).
 */

export type TermMatcher = 'latin-word' | 'cjk-substring' | 'unicode-word' | 'unicode-stem';

/** A list of terms plus the boundary strategy that fits their script. */
export interface TermSet {
  readonly matcher: TermMatcher;
  readonly terms: readonly string[];
}

/** A regex that can never match — safe to chain when a term list is empty. */
export const NEVER_MATCH = /(?!)/g;

export function escapeRegex(term: string): string {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive, `\b`-bounded alternation for ASCII-script terms. */
export function buildLatinWordPattern(terms: readonly string[]): RegExp {
  if (terms.length === 0) return NEVER_MATCH;
  return new RegExp(`\\b(${terms.map(escapeRegex).join('|')})\\b`, 'gi');
}

/** Plain substring alternation — CJK has no `\b` boundaries and no letter case. */
export function buildCjkSubstringPattern(terms: readonly string[]): RegExp {
  if (terms.length === 0) return NEVER_MATCH;
  return new RegExp(`(${terms.map(escapeRegex).join('|')})`, 'g');
}

const NOT_PRECEDED_BY_WORD_CHAR = '(?<![\\p{L}\\p{M}\\p{N}])';
const NOT_FOLLOWED_BY_WORD_CHAR = '(?![\\p{L}\\p{M}\\p{N}])';

/** Whole-word alternation with Unicode-aware boundaries and case folding. */
export function buildUnicodeWordPattern(terms: readonly string[]): RegExp {
  if (terms.length === 0) return NEVER_MATCH;
  return new RegExp(
    `${NOT_PRECEDED_BY_WORD_CHAR}(${terms.map(escapeRegex).join('|')})${NOT_FOLLOWED_BY_WORD_CHAR}`,
    'giu',
  );
}

/** Word-initial stem alternation; the match extends over the rest of the word. */
export function buildUnicodeStemPattern(stems: readonly string[]): RegExp {
  if (stems.length === 0) return NEVER_MATCH;
  return new RegExp(
    `${NOT_PRECEDED_BY_WORD_CHAR}(?:${stems.map(escapeRegex).join('|')})[\\p{L}\\p{M}]*`,
    'giu',
  );
}

export function buildTermPattern({ matcher, terms }: TermSet): RegExp {
  switch (matcher) {
    case 'latin-word':
      return buildLatinWordPattern(terms);
    case 'cjk-substring':
      return buildCjkSubstringPattern(terms);
    case 'unicode-word':
      return buildUnicodeWordPattern(terms);
    case 'unicode-stem':
      return buildUnicodeStemPattern(terms);
  }
}

/**
 * Expands a stem into explicit inflected forms for a `unicode-word` list:
 * `inflect('приз', ['', 'и', 'у'])` → `['приз', 'призи', 'призу']`.
 */
export function inflect(stem: string, endings: readonly string[]): string[] {
  return endings.map((ending) => `${stem}${ending}`);
}

/** Ukrainian noun endings that cover every case in singular and plural for common declensions. */
export const UK_NOUN_ENDINGS: readonly string[] = [
  '',
  'а',
  'у',
  'ю',
  'ом',
  'ем',
  'єм',
  'і',
  'и',
  'ів',
  'ам',
  'ям',
  'ами',
  'ями',
  'ах',
  'ях',
  'ою',
  'ею',
  'ок',
  'ку',
  'ки',
  'кою',
  'кам',
  'ками',
  'ках',
  'ці',
];
