'use client';

import { ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { findFaqItemById } from '@/content/faq/lookup';
import type { FAQCategory, FAQContent, FAQItem } from '@/content/faq/types';

import { cn } from '@/lib/utils';

interface PopularQuestionsProps {
  /** The reader's locale's FAQ, from the page (the client never bundles another locale's). */
  content: FAQContent;
  onQuestionClick: (itemId: string, categoryId: string) => void;
  className?: string;
}

interface ResolvedPopular {
  item: FAQItem;
  category: FAQCategory;
}

function resolvePopular(content: FAQContent): ResolvedPopular[] {
  return content.popularQuestionIds.flatMap((id) => {
    const resolved = findFaqItemById(content, id);
    return resolved ? [resolved] : [];
  });
}

/**
 * The questions most readers start with, as an index: each row names the
 * question and its category, and jumps to the answer opened in place.
 */
export function PopularQuestions({ content, onQuestionClick, className }: PopularQuestionsProps) {
  const t = useTranslations('faq');
  const items = resolvePopular(content);

  return (
    <section aria-labelledby="popular-heading" className={cn('mb-12 sm:mb-16', className)}>
      <h2 id="popular-heading" className="mb-3 type-eyebrow text-subtle">
        {t('popular.heading')}
      </h2>
      <ul className="grid border-t border-rule sm:grid-cols-2 sm:gap-x-10">
        {items.map(({ item, category }) => (
          <li key={item.id} className="border-b border-rule-faint">
            <a
              href={`#${item.hashAnchor ?? item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onQuestionClick(item.id, category.id);
              }}
              className="group flex min-h-14 items-center justify-between gap-4 py-3"
            >
              <span className="min-w-0">
                <span className="block type-title text-foreground transition-colors duration-fast group-hover:text-primary">
                  {item.question}
                </span>
                <span className="mt-0.5 block type-caption text-subtle">{category.title}</span>
              </span>
              <ArrowDown
                aria-hidden
                className="size-4 shrink-0 text-subtle transition-transform duration-fast group-hover:translate-y-0.5 group-hover:text-foreground"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
