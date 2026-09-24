'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import {
  AnchoringIcon,
  ChronoWarriorIcon,
  CompoundingReserveIcon,
  PublicGoodsIcon,
  SignatureAllocationIcon,
  StellarSelectionIcon,
} from '@/lib/conceptIcons';
import {
  ALLOCATION_TRACK_COLORS,
  ALLOCATION_TRACK_COPY_KEYS,
  withNextCycleShare,
  type AllocationTrackId,
} from '@/config/allocationTracks';
import { cn } from '@/lib/utils';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { UnknownValue } from '@/components/ui/unknown-value';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { formatGroupedNumber } from '@/utils/format';
import { formatPercentPoints } from '@/utils/protocolParams';

type DistData = {
  PrizePercentage?: number;
  RafflePercentage?: number;
  CharityPercentage?: number;
  StakingPercentage?: number;
  ChronoWarriorPercentage?: number;
  CosmicGameBalanceEth?: number;
};

const TRACK_ICONS: Record<AllocationTrackId, ReactNode> = {
  signature: <SignatureAllocationIcon className="h-4 w-4" aria-hidden />,
  chrono: <ChronoWarriorIcon className="h-4 w-4" aria-hidden />,
  stellar: <StellarSelectionIcon className="h-4 w-4" aria-hidden />,
  anchor: <AnchoringIcon className="h-4 w-4" aria-hidden />,
  publicGoods: <PublicGoodsIcon className="h-4 w-4" aria-hidden />,
  nextCycle: <CompoundingReserveIcon className="h-4 w-4" aria-hidden />,
};

/** A track's share of the reserve, clamped into [0, 100]; `null` when it could not be read. */
function toShare(value: unknown): number | null {
  const numeric = toFiniteNumber(value);
  return numeric === null ? null : Math.min(100, Math.max(0, numeric));
}

/**
 * The live Cycle Reserve split on /current-cycle. Every bar is drawn against the whole
 * reserve (100%) in the track order and colors of /allocation, /allocation/[id] and
 * /contracts, so a 25% track fills a quarter of its bar here too. A share that could not be
 * read shows as unavailable with an empty bar, never as 0%.
 */
export function FundDistribution({ data }: { data?: DistData }) {
  const t = useTranslations('contracts');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;

  const balanceEth = toFiniteNumber(data?.CosmicGameBalanceEth);
  const shares = withNextCycleShare([
    { id: 'signature', percent: toShare(data?.PrizePercentage) },
    { id: 'chrono', percent: toShare(data?.ChronoWarriorPercentage) },
    { id: 'stellar', percent: toShare(data?.RafflePercentage) },
    { id: 'anchor', percent: toShare(data?.StakingPercentage) },
    { id: 'publicGoods', percent: toShare(data?.CharityPercentage) },
  ]);

  return (
    <ul
      data-testid="fund-distribution"
      className="space-y-1 rounded-xl border border-border bg-card/40 p-3 sm:p-5"
    >
      {shares.map(({ id, percent }, index) => {
        const copyKey = ALLOCATION_TRACK_COPY_KEYS[id];
        const label = t(`funds.segments.${copyKey}.label`);
        const eth = percent !== null && balanceEth !== null ? (percent * balanceEth) / 100 : null;

        return (
          <motion.li
            key={id}
            data-track={id}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-foreground/[0.03] sm:px-3"
          >
            <span className="shrink-0 text-muted-foreground">{TRACK_ICONS[id]}</span>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    aria-hidden
                    className={cn('h-2.5 w-2.5 shrink-0 rounded-full', ALLOCATION_TRACK_COLORS[id])}
                  />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <InfoTooltip content={t(`funds.segments.${copyKey}.tooltip`)} label={label} />
                </div>
                <span className="ml-auto whitespace-nowrap text-sm font-medium tabular-nums text-foreground">
                  {percent === null ? unknown : formatPercentPoints(percent, locale)}{' '}
                  <span className="text-xs text-muted-foreground">
                    (
                    {eth === null
                      ? unknown
                      : `${formatGroupedNumber(eth, locale, {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })} ETH`}
                    )
                  </span>
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-foreground/[0.06]">
                {percent !== null && percent > 0 ? (
                  <motion.div
                    data-testid={`fund-track-fill-${id}`}
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                    className={cn('h-full rounded-full', ALLOCATION_TRACK_COLORS[id])}
                  />
                ) : null}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
