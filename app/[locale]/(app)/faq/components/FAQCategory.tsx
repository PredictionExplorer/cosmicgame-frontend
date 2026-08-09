'use client';

import { forwardRef, Fragment, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronsUpDown, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { type FAQCategory as FAQCategoryType, type FAQItem } from '@/content/faq';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { FAQ_ICONS } from './faqIcons';

const TOOLTIP_KEYS = [
  'enduranceChampion',
  'chronoWarrior',
  'calibrationWindow',
  'cosmicCouncil',
  'cst',
  'erc20',
  'erc721',
  'layer2',
  'rollup',
  'randomWalkNft',
  'renounceOwnership',
] as const;

interface TooltipTerm {
  term: string;
  content: string;
}

function normalizeForMatch(value: string): string {
  return value.normalize('NFKC').toLowerCase();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function enrichWithTooltips(
  text: string,
  tooltipTerms: readonly TooltipTerm[],
): React.ReactNode[] {
  const sortedTerms = tooltipTerms
    .filter(({ term }) => term.length > 0)
    .sort((a, b) => b.term.length - a.term.length);
  if (sortedTerms.length === 0) return [text];

  const pattern = new RegExp(
    `(${sortedTerms.map(({ term }) => escapeRegExp(term)).join('|')})`,
    'giu',
  );
  const parts = text.split(pattern);
  const termsByNormalizedValue = new Map(
    sortedTerms.map((entry) => [normalizeForMatch(entry.term), entry] as const),
  );
  const seen = new Set<string>();

  return parts.map((part, i) => {
    const normalizedPart = normalizeForMatch(part);
    const matchedTerm = termsByNormalizedValue.get(normalizedPart);
    if (matchedTerm && !seen.has(normalizedPart)) {
      seen.add(normalizedPart);
      return (
        <Fragment key={i}>
          <span className="font-medium text-foreground">{part}</span>
          <InfoTooltip content={matchedTerm.content} side="top" maxWidth={280} />
        </Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function highlightSearch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'giu');
  const normalizedQuery = normalizeForMatch(query);
  const parts = text.split(regex);
  return parts.map((part, i) =>
    normalizeForMatch(part) === normalizedQuery ? (
      <mark key={i} className="rounded-sm bg-primary/25 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

interface FAQCategoryProps {
  category: FAQCategoryType;
  searchQuery: string;
  expandedItems: string[];
  onItemToggle: (categoryId: string, itemId: string) => void;
  onExpandAll: (categoryId: string) => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export const FAQCategorySection = forwardRef<HTMLElement, FAQCategoryProps>(
  function FAQCategorySection(
    { category, searchQuery, expandedItems, onItemToggle, onExpandAll },
    ref,
  ) {
    const t = useTranslations('faq');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const Icon = FAQ_ICONS[category.icon];
    const allExpanded = category.items.every((item) => expandedItems.includes(item.id));
    const tooltipTerms = useMemo(
      () =>
        TOOLTIP_KEYS.map((key) => ({
          term: t(`tooltips.${key}.term`),
          content: t(`tooltips.${key}.content`),
        })),
      [t],
    );

    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return category.items;
      const q = normalizeForMatch(searchQuery);
      return category.items.filter(
        (item) =>
          normalizeForMatch(item.question).includes(q) ||
          normalizeForMatch(item.answer).includes(q),
      );
    }, [category.items, searchQuery]);

    const copyLink = useCallback((item: FAQItem) => {
      const anchor = item.hashAnchor || item.id;
      const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2000);
      });
    }, []);

    if (filteredItems.length === 0) return null;

    const accordionValue = expandedItems.filter((id) =>
      filteredItems.some((item) => item.id === id),
    );

    return (
      <motion.section
        ref={ref}
        id={`faq-category-${category.id}`}
        aria-labelledby={`faq-cat-${category.id}`}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        className="scroll-mt-40"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2
                id={`faq-cat-${category.id}`}
                className="font-display text-lg font-bold tracking-tight sm:text-xl"
              >
                {searchQuery ? highlightSearch(category.title, searchQuery) : category.title}
              </h2>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <button
            onClick={() => onExpandAll(category.id)}
            className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground sm:inline-flex"
            aria-label={allExpanded ? t('category.collapseAllAria') : t('category.expandAllAria')}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {allExpanded ? t('category.collapseAll') : t('category.expandAll')}
          </button>
        </div>

        <Accordion
          type="multiple"
          value={accordionValue}
          onValueChange={(values) => {
            const currentIds = new Set(accordionValue);
            const newIds = new Set(values);

            for (const id of newIds) {
              if (!currentIds.has(id)) onItemToggle(category.id, id);
            }
            for (const id of currentIds) {
              if (!newIds.has(id)) onItemToggle(category.id, id);
            }
          }}
          className="space-y-2"
        >
          {filteredItems.map((item) => (
            <AccordionItem
              key={item.id}
              value={item.id}
              id={item.hashAnchor || item.id}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.015] px-5 transition-colors data-[state=open]:border-primary/20 data-[state=open]:bg-white/[0.03]"
            >
              <AccordionTrigger className="py-4 text-left text-[15px] font-semibold leading-snug hover:no-underline sm:text-base [&>svg]:text-muted-foreground/40">
                {searchQuery ? highlightSearch(item.question, searchQuery) : item.question}
              </AccordionTrigger>
              <AccordionContent forceMount className="pb-5">
                {/* Several answers embed contract identifiers such as
                    `mainPrizeTimeIncrementInMicroSeconds`, which are wider than
                    a phone screen on their own. */}
                <p className="break-words text-sm leading-relaxed text-muted-foreground">
                  {searchQuery
                    ? highlightSearch(item.answer, searchQuery)
                    : enrichWithTooltips(item.answer, tooltipTerms)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyLink(item);
                  }}
                  className="-mx-2 mt-1 inline-flex min-h-11 items-center gap-1.5 px-2 text-xs text-muted-foreground/50 transition-colors hover:text-primary sm:mx-0 sm:mt-3 sm:min-h-0 sm:px-0"
                  aria-label={t('category.copyLinkAria')}
                >
                  <Link2 className="h-3 w-3" />
                  {copiedId === item.id ? t('category.copied') : t('category.copyLink')}
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    );
  },
);
