'use client';

import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { FAQCategory as FAQCategoryType, FAQItem } from '@/content/faq/types';
import { protocolFacts } from '@/content/protocol-facts';

import { useCopyFeedback } from '@/hooks/useCopyFeedback';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { PhrasedText } from '@/components/ui/phrased-text';

import {
  EXPLAINED_AD_HOC_KEYS,
  EXPLAINED_GLOSSARY_IDS,
  answerParagraphs,
  enrichAnswer,
  highlightMatches,
  matchesQuery,
  type AnswerTerm,
} from './answerText';
import { FAQ_SCROLL_MARGIN_CLASS } from './scrollMargin';

/** Contract identifiers the answers quote, set as code. */
const ANSWER_CODE = [protocolFacts.dynamicCstRewardFormula];

/**
 * An answer in its paragraphs, at the reading measure: with the search's
 * matches marked while searching, otherwise with its terms explained in
 * place (each once per answer) and contract identifiers set as code.
 */
function AnswerBody({
  answer,
  searchQuery,
  terms,
}: {
  answer: string;
  searchQuery: string;
  terms: readonly AnswerTerm[];
}) {
  const seen = new Set<string>();
  return (
    <div className="space-y-4">
      {answerParagraphs(answer).map((paragraph, index) => (
        <p key={index} className="type-prose text-muted-foreground">
          {searchQuery
            ? highlightMatches(paragraph, searchQuery)
            : enrichAnswer(paragraph, terms, ANSWER_CODE, seen)}
        </p>
      ))}
    </div>
  );
}

interface FAQCategoryProps {
  category: FAQCategoryType;
  searchQuery: string;
  expandedItems: string[];
  onItemToggle: (categoryId: string, itemId: string) => void;
  onExpandAll: (categoryId: string) => void;
}

/**
 * One FAQ category: its heading, an "Expand all" toggle and the questions as
 * a hairline-divided accordion. Every answer stays in the HTML, closed ones
 * `hidden="until-found"`, so crawlers and find-in-page still reach them;
 * a search opens every matching answer with the match marked, and the
 * reader can close them again until the query changes.
 * Answers keep a reading measure, explain coined terms in place from the
 * glossary and set contract identifiers as code.
 */
