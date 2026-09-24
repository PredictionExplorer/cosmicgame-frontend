'use client';

import { MessageSquare } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { shortenHex } from '@/utils';

import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import type { ChampionsState } from '@/hooks/useChampions';
import { useFormat } from '@/hooks/useFormat';
import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
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
  /** Explicit active-cycle visibility; defaults to whether a gesture record exists. */
  showLastGesture?: boolean;
  /** Identity is known but the matching transaction row has not indexed yet. */
  gestureDetailsPending?: boolean;
  allocationPackage?: LatestParticipantAllocationPackage;
  compact?: boolean;
  /** Unframed metrics fit the dashboard without repeating its identity or allocation. */
  dashboard?: boolean;
}

/** The 6px mark of something changing right now; the text beside it is the word. */
function LiveDot() {
  return <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-live" />;
}

function LatestGestureProgress({
  latest,
  hasEnduranceRecord,
  compact,
  dashboard,
}: Pick<LatestParticipantDetailsProps, 'latest' | 'hasEnduranceRecord' | 'compact' | 'dashboard'>) {
  const t = useTranslations('tables');
  const format = useFormat();

  if (!hasEnduranceRecord) {
    return (
      <p
        data-testid="latest-participant-status"
        className={cn(
          'flex items-center gap-2 rounded-control bg-surface-sunken type-caption text-foreground',
          compact ? 'px-2.5 py-1.5' : 'mt-3 px-3 py-2',
        )}
      >
        <LiveDot />
        {t('specialAllocation.firstRecordForming')}
      </p>
    );
  }

  const progress = Math.floor(latest.progressToEnduranceChampion);
  const isComplete = latest.isExtendingEnduranceRecord;
  const remainingCopy = latest.isCurrentEnduranceChampion
    ? t('specialAllocation.needsToExtend', {
        duration: format.duration(latest.secondsUntilEnduranceChampion),
      })
    : t('specialAllocation.needsToBecomeChampion', {
        duration: format.duration(latest.secondsUntilEnduranceChampion),
      });

  return (
    <div
      className={cn(
        'rounded-control bg-surface-sunken',
        compact ? 'px-2.5 py-1.5' : 'mt-3 px-3 py-2',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          data-testid="latest-participant-remaining"
          className={cn('type-caption', isComplete ? 'text-live' : 'text-muted-foreground')}
        >
          {isComplete ? t('specialAllocation.extendingRecord') : remainingCopy}
        </span>
        <span className="shrink-0 text-xs font-medium tabular-nums slashed-zero text-foreground">
          {format.percent(progress)}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t('specialAllocation.progressAria')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-rule"
      >
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-slow motion-reduce:transition-none"
          style={{ width: `${latest.progressToEnduranceChampion}%` }}
        />
      </div>
      {!dashboard && (
        <p className="mt-1 type-caption text-subtle">
          {t('specialAllocation.progressAmounts', {
            current: format.duration(latest.holdDuration),
            target: format.duration(latest.durationToBeat),
          })}
        </p>
      )}
    </div>
  );
}

function LatestGestureDetails({
  latestGesture,
  latestAddress,
  compact,
  showLastGesture,
  gestureDetailsPending,
  dashboard,
}: Pick<
  LatestParticipantDetailsProps,
  | 'latestGesture'
  | 'latestAddress'
  | 'compact'
  | 'showLastGesture'
  | 'gestureDetailsPending'
  | 'dashboard'
>) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const hasGestureTime =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp);
  const gestureTimestamp =
    typeof latestGesture?.TimeStamp === 'number' && Number.isFinite(latestGesture.TimeStamp)
      ? latestGesture.TimeStamp
      : 0;
  const gestureTime = useHydrationSafeDateTime(gestureTimestamp, true, locale);

  const shouldShow = showLastGesture ?? !!latestGesture;
  if (!shouldShow) return null;

  const randomWalkStatus = latestGesture
    ? hasRandomWalkToken(latestGesture)
      ? t('specialAllocation.yesToken', { id: String(latestGesture.RWalkNFTId) })
      : resolveGestureType(latestGesture) === 1
        ? t('status.yes')
        : t('status.no')
    : t('status.unavailable');
  const gestureAddress = latestGesture?.BidderAddr ?? latestAddress;
  const syncingCopy = gestureDetailsPending
    ? t('specialAllocation.gestureDetailsSyncing')
    : t('specialAllocation.gestureDetailsUnavailable');

  if (dashboard) {
    return (
      <div data-testid="latest-participant-gesture-details" className="@container/gesture min-w-0">
        {latestGesture &&
          gestureAddress &&
          gestureAddress.toLowerCase() !== latestAddress?.toLowerCase() && (
            <p className="mb-1 flex flex-wrap items-center gap-1 type-caption text-subtle">
              {t('specialAllocation.gestureBy')}
              <Link
                href={`/user/${gestureAddress}`}
                aria-label={gestureAddress}
                title={gestureAddress}
                className={cn(
                  'type-mono-sm text-foreground transition-colors duration-fast hover:text-primary',
                  TOUCH_TARGET_TEXT_LINK_CLASS,
                )}
              >
                {shortenHex(gestureAddress, 6)}
              </Link>
            </p>
          )}
        {!latestGesture ? (
          <p
            data-testid="latest-participant-gesture-syncing"
            role="status"
            className="py-2 type-caption text-muted-foreground"
          >
            {syncingCopy}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 @min-[340px]/gesture:grid-cols-3 @min-[680px]/gesture:grid-cols-6">
            <DetailMetric
              testId="latest-participant-paid-amount"
              label={t('specialAllocation.amountPaid')}
              value={formatGesturePayment(latestGesture, t('status.unavailable'))}
              unframed
            />
            <DetailMetric
              testId="latest-participant-cst-received"
              label={t('specialAllocation.cstReceived')}
              value={formatReceivedCstAmount(
                getParticipationCST(latestGesture),
                t('status.unavailable'),
              )}
              unframed
            />
            <div className="min-w-0">
              <DetailMetric
                label={t('specialAllocation.method')}
                value={formatGestureMethod(latestGesture, t('status.unknown'))}
                unframed
              />
              {hasRandomWalkToken(latestGesture) && (
                <p
                  data-testid="latest-participant-random-walk"
                  className="mt-0.5 type-caption text-subtle"
                >
                  {randomWalkStatus}
                </p>
              )}
            </div>
            <DetailMetric
              label={t('specialAllocation.gestureTime')}
              value={hasGestureTime ? gestureTime : t('status.unavailable')}
              unframed
              className="@min-[340px]/gesture:col-span-2"
            />
            <DetailMetric
              testId="latest-participant-gesture-id"
              label={t('specialAllocation.gesturePosition')}
              value={
                typeof latestGesture.BidPosition === 'number'
                  ? `#${latestGesture.BidPosition}`
                  : t('status.unavailable')
              }
              unframed
            />
            {getAttachedAssetLabels(latestGesture).length > 0 && (
              <dl
                data-testid="latest-participant-attached-assets"
                className="col-span-full flex flex-wrap gap-x-1 type-caption"
              >
                <dt className="text-subtle">{t('specialAllocation.attachedAssets')}</dt>
                <dd className="font-medium text-foreground">
                  {formatAttachedAssets(latestGesture, t('status.none'))}
                </dd>
              </dl>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="latest-participant-gesture-details"
      className={cn(
        '@container/gesture min-w-0',
        compact
          ? 'rounded-control bg-surface-sunken p-2.5'
          : 'mt-3 border-t border-rule-faint pt-3',
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2">
        <p className="type-label text-muted-foreground">{t('specialAllocation.lastGesture')}</p>
        {latestGesture && gestureAddress && (
          <span className="ml-auto flex min-w-0 items-center gap-1 type-caption text-subtle">
            <span>{t('specialAllocation.gestureBy')}</span>
            <Link
              href={`/user/${gestureAddress}`}
              aria-label={gestureAddress}
              className={cn(
                'shrink-0 type-mono-sm text-foreground transition-colors duration-fast hover:text-primary',
                TOUCH_TARGET_TEXT_LINK_CLASS,
              )}
              title={gestureAddress}
            >
              {shortenHex(gestureAddress, 4)}
            </Link>
          </span>
        )}
      </div>
      {!latestGesture ? (
        <div
          data-testid="latest-participant-gesture-syncing"
          role="status"
          className={cn(
            'flex min-h-20 items-center py-2 type-caption text-muted-foreground',
            !compact && 'rounded-control bg-surface-sunken px-3',
          )}
        >
          {syncingCopy}
        </div>
      ) : (
        <div
          className={cn(
            'grid',
            compact
              ? 'grid-cols-2 gap-x-3 gap-y-2 @min-[420px]/gesture:grid-cols-3'
              : 'gap-1.5 @min-[420px]/gesture:grid-cols-2',
          )}
        >
          <DetailMetric
            testId="latest-participant-paid-amount"
            label={t('specialAllocation.amountPaid')}
            value={formatGesturePayment(latestGesture, t('status.unavailable'))}
            unframed={compact}
          />
          <DetailMetric
            label={t('specialAllocation.method')}
            value={formatGestureMethod(latestGesture, t('status.unknown'))}
            unframed={compact}
          />
          <DetailMetric
            testId="latest-participant-cst-received"
            label={t('specialAllocation.cstReceived')}
            value={formatReceivedCstAmount(
              getParticipationCST(latestGesture),
              t('status.unavailable'),
            )}
            unframed={compact}
          />
          <DetailMetric
            testId="latest-participant-random-walk"
            label={t('specialAllocation.randomWalk')}
            value={randomWalkStatus}
            unframed={compact}
          />
          <DetailMetric
            label={t('specialAllocation.gestureTime')}
            value={hasGestureTime ? gestureTime : t('status.unavailable')}
            unframed={compact}
          />
          <DetailMetric
            testId="latest-participant-gesture-id"
            label={t('specialAllocation.gesturePosition')}
            value={
              typeof latestGesture.BidPosition === 'number'
                ? `#${latestGesture.BidPosition}`
                : t('status.unavailable')
            }
            unframed={compact}
          />
          {getAttachedAssetLabels(latestGesture).length > 0 && (
            <DetailMetric
              testId="latest-participant-attached-assets"
              label={t('specialAllocation.attachedAssets')}
              value={formatAttachedAssets(latestGesture, t('status.none'))}
              unframed={compact}
              className={
                compact
                  ? 'col-span-2 @min-[420px]/gesture:col-span-3'
                  : '@min-[420px]/gesture:col-span-2'
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Complete detail body for the latest participant.
 *
 * It deliberately distinguishes the CST already received from the current
 * gesture from the allocation package the participant is merely in line for
 * if the cycle finalizes now. Inside a card it groups with hairlines and
 * sunken wells, never a second bordered box; amounts stay in ink, and only
 * the forming record carries the live colour.
 */
export function LatestParticipantDetails({
  latest,
  hasEnduranceRecord,
  latestGesture = null,
  latestAddress,
  message = null,
  showLastGesture,
  gestureDetailsPending = false,
  allocationPackage,
  compact = false,
  dashboard = false,
}: LatestParticipantDetailsProps) {
  // Never show a detached message while its transaction row is absent. Once
  // the row exists, the wire value wins and the legacy prop is only a same-row
  // compatibility fallback.
  const cleanMessage = latestGesture
    ? (latestGesture.Message?.trim() ?? '') || (message?.trim() ?? '')
    : '';

  return (
    <div className={cn('grid min-w-0 grid-cols-1', compact ? 'gap-2' : undefined)}>
      <LatestGestureProgress
        latest={latest}
        hasEnduranceRecord={hasEnduranceRecord}
        compact={compact}
        dashboard={dashboard}
      />
      <LatestGestureDetails
        latestGesture={latestGesture}
        latestAddress={latestAddress}
        compact={compact}
        showLastGesture={showLastGesture}
        gestureDetailsPending={gestureDetailsPending}
        dashboard={dashboard}
      />
      {allocationPackage && (
        <div
          data-testid="latest-participant-allocation-package"
          className={cn(
            'rounded-control bg-surface-sunken',
            compact ? 'px-2.5 py-2' : 'mt-3 px-3 py-2.5',
          )}
        >
          <p className="type-caption text-subtle">{allocationPackage.label}</p>
          <p className="mt-0.5 type-label tabular-nums slashed-zero text-foreground">
            {allocationPackage.primary}
          </p>
          {allocationPackage.secondary && (
            <p className="mt-0.5 type-caption text-subtle">{allocationPackage.secondary}</p>
          )}
        </div>
      )}
      {cleanMessage && (
        <div
          data-testid="latest-participant-message"
          className={cn(
            'flex items-start gap-2',
            dashboard
              ? 'py-1'
              : cn('rounded-control bg-surface-sunken', compact ? 'p-2.5' : 'mt-3 p-3'),
          )}
        >
          <MessageSquare aria-hidden className="mt-0.5 size-3.5 shrink-0 text-subtle" />
          <p className="line-clamp-2 break-words type-caption text-muted-foreground">
            &ldquo;{cleanMessage}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
