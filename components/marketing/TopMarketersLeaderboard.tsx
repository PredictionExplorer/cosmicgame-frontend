'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Info } from 'lucide-react';

import { cn } from '@/lib/utils';
import { AddressLink } from '@/components/common/AddressLink';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { MarketingReward } from '@/services/api/types';

interface AggregatedMarketer {
  address: string;
  totalEarned: number;
  rewardCount: number;
}

function aggregateMarketers(rewards: MarketingReward[]): AggregatedMarketer[] {
  const map = new Map<string, AggregatedMarketer>();

  for (const r of rewards) {
    const existing = map.get(r.MarketerAddr);
    if (existing) {
      existing.totalEarned += r.AmountEth;
      existing.rewardCount += 1;
    } else {
      map.set(r.MarketerAddr, {
        address: r.MarketerAddr,
        totalEarned: r.AmountEth,
        rewardCount: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalEarned - a.totalEarned);
}

const rankStyles: Record<number, string> = {
  0: 'from-yellow-400/30 to-yellow-600/10 border-yellow-500/30',
  1: 'from-gray-300/20 to-gray-400/10 border-gray-400/20',
  2: 'from-amber-600/20 to-amber-700/10 border-amber-600/20',
};

export interface TopMarketersLeaderboardProps {
  rewards: MarketingReward[];
}

export function TopMarketersLeaderboard({ rewards }: TopMarketersLeaderboardProps) {
  const topMarketers = useMemo(() => aggregateMarketers(rewards).slice(0, 5), [rewards]);

  return (
    <section aria-labelledby="leaderboard-heading" className="py-16">
      <div className="mb-10 flex items-center justify-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        <h2
          id="leaderboard-heading"
          className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
        >
          Top Marketers
        </h2>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Info about top marketers"
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            Rankings based on total CST earned from marketing activities
          </TooltipContent>
        </Tooltip>
      </div>

      {topMarketers.length === 0 ? (
        <p className="text-center text-muted-foreground" role="status">
          No marketers yet.
        </p>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="mx-auto grid max-w-3xl gap-4"
        >
          {topMarketers.map((marketer, idx) => (
            <motion.div
              key={marketer.address}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
              }}
              className={cn(
                'flex items-center gap-4 rounded-xl border bg-gradient-to-r p-4 sm:p-5',
                rankStyles[idx] ?? 'from-white/[0.02] to-white/[0.01] border-white/[0.06]',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold',
                  idx === 0 && 'bg-yellow-500/20 text-yellow-400',
                  idx === 1 && 'bg-gray-400/20 text-gray-300',
                  idx === 2 && 'bg-amber-600/20 text-amber-500',
                  idx > 2 && 'bg-white/[0.06] text-muted-foreground',
                )}
              >
                {idx + 1}
              </span>

              <div className="min-w-0 flex-1">
                <AddressLink address={marketer.address} url={`/marketing/${marketer.address}`} />
              </div>

              <div className="text-right">
                <p className="font-display text-lg font-bold">
                  {marketer.totalEarned.toFixed(2)}{' '}
                  <span className="text-sm text-muted-foreground">CST</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {marketer.rewardCount} reward{marketer.rewardCount !== 1 ? 's' : ''}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
