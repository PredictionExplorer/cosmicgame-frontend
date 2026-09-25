import { Fragment, type ReactNode } from 'react';

import type { GlossaryTermId } from '@/lib/glossary';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Term } from '@/components/ui/term';

/** A word an answer explains in place: a glossary term, or an ad hoc one with its definition. */
export type AnswerTerm =
  | { term: string; glossaryId: GlossaryTermId }
  | { term: string; definition: string };

/**
 * The coined terms an FAQ answer explains through the glossary. The everyday
 * ones (gesture, cycle, retrieve, imprint) are left plain: every answer uses
 * them, and underlining each would break the reading line.
 */
export const EXPLAINED_GLOSSARY_IDS = [
  'cycleFinalizationTime',
  'calibrationWindow',
  'cycleReserve',
  'signatureAllocation',
  'finalCstGesture',
  'enduranceChampion',
  'chronoWarrior',
  'stellarSelection',
  'anchoring',
  'anchorDistribution',
  'publicGoods',
  'outreachReserve',
  'cosmicCouncil',
  'cst',
] as const satisfies readonly GlossaryTermId[];

/** Ad hoc words (standards and chain vocabulary) the FAQ explains under `faq.tooltips`. */
export const EXPLAINED_AD_HOC_KEYS = [
  'erc20',
  'erc721',
  'layer2',
  'rollup',
  'randomWalkNft',
  'renounceOwnership',
] as const;

/**
 * What a reader types differently from the copy. The copy sets typographic
 * quotes and apostrophes (don’t, «ціна»); a keyboard types straight ones.
 * Joiners and soft hyphens (authored phrase breaks) are invisible, so a
 * query never has to match them.
 */
const TYPED_EQUIVALENT: Readonly<Record<string, string>> = {
  '‘': "'",
  '’': "'",
  '‚': "'",
  '‛': "'",
  '′': "'",
  '“': '"',
  '”': '"',
  '„': '"',
  '‟': '"',
  '″': '"',
  '«': '"',
  '»': '"',
  '​': '',
  '⁠': '',
  '­': '',
};

/** One character as a search compares it: its typed form, compatibility-folded, lower case. */
function foldCharacter(character: string): string {
  return TYPED_EQUIVALENT[character] ?? character.normalize('NFKC').toLocaleLowerCase();
}

/**
 * Text folded for search, with where each folded unit came from: `starts[i]`
 * and `ends[i]` bound the source character behind folded unit `i`, so a
 * match in the folded text maps back onto the text as written.
 */
function foldWithSource(value: string): {
  source: string;
  folded: string;
  starts: number[];
  ends: number[];
} {
  // Composed first, so a typed "e" + combining accent meets the copy's "é".
  const source = value.normalize('NFC');
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let offset = 0;
  for (const character of source) {
    const unit = foldCharacter(character);
    for (let index = 0; index < unit.length; index += 1) {
      starts.push(offset);
      ends.push(offset + character.length);
    }
    folded += unit;
    offset += character.length;
  }
  return { source, folded, starts, ends };
}

/**
 * Text as the FAQ search compares it: composed (NFC), compatibility forms
 * folded (NFKC: full-width ＣＳＴ is CST, a no-break space a space), lower
 * case, and typographic quotes and apostrophes as typed. Every layer of the
 * search (which questions match, the count, the highlight) folds through
 * this one function, so they never disagree.
 */
export function foldForMatch(value: string): string {
  return foldWithSource(value).folded;
}

/** Whether `text` contains the search `query` (both folded); an empty query matches nothing. */
export function matchesQuery(text: string, query: string): boolean {
  const needle = foldForMatch(query.trim());
  return needle.length > 0 && foldForMatch(text).includes(needle);
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Scripts that separate words with spaces and change letters inside a word (Latin, Cyrillic). */
const SPACED_LETTER = /[A-Za-zÀ-ɏḀ-ỿЀ-ӿ]/;

/**
 * The pattern for one term. In a spaced alphabet a term must stand as a
 * whole word ("CST" is not the start of "CSTs"); in Han, Kana and Hangul a
 * term sits between other letters, so it matches as a substring.
 */
function termPattern(term: string): string {
  const escaped = escapeRegExp(term);
  const before = SPACED_LETTER.test(term[0] ?? '') ? '(?<![\\p{L}\\p{N}])' : '';
  const after = SPACED_LETTER.test(term.at(-1) ?? '') ? '(?![\\p{L}\\p{N}])' : '';
  return `${before}${escaped}${after}`;
}

/**
 * An answer as a reader sees it: each explained term marked once, at its
 * first use, as a dotted-underline trigger that opens its definition
 * (glossary terms through `<Term>`, so the FAQ and the glossary never
 * disagree), and contract identifiers (`code`) set as code.
 */
export function enrichAnswer(
  text: string,
  terms: readonly AnswerTerm[],
  code: readonly string[] = [],
): ReactNode[] {
  const codeParts = code.filter(Boolean);
  const segments = codeParts.length
    ? text.split(new RegExp(`(${codeParts.map(escapeRegExp).join('|')})`, 'u'))
    : [text];
  const sorted = terms
    .filter(({ term }) => term.length > 0)
    .sort((a, b) => b.term.length - a.term.length);
  const byWord = new Map(sorted.map((entry) => [foldForMatch(entry.term), entry] as const));
  const pattern = sorted.length
    ? new RegExp(`(${sorted.map(({ term }) => termPattern(term)).join('|')})`, 'giu')
    : null;
  const seen = new Set<string>();

  return segments.flatMap((segment, segmentIndex) => {
    if (codeParts.includes(segment)) {
      return [
        <code
          key={`code-${segmentIndex}`}
          className="rounded-edge bg-surface-sunken px-1.5 py-0.5 type-hash text-foreground"
        >
          {segment}
        </code>,
      ];
    }
    if (!pattern) return [<Fragment key={segmentIndex}>{segment}</Fragment>];
    return segment.split(pattern).map((part, partIndex) => {
      const key = `${segmentIndex}-${partIndex}`;
      const normalized = foldForMatch(part);
      const entry = byWord.get(normalized);
      if (!entry || seen.has(normalized)) return <Fragment key={key}>{part}</Fragment>;
      seen.add(normalized);
      return 'glossaryId' in entry ? (
        <Term key={key} id={entry.glossaryId}>
          {part}
        </Term>
      ) : (
        <ExplainedTerm key={key} definition={entry.definition} title={entry.term}>
          {part}
        </ExplainedTerm>
      );
    });
  });
}

/**
 * The answer (or question) with every match of the search query marked,
 * found the way `matchesQuery` finds it: a typed "don't" marks the copy's
 * "don’t", a full-width "ＣＳＴ" marks "CST".
 */
export function highlightMatches(text: string, query: string): ReactNode {
  const needle = foldForMatch(query.trim());
  if (!needle) return text;
  const { source, folded, starts, ends } = foldWithSource(text);
  const parts: ReactNode[] = [];
  let cursor = 0;
  let from = 0;
  for (let at = folded.indexOf(needle); at !== -1; at = folded.indexOf(needle, from)) {
    const start = starts[at] ?? cursor;
    const end = ends[at + needle.length - 1] ?? start;
    from = at + needle.length;
    if (start < cursor) continue;
    if (start > cursor) parts.push(source.slice(cursor, start));
    parts.push(
      <mark key={start} className="rounded-edge bg-primary/25 px-0.5 text-foreground">
        {source.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }
  if (parts.length === 0) return text;
  if (cursor < source.length) parts.push(source.slice(cursor));
  return parts;
}
