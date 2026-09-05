'use client';

import { motion } from 'framer-motion';
import { History, Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';

export interface RewardsHistorySectionProps {
  rewards: MarketingReward[];
}

export function RewardsHistorySection({ rewards }: RewardsHistorySectionProps) {
  const t = useTranslations('marketing');

  return (
    <motion.section
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      aria-labelledby="history-heading"
      className="py-8 sm:py-10"
    >
      <div className="mb-8 flex items-center justify-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2
          id="history-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {t('history.title')}
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={t('history.infoAria')}
              data-touch-target="extended"
              className={cn(
                'text-muted-foreground/60 hover:text-muted-foreground transition-colors',
                TOUCH_TARGET_EXTENDED_CLASS,
              )}
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{t('history.tooltip')}</TooltipContent>
        </Tooltip>
      </div>

      {rewards.length > 0 && (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          {t.rich(rewards.length === 1 ? 'history.showingOne' : 'history.showingOther', {
            count: rewards.length,
            strong: (chunks) => <span className="font-semibold text-foreground">{chunks}</span>,
          })}
        </p>
      )}

      {rewards.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center sm:px-8">
          <History className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">{t('history.emptyTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground/60">{t('history.emptyDescription')}</p>
        </div>
      ) : (
        <GlobalMarketingRewardsTable list={rewards} />
      )}
    </motion.section>
  );
}
