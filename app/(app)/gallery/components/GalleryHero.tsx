'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Gem, Lock, Tag, Trophy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface GalleryStats {
  total: number;
  staked: number;
  named: number;
  rounds: number;
}

interface GalleryHeroProps {
  stats: GalleryStats;
  loading?: boolean;
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;

    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

const statCards: {
  key: keyof GalleryStats;
  label: string;
  icon: typeof Gem;
  tooltip: string;
  gradient: string;
}[] = [
  {
    key: 'total',
    label: 'Total Imprinted',
    icon: Gem,
    tooltip: 'The total number of COSMIC NFTs imprinted across all cycles',
    gradient: 'from-[#06AEEC] to-[#35C9FF]',
  },
  {
    key: 'staked',
    label: 'Currently Anchored',
    icon: Lock,
    tooltip: 'NFTs anchored to the protocol, receiving distributions for their owners',
    gradient: 'from-[#9C37FD] to-[#C77DFF]',
  },
  {
    key: 'named',
    label: 'Named NFTs',
    icon: Tag,
    tooltip: 'NFTs that have been given a unique custom name by their owner',
    gradient: 'from-[#06AEEC] to-[#9C37FD]',
  },
  {
    key: 'rounds',
    label: 'Cycles',
    icon: Trophy,
    tooltip: 'The number of unique cycles that have produced NFTs',
    gradient: 'from-[#35C9FF] to-[#9C37FD]',
  },
];

export function GalleryHero({ stats, loading }: GalleryHeroProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
      {statCards.map((card, index) => (
        <motion.div
          key={card.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
        >
          <StatCard
            value={stats[card.key]}
            label={card.label}
            icon={card.icon}
            tooltip={card.tooltip}
            gradient={card.gradient}
            loading={loading}
          />
        </motion.div>
      ))}
    </div>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  icon: typeof Gem;
  tooltip: string;
  gradient: string;
  loading?: boolean;
}

function StatCard({ value, label, icon: Icon, tooltip, gradient, loading }: StatCardProps) {
  const animatedValue = useAnimatedCounter(loading ? 0 : value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5 overflow-hidden',
            'hover:border-primary/20 transition-colors duration-300 cursor-help group',
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium">{label}</p>
              {loading ? (
                <div className="h-8 w-16 rounded bg-white/[0.06] animate-pulse" />
              ) : (
                <p className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                  {animatedValue.toLocaleString()}
                </p>
              )}
            </div>
            <div className={cn('rounded-lg bg-gradient-to-br p-2', gradient, 'opacity-80')}>
              <Icon className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px]">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
