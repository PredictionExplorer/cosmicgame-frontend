'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Info } from 'lucide-react';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  tooltip: string;
  decimals?: number;
}

function useCountUp(target: number, inView: boolean, decimals = 0) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number>(undefined);

  useEffect(() => {
    if (!inView) return;

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Number((eased * target).toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, inView, decimals]);

  return display;
}

function StatCard({ label, value, suffix = '', tooltip, decimals = 0 }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const displayed = useCountUp(value, inView, decimals);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className="gradient-border-card rounded-xl bg-white/[0.02] p-6 text-center"
    >
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`Info about ${label}`}
              className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <p
        className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
        aria-label={`${label}: ${value}${suffix}`}
      >
        {displayed.toLocaleString()}
        {suffix && <span className="ml-1 text-xl text-muted-foreground">{suffix}</span>}
      </p>
    </motion.div>
  );
}

export interface MarketingStatsProps {
  totalRewardsEth: number;
  activeMarketers: number;
  rewardTransactions: number;
}

export function MarketingStats({
  totalRewardsEth,
  activeMarketers,
  rewardTransactions,
}: MarketingStatsProps) {
  return (
    <section aria-labelledby="stats-heading" className="py-16">
      <h2 id="stats-heading" className="sr-only">
        Outreach Program Statistics
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label="Total Allocations"
          value={totalRewardsEth}
          suffix="CST"
          decimals={2}
          tooltip="Total CST tokens forwarded to all outreach contributors since launch"
        />
        <StatCard
          label="Active Outreach Contributors"
          value={activeMarketers}
          tooltip="Number of unique wallet addresses that have received outreach allocations"
        />
        <StatCard
          label="Allocation Transactions"
          value={rewardTransactions}
          tooltip="Total number of individual allocation payouts processed"
        />
      </div>
    </section>
  );
}
