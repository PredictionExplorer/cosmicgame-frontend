'use client';

import { zeroAddress } from 'viem';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { InfoTooltip } from '@/components/ui/info-tooltip';
import { LiveStatus } from '@/components/ui/live-status';
import type { EthGestureInfo } from '@/hooks/useGestureForm';
import { useFormat } from '@/hooks/useFormat';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { getCstAuctionProgress, type CstGestureData } from '@/utils/cstGesture';
import { formatEthMethodQuote } from '@/utils/gestureQuote';
import { NBSP } from '@/utils/format';

import { ValuePending } from './ValuePending';

export interface CalibrationStatusProps {
  data: DashboardInfo | null;
  ethGestureInfo: EthGestureInfo | null;
  cstGestureData: CstGestureData;
  className?: string;
}

interface PriceTrackProps {
  /** Share of the window elapsed, 0–100. */
  percent: number;
  /** Accessible reading: the cost now and when it reaches its floor. */
  valueText: string;
  label: string;
}

/** The track's height in viewBox units (it is drawn 36px tall) and its inset. */
const TRACK_HEIGHT = 36;
const TRACK_INSET = 3;

/** The share of the window elapsed, clamped to the track (0–100). */
function trackPosition(percent: number): number {
  return Math.min(100, Math.max(0, percent));
}

/**
 * The price the participant decides on, as a 36px sparkline: the Gesture
 * Cost descends linearly across the window from its opening price (top left)
 * to its floor (bottom right), solid for the part already behind and dashed
 * for the part to come, with a dot and a hairline tick at now, where the
 * cost-now figure stands. It is the window's progress bar, drawn as the trend
 * it represents, in the foreground ink: amber beside the live dot would read
 * as a warning.
 */
