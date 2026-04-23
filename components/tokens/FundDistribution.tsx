'use client';

import { type ReactNode } from 'react';
import { Trophy, Shuffle, Heart, Layers, Swords, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';

type DistData = {
  PrizePercentage?: number;
  RafflePercentage?: number;
  CharityPercentage?: number;
  StakingPercentage?: number;
  ChronoWarriorPercentage?: number;
  CosmicGameBalanceEth?: number;
};

interface FundCategory {
  label: string;
  value: number;
  eth: number;
  icon: ReactNode;
  tooltip: string;
  color: string;
  gradient: string;
}

const clamp = (n: number | undefined, min = 0, max = 100) => {
  const num = Number(n);
  return Number.isFinite(num) ? Math.min(max, Math.max(min, num)) : 0;
};

const fmtEth = (eth: number) => (Number.isFinite(eth) ? eth.toFixed(4) : '0.0000');

const barVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.07, duration: 0.35, ease: 'easeOut' as const },
  }),
};

const fillVariants = {
  hidden: { width: 0 },
  visible: (pct: number) => ({
    width: `${pct}%`,
    transition: { duration: 0.7, ease: 'easeOut' as const, delay: 0.15 },
  }),
};

export function FundDistribution({ data }: { data?: DistData }) {
  const prize = clamp(data?.PrizePercentage);
  const raffle = clamp(data?.RafflePercentage);
  const charity = clamp(data?.CharityPercentage);
  const staking = clamp(data?.StakingPercentage);
  const chrono = clamp(data?.ChronoWarriorPercentage);
  const balance = Number(data?.CosmicGameBalanceEth) || 0;

  const remainder = clamp(100 - (prize + raffle + charity + staking + chrono));

  const categories: FundCategory[] = [
    {
      label: 'Signature',
      value: prize,
      eth: (prize * balance) / 100,
      icon: <Trophy className="h-4 w-4" />,
      tooltip: 'Signature Allocation ETH for the participant who made the final gesture at close.',
      color: 'text-[hsl(196,98%,54%)]',
      gradient: 'from-[hsl(196,98%,54%)] to-[hsl(196,98%,40%)]',
    },
    {
      label: 'Stellar Selection',
      value: raffle,
      eth: (raffle * balance) / 100,
      icon: <Shuffle className="h-4 w-4" />,
      tooltip: 'ETH for Stellar Selection participants chosen at random at cycle end.',
      color: 'text-[hsl(271,98%,60%)]',
      gradient: 'from-[hsl(271,98%,60%)] to-[hsl(271,98%,45%)]',
    },
    {
      label: 'Public goods',
      value: charity,
      eth: (charity * balance) / 100,
      icon: <Heart className="h-4 w-4" />,
      tooltip: 'Forwarded to Protocol Guild (public goods) each cycle.',
      color: 'text-[hsl(205,100%,71%)]',
      gradient: 'from-[hsl(205,100%,71%)] to-[hsl(205,100%,55%)]',
    },
    {
      label: 'Anchors',
      value: staking,
      eth: (staking * balance) / 100,
      icon: <Layers className="h-4 w-4" />,
      tooltip: 'Distributed to anchored COSMIC NFT holders proportional to anchors.',
      color: 'text-[hsl(45,93%,52%)]',
      gradient: 'from-[hsl(45,93%,52%)] to-[hsl(45,93%,38%)]',
    },
    {
      label: 'Chrono-Warrior',
      value: chrono,
      eth: (chrono * balance) / 100,
      icon: <Swords className="h-4 w-4" />,
      tooltip:
        'Allocation to the participant who held the Endurance Champion interval longest.',
      color: 'text-[hsl(0,62%,50%)]',
      gradient: 'from-[hsl(0,62%,50%)] to-[hsl(0,62%,38%)]',
    },
    {
      label: 'Next cycle',
      value: remainder,
      eth: (remainder * balance) / 100,
      icon: <RotateCcw className="h-4 w-4" />,
      tooltip: 'Remaining ETH that compounds into the next cycle reserve.',
      color: 'text-muted-foreground',
      gradient: 'from-white/30 to-white/15',
    },
  ].sort((a, b) => b.value - a.value);

  const maxValue = Math.max(...categories.map((c) => c.value), 1);

  return (
    <div
      data-testid="fund-distribution"
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3"
    >
      {categories.map((cat, i) => {
        const barPct = (cat.value / maxValue) * 100;

        return (
          <motion.div
            key={cat.label}
            custom={i}
            variants={barVariants}
            initial="hidden"
            animate="visible"
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]"
          >
            <div className={cn('shrink-0', cat.color)}>{cat.icon}</div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-white">{cat.label}</span>
                  <InfoTooltip content={cat.tooltip} />
                </div>
                <span className="text-sm tabular-nums font-medium text-white/90">
                  {cat.value}%{' '}
                  <span className="text-xs text-muted-foreground">({fmtEth(cat.eth)} ETH)</span>
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  custom={barPct}
                  variants={fillVariants}
                  initial="hidden"
                  animate="visible"
                  className={cn('h-full rounded-full bg-gradient-to-r', cat.gradient)}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
