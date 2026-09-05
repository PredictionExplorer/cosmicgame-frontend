'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

export function MarketingHero({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('marketing');

  return (
    <motion.section
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={compact ? 'mb-8' : 'relative mb-10 border-b border-border pb-12 sm:pb-16'}
    >
      {!compact && (
        <>
          <h2 className="max-w-4xl type-display-lg text-foreground">
            {t.rich('hero.title', {
              highlight: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h2>

          <p className="mt-6 max-w-2xl type-body-lg text-muted-foreground">
            {t('hero.description')}
          </p>
        </>
      )}

      <div className={compact ? undefined : 'mt-10'}>
        <Button asChild size="lg" className="group">
          <a href="#how-it-works">
            {t('hero.learnHow')}
            <ArrowDown className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
        </Button>
      </div>
    </motion.section>
  );
}
