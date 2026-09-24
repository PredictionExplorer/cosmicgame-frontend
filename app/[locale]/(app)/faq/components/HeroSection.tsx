'use client';

import { HelpCircle, BookOpen, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PageHeader } from '@/components/layout/PageHeader';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { FAQSearch } from './FAQSearch';

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  categoryCount: number;
}

export function HeroSection({
  searchValue,
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
      // One rich message per locale: each language sets its own spacing and word order.
      title={t.rich('hero.title', {
        accent: (chunks) => <span className="text-primary">{chunks}</span>,
      })}
      subtitle={t('hero.subtitle')}
    >
      <div className="mt-7 sm:mt-8">
        <FAQSearch
          value={searchValue}
          onChange={onSearchChange}
          resultCount={resultCount}
          totalCount={totalCount}
          className="mx-0"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>{t('hero.answerCount', { count: totalCount })}</span>
          <InfoTooltip content={t('hero.answerCountTooltip')} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
            <Layers className="h-3.5 w-3.5 text-accent" />
          </div>
          <span>{t('hero.categoryCount', { count: categoryCount })}</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>{t('hero.alwaysUpdated')}</span>
        </div>
      </div>
    </PageHeader>
  );
}
