'use client';

import type { ReactNode } from 'react';
import { ArrowRight, CalendarPlus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  SmoothCountdown,
  type LocalizedCountdownRenderProps,
} from '@/components/common/SmoothCountdown';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import {
  CountdownFigures,
  countdownGroups,
  countdownPartsFromMs,
  countdownSeconds,
} from '@/components/ui/countdown-figures';
import { Duration } from '@/components/ui/duration';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useHydrated } from '@/hooks/useHydrated';
import { Term } from '@/components/ui/term';
import { UnknownValue } from '@/components/ui/unknown-value';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import { Link } from '@/i18n/navigation';
import { buildCalendarInviteDataUri } from '@/lib/calendarInvite';
import { getCycleState } from '@/lib/cycleState';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { TOUCH_TARGET_HEIGHT_CLASS, TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
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
 * The readout keeps the height of the figures (CountdownFigures' `desk`
 * bounds plus their captions) whatever stands in it. Words that replace the
 * figures (at zero, before the first Gesture) take the slightly smaller word
 * size so "Ready to finalize" stays on one line, but nothing on the clock
 * shrinks at zero.
 */
const WORD_SIZE = 'text-[clamp(1.625rem,7.5cqi,2.75rem)]';
const READOUT_HEIGHT = 'min-h-[calc(clamp(2.25rem,12cqi,3.5rem)+1.5rem)]';

/**
 * Ticks the server-rendered figures until React takes over. The page is
 * statically regenerated, so its HTML carries a countdown read up to a few
 * seconds before it was served, and on a slow phone hydration can take
 * several more: without this the clock sat frozen, then jumped. The script
 * runs where it stands (right after the figures), recomputes each group from
 * the deadline every second, and stops once the figures say they are
 * hydrated. It exists only in the server HTML: a client-side render never
 * creates it, since React ticks from the first frame. It rounds like
 * `countdownSeconds` (whole seconds, up), so React takes over on the same
 * reading.
 */
export const PREHYDRATION_TICK = `(function(){var s=document.currentScript,e=s&&s.previousElementSibling;if(!e)return;var t=Number(e.getAttribute('data-deadline'));if(!(t>0))return;var i=0;function k(){if(e.hasAttribute('data-hydrated')){clearInterval(i);return}var r=Math.max(0,Math.ceil((t-Date.now())/1e3)),v={days:Math.floor(r/86400),hours:Math.floor(r%86400/3600),minutes:Math.floor(r%3600/60),seconds:r%60},n=e.querySelectorAll('[data-unit]');for(var j=0;j<n.length;j++){var u=n[j].getAttribute('data-unit');if(u in v)n[j].textContent=String(v[u]).padStart(2,'0')}if(r<=0)clearInterval(i)}i=setInterval(k,1000);k()})();`;

function renderWindowCountdown({ total }: LocalizedCountdownRenderProps) {
  return (
    <Duration
      seconds={countdownSeconds(total)}
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
                renderer={({ total }) => (
                  // The one Cycle clock (the landing's and /current-cycle's
                  // too): padded groups, one set of captions, and one
                  // rounding rule (countdownSeconds), like the dock's and the
                  // pre-hydration tick's, so no two readings on the page are
                  // ever a second apart.
                  <CountdownFigures
                    groups={countdownGroups(countdownPartsFromMs(total), locale)}
                    size="desk"
                    align="start"
                    deadlineMs={targetMs}
                    hydrated={hydrated}
                    data-testid="clock-figures"
                  />
                )}
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
            ends on one; each item's words sit in their own box inside its
            gutter, so only the padding, never text, meets the clip. Every line
            is a 24px box, the attached-assets link's target size, so the line
            keeps its height when that link arrives. */}
        <div className="mt-0.5 overflow-hidden">
          <ul
            role="list"
            data-testid="clock-reserve-extras"
            className={cn(
              'type-caption -ms-4 flex flex-wrap text-subtle',
              TOUCH_TARGET_TEXT_LINK_CLASS,
            )}
          >
            <li className="ps-4">
              <span>{t('observatory.clock.reserveExtraCst')}</span>
            </li>
            <li className={ITEM_SEPARATOR}>
              <span>{t('observatory.clock.reserveExtraNft')}</span>
            </li>
            {attachedAssetCount > 0 && (
              <li className={ITEM_SEPARATOR} data-testid="clock-reserve-attached">
                {attachedAssetsHref ? (
                  <a
                    href={attachedAssetsHref}
                    className={cn(
                      'link-quiet inline-flex text-primary',
                      TOUCH_TARGET_TEXT_LINK_CLASS,
                    )}
                  >
                    {t('observatory.clock.reserveAttached', { count: attachedAssetCount })}
                  </a>
                ) : (
                  <span>
                    {t('observatory.clock.reserveAttached', { count: attachedAssetCount })}
                  </span>
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
                // The home in the viewer's own language, on this build's app host.
                url: localeHref(APP_ORIGIN, '/', locale),
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
