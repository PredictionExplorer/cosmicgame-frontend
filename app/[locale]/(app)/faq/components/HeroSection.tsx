'use client';

import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { GradientText } from '@/components/styled';
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
      className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.08),rgb(var(--nebula-violet-rgb)/0.08)_44%,rgb(var(--chrono-rose-rgb)/0.05))] px-5 py-12 text-center shadow-[0_24px_100px_-76px_rgb(var(--aurora-cyan-rgb)/0.85)] backdrop-blur sm:px-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-12 h-64 w-64 rounded-full opacity-40 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--aurora-cyan-rgb) / 0.22), transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--nebula-violet-rgb) / 0.25), transparent 70%)',
        }}
      />
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-medium text-primary"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        {t('hero.badge')}
      </motion.div>

      <motion.h1
        id="faq-hero-heading"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative font-display text-3xl font-bold tracking-tight md:text-5xl"
      >
        {t('hero.titlePrefix')} <GradientText>{t('hero.titleHighlight')}</GradientText>
      </motion.h1>

      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative mx-auto mt-4 max-w-lg text-base text-muted-foreground"
      >
        {t('hero.subtitle')}
      </motion.p>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative mt-8"
      >
        <FAQSearch
          value={searchValue}
          onChange={onSearchChange}
          resultCount={resultCount}
          totalCount={totalCount}
        />
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative mx-auto mt-8 flex max-w-md items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-10"
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
