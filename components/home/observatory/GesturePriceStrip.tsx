'use client';

import { zeroAddress } from 'viem';
import { Coins, Footprints, Gem } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { formatCstAmount, type CstGestureData } from '@/utils/cstGesture';

export interface GesturePriceStripProps {
  data: DashboardInfo | null;
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  className?: string;
}

/**
 * Read-only mobile price strip.
 *
 * It keeps every method's current cost visible without creating another
 * gesture form. The fixed action dock remains the sole entry point and opens
 * the canonical sheet console.
 */
export function GesturePriceStrip({
  data,
  ethGestureInfo,
  cstGestureData,
  className,
}: GesturePriceStripProps) {
  const t = useTranslations('home');
  const afterFirstGesture = !!data?.LastBidderAddr && data.LastBidderAddr !== zeroAddress;
  const ethPrice = ethGestureInfo?.ETHPrice ?? 0;
  const unavailable = t('observatory.prices.availableAfterFirst');

  const methods = [
    {
      key: 'eth',
      icon: <Gem className="h-3.5 w-3.5" aria-hidden />,
      label: t('form.method.eth.label'),
      price: `${ethPrice.toFixed(5)} ETH`,
      tooltip: t('status.metrics.ethGestureTooltip'),
      available: true,
    },
    {
      key: 'randomWalk',
      icon: <Footprints className="h-3.5 w-3.5" aria-hidden />,
      label: t('form.method.randomWalk.label'),
      price: afterFirstGesture ? `${(ethPrice / 2).toFixed(5)} ETH` : unavailable,
      tooltip: t('status.metrics.randomWalkGestureTooltip'),
      available: afterFirstGesture,
    },
    {
      key: 'cst',
      icon: <Coins className="h-3.5 w-3.5" aria-hidden />,
      label: t('form.method.cst.label'),
      price: afterFirstGesture
        ? cstGestureData.isFree
          ? t('status.metrics.free')
          : `${formatCstAmount(cstGestureData.CSTPrice)} CST`
        : unavailable,
      tooltip: t('status.metrics.cstGestureTooltip'),
      available: afterFirstGesture,
    },
  ];

  return (
    <section
      aria-labelledby="gesture-price-strip-title"
      data-testid="gesture-price-strip"
      className={cn('min-w-0 border-t border-white/[0.08] p-3.5 lg:hidden', className)}
    >
      <div className="mb-2 flex items-center gap-2">
        <h2
          id="gesture-price-strip-title"
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
        >
          {t('form.methodLabel')}
        </h2>
        <span className="text-[10px] text-muted-foreground/70">
          {t('observatory.prices.openDockHint')}
        </span>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-white/[0.07] overflow-hidden rounded-lg border border-white/[0.07] bg-black/10">
        {methods.map((method) => (
          <div
            key={method.key}
            data-testid={`gesture-price-${method.key}`}
            className={cn('min-w-0 p-2', !method.available && 'opacity-65')}
          >
            <dt className="flex min-w-0 items-center gap-1 text-[10px] font-semibold text-muted-foreground">
              <span className="shrink-0 text-primary/80">{method.icon}</span>
              <span className="min-w-0 break-words">{method.label}</span>
              <InfoTooltip content={method.tooltip} className="ml-auto shrink-0" />
            </dt>
            <dd className="mt-1 break-words font-mono text-[10px] font-semibold leading-tight tabular-nums text-foreground">
              {method.price}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