export const FAQCategorySection = forwardRef<HTMLElement, FAQCategoryProps>(
  function FAQCategorySection(
    { category, searchQuery, expandedItems, onItemToggle, onExpandAll },
    ref,
  ) {
    const t = useTranslations('faq');
    const tGlossary = useTranslations('glossary');
    // The shared copy action: an execCommand fallback, no unhandled
    // rejection, and a check only for a write that happened.
    const { copied, copy } = useCopyFeedback();
    const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
    const copiedId = copied ? copiedItemId : null;
    const query = searchQuery.trim();
    const searching = query.length > 0;
    // The answers a reader closed during a search, kept for that query only:
    // a new query opens every match again.
    const [searchClosed, setSearchClosed] = useState<{ query: string; ids: readonly string[] }>({
      query: '',
      ids: [],
    });

    const terms = useMemo<AnswerTerm[]>(
      () => [
        ...EXPLAINED_GLOSSARY_IDS.map((glossaryId) => ({
          term: tGlossary(`terms.${glossaryId}.term`),
          glossaryId,
        })),
        ...EXPLAINED_AD_HOC_KEYS.map((key) => ({
          term: t(`tooltips.${key}.term`),
          definition: t(`tooltips.${key}.content`),
        })),
      ],
      [t, tGlossary],
    );

    const filteredItems = useMemo(() => {
      if (!searching) return category.items;
      return category.items.filter(
        (item) => matchesQuery(item.question, query) || matchesQuery(item.answer, query),
      );
    }, [category.items, query, searching]);

    const copyLink = useCallback(
      (item: FAQItem) => {
        const anchor = item.hashAnchor || item.id;
        const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
        setCopiedItemId(item.id);
        void copy(url);
      },
      [copy],
    );

    if (filteredItems.length === 0) return null;

    // A match may sit in an answer only, so every matching answer opens with
    // the search; the reader can still close one.
    const closedForQuery = searchClosed.query === query ? searchClosed.ids : [];
    const openIds = searching
      ? filteredItems.map((item) => item.id).filter((id) => !closedForQuery.includes(id))
      : expandedItems.filter((id) => filteredItems.some((item) => item.id === id));
    const allExpanded = category.items.every((item) => expandedItems.includes(item.id));
    const headingId = `faq-cat-${category.id}`;
    const copiedHere = filteredItems.some((item) => item.id === copiedId);

    return (
      <section
        ref={ref}
        id={`faq-category-${category.id}`}
        aria-labelledby={headingId}
        className={FAQ_SCROLL_MARGIN_CLASS}
      >
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-4">
          <div className="min-w-0">
            <h2 id={headingId} className="type-section">
              {searching ? highlightMatches(category.title, searchQuery) : category.title}
            </h2>
            <p className="mt-1.5 type-body-sm text-muted-foreground">{category.description}</p>
          </div>
          {searching ? null : (
            // The label says what a press does next ("Collapse all") and names the
            // category, so six of them read apart; no aria-expanded to say it twice.
            // Its icon lines up with the content edge wherever the row puts it.
            <Button
              variant="quiet"
              size="sm"
              onClick={() => onExpandAll(category.id)}
              aria-label={t(allExpanded ? 'category.collapseAllAria' : 'category.expandAllAria', {
                category: category.title,
              })}
              className="-ml-3 sm:-mr-3 sm:ml-0"
            >
              <ChevronsUpDown aria-hidden />
              {allExpanded ? t('category.collapseAll') : t('category.expandAll')}
            </Button>
          )}
        </header>

        <Accordion
          type="multiple"
          value={openIds}
          onValueChange={(values) => {
            if (searching) {
              setSearchClosed({
                query,
                ids: filteredItems.map((item) => item.id).filter((id) => !values.includes(id)),
              });
              return;
            }
            const current = new Set(openIds);
            const next = new Set(values);
            for (const id of next) if (!current.has(id)) onItemToggle(category.id, id);
            for (const id of current) if (!next.has(id)) onItemToggle(category.id, id);
          }}
        >
          {filteredItems.map((item) => {
            const open = openIds.includes(item.id);
            return (
              <AccordionItem
                key={item.id}
                value={item.id}
                id={item.hashAnchor || item.id}
                className={cn(FAQ_SCROLL_MARGIN_CLASS, 'border-b border-rule-faint')}
              >
                <AccordionTrigger className="gap-6 py-5 text-start type-title text-foreground hover:no-underline hover:text-primary [&>svg]:size-5 [&>svg]:text-subtle">
                  {/* One flex item: a highlighted match stays inline in the question
                      (the trigger is a flex row) and in its accessible name. A
                      Chinese question keeps its ？ on the line of its last word. */}
                  <span className="min-w-0">
                    {searching ? (
                      highlightMatches(item.question, searchQuery)
                    ) : (
                      <PhrasedText>{item.question}</PhrasedText>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent hiddenUntilFound={!open} className="pb-6">
                  <AnswerBody
                    answer={item.answer}
                    searchQuery={searching ? searchQuery : ''}
                    terms={terms}
                  />
                  {/* Named after its question, so a list of buttons tells the links apart. */}
                  <button
                    type="button"
                    onClick={() => copyLink(item)}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-control type-caption text-subtle transition-colors duration-fast hover:text-foreground sm:min-h-8"
                    aria-label={t('category.copyLinkAria', { question: item.question })}
                  >
                    {copiedId === item.id ? (
                      <Check className="size-3.5 text-positive" aria-hidden />
                    ) : (
                      <Link2 className="size-3.5" aria-hidden />
                    )}
                    <span>
                      {copiedId === item.id ? t('category.copied') : t('category.copyLink')}
                    </span>
                  </button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {/* The confirmation is spoken from outside the button, whose name overrides its
            text; the region is always present, so the change is announced. */}
        <p role="status" className="sr-only" data-testid="faq-copy-status">
          {copiedHere ? t('category.linkCopied') : null}
        </p>
      </section>
    );
  },
);
