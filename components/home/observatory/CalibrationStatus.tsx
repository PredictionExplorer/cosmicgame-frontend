'use client';

import { zeroAddress } from 'viem';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { AuctionInfo } from '@/components/home/AuctionInfo';
import { Skeleton } from '@/components/ui/skeleton';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import type { DashboardInfo } from '@/services/api';
import type { CstGestureData } from '@/utils/cstGesture';

export interface CalibrationStatusProps {
  data: DashboardInfo | null;
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
}

/** The running pricing window is decision data even when another method is
 * selected. Show the opening ETH window before the first Gesture, then CST.
 * Timing remains useful while its independently requested price loads.
 */
export function CalibrationStatus({
  data,
  ethGestureInfo,
  cstGestureData,
}: CalibrationStatusProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const firstGesture = data?.LastBidderAddr === zeroAddress;
  const title = t(firstGesture ? 'calibration.firstGestureTitle' : 'calibration.cstTitle');
  const sample = firstGesture ? ethGestureInfo : cstGestureData;
  const hasEthTiming =
    ethGestureInfo != null &&
    Number.isSafeInteger(ethGestureInfo.AuctionDuration) &&
    ethGestureInfo.AuctionDuration >= 0 &&
    // V2 reports signed ETH elapsed time before the cycle opens.
    Number.isSafeInteger(ethGestureInfo.SecondsElapsed);
  const available =
    data != null &&
    (firstGesture
      ? hasEthTiming
      : (cstGestureData.timingAvailable ?? cstGestureData.source !== 'empty'));

  if (!available || !sample) {
    return (
      <section
        aria-label={title}
        className="rounded-2xl border border-primary/15 bg-[#0b182a]/95 p-3"
      >
        <h2 className="text-xs font-semibold text-primary">{title}</h2>
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {tCommon('status.loadingDots')}
        </p>
        <Skeleton className="mt-2 h-8" />
      </section>
    );
  }

  return (
    <AuctionInfo
      title={title}
      subtitle={
        firstGesture
          ? t('calibration.firstGestureSubtitle')
          : t('calibration.cstSubtitle', {
              decreasePercent: String(
                protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture,
              ),
              increasePercent: String(
                protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture,
              ),
            })
      }
      secondsElapsed={sample.SecondsElapsed}
      auctionDuration={sample.AuctionDuration}
      endedMessage={
        firstGesture || cstGestureData.source === 'empty'
          ? undefined
          : t('calibration.cstEndedMessage')
      }
      compact
    />
  );
}
