'use client';

import { Fragment, type ReactNode } from 'react';
import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, CalendarPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useHydrated } from '@/hooks/useHydrated';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { Link } from '@/i18n/navigation';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getCycleState } from '@/lib/cycleState';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { formatAmount, sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';

import { PHASE_TEXT_CLASS, viewForPhase } from './phaseView';
import { ValuePending } from './ValuePending';

export interface CycleClockProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  account?: string | null;
  /** True once the deadline passed, on-chain state confirms it, and the cycle can close. */
  canClaim: boolean;
  isClaiming: boolean;
  /** Timestamp (ms) after which any wallet, not only the Last Gesture holder, may finalize. */
  claimWait: number;
  onFinalize: () => void;
  /** ETH price in USD for the allocation conversion; 0 hides the USD line. */
  ethUsdPrice?: number;
  /**
   * NFTs and tokens attached to this cycle's Gestures, which travel with the
   * Signature Allocation; the line names them only when there are some.
   */
  attachedAssetCount?: number;
  /** Where the attached assets are listed on the page (a same-page anchor). */
  attachedAssetsHref?: string;
  /** A control beside the clock's heading (the finalization alerts menu). */
  headingAction?: ReactNode;
  className?: string;
}

/** A dot centred in the 1rem gutter before an item; clipped when the item starts a line. */
const ITEM_SEPARATOR =
  "relative ps-4 before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:flex before:w-4 before:items-center before:justify-center before:text-subtle before:content-['·']";

/**
 * The clock's one size, fitted to its column: four two-digit groups and three
 * colons never outgrow a 288px phone column or a 380px laptop column. Words
 * that replace the figures (at zero, before the first Gesture) take the
 * slightly smaller word size so "Ready to finalize" stays on one line, but
 * the readout keeps its height: nothing on the clock shrinks at zero.
 */
const FIGURE_SIZE = 'text-[clamp(2.25rem,12cqi,3.5rem)]';
const WORD_SIZE = 'text-[clamp(1.625rem,7.5cqi,2.75rem)]';
const READOUT_HEIGHT = 'min-h-[calc(clamp(2.25rem,12cqi,3.5rem)+1.5rem)]';

type UnitId = 'days' | 'hours' | 'minutes' | 'seconds';

interface ClockGroup {
  id: UnitId;
  value: number;
}

/**
 * DD:HH:MM:SS while days remain, then HH:MM:SS: the width never jumps within
 * a phase. Each group is captioned by its unit as a fixed column label (the
 * spoken reading comes from the timer's own label), so a caption never
 * changes word or width as the digits tick.
 */
function clockGroups({ days, hours, minutes, seconds }: CountdownRenderProps): ClockGroup[] {
  const groups: ClockGroup[] = [
    { id: 'hours', value: hours },
    { id: 'minutes', value: minutes },
    { id: 'seconds', value: seconds },
  ];
  return days > 0 ? [{ id: 'days', value: days }, ...groups] : groups;
}

/**
 * Ticks the server-rendered figures until React takes over. The page is
 * statically regenerated, so its HTML carries a countdown read up to a few
 * seconds before it was served, and on a slow phone hydration can take
 * several more: without this the clock sat frozen, then jumped. The script
 * runs where it stands (right after the figures), recomputes each group from
 * the deadline every second, and stops once the figures say they are
 * hydrated. It exists only in the server HTML: a client-side render never
 * creates it, since React ticks from the first frame.
 */
export const PREHYDRATION_TICK = `(function(){var s=document.currentScript,e=s&&s.previousElementSibling;if(!e)return;var t=Number(e.getAttribute('data-deadline'));if(!(t>0))return;var i=0;function k(){if(e.hasAttribute('data-hydrated')){clearInterval(i);return}var r=Math.max(0,t-Date.now()),v={days:Math.floor(r/864e5),hours:Math.floor(r%864e5/36e5),minutes:Math.floor(r%36e5/6e4),seconds:Math.floor(r%6e4/1e3)},n=e.querySelectorAll('[data-unit]');for(var j=0;j<n.length;j++){var u=n[j].getAttribute('data-unit');if(u in v)n[j].textContent=String(v[u]).padStart(2,'0')}if(r<=0)clearInterval(i)}i=setInterval(k,1000);k()})();`;

/**
 * The clock as type: tabular Inter figures with hairline colons and a
 * localized caption unit under each group. No tiles, rings or glows.
 */
