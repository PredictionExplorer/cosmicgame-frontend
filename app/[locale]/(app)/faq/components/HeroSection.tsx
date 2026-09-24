'use client';

import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';

import { FAQSearch } from './FAQSearch';

interface HeroSectionProps {
  searchValue: string;
  /** The query the results were computed for (the debounced field value). */
  activeQuery?: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  categoryCount: number;
}

/**
 * The FAQ header: the reading-page H1 (one plain string per locale, so the
 * server HTML carries the title as one text node), the lede, how many
 * answers there are, and the page's own search.
 */
export function HeroSection({
  searchValue,
  activeQuery,
  onSearchChange,
  resultCount,
  totalCount,
  categoryCount,
}: HeroSectionProps) {
  const t = useTranslations('faq');

  return (
    <PageHeader
      variant="reading"
      section="learn"
      titleId="faq-hero-heading"
      title={t('hero.title')}
      subtitle={t('hero.subtitle')}
      meta={
        <span>
          {t('hero.answerCount', { count: totalCount })}
          <span aria-hidden>{' · '}</span>
          {t('hero.categoryCount', { count: categoryCount })}
        </span>
      }
    >
      <FAQSearch
        value={searchValue}
        activeQuery={activeQuery}
        onChange={onSearchChange}
        resultCount={resultCount}
        totalCount={totalCount}
        className="mt-6 sm:mt-8"
      />
    </PageHeader>
  );
}
