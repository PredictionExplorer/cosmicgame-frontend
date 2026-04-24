/**
 * Core scanner logic for the Cosmic Signature lexicon.
 *
 * This module is separate from the CLI entry point so it can be imported by
 * unit tests without running the walk-filesystem side effect. The CLI
 * (scripts/lexicon-scan.js) re-imports these primitives and adds the
 * file-walk + process-exit behavior.
 *
 * The scanner reads string literals from a source file and checks them
 * against a banned-word regex. To avoid false positives on routine internal
 * concerns (import paths, DOM element IDs, test selectors), it skips a
 * small, explicit list of known-internal call sites. This keeps the tool
 * useful on real-world React + Next.js codebases without requiring every
 * file to sprinkle `lexicon-allow-*` pragmas.
 *
 * Explicit allow pragmas remain supported for the rare case where a banned
 * term must appear verbatim (e.g., FAQ "is this a lottery?" denial copy,
 * or internal developer docs explaining the vocabulary rules).
 */

'use strict';

/**
 * The default banned-term list for Cosmic Signature, derived from
 * marketing/cosmic-lexicon.md. "game" and "play" are intentionally absent
 * per product direction (casual usage approved).
 */
const DEFAULT_BANNED_TERMS = [
  'bid',
  'bids',
  'bidding',
  'bidder',
  'bidders',
  'prize',
  'prizes',
  'raffle',
  'raffles',
  'winner',
  'winners',
  'gambling',
  'gamble',
  'lottery',
  'lotteries',
  'bet',
  'bets',
  'wager',
  'wagers',
  'odds',
  'investor',
  'investors',
  'investment',
  'investments',
  'profit',
  'profits',
  'ROI',
  'dividend',
  'dividends',
  'tax-deductible',
  'house edge',
  'degen',
  'moon',
  'lambo',
  'yield',
  'staker',
  'stakers',
  'staking',
  'charity',
  'donate',
  'donation',
  'donations',
  'donor',
  'Dutch auction',
  'cash out',
];

/**
 * Builds a case-insensitive, word-boundary-aware regex from a list of
 * banned terms. Escapes regex metacharacters so "Dutch auction" matches
 * the literal phrase and "tax-deductible" matches the literal hyphen.
 */
function buildBannedPattern(banned) {
  if (banned.length === 0) {
    // An empty alternation `\b(|)\b` would match zero-width positions at
    // every word boundary, producing a flood of empty matches. Return a
    // pattern that matches nothing instead, so callers can safely chain.
    return /(?!)/g;
  }
  const escaped = banned.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
}

/**
 * Extracts string literals (single-quoted, double-quoted, and
 * backtick-quoted) from a single line of source code. Returns each literal
 * along with the zero-based column offset in the line so callers can
 * inspect what precedes the literal.
 */
function extractStringLiterals(line) {
  const result = [];
  const regex = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    result.push({ literal: match[0], start: match.index });
  }
  return result;
}

/**
 * Decides whether a given string literal, at column `start` of `line`,
 * should be skipped because it represents an internal-only string (import
 * path, DOM element ID, test selector, etc.). Returns true to skip.
 *
 * The "prefix" is the text in the line immediately before the literal.
 * We match on the trimmed trailing tokens to identify the surrounding
 * call site.
 */
function isInternalCallSite(line, start) {
  const prefix = line.slice(0, start);
  const trimmedPrefix = prefix.trimEnd();

  // Imports and bare require(): `import X from 'y'`, `require('y')`.
  if (/\b(?:from|require\s*\()\s*$/.test(trimmedPrefix)) return true;
  if (/\bimport\s*\(\s*$/.test(trimmedPrefix)) return true;

  // JSX / prop internal attributes: id, data-testid, className, sectionId,
  // data-*, key, htmlFor. These are internal DOM concerns.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*[:=]\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }
  // JSX attribute form: `data-testid={"..."}` or `id={"..."}`.
  if (
    /\b(data-testid|data-test|data-slot|sectionId|id|key|className|htmlFor)\s*=\s*\{\s*$/.test(
      trimmedPrefix,
    )
  ) {
    return true;
  }

  // Object literal shorthand for the above keys: `{ id: '...' }`,
  // `{ sectionId: '...' }`, `{ testId: '...' }`. We limit to cases where
  // the key is unambiguously an internal-identifier key.
  if (/\b(sectionId|testId|slotId|elementId|anchorId)\s*:\s*$/.test(trimmedPrefix)) return true;

  return false;
}

/**
 * Scans the content of a single file for banned terms in user-visible
 * string literals. Returns an array of hits with line number, matched
 * term, and the literal containing it.
 *
 * Lines wrapped in `// lexicon-allow-start` / `// lexicon-allow-end`
 * pragmas are excluded. Pure-comment lines (starting with `//` or `*`)
 * are also excluded so JSDoc mentioning a banned term is fine.
 */
function scanContent(content, pattern) {
  const lines = content.split('\n');
  const hits = [];
  let inAllowBlock = false;

  lines.forEach((line, idx) => {
    if (/\/\/\s*lexicon-allow-start/i.test(line)) {
      inAllowBlock = true;
      return;
    }
    if (/\/\/\s*lexicon-allow-end/i.test(line)) {
      inAllowBlock = false;
      return;
    }
    if (inAllowBlock) return;

    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

    // Fast-path: skip whole `import` / `export from` lines. The literal-by-
    // literal isInternalCallSite guard also catches these, but the shortcut
    // avoids scanning long module-re-export blocks.
    if (/^\s*(?:import|export)\s/.test(line) && /\bfrom\s+['"`]/.test(line)) return;

    const literals = extractStringLiterals(line);
    for (const { literal, start } of literals) {
      if (isInternalCallSite(line, start)) continue;
      const matches = literal.match(pattern);
      if (matches) {
        for (const m of matches) {
          hits.push({ line: idx + 1, term: m, literal });
        }
      }
    }
  });

  return hits;
}

module.exports = {
  DEFAULT_BANNED_TERMS,
  buildBannedPattern,
  extractStringLiterals,
  isInternalCallSite,
  scanContent,
};