function ClockFigures({ deadlineMs, ...props }: CountdownRenderProps & { deadlineMs: number }) {
  const t = useTranslations('home.observatory.clock.unitLabels');
  const groups = clockGroups(props);
  const hydrated = useHydrated();

  return (
    <div
      data-testid="clock-figures"
      data-deadline={deadlineMs}
      data-hydrated={hydrated || undefined}
      // The size goes first: tailwind-merge drops a leading-* that precedes a
      // text-[size], and the digits must set solid (line-height 1).
      className={cn(
        FIGURE_SIZE,
        'flex items-start justify-start gap-[0.12em] font-normal leading-none tracking-[-0.03em] text-foreground tabular-nums lining-nums slashed-zero',
      )}
    >
      {groups.map((group, index) => (
        <Fragment key={group.id}>
          {index > 0 && (
            <span aria-hidden className="font-light text-subtle">
              :
            </span>
          )}
          <span className="flex flex-col items-center">
            {/* The pre-hydration tick may already have moved these digits on;
                React's first render keeps the server value it reconciles. */}
            <span data-unit={group.id} suppressHydrationWarning>
              {String(group.value).padStart(2, '0')}
            </span>
            <span className="type-caption mt-1 tracking-normal text-subtle">{t(group.id)}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function renderWindowCountdown({ total }: CountdownRenderProps) {
  return (
    <Duration
      seconds={Math.ceil(total / 1000)}
      variant="clock"
      className="type-figure-sm text-foreground"
    />
  );
}

/**
 * The observatory's first reading: the Cycle Finalization Time as type under
 * the phase as the region's heading, and what the cycle is for (the
 * Signature Allocation). It owns the finalize action: closing the cycle is
 * the clock reaching zero, not a form concern. At zero nothing shrinks: the
 * figures give way to "Ready to finalize" at the clock's size, with who may
 * finalize and from when. Everything reads from the start edge, like the
 * ledger beside it, so a late figure (the USD reading) never moves another.
 */
export function CycleClock({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  account = null,
  canClaim,
  isClaiming,
  claimWait,
  onFinalize,
  ethUsdPrice = 0,
  attachedAssetCount = 0,
  attachedAssetsHref,
  headingAction = null,
  className,
}: CycleClockProps) {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const hydrated = useHydrated();

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
  const eyebrow = t(`chrono.phase.${view.messageKey}.eyebrow`);
  const label = t(`chrono.phase.${view.messageKey}.label`);
  const status = t(`chrono.phase.${view.messageKey}.status`);
  const tooltip = t(`chrono.phase.${view.messageKey}.tooltip`);
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;

  // The word that stands in for the figures (only phases without a countdown
  // have one in the catalog).
  const displayText = (() => {
    if (showCountdown) return null;
    if (cycleState.isReadyToFinalize) return t('observatory.clock.state.ready');
    if (cycleState.isConfirmingFinalization) return t('observatory.clock.state.confirming');
    if (phase === 'unavailable') return label;
    return t(`chrono.phase.${view.messageKey}.display`);
  })();

  const reserveEth = toFiniteNumber(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth);
  const reserveUsd = reserveEth != null && ethUsdPrice > 0 ? reserveEth * ethUsdPrice : null;

  // At zero the Last Gesture holder has an exclusive window; after it, anyone
  // may finalize. Both facts are stated, with the time, for every viewer.
  const isHolder = sameAddress(account, data?.LastBidderAddr);
  const windowOpen = claimWait > now;
  const canFinalizeHere =
    !loading && cycleState.isReadyToFinalize && canClaim && !!account && (isHolder || !windowOpen);

  return (
    <section
      id="cycle-clock"
      tabIndex={-1}
      // The region keeps one stable name; its visible heading is the phase.
      aria-label={t('chrono.sectionAria')}
      className={cn(
        'print-motion-visible relative min-w-0 scroll-mt-24 focus:outline-none',
        className,
      )}
      data-testid="cycle-clock"
      data-phase={phase}
    >
      <div className="flex min-h-6 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1.5">
          <h2 id="cycle-clock-title" className="type-heading-3 min-w-0 text-foreground">
            {eyebrow}
          </h2>
          <InfoTooltip content={tooltip} label={eyebrow} />
        </div>
        {headingAction}
      </div>

      <div
        className={cn('@container mt-2.5 flex items-end', READOUT_HEIGHT)}
        role="timer"
        aria-live="off"
        aria-label={t('chrono.timerAria', { label, status })}
      >
        <div className="w-full">
          {showCountdown ? (
            <>
              <SmoothCountdown
                date={targetMs}
                initialNowMs={now}
                renderer={(props) => <ClockFigures {...props} deadlineMs={targetMs} />}
                intervalMs={1000}
              />
              {/* Server HTML and hydration only: a client-side render ticks
                  from its first frame, and never creates a script. */}
              {!hydrated && <script dangerouslySetInnerHTML={{ __html: PREHYDRATION_TICK }} />}
            </>
          ) : (
            <p
              data-testid="clock-display"
              className={cn(
                WORD_SIZE,
                'font-medium leading-tight tracking-[-0.02em] text-balance',
                cycleState.isReadyToFinalize ? PHASE_TEXT_CLASS.positive : 'text-foreground',
              )}
            >
              {displayText}
            </p>
          )}
        </div>
      </div>

      <p
        data-testid="clock-status"
        className={cn(
          'type-body-sm mt-2 max-w-[var(--measure-lede)] text-pretty',
          view.tone === 'attention' ? PHASE_TEXT_CLASS.attention : 'text-muted-foreground',
        )}
      >
        {status}
      </p>

      {cycleState.isReadyToFinalize && (
        <div data-testid="clock-finalize-window" className="mt-4 w-full max-w-sm">
          {windowOpen ? (
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="type-label text-subtle">
                {isHolder
                  ? t('observatory.clock.finalize.exclusiveFor')
                  : t('observatory.clock.finalize.openIn')}
              </span>
              <SmoothCountdown
                date={claimWait}
                initialNowMs={now}
                renderer={renderWindowCountdown}
                intervalMs={1000}
              />
            </p>
          ) : (
            <p className="type-label text-muted-foreground">
              {t('observatory.clock.finalize.openNow')}
            </p>
          )}
          {canFinalizeHere && (
            <ChainGuard className="mt-3" buttonClassName="w-full">
              <Button
                variant="commit"
                size="xl"
                data-testid="clock-finalize"
                onClick={onFinalize}
                loading={isClaiming}
                className="mt-3 w-full"
              >
                {t('form.finalize')}
                <ArrowRight aria-hidden />
              </Button>
            </ChainGuard>
          )}
        </div>
      )}

      {/* What the cycle is for: the Signature Allocation. */}
      <div data-testid="clock-reserve" className="mt-3 border-t border-rule-faint pt-3">
        <p className="type-label text-subtle">
          <Term id="signatureAllocation">{t('observatory.clock.reserveLabel')}</Term>
        </p>
        <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {reserveEth != null ? (
            <Amount
              value={reserveEth}
              unit="ETH"
              context="card"
              data-testid="clock-reserve-amount"
              className="type-figure-lg text-foreground"
            />
          ) : loading ? (
            <ValuePending ch={9} className="type-figure-lg" />
          ) : (
            <UnknownValue label={tCommon('status.unavailable')} className="type-figure-lg" />
          )}
          {reserveUsd != null && (
            <span data-testid="clock-reserve-usd" className="type-caption text-subtle">
              {t('observatory.clock.reserveUsd', {
                amount: formatAmount(reserveUsd, { unit: 'USD', locale, withUnit: false }),
              })}
            </span>
          )}
        </p>
        {/* The fixed extras, then the attached assets when there are any. The
            dots hang in clipped gutters, so a wrapped line never starts or
            ends on one. */}
        <div className="mt-1 overflow-hidden">
          <ul
            role="list"
            data-testid="clock-reserve-extras"
            className="type-caption -ms-4 flex flex-wrap text-subtle"
          >
            <li className="ps-4">{t('observatory.clock.reserveExtraCst')}</li>
            <li className={ITEM_SEPARATOR}>{t('observatory.clock.reserveExtraNft')}</li>
            {attachedAssetCount > 0 && (
              <li className={ITEM_SEPARATOR} data-testid="clock-reserve-attached">
                {attachedAssetsHref ? (
                  <a href={attachedAssetsHref} className="link-quiet text-primary">
                    {t('observatory.clock.reserveAttached', { count: attachedAssetCount })}
                  </a>
                ) : (
                  t('observatory.clock.reserveAttached', { count: attachedAssetCount })
                )}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Between cycles: a calendar invite and the cycle-details path. */}
      {!loading && !isRoundActive && (
        <div className="mt-4 flex flex-col items-start gap-1">
          {cycleState.isOpeningSoon && (cycleState.activationTime ?? 0) > 0 && (
            <a
              data-testid="clock-calendar-link"
              href={buildCalendarInviteDataUri({
                uid: `cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening`,
                title: t('observatory.clock.calendarTitle', {
                  number: String(data?.CurRoundNum ?? ''),
                }),
                description: t('observatory.clock.calendarBody'),
                url: 'https://app.cosmicsignature.com/',
                startSeconds: cycleState.activationTime ?? 0,
              })}
              download={`cosmic-cycle-${data?.CurRoundNum ?? 'next'}-opening.ics`}
              className={cn(
                'link-quiet inline-flex items-center gap-2 text-sm font-medium text-primary',
                TOUCH_TARGET_HEIGHT_CLASS,
              )}
            >
              <CalendarPlus className="size-4" aria-hidden />
              {t('observatory.clock.calendarCta')}
            </a>
          )}
          <Link
            href="/current-cycle"
            className={cn(
              'link-quiet inline-flex items-center gap-2 text-sm font-medium text-primary',
              TOUCH_TARGET_HEIGHT_CLASS,
            )}
          >
            {t('chrono.cta.viewCycle')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
