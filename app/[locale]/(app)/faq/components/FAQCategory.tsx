'use client';

import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type FAQCategory as FAQCategoryType, type FAQItem } from '@/content/faq';
import { protocolFacts } from '@/content/protocol-facts';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

import {
  EXPLAINED_AD_HOC_KEYS,
  EXPLAINED_GLOSSARY_IDS,
  enrichAnswer,
  highlightMatches,
  normalizeForMatch,
  type AnswerTerm,
} from './answerText';

/** Contract identifiers the answers quote, set as code. */
const ANSWER_CODE = [protocolFacts.dynamicCstRewardFormula];

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
    const [copiedId, setCopiedId] = useState<string | null>(null);
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
      const q = normalizeForMatch(query);
      return category.items.filter(
        (item) =>
          normalizeForMatch(item.question).includes(q) ||
          normalizeForMatch(item.answer).includes(q),
      );
    }, [category.items, query, searching]);

    const copyLink = useCallback((item: FAQItem) => {
      const anchor = item.hashAnchor || item.id;
      const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
      void navigator.clipboard.writeText(url).then(() => {
        setCopiedId(item.id);
        window.setTimeout(() => setCopiedId(null), 2000);
      });
    }, []);

    if (filteredItems.length === 0) return null;

    // A match may sit in an answer only, so every matching answer opens with
    // the search; the reader can still close one.
    const closedForQuery = searchClosed.query === query ? searchClosed.ids : [];
    const openIds = searching
      ? filteredItems.map((item) => item.id).filter((id) => !closedForQuery.includes(id))
      : expandedItems.filter((id) => filteredItems.some((item) => item.id === id));
    const allExpanded = category.items.every((item) => expandedItems.includes(item.id));
    const headingId = `faq-cat-${category.id}`;

    return (
      <section
        ref={ref}
        id={`faq-category-${category.id}`}
        aria-labelledby={headingId}
        className="scroll-mt-[calc(var(--header-height)+4.5rem)] lg:scroll-mt-[var(--sticky-offset)]"
      >
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-rule pb-4">
          <div className="min-w-0">
            <h2 id={headingId} className="type-section">
              {searching ? highlightMatches(category.title, searchQuery) : category.title}
            </h2>
            <p className="mt-1.5 type-body-sm text-muted-foreground">{category.description}</p>
          </div>
          {searching ? null : (
            <Button
              variant="quiet"
              size="sm"
              onClick={() => onExpandAll(category.id)}
              aria-label={allExpanded ? t('category.collapseAllAria') : t('category.expandAllAria')}
              aria-expanded={allExpanded}
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
                className="scroll-mt-[calc(var(--header-height)+4.5rem)] border-b border-rule-faint lg:scroll-mt-[var(--sticky-offset)]"
              >
                <AccordionTrigger className="gap-6 py-5 text-start type-title text-foreground hover:no-underline hover:text-primary [&>svg]:size-5 [&>svg]:text-subtle">
                  {/* One flex item: a highlighted match stays inline in the question
                      (the trigger is a flex row) and in its accessible name. */}
                  <span className="min-w-0">
                    {searching ? highlightMatches(item.question, searchQuery) : item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent hiddenUntilFound={!open} className="pb-6">
                  <p className="type-prose text-muted-foreground">
                    {searching
                      ? highlightMatches(item.answer, searchQuery)
                      : enrichAnswer(item.answer, terms, ANSWER_CODE)}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyLink(item)}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-control type-caption text-subtle transition-colors duration-fast hover:text-foreground sm:min-h-8"
                    aria-label={t('category.copyLinkAria')}
                  >
                    {copiedId === item.id ? (
                      <Check className="size-3.5 text-positive" aria-hidden />
                    ) : (
                      <Link2 className="size-3.5" aria-hidden />
                    )}
                    <span aria-live="polite">
                      {copiedId === item.id ? t('category.copied') : t('category.copyLink')}
                    </span>
                  </button>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>
    );
  },
);
