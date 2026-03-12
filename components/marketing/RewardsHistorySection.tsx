'use client';

import { motion } from 'framer-motion';
import { History, Info } from 'lucide-react';

import {
  GlobalMarketingRewardsTable,
  type MarketingReward,
} from '@/components/tables/GlobalMarketingRewardsTable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface RewardsHistorySectionProps {
  rewards: MarketingReward[];
}

export function RewardsHistorySection({ rewards }: RewardsHistorySectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      aria-labelledby="history-heading"
      className="py-16"
    >
      <div className="mb-8 flex items-center justify-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <h2
          id="history-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Reward History
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Info about reward history"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Complete chronological log of all marketing reward distributions
          </TooltipContent>
        </Tooltip>
      </div>

      {rewards.length > 0 && (
        <p className="mb-4 text-center text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{rewards.length}</span> reward
          {rewards.length !== 1 ? 's' : ''}
        </p>
      )}

      {rewards.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-8 py-16 text-center">
          <History className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">No rewards distributed yet</p>
          <p className="mt-1 text-sm text-muted-foreground/60">
            Rewards will appear here once marketing activities are verified and paid out.
          </p>
        </div>
      ) : (
        <GlobalMarketingRewardsTable list={rewards} />
      )}
    </motion.section>
  );
}
