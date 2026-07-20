'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function MarketingCTA() {
  const t = useTranslations('marketing');

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-labelledby="cta-heading"
      className="gradient-border-card rounded-2xl bg-white/[0.02] px-8 py-16 text-center sm:px-16"
    >
      <h2 id="cta-heading" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {t('cta.title')}
      </h2>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">{t('cta.description')}</p>
      <div className="mt-8 inline-flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="lg">
              <a href="mailto:marketing@cosmicsignature.com">
                {t('cta.contact')}
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('cta.contactTooltip')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t('cta.infoAria')}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{t('cta.infoTooltip')}</TooltipContent>
        </Tooltip>
      </div>
    </motion.section>
  );
}
