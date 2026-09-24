'use client';

import { useId, type ReactNode } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { CalendarPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Amount } from '@/components/ui/amount';
import { Badge } from '@/components/ui/badge';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { LiveStatus } from '@/components/ui/live-status';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getAttachedAssetValues, getAttachedAssetVariant } from '@/lib/attachedAssets';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

import { viewForPhase, type PhaseTone } from './phaseView';

interface CycleMonumentProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  /** Attached assets that ride along with the Signature Allocation. */
  attachedNFTCount?: number;
  attachedERC20Count?: number;
  /** The gesture console, under the clock and the Signature Allocation. */
  children?: ReactNode;
  className?: string;
}

const BADGE_TONE: Record<Exclude<PhaseTone, 'neutral' | 'live'>, 'attention' | 'positive'> = {
  attention: 'attention',
  positive: 'positive',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** A thin colon between clock fields: the digits carry the reading, not the punctuation. */
function Colon() {
  return (
    <span aria-hidden className="px-[0.06em] text-subtle">
      :
    </span>
  );
}

/**
 * The clock as type: "6d 22:27:13" in tabular Inter, the day unit set small
 * and quiet beside its figure. No tiles, no ring; the figures keep their size
 * and colour in every phase, so a glance reads the time, not the styling.
 */
function ClockFigures({
  days,
  hours,
  minutes,
  seconds,
  dayUnit,
}: Pick<CountdownRenderProps, 'days' | 'hours' | 'minutes' | 'seconds'> & { dayUnit: string }) {
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-[0.3em] whitespace-nowrap type-figure-xl text-foreground">
      {days > 0 ? (
        <span data-testid="monument-clock-days">
          {days}
          <span className="ms-[0.08em] type-body-lg text-subtle">{dayUnit}</span>
        </span>
      ) : null}
      <span data-testid="monument-clock-time">
        {pad(hours)}
        <Colon />
        {pad(minutes)}
        <Colon />
        {pad(seconds)}
      </span>
    </span>
  );
}

/**
 * The cycle readout at the head of the monument column: the phase as words,
 * the finalization clock as type with its freshness stamp, then the
 * Signature Allocation as the column's one large figure. The gesture console
 * follows as children, so reading the clock and acting on it happen in one
 * column.
 */
export function CycleMonument({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  attachedNFTCount = 0,
  attachedERC20Count = 0,
  children,
  className,
}: CycleMonumentProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tFormats = useTranslations('formats');
  const headingId = useId();

  const cycleState = getCycleState({
    data,
    loading,
    allocationTime,
    activationTime,
    now,
    finalizationConfirmed,
  });
  const phase = cycleState.phase;
  const view = viewForPhase(phase);
  const phaseCopy = (field: 'eyebrow' | 'label' | 'status' | 'tooltip' | 'display') =>
    t(`chrono.phase.${view.messageKey}.${field}`);
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const dayUnit = tFormats('durationCompact.days');

  const reserveEth = data ? (data.PrizeAmountEth ?? data.CurPrizeAmountEth ?? null) : null;
  const attachedAssetVariant = getAttachedAssetVariant(attachedNFTCount, attachedERC20Count);
  const attachedAssetValues = getAttachedAssetValues(
    attachedAssetVariant,
    attachedNFTCount,
    attachedERC20Count,
  );

  const renderClock = ({ days, hours, minutes, seconds }: CountdownRenderProps) => (
    <ClockFigures days={days} hours={hours} minutes={minutes} seconds={seconds} dayUnit={dayUnit} />
  );

  // A zero reads as figures ("00:00"); a state reads as words.
  const displayIsFigure = view.messageKey === 'confirming' || view.messageKey === 'readyToFinalize';
  const display = view.hasDisplayText ? phaseCopy('display') : phaseCopy('label');

  let clock: ReactNode;
  if (showCountdown) {
    clock = (
      <SmoothCountdown
        date={targetMs}
        initialNowMs={now}
        intervalMs={1000}
        renderer={renderClock}
      />
    );
  } else if (phase === 'loading') {
    clock = (
      <div className="type-figure-xl" data-testid="monument-clock-loading">
        <Skeleton className="h-[1em] w-[5.5ch] rounded-control" />
        <span className="sr-only">{display}</span>
      </div>
    );
  } else if (displayIsFigure) {
    clock = <span className="type-figure-xl text-foreground">{display}</span>;
  } else {
    clock = <span className="type-heading-1 text-foreground">{display}</span>;
  }

  const stateBadge =
    view.tone === 'attention' || view.tone === 'positive' ? (
      <Badge tone={BADGE_TONE[view.tone]} size="sm" dot data-testid="monument-phase-badge">
        {phaseCopy('label')}
      </Badge>
    ) : null;

  const calendarStart = cycleState.activationTime ?? 0;

  // A group, not a region: the console it holds is the page's section, and
  // regions nested three deep (clock › console › Calibration Window) only
  // lengthen the landmark list.
  return (
    <div
      role="group"
      aria-labelledby={headingId}
      data-testid="cycle-monument"
      data-phase={phase}
      className={cn('min-w-0', className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id={headingId} className="type-label text-muted-foreground">
            <ExplainedTerm definition={phaseCopy('tooltip')}>{phaseCopy('eyebrow')}</ExplainedTerm>
          </h2>
          {stateBadge}
        </div>
        <LiveStatus variant="inline" clockCaveat />
      </div>

      <div
        role="timer"
        aria-live="off"
        aria-label={t('chrono.timerAria', {
          label: phaseCopy('label'),
          status: phaseCopy('status'),
        })}
        className="mt-3 min-h-[1em] type-figure-xl"
        data-testid="monument-clock"
      >
        {clock}
      </div>
      <p className="mt-3 max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {phaseCopy('status')}
      </p>

      {cycleState.isOpeningSoon && calendarStart > 0 ? (
        <a
          data-testid="monument-calendar-link"
          href={buildCalendarInviteDataUri({
            uid: `cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening`,
            title: t('deck.monument.calendarTitle', { number: String(data?.CurRoundNum ?? '') }),
            description: t('deck.monument.calendarBody'),
            url: 'https://app.cosmicsignature.com/',
            startSeconds: calendarStart,
          })}
          download={`cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening.ics`}
          className={cn(
            'link mt-2 inline-flex items-center gap-2 type-body-sm',
            TOUCH_TARGET_HEIGHT_CLASS,
          )}
        >
          <CalendarPlus className="size-4" aria-hidden />
          {t('deck.monument.calendarCta')}
        </a>
      ) : null}

      <div data-testid="monument-reserve" className="mt-6 border-t border-rule-faint pt-5">
        <p className="type-label text-muted-foreground">
          <ExplainedTerm
            definition={t(
              `status.metrics.signatureTooltip.${attachedAssetVariant}`,
              attachedAssetValues,
            )}
          >
            {t('deck.monument.reserveLabel')}
          </ExplainedTerm>
        </p>
        <div className="mt-2 type-figure-lg text-foreground">
          {loading && !data ? (
            <Skeleton className="h-[1.1em] w-[7ch] rounded-control" />
          ) : reserveEth == null ? (
            <UnknownValue label={tCommon('status.unavailable')} />
          ) : (
            <Amount value={reserveEth} unit="ETH" unitClassName="type-body-lg text-subtle" />
          )}
        </div>
        <p className="mt-1.5 type-caption text-subtle">{t('deck.monument.reserveExtras')}</p>
      </div>

      {children}
    </div>
  );
}
