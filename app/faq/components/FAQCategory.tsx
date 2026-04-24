'use client';

import { forwardRef, Fragment, useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronsUpDown, Link2 } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { type FAQCategory as FAQCategoryType, type FAQItem } from '../data/faq-data';

const tooltipTerms: Record<string, string> = {
  'Endurance Champion':
    'A special title given to the participant who held the most-recent-gesture position for the longest uninterrupted interval within a Performance Cycle.',
  'Chrono Warrior':
    'An even rarer title \u2014 the participant who held the Endurance Champion position for the longest consecutive interval.',
  'Chrono-Warrior':
    'An even rarer title \u2014 the participant who held the Endurance Champion position for the longest consecutive interval.',
  'Calibration Window':
    'A price-discovery window where Gesture Cost starts high and descends over time from the Calibration Ceiling toward the Calibration Floor. The longer you wait, the lower the cost.',
  'Cosmic Council':
    'The on-chain coordination body where CST holders submit Coordination Proposals and express Support or Opposition \u2014 for example, selecting the Public Goods Beneficiary that receives each cycle\u2019s public-goods allocation.',
  CST: 'Cosmic Signature Tokens \u2014 the ERC-20 token imprinted with every gesture. Used on the Cosmic Council and as alternative gesture currency.',
  'ERC-20': 'A widely used Ethereum token standard for fungible (interchangeable) tokens.',
  'ERC-721':
    'The Ethereum token standard for non-fungible tokens (NFTs) \u2014 each token is unique.',
  'Layer 2':
    "A secondary protocol built on top of Ethereum that processes transactions faster and cheaper while inheriting Ethereum's security.",
  rollup:
    'A Layer 2 technique that bundles ("rolls up") many transactions into one, dramatically reducing costs while keeping Ethereum-level security.',
  RandomWalkNFT:
    'A sister NFT collection. Attaching one to your gesture grants a one-time 50% Gesture-Cost reduction.',
  'renounceOwnership()':
    "A smart contract function that permanently gives up the team's ability to change protocol parameters \u2014 making the rules immutable.",
};

function enrichWithTooltips(text: string): React.ReactNode[] {
  const sortedTerms = Object.keys(tooltipTerms).sort((a, b) => b.length - a.length);
  const pattern = new RegExp(
    `(${sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'g',
  );

  const parts = text.split(pattern);
  const seen = new Set<string>();

  return parts.map((part, i) => {
    const normalizedKey = Object.keys(tooltipTerms).find(
      (k) => k.toLowerCase() === part.toLowerCase(),
    );
    if (normalizedKey && tooltipTerms[normalizedKey] && !seen.has(normalizedKey.toLowerCase())) {
      seen.add(normalizedKey.toLowerCase());
      return (
        <Fragment key={i}>
          <span className="font-medium text-foreground">{part}</span>
          <InfoTooltip content={tooltipTerms[normalizedKey]} side="top" maxWidth={280} />
        </Fragment>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function highlightSearch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
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
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const Icon = category.icon;
    const allExpanded = category.items.every((item) => expandedItems.includes(item.id));

    const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return category.items;
      const q = searchQuery.toLowerCase();
      return category.items.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q),
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
            aria-label={allExpanded ? 'Collapse all questions' : 'Expand all questions'}
          >
            <ChevronsUpDown className="h-3.5 w-3.5" />
            {allExpanded ? 'Collapse All' : 'Expand All'}
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
              <AccordionContent className="pb-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {searchQuery
                    ? highlightSearch(item.answer, searchQuery)
                    : enrichWithTooltips(item.answer)}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyLink(item);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 transition-colors hover:text-primary"
                  aria-label="Copy link to this question"
                >
                  <Link2 className="h-3 w-3" />
                  {copiedId === item.id ? 'Copied!' : 'Copy link'}
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.section>
    );
  },
);
