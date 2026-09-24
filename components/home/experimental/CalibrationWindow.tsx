'use client';

import { useId } from 'react';
import { zeroAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Duration } from '@/components/ui/duration';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { Skeleton } from '@/components/ui/skeleton';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import {
  formatCstProgressPercent,
  getCstAuctionProgress,
  type CstGestureData,
} from '@/utils/cstGesture';

interface CalibrationWindowProps {
  data: DashboardInfo | null;
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  className?: string;
}

/**
 * The running Calibration Window, right under the method prices: the cost a
 * participant is about to choose descends through it, so the two are read
 * together whichever method is selected. Before the first Gesture it is the
 * opening ETH window; after it, the CST window. A 2px rule shows the
 * progress, and three figures give its length, the time elapsed and the time
 * left. While the timing loads, the figures are skeletons, never zeros.
 */
export function CalibrationWindow({
  data,
  ethGestureInfo,
  cstGestureData,
  className,
}: CalibrationWindowProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const titleId = useId();

  const firstGesture = data?.LastBidderAddr === zeroAddress;
  const title = t(firstGesture ? 'calibration.firstGestureTitle' : 'calibration.cstTitle');
  const definition = firstGesture
    ? t('calibration.firstGestureSubtitle')
    : t('calibration.cstSubtitle', {
        decreasePercent: String(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture),
        increasePercent: String(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture),
      });

  const hasEthTiming =
    ethGestureInfo != null &&
    Number.isSafeInteger(ethGestureInfo.AuctionDuration) &&
    ethGestureInfo.AuctionDuration >= 0 &&
    Number.isSafeInteger(ethGestureInfo.SecondsElapsed);
  const available =
    data != null &&
    (firstGesture
      ? hasEthTiming
      : (cstGestureData.timingAvailable ?? cstGestureData.source !== 'empty'));
  const sample = firstGesture
    ? {
        AuctionDuration: ethGestureInfo?.AuctionDuration ?? 0,
        SecondsElapsed: ethGestureInfo?.SecondsElapsed ?? 0,
      }
    : cstGestureData;
  const progress = getCstAuctionProgress(sample);
  const percentLabel = t('calibration.percentComplete', {
    percent: formatCstProgressPercent(progress.percentComplete, locale),
  });
  const ended = !firstGesture && available && progress.isEnded;

  const figures = [
    { key: 'length', label: t('calibration.dynamicDuration'), seconds: progress.auctionDuration },
    { key: 'elapsed', label: t('calibration.elapsedLabel'), seconds: progress.secondsElapsed },
    {
      key: 'remaining',
      label: t('calibration.remainingLabel'),
      seconds: progress.secondsRemaining,
    },
  ];

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={!available || undefined}
      data-testid="calibration-window"
      className={cn('min-w-0', className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id={titleId} className="type-label text-muted-foreground">
          <ExplainedTerm definition={definition}>{title}</ExplainedTerm>
        </h3>
        <span className="type-figure-sm text-foreground" data-testid="calibration-percent">
          {available ? percentLabel : <span className="sr-only">{tCommon('status.loading')}</span>}
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={titleId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={available ? Math.round(progress.percentComplete) : undefined}
        aria-valuetext={available ? percentLabel : undefined}
        className="mt-2 h-0.5 overflow-hidden rounded-pill bg-rule"
      >
        {available ? (
          <div
            className="h-full rounded-pill bg-primary transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out-soft)]"
            style={{ width: `${progress.percentComplete}%` }}
          />
        ) : null}
      </div>
      <dl className="mt-3 grid grid-cols-3 items-end gap-x-3">
        {figures.map((figure) => (
          <div key={figure.key} className="min-w-0">
            <dt className="type-caption text-subtle">{figure.label}</dt>
            <dd className="mt-0.5 type-figure-sm text-foreground">
              {available ? (
                <Duration seconds={figure.seconds} maxUnits={2} />
              ) : (
                <Skeleton className="mt-1 h-3.5 w-14 rounded-edge" />
              )}
            </dd>
          </div>
        ))}
      </dl>
      {ended ? (
        <p className="mt-2 type-caption text-positive">{t('calibration.cstEndedMessage')}</p>
      ) : null}
    </section>
  );
}
