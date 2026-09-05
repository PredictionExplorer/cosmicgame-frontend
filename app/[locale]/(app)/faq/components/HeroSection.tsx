'use client';

import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InfoTooltip } from '@/components/ui/info-tooltip';

import { FAQSearch } from './FAQSearch';

interface HeroSectionProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
  totalCount: number;
  categoryCount: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const, delay: i * 0.1 },
  }),
};

export function HeroSection({
  searchValue,
  onSearchChange,
  resultCount,
  totalCount,
  categoryCount,
}: HeroSectionProps) {
  const t = useTranslations('faq');

  return (
    <section
      aria-labelledby="faq-hero-heading"
      className="relative border-b border-border pb-12 sm:pb-16"
    >
      <motion.div
        custom={0}
        variants={fadeUp}
        initial={false}
        animate="visible"
        className="mb-5 inline-flex items-center gap-2 type-eyebrow text-primary/80"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        {t('hero.badge')}
      </motion.div>

      <motion.h1
        id="faq-hero-heading"
        custom={1}
        variants={fadeUp}
        initial={false}
        animate="visible"
        className="relative max-w-4xl type-display-lg text-foreground"
      >
        {t('hero.titlePrefix')} <span className="text-primary">{t('hero.titleHighlight')}</span>
      </motion.h1>

      <motion.p
        custom={2}
        variants={fadeUp}
        initial={false}
        animate="visible"
        className="relative mt-5 max-w-2xl type-body-lg text-muted-foreground"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial={false}
        animate="visible"
        className="relative mt-8"
      >
        <FAQSearch
          value={searchValue}
          onChange={onSearchChange}
          resultCount={resultCount}
          totalCount={totalCount}
          className="mx-0"
        />
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial={false}
        animate="visible"
        className="relative mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
      >
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
      </motion.div>
    </section>
  );
}
