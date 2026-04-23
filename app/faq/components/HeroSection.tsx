'use client';

import { motion } from 'framer-motion';
import { HelpCircle, BookOpen, Layers } from 'lucide-react';

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
  return (
    <section aria-labelledby="faq-hero-heading" className="pb-10 text-center">
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-xs font-medium text-primary"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        Knowledge Base
      </motion.div>

      <motion.h1
        id="faq-hero-heading"
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="font-display text-3xl font-bold tracking-tight md:text-5xl"
      >
        Frequently Asked <GradientText>Questions</GradientText>
      </motion.h1>

      <motion.p
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-4 max-w-lg text-base text-muted-foreground"
      >
        Everything you need to know about Cosmic Signature — from getting started to advanced
        protocol mechanics.
      </motion.p>

      <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="mt-8">
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
        className="mx-auto mt-8 flex max-w-md items-center justify-center gap-6 text-sm text-muted-foreground sm:gap-10"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>{totalCount}+ Answers</span>
          <InfoTooltip content="Comprehensive answers covering every aspect of Cosmic Signature." />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10">
            <Layers className="h-3.5 w-3.5 text-accent" />
          </div>
          <span>{categoryCount} Categories</span>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <span>Always Updated</span>
        </div>
      </motion.div>
    </section>
  );
}
