'use client';

import { useId, useRef, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { countdownSeconds } from '@/components/ui/countdown-figures';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { Duration } from '@/components/ui/duration';
import { ConnectWalletAction } from '@/components/wallet/ConnectWalletAction';
import type { PositionMoment } from '@/hooks/usePositionMoment';
import { useTxStageLabel, type TxStage } from '@/hooks/useTxFlow';
import { SignatureAllocationIcon } from '@/lib/conceptIcons';
import { getCycleState } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';
import { sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';

import type { GestureSubmitParts } from './gestureSubmitLabel';
import { PHASE_TEXT_CLASS, viewForPhase } from './phaseView';
import { useFocusClearOfDock } from './useFocusClearOfDock';

export interface ActionDockProps {
  /**
   * Out of sight, out of the tab order and the accessibility tree: while the
   * page's own clock or form is on screen (the dock would repeat the one and
   * lie over the other), before the page has measured, or while the sheet
   * is open.
   */
  stepAside: boolean;
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  /** The selected method's live-priced label, as verb and price. */
  submit: GestureSubmitParts;
  isGesturing: boolean;
  txStage: TxStage;
  account?: string | null;
  /** True once the deadline passed, on-chain state confirms it, and the cycle can close. */
  canClaim: boolean;
  isClaiming: boolean;
  /** Timestamp (ms) after which any wallet may finalize. */
  claimWait: number;
  onFinalize: () => void;
  /** The connected wallet's latest change of position. */
  moment?: PositionMoment | null;
  /** Phones: open the bottom sheet hosting the gesture panel. */
  onOpenSheet: () => void;
  /** Tablets and up: scroll back to the one gesture panel. */
  onJumpToPanel: () => void;
  className?: string;
}

/**
 * The one persistent quick action: a single opaque line on the raised
 * surface with the clock, the Signature Allocation (or the wallet's own
 * position when it changes) and one commit button. It never submits a
 * gesture itself: on phones it opens the bottom sheet with the gesture panel,
 * from tablets up it returns to the panel, so the price shown and the price
 * paid come from the same place. Without a wallet its action is the same
 * "Connect wallet" the form offers, opening the wallet list directly. It
 * shows the live transaction stage while a Gesture is in flight, and at zero
 * it turns into Finalize for whoever may finalize. It steps aside while the
 * page's own clock or form is on screen, so it never repeats them or covers
 * a control, and it keeps keyboard focus from landing under it.
 */
export function ActionDock({
  stepAside,
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  submit,
  isGesturing,
  txStage,
  account = null,
  canClaim,
  isClaiming,
  claimWait,
  onFinalize,
  moment = null,
  onOpenSheet,
  onJumpToPanel,
  className,
}: ActionDockProps) {
  const t = useTranslations('home');
  const stageLabel = useTxStageLabel();
  const describedById = useId();
  // Keyboard focus never lands under the dock, on any page that mounts it.
  const dockRef = useRef<HTMLDivElement>(null);
  useFocusClearOfDock(dockRef);

  const cycleState = getCycleState({
    data,
    loading,
    allocationTime,
    activationTime,
    now,
    finalizationConfirmed,
  });
  const view = viewForPhase(cycleState.phase);
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const isRoundActive =
    cycleState.isGestureOpen || cycleState.isReadyToFinalize || cycleState.isConfirmingFinalization;
  const reserveEth = toFiniteNumber(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth);
  const isHolder = sameAddress(account, data?.LastBidderAddr);
  const rendered = !loading && isRoundActive;

  if (!rendered) return null;

  const finalizeMode =
    cycleState.isReadyToFinalize && !!account && canClaim && (isHolder || claimWait <= now);
  const hidden = stepAside;

  // The line under the clock: the wallet's own moment when there is one,
  // otherwise what the cycle is for. Who may finalize and from when stays
  // with the clock, so the dock keeps to one line in every locale.
  let status: ReactNode;
  if (moment?.kind === 'taken' && !isHolder) {
    status = (
      <span className={PHASE_TEXT_CLASS.attention}>{t('observatory.standing.positionTaken')}</span>
    );
  } else if (isHolder) {
    status = (
      <span className={PHASE_TEXT_CLASS.positive}>{t('observatory.standing.positionLatest')}</span>
    );
  } else {
    status = (
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <SignatureAllocationIcon className="size-3.5 shrink-0 text-subtle" aria-hidden />
        <span className="sr-only min-[25rem]:not-sr-only">
          {t('observatory.clock.reserveLabel')}
        </span>
        {reserveEth != null && (
          <Amount value={reserveEth} unit="ETH" context="card" className="text-foreground" />
        )}
      </span>
    );
  }

  const busy = isGesturing ? stageLabel(txStage) : null;
  const gestureLabel = busy ?? (
    <span className="flex min-w-0 flex-col items-center leading-tight">
      <span className="text-[0.8125rem] font-semibold min-[360px]:text-sm">{submit.action}</span>{' '}
      {submit.cost && <span className="text-xs font-medium tabular-nums">{submit.cost}</span>}
    </span>
  );

  return (
    <div
      ref={dockRef}
      data-action-dock
      data-state={hidden ? 'aside' : 'shown'}
      className={cn(
        'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 md:inset-x-0 md:bottom-4 md:px-4 print:hidden',
        'transition-[transform,opacity,visibility] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] motion-reduce:transition-none',
        hidden && 'pointer-events-none translate-y-[calc(100%+1.5rem)] opacity-0',
        className,
      )}
      aria-hidden={hidden || undefined}
      inert={hidden || undefined}
    >
      <section
        aria-label={t('observatory.dock.aria')}
        data-testid="action-dock"
        data-phase={cycleState.phase}
        // Opaque: the form scrolling underneath never shows through the one
        // surface that carries the commit action.
        className="mx-auto flex min-h-16 max-w-2xl items-center justify-between gap-3 rounded-surface border border-rule bg-surface-raised px-3.5 py-2 shadow-float md:px-4"
      >
        <div
          data-testid="action-dock-status"
          className="flex min-w-0 max-w-[55%] shrink-0 flex-col gap-0.5"
        >
          {showCountdown ? (
            <span role="timer" aria-live="off" className="whitespace-nowrap">
              <SmoothCountdown
                date={targetMs}
                initialNowMs={now}
                renderer={(parts) => (
                  // The dock shows only once the Cycle clock has scrolled
                  // away, so it names its units on its own: the site's one
                  // countdown shape, the day count with its unit and the
                  // rest as a clock ("4d 21:30:48"), rounded like the Cycle
                  // clock. Screen readers hear it spelled out ("4d 21h 30m 48s").
                  <>
                    <Duration
                      seconds={countdownSeconds(parts.total)}
                      variant="clock"
                      aria-hidden="true"
                      data-testid="dock-clock"
                      className="type-figure-sm text-foreground"
                    />
                    <Duration seconds={countdownSeconds(parts.total)} className="sr-only" />
                  </>
                )}
                intervalMs={1000}
              />
            </span>
          ) : (
            <span
              className={cn(
                'type-label min-w-0 break-words',
                PHASE_TEXT_CLASS[view.tone] ?? 'text-foreground',
              )}
            >
              {t(`chrono.phase.${view.messageKey}.label`)}
            </span>
          )}
          <span className="type-caption min-w-0">{status}</span>
        </div>

        {finalizeMode ? (
          <Button
            variant="commit"
            data-testid="dock-finalize"
            onClick={onFinalize}
            loading={isClaiming}
            className="min-h-12 shrink-0 px-4"
          >
            {t('form.finalize')}
            <ArrowRight aria-hidden />
          </Button>
        ) : !account ? (
          // Without a wallet the dock's action is the one the form offers:
          // connect, straight to the wallet list, never a priced Gesture that
          // opens a sheet only to ask for a wallet.
          <ConnectWalletAction
            variant="commit"
            data-testid="dock-connect"
            label={t('form.connect.ctaShort')}
            className="min-h-12 min-w-0 flex-1 px-4 md:flex-none md:px-5"
          />
        ) : (
          <>
            <Button
              variant="commit"
              data-testid="dock-open-sheet"
              onClick={onOpenSheet}
              loading={isGesturing}
              aria-describedby={describedById}
              className="h-auto min-h-12 min-w-0 flex-1 px-3 py-1.5 whitespace-normal min-[360px]:px-4 md:hidden"
            >
              {gestureLabel}
            </Button>
            <Button
              variant="commit"
              data-testid="dock-jump-to-panel"
              onClick={onJumpToPanel}
              loading={isGesturing}
              aria-describedby={describedById}
              className="hidden h-auto min-h-12 shrink-0 px-5 py-1.5 whitespace-normal md:inline-flex"
            >
              {gestureLabel}
            </Button>
            <span id={describedById} className="sr-only">
              {t('observatory.dock.openPanelAria')}
            </span>
          </>
        )}
      </section>
    </div>
  );
}
