'use client';

import { zeroAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { CalibrationWindowIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import {
  formatCstProgressPercent,
  getCstAuctionProgress,
  type CstGestureData,
} from '@/utils/cstGesture';

import { ValuePending } from './ValuePending';

export interface CalibrationStatusProps {
  data: DashboardInfo | null;
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  className?: string;
}

const FIGURES = ['dynamicDuration', 'elapsedLabel', 'remainingLabel'] as const;

/**
 * The running Calibration Window, decision data even while another method is
 * selected: the opening ETH window before the first Gesture, then the CST
 * window. A 2px progress rule and three figures (duration, elapsed,
 * remaining). Before its timing arrives it renders the same structure with
 * the figures pending, so nothing reflows when they land.
 */
export function CalibrationStatus({
  data,
  ethGestureInfo,
  cstGestureData,
  className,
}: CalibrationStatusProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const firstGesture = data?.LastBidderAddr === zeroAddress;
  const title = t(firstGesture ? 'calibration.firstGestureTitle' : 'calibration.cstTitle');
  const subtitle = firstGesture
    ? t('calibration.firstGestureSubtitle')
    : t('calibration.cstSubtitle', {
        decreasePercent: String(protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture),
        increasePercent: String(protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture),
      });
  const sample = firstGesture ? ethGestureInfo : cstGestureData;
  const hasEthTiming =
    ethGestureInfo != null &&
    Number.isSafeInteger(ethGestureInfo.AuctionDuration) &&
    ethGestureInfo.AuctionDuration >= 0 &&
    // V2 reports signed ETH elapsed time before the cycle opens.
    Number.isSafeInteger(ethGestureInfo.SecondsElapsed);
  const available =
    data != null &&
    sample != null &&
    (firstGesture
      ? hasEthTiming
      : (cstGestureData.timingAvailable ?? cstGestureData.source !== 'empty'));
  const progress =
    available && sample
      ? getCstAuctionProgress({
          AuctionDuration: sample.AuctionDuration,
          SecondsElapsed: sample.SecondsElapsed,
        })
      : null;
  const endedMessage =
    firstGesture || cstGestureData.source === 'empty'
      ? t('calibration.defaultEndedMessage')
      : t('calibration.cstEndedMessage');
  const values = progress
    ? {
        dynamicDuration: progress.auctionDuration,
        elapsedLabel: progress.secondsElapsed,
        remainingLabel: progress.secondsRemaining,
      }
    : null;

  return (
    <section
      aria-labelledby="calibration-status-title"
      data-testid="calibration-status"
      className={cn('@container/calibration min-w-0', className)}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <CalibrationWindowIcon className="size-4 shrink-0 text-subtle" aria-hidden />
          <h2 id="calibration-status-title" className="type-label text-foreground">
            {title}
          </h2>
          <InfoTooltip content={subtitle} label={title} />
        </div>
        {progress ? (
          <span className="type-caption tabular-nums text-subtle">
            {t('calibration.percentComplete', {
              percent: formatCstProgressPercent(progress.percentComplete, locale),
            })}
          </span>
        ) : (
          <span role="status" className="type-caption text-subtle">
            {tCommon('status.loadingDots')}
          </span>
        )}
      </div>

      <div className="mt-2.5 h-0.5 w-full rounded-pill bg-rule">
        {progress && !progress.isEnded && (
          <div
            role="progressbar"
            aria-label={t('calibration.progressAria', { title })}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.percentComplete * 10) / 10}
            className="h-full rounded-pill bg-primary transition-[width] duration-[var(--duration-slow)]"
            style={{ width: `${progress.percentComplete}%` }}
          />
        )}
      </div>

      <dl className="mt-2.5 grid gap-x-4 gap-y-1.5 @min-[22rem]/calibration:grid-cols-3">
        {FIGURES.map((figure) => (
          <div
            key={figure}
            className="flex min-w-0 items-baseline justify-between gap-3 @min-[22rem]/calibration:block"
          >
            <dt className="type-caption min-w-0 text-subtle">{t(`calibration.${figure}`)}</dt>
            <dd className="@min-[22rem]/calibration:mt-0.5">
              {values ? (
                <Duration seconds={values[figure]} className="type-figure-sm text-foreground" />
              ) : (
                <ValuePending ch={8} className="type-figure-sm" />
              )}
            </dd>
          </div>
        ))}
      </dl>

      {progress?.isEnded && <p className="type-caption mt-2 text-positive">{endedMessage}</p>}
    </section>
  );
}
