/**
 * Lookup and matching for the command palette (components/layout/CommandPalette).
 * Pure and locale-agnostic: callers pass the localized labels in.
 */

/** A direct jump the query spells out: an address, a transaction, or a numbered record. */
export type JumpTarget =
  | { readonly kind: 'address'; readonly value: `0x${string}`; readonly path: string }
  | { readonly kind: 'transaction'; readonly value: `0x${string}` }
  | { readonly kind: 'token' | 'cycle' | 'gesture'; readonly value: number; readonly path: string };

const ADDRESS = /^0x[0-9a-f]{40}$/i;
const TRANSACTION = /^0x[0-9a-f]{64}$/i;
/** `25`, `#25`, `token 25`, `nft #25`, `cycle 3`, `gesture 1135`. */
const NUMBERED = /^(?:(token|nft|signature|cycle|gesture)\s*)?#?\s*(\d{1,9})$/i;

function numbered(kind: 'token' | 'cycle' | 'gesture', value: number): JumpTarget {
  const base = kind === 'token' ? '/detail' : kind === 'cycle' ? '/allocation' : '/gesture';
  return { kind, value, path: `${base}/${value}` };
}

/**
 * Reads a query as direct jumps, most likely first. A keyword picks one
 * kind; a bare number offers all three, since token ids, cycle numbers and
 * gesture ids overlap.
 */
export function parseJumpQuery(raw: string): readonly JumpTarget[] {
  const query = raw.trim();
  if (!query) return [];
  if (ADDRESS.test(query)) {
    return [{ kind: 'address', value: query as `0x${string}`, path: `/user/${query}` }];
  }
  if (TRANSACTION.test(query)) return [{ kind: 'transaction', value: query as `0x${string}` }];

  const match = NUMBERED.exec(query);
  if (!match) return [];
  const value = Number(match[2]);
  const keyword = match[1]?.toLowerCase();
  if (keyword === 'cycle') return [numbered('cycle', value)];
  if (keyword === 'gesture') return [numbered('gesture', value)];
  if (keyword) return [numbered('token', value)];
  return [numbered('token', value), numbered('cycle', value), numbered('gesture', value)];
}

/**
 * Folds case, width and diacritics so "thong ke" finds "Thống kê" and a
 * full-width query finds its ASCII label.
 */
export function foldForSearch(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').replace(/đ/gi, 'd').toLowerCase().trim();
}

export interface SearchEntry {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  /** Extra text that should match but is not shown: the section title, the path. */
  readonly keywords: readonly string[];
}

function scoreEntry(entry: SearchEntry, terms: readonly string[], phrase: string): number {
  const label = foldForSearch(entry.label);
  const description = foldForSearch(entry.description);
  const keywords = entry.keywords.map(foldForSearch).join(' ');
  let score = 0;
  if (label === phrase) score += 200;
  else if (label.startsWith(phrase)) score += 120;
  for (const term of terms) {
    if (label.split(/[\s/:：、,-]+/).some((word) => word.startsWith(term))) score += 40;
    else if (label.includes(term)) score += 25;
    else if (keywords.includes(term)) score += 12;
    else if (description.includes(term)) score += 6;
    else return 0;
  }
  return score;
}

/**
 * Entries matching every term of the query, best first; ties keep their
 * original (taxonomy) order. An empty query returns every entry.
 */
export function searchEntries<T extends SearchEntry>(entries: readonly T[], raw: string): T[] {
  const phrase = foldForSearch(raw);
  if (!phrase) return [...entries];
  const terms = phrase.split(/\s+/).filter(Boolean);
  return entries
    .map((entry, index) => ({ entry, index, score: scoreEntry(entry, terms, phrase) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((candidate) => candidate.entry);
}
