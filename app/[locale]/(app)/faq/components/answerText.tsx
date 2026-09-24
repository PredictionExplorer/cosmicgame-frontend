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

export function normalizeForMatch(value: string): string {
  return value.normalize('NFKC').toLocaleLowerCase();
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
  const byWord = new Map(sorted.map((entry) => [normalizeForMatch(entry.term), entry] as const));
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
      const normalized = normalizeForMatch(part);
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

/** The answer (or question) with every match of the search query marked. */
export function highlightMatches(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const normalizedQuery = normalizeForMatch(query);
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'giu'));
  return parts.map((part, index) =>
    normalizeForMatch(part) === normalizedQuery ? (
      <mark key={index} className="rounded-edge bg-primary/25 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
