'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Info } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';

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
  const locale = useLocale();
  const t = useTranslations('marketing');
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const displayed = useCountUp(value, inView, decimals);

  return (
    <motion.div
      ref={ref}
      initial={false}
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
              aria-label={t('stats.infoAria', { label })}
              data-touch-target="extended"
              className={cn(
                'text-muted-foreground/60 hover:text-muted-foreground transition-colors',
                TOUCH_TARGET_EXTENDED_CLASS,
              )}
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
        </Tooltip>
      </div>
      <p
        className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl"
        aria-label={t('stats.valueAria', { label, value, suffix })}
      >
        {displayed.toLocaleString(locale)}
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
  const t = useTranslations('marketing');

  return (
    <section aria-labelledby="stats-heading" className="pb-8 sm:pb-10">
      <h2 id="stats-heading" className="sr-only">
        {t('stats.heading')}
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          label={t('stats.totalAllocations.label')}
          value={totalRewardsEth}
          suffix="CST"
          decimals={2}
          tooltip={t('stats.totalAllocations.tooltip')}
        />
        <StatCard
          label={t('stats.activeContributors.label')}
          value={activeMarketers}
          tooltip={t('stats.activeContributors.tooltip')}
        />
        <StatCard
          label={t('stats.transactions.label')}
          value={rewardTransactions}
          tooltip={t('stats.transactions.tooltip')}
        />
      </div>
    </section>
  );
}
