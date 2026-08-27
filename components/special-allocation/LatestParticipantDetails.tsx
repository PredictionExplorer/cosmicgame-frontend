'use client';

import { MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import type { ChampionsState } from '@/hooks/useChampions';
import { cn } from '@/lib/utils';
import type { GestureInfo } from '@/services/api/types';
import {
  formatAttachedAssets,
  formatGestureMethod,
  formatGesturePayment,
  formatReceivedCstAmount,
  getAttachedAssetLabels,
  getParticipationCST,
  hasRandomWalkToken,
  resolveGestureType,
} from '@/utils/gesturePayment';

import { DetailMetric } from './DetailMetric';

export interface LatestParticipantAllocationPackage {
  label: string;
  primary: string;
  secondary?: string;
}

export interface LatestParticipantDetailsProps {
  latest: ChampionsState['latestGesture'];
  hasEnduranceRecord: boolean;
  latestGesture?: GestureInfo | null;
  latestAddress: string | null;
  message?: string | null;
  allocationPackage?: LatestParticipantAllocationPackage;
  compact?: boolean;
}

function LatestGestureProgress({
  latest,
  hasEnduranceRecord,
  compact,
}: Pick<LatestParticipantDetailsProps, 'latest' | 'hasEnduranceRecord' | 'compact'>) {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!hasEnduranceRecord) {
    return (
      <div
        data-testid="latest-participant-status"
        className={cn(
          'rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] text-xs text-emerald-300',
          compact ? 'px-2.5 py-1.5' : 'mt-3 px-3 py-2',
        )}
      >
        {t('specialAllocation.firstRecordForming')}
      </div>
    );
  }

  const progress = Math.floor(latest.progressToEnduranceChampion);
  const isComplete = latest.isExtendingEnduranceRecord;
  const remainingCopy = latest.isCurrentEnduranceChampion
    ? t('specialAllocation.needsToExtend', {
        duration: formatSeconds(latest.secondsUntilEnduranceChampion, locale),
      })
    : t('specialAllocation.needsToBecomeChampion', {
        duration: formatSeconds(latest.secondsUntilEnduranceChampion, locale),
      });

  return (
    <div
      className={cn(
        'rounded-lg border border-white/[0.06] bg-black/10',
        compact ? 'px-2.5 py-1.5' : 'mt-3 px-3 py-2',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          data-testid="latest-participant-remaining"
          className={cn('text-xs', isComplete ? 'text-emerald-300' : 'text-muted-foreground')}
        >
          {isComplete ? t('specialAllocation.extendingRecord') : remainingCopy}
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-primary">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={t('specialAllocation.progressAria')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${latest.progressToEnduranceChampion}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {t('specialAllocation.progressAmounts', {
          current: formatSeconds(latest.holdDuration, locale),
          target: formatSeconds(latest.durationToBeat, locale),
        })}
      </p>
    </div>
  );
}

function LatestGestureDetails({
  latestGesture,
  latestAddress,
  compact,
}: Pick<LatestParticipantDetailsProps, 'latestGesture' | 'latestAddress' | 'compact'>) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const hasGestureTime =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp);
  const gestureTimestamp =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp)
      ? latestGesture.TimeStamp
      : 0;
  const gestureTime = useHydrationSafeDateTime(gestureTimestamp, true, locale);

  if (!latestGesture || !sameAddress(latestGesture.BidderAddr, latestAddress)) return null;

  const randomWalkStatus = hasRandomWalkToken(latestGesture)
    ? t('specialAllocation.yesToken', { id: String(latestGesture.RWalkNFTId) })
    : resolveGestureType(latestGesture) === 1
      ? t('status.yes')
      : t('status.no');

  return (
    <div
      data-testid="latest-participant-gesture-details"
      className={cn(
        'rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/[0.07] via-white/[0.025] to-transparent shadow-[0_0_30px_-22px_rgba(52,211,153,0.75)]',
        compact ? 'p-2.5' : 'mt-3 p-3',
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
        <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">
          {t('specialAllocation.lastGesture')}
        </p>
      </div>
      <div
        className={cn('grid gap-1.5', compact ? 'grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2')}
      >
        <DetailMetric
          testId="latest-participant-paid-amount"
          label={t('specialAllocation.amountPaid')}
          value={formatGesturePayment(latestGesture, t('status.unavailable'))}
          tone="emerald"
          compact={compact}
        />
        <DetailMetric
          label={t('specialAllocation.method')}
          value={formatGestureMethod(latestGesture, t('status.unknown'))}
          compact={compact}
        />
        <DetailMetric
          testId="latest-participant-cst-received"
          label={t('specialAllocation.cstReceived')}
          value={formatReceivedCstAmount(
            getParticipationCST(latestGesture),
            t('status.unavailable'),
          )}
          tone="emerald"
          compact={compact}
        />
        <DetailMetric
          testId="latest-participant-random-walk"
          label={t('specialAllocation.randomWalk')}
          value={randomWalkStatus}
          compact={compact}
        />
        <DetailMetric
          label={t('specialAllocation.gestureTime')}
          value={hasGestureTime ? gestureTime : t('status.unavailable')}
          compact={compact}
        />
        <DetailMetric
          testId="latest-participant-gesture-id"
          label={t('specialAllocation.gesturePosition')}
          value={
            typeof latestGesture.BidPosition === 'number'
              ? `#${latestGesture.BidPosition}`
              : t('status.unavailable')
          }
          compact={compact}
        />
        {getAttachedAssetLabels(latestGesture).length > 0 && (
          <DetailMetric
            testId="latest-participant-attached-assets"
            label={t('specialAllocation.attachedAssets')}
            value={formatAttachedAssets(latestGesture, t('status.none'))}
            compact={compact}
            className={compact ? 'col-span-2 xl:col-span-3' : undefined}
          />
        )}
      </div>
    </div>
  );
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

/**
 * Complete detail body for the latest participant.
 *
 * It deliberately distinguishes the CST already received from the current
 * gesture from the allocation package the participant is merely in line for
 * if the cycle finalizes now.
 */
export function LatestParticipantDetails({
  latest,
  hasEnduranceRecord,
  latestGesture = null,
  latestAddress,
  message = null,
  allocationPackage,
  compact = false,
}: LatestParticipantDetailsProps) {
  const cleanMessage = message?.trim() ?? '';

  return (
    <div className={cn('grid', compact ? 'gap-2' : undefined)}>
      <LatestGestureProgress
        latest={latest}
        hasEnduranceRecord={hasEnduranceRecord}
        compact={compact}
      />
      <LatestGestureDetails
        latestGesture={latestGesture}
        latestAddress={latestAddress}
        compact={compact}
      />
      {allocationPackage && (
        <div
          data-testid="latest-participant-allocation-package"
          className={cn(
            'rounded-lg border border-primary/20 bg-primary/[0.055]',
            compact ? 'px-2.5 py-2' : 'mt-3 px-3 py-2.5',
          )}
        >
          <p className="text-[10px] font-medium uppercase tracking-wider text-primary/90">
            {allocationPackage.label}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-foreground">
            {allocationPackage.primary}
          </p>
          {allocationPackage.secondary && (
            <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
              {allocationPackage.secondary}
            </p>
          )}
        </div>
      )}
      {cleanMessage && (
        <div
          data-testid="latest-participant-message"
          className={cn(
            'flex items-start gap-2 rounded-lg bg-white/[0.03]',
            compact ? 'p-2.5' : 'mt-3 p-3',
          )}
        >
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
          <p className="line-clamp-2 break-words text-xs text-amber-300/90">
            &ldquo;{cleanMessage}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
