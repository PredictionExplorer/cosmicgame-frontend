'use client';

import type * as React from 'react';
import { useTranslations } from 'next-intl';

import type { GlossaryTermId } from '@/lib/glossary';
import { ExplainedTerm, type ExplainedTermProps } from '@/components/ui/explain-popover';

export interface TermProps extends Omit<
  ExplainedTermProps,
  'definition' | 'details' | 'title' | 'children'
> {
  /** The glossary entry: its word, short and long definition come from glossary.json. */
  id: GlossaryTermId;
  /** The word as it reads in the sentence (plural, inflected). Defaults to the glossary term. */
  children?: React.ReactNode;
}

/**
 * Term — a coined word that explains itself from the glossary
 * (`messages/<locale>/glossary.json`, ids in `lib/glossary`).
 *
 * The word keeps its place in the sentence, marked by a dotted underline,
 * and is the only tab stop: hovering it shows the short definition, and a
 * click, tap, Enter or Space pins a card with the long one. It replaces a
 * word followed by an ⓘ icon, which doubled the tab stops and broke the
 * reading line. The trigger is an inline span, so a long term wraps with
 * the sentence.
 *
 *   <Term id="calibrationWindow" />
 *   <Term id="stellarSelection">Stellar Selections</Term>
 *
 * The glossary is not part of the app chrome: a page that renders `<Term>`
 * declares `'glossary'` in its `<PageMessages namespaces>` (the i18n scoping
 * test fails until it does). For a word outside the glossary, use
 * `<ExplainedTerm definition>` from components/ui/explain-popover.
 */
export function Term({ id, children, ...rest }: TermProps) {
  const t = useTranslations('glossary');
  const word = t(`terms.${id}.term`);

  return (
    <ExplainedTerm
      {...rest}
      data-term={id}
      title={word}
      definition={t(`terms.${id}.short`)}
      details={t(`terms.${id}.long`)}
    >
      {children ?? word}
    </ExplainedTerm>
  );
}
