'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  faqContentEn,
  type FAQCategory,
  type FAQContent,
  type FAQItem,
  findFaqItemById,
} from '@/content/faq';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { FAQ_ICONS } from './faqIcons';

interface PopularQuestionsProps {
  content?: FAQContent;
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

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function PopularQuestions({
  content = faqContentEn,
  onQuestionClick,
  className,
}: PopularQuestionsProps) {
  const t = useTranslations('faq');
  const items = resolvePopular(content);

  return (
    <section aria-labelledby="popular-heading" className={cn('py-8', className)}>
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2
          id="popular-heading"
          className="text-sm font-medium uppercase tracking-wider text-muted-foreground"
        >
          {t('popular.heading')}
        </h2>
        <InfoTooltip content={t('popular.tooltip')} />
      </div>

      <motion.div
        variants={container}
        initial={false}
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map(({ item, category }) => {
          const Icon = FAQ_ICONS[category.icon];
          return (
            <motion.button
              key={item.id}
              variants={cardVariant}
              onClick={() => onQuestionClick(item.id, category.id)}
              className="gradient-border-card group relative flex flex-col items-start gap-3 rounded-xl bg-white/[0.02] p-5 text-left transition-all duration-200 hover:bg-white/[0.05]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/15 bg-primary/[0.06] transition-colors group-hover:bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium leading-snug text-foreground">{item.question}</p>
              <span className="mt-auto text-xs text-muted-foreground/50">{category.title}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </section>
  );
}
