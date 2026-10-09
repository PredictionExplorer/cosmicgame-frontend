/**
 * Lookup and matching for the command palette (components/layout/CommandPalette).
 * Pure: callers pass the localized labels in, and the jump keywords come from
 * a `LocaleRecord`.
 */
import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

type NumberedKind = 'token' | 'cycle' | 'gesture';

/** A direct jump the query spells out: an address, a transaction, or a numbered record. */
export type JumpTarget =
  | { readonly kind: 'address'; readonly value: `0x${string}`; readonly path: string }
  | { readonly kind: 'transaction'; readonly value: `0x${string}` }
  | { readonly kind: NumberedKind; readonly value: number; readonly path: string };

/** The words that name a numbered record before (or after) its number. */
export type JumpKeywords = Readonly<Record<NumberedKind, readonly string[]>>;

/**
 * Per-locale jump keywords, in each locale's glossary terms (the placeholder
 * invites "cycle", "サイクル", "цикл" …). English always works as well, so a
 * visitor can type "cycle 3" in any language.
 */
export const JUMP_KEYWORDS: LocaleRecord<JumpKeywords> = {
  en: { token: ['token', 'nft', 'signature'], cycle: ['cycle'], gesture: ['gesture'] },
  zh: { token: ['代币', '签名作品', '签名'], cycle: ['周期'], gesture: ['落笔'] },
  'zh-TW': { token: ['代幣', '簽名作品', '簽名'], cycle: ['週期'], gesture: ['落筆'] },
  'zh-HK': { token: ['代幣', '簽名作品', '簽名'], cycle: ['週期'], gesture: ['落筆'] },
  uk: { token: ['токен', 'сигнатура'], cycle: ['цикл'], gesture: ['жест'] },
  ko: { token: ['토큰', '시그니처'], cycle: ['사이클'], gesture: ['제스처'] },
  ja: { token: ['トークン', 'シグネチャー'], cycle: ['サイクル'], gesture: ['一筆'] },
  vi: { token: ['signature'], cycle: ['chu kỳ'], gesture: ['nét bút'] },
};

/** The locale's jump keywords plus the English ones. */
export function jumpKeywordsFor(locale: string): JumpKeywords {
  const local = pickByLocale(JUMP_KEYWORDS, locale);
  const merge = (kind: NumberedKind) => [...new Set([...JUMP_KEYWORDS.en[kind], ...local[kind]])];
  return { token: merge('token'), cycle: merge('cycle'), gesture: merge('gesture') };
}

const ADDRESS = /^0x[0-9a-f]{40}$/i;
const TRANSACTION = /^0x[0-9a-f]{64}$/i;
/**
 * A number with at most one word around it, after folding: `25`, `#25`,
 * `token 25`, `cycle #3`, `gesture id 1135`, `サイクル3`, `3 周期`.
 */
const NUMBERED = /^(\D*?)\s*#?\s*(\d{1,9})\s*(\D*)$/u;
/** "ID" after a keyword: "gesture ID 1135", "落笔 ID 1135", "一筆ID". */
const TRAILING_ID = /\s*id$/u;

function numbered(kind: NumberedKind, value: number): JumpTarget {
  const base = kind === 'token' ? '/detail' : kind === 'cycle' ? '/allocation' : '/gesture';
  return { kind, value, path: `${base}/${value}` };
}

function keywordKind(word: string, keywords: JumpKeywords): NumberedKind | null {
  const bare = word.replace(TRAILING_ID, '').trim();
  for (const kind of ['cycle', 'gesture', 'token'] as const) {
    if (keywords[kind].some((keyword) => foldForSearch(keyword) === bare)) return kind;
  }
  return null;
}

/**
 * Reads a query as direct jumps, most likely first. A keyword picks one
 * kind; a bare number offers all three, since token ids, cycle numbers and
 * gesture ids overlap. Pass `jumpKeywordsFor(locale)` so the locale's own
 * keywords work too; English is the default.
 */
export function parseJumpQuery(
  raw: string,
  keywords: JumpKeywords = JUMP_KEYWORDS.en,
): readonly JumpTarget[] {
  const query = raw.trim();
  if (!query) return [];
  if (ADDRESS.test(query)) {
    return [{ kind: 'address', value: query as `0x${string}`, path: `/user/${query}` }];
  }
  if (TRANSACTION.test(query)) return [{ kind: 'transaction', value: query as `0x${string}` }];

  const match = NUMBERED.exec(foldForSearch(query));
  if (!match) return [];
  const value = Number(match[2]);
  const before = (match[1] ?? '').trim();
  const after = (match[3] ?? '').trim();
  if (before && after) return [];
  const word = before || after;
  if (!word) {
    return [numbered('token', value), numbered('cycle', value), numbered('gesture', value)];
  }
  const kind = keywordKind(word, keywords);
  return kind ? [numbered(kind, value)] : [];
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