function PriceTrack({ percent, valueText, label }: PriceTrackProps) {
  const now = trackPosition(percent);
  const fall = TRACK_HEIGHT - 2 * TRACK_INSET;
  const nowY = TRACK_INSET + (fall * now) / 100;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(now * 10) / 10}
      aria-valuetext={valueText}
      data-testid="calibration-track"
      className="relative h-9 min-w-0 text-foreground"
    >
      <svg
        aria-hidden
        viewBox={`0 0 100 ${TRACK_HEIGHT}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        {/* The tick that ties the figure above to the dot at now. */}
        <line
          x1={now}
          y1={0}
          x2={now}
          y2={nowY}
          className="stroke-rule"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={now}
          y1={nowY}
          x2={100}
          y2={TRACK_HEIGHT - TRACK_INSET}
          className="stroke-subtle"
          strokeWidth={1}
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={0}
          y1={TRACK_INSET}
          x2={now}
          y2={nowY}
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        aria-hidden
        className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current ring-2 ring-background"
        style={{ left: `${now}%`, top: `${(nowY / TRACK_HEIGHT) * 100}%` }}
      />
    </div>
  );
}

/**
 * The running Calibration Window as the price people decide on: the cost
 * now, standing over the point of the descending track that marks now, the
 * floor at the track's end, and when it gets there, as a clock like every
 * countdown on the desk. Before the first Gesture it is the opening ETH
 * window; after it, the CST window. The window's length and elapsed time
 * live in the explanation. Before the timing arrives the same structure
 * renders with the figures pending, so nothing reflows when they land.
 */
export function CalibrationStatus({
  data,
  ethGestureInfo,
  cstGestureData,
  className,
}: CalibrationStatusProps) {
  const t = useTranslations('home');
  const format = useFormat();
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

  // The cost now, only from a real quote (timing alone does not price it).
  const costNow = firstGesture
    ? ethGestureInfo && Number.isFinite(ethGestureInfo.ETHPrice)
      ? `${formatEthMethodQuote(ethGestureInfo.ETHPrice, 'ETH', format.locale)}${NBSP}ETH`
      : null
    : cstGestureData.source !== 'empty'
      ? format.amount(cstGestureData.isFree ? 0 : cstGestureData.CSTPrice, { unit: 'CST' })
      : null;
  // A countdown reads as a clock, like the desk's other countdowns.
  const remaining = progress
    ? format.duration(progress.secondsRemaining, { style: 'clock' })
    : null;
  const nowPercent = progress ? trackPosition(progress.percentComplete) : 0;
  // Spoken in full; shown under the track's "0 CST" end as "in 7h 25m".
  const floorReading = remaining
    ? firstGesture
      ? t('calibration.windowEndsIn', { duration: remaining })
      : t('calibration.reachesFloorIn', { duration: remaining })
    : null;
  const floorCaption = remaining
    ? firstGesture
      ? floorReading
      : t('calibration.floorIn', { duration: remaining })
    : null;
  const endedMessage =
    firstGesture || cstGestureData.source === 'empty'
      ? t('calibration.defaultEndedMessage')
      : t('calibration.cstEndedMessage');
  const explanation = progress
    ? `${subtitle} ${t('calibration.windowDetails', {
        duration: format.duration(progress.auctionDuration),
        elapsed: format.duration(progress.secondsElapsed),
      })}`
    : subtitle;

  return (
    <section
      aria-labelledby="calibration-status-title"
      data-testid="calibration-status"
      data-window={firstGesture ? 'eth' : 'cst'}
      className={cn('min-w-0', className)}
    >
      <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex min-w-0 items-center gap-1.5">
          {/* The desk's one region-heading style (docs/design-system.md). */}
          <h2 id="calibration-status-title" className="type-heading-3 min-w-0 text-foreground">
            {title}
          </h2>
          <InfoTooltip content={explanation} label={title} />
        </div>
        {/* The quote's own stamp appears only when it stops updating. */}
        <LiveStatus
          variant="inline"
          still
          quietWhenFresh
          announce={false}
          queryKeys={firstGesture ? [['bidEthPrice']] : [['ctPrice']]}
          pollIntervalMs={15_000}
        />
      </div>

      <div className="mt-2 flex min-w-0 items-end gap-3">
        <div className="min-w-0 flex-1">
          {/* The cost now stands over the dot that marks now on the track: its
              left edge sits at now's share of the width, drawn back by the
              same share of its own width, so it follows the dot and never
              leaves the track. */}
          <div className="relative h-11">
            <span
              data-testid="calibration-cost-now"
              className="absolute bottom-1.5 flex flex-col whitespace-nowrap"
              style={{ left: `${nowPercent}%`, transform: `translateX(-${nowPercent}%)` }}
            >
              <span className="type-caption text-subtle">{t('calibration.costNow')}</span>
              <span className="type-figure-sm text-foreground">
                {costNow ?? <ValuePending ch={9} />}
              </span>
            </span>
          </div>
          {progress ? (
            <PriceTrack
              percent={progress.percentComplete}
              label={t('calibration.progressAria', { title })}
              valueText={[costNow, progress.isEnded ? endedMessage : floorReading]
                .filter(Boolean)
                .join(' · ')}
            />
          ) : (
            <span className="block h-px min-w-0 bg-rule" aria-hidden />
          )}
        </div>
        {!firstGesture && (
          <span
            data-testid="calibration-floor"
            className="type-caption shrink-0 self-end leading-none text-subtle"
          >
            {t('calibration.floor')}
          </span>
        )}
      </div>

      {progress?.isEnded ? (
        <p data-testid="calibration-ended" className="type-caption mt-1.5 text-muted-foreground">
          {endedMessage}
        </p>
      ) : (
        <p className="type-caption mt-1.5 flex min-w-0 justify-end text-subtle">
          {floorCaption ? (
            <span data-testid="calibration-floor-in" className="tabular-nums text-muted-foreground">
              {floorCaption}
            </span>
          ) : (
            <ValuePending ch={12} />
          )}
        </p>
      )}
    </section>
  );
}
