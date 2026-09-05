'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { ArrowUpRight, Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { Button } from '@/components/ui/button';
import { getCycleState } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

import { viewForPhase } from './phaseView';

export interface ActionDockProps {
  /** True once the observatory stage scrolled out of view (desktop gate). */
  stageOutOfView: boolean;
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  /** Live-priced label of the currently selected method. */
  submitLabel: string;
  /** Phones: open the bottom sheet hosting the gesture panel. */
  onOpenSheet: () => void;
  /** Desktop: scroll back to the one gesture panel. */
  onJumpToPanel: () => void;
  className?: string;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function renderCompactCountdown({ days, hours, minutes, seconds }: CountdownRenderProps) {
  return (
    <span className="font-mono text-sm font-semibold tabular-nums">
      {days > 0 ? `${days}d ` : ''}
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </span>
  );
}

/**
 * The one persistent quick-action surface. It never submits a gesture itself
 * — it routes to the single gesture panel (bottom sheet on phones, scroll on
 * desktop), so the price shown and the price paid always come from the same
 * place. Phones see it whenever the cycle is active; desktop only once the
 * stage has scrolled away.
 */
export function ActionDock({
  stageOutOfView,
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  submitLabel,
  onOpenSheet,
  onJumpToPanel,
  className,
}: ActionDockProps) {
  const t = useTranslations('home');

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
  const reserveEth = data?.PrizeAmountEth ?? data?.CurPrizeAmountEth ?? 0;

  if (loading || !isRoundActive) return null;

  const clock = (
    <span className="flex min-w-0 items-center gap-2">
      <Clock3 className={cn('h-4 w-4 shrink-0', view.iconClass)} aria-hidden />
      {showCountdown ? (
        <SmoothCountdown
          date={targetMs}
          initialNowMs={now}
          renderer={renderCompactCountdown}
          intervalMs={1000}
        />
      ) : (
        <span className="truncate text-sm font-semibold">
          {t(`chrono.phase.${view.messageKey}.label`)}
        </span>
      )}
    </span>
  );

  return (
    <div className={cn('print:hidden', className)}>
      {/* Phones: the dock is the permanent bridge to the gesture panel. */}
      <div className="fixed inset-x-3 bottom-3 z-40 lg:hidden">
        <section
          aria-label={t('observatory.dock.aria')}
          data-testid="action-dock-mobile"
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.12] bg-[rgb(10_14_42/0.92)] px-3.5 py-2.5 shadow-[0_20px_70px_-30px_rgb(var(--aurora-cyan-rgb)/1)] backdrop-blur-xl"
        >
          <span className="flex min-w-0 flex-col">
            {clock}
            {/* Wraps instead of truncating: the CTA carries a long live-cost
                label, and at 320px an ellipsis would hide the reserve amount. */}
            <span className="mt-0.5 break-words text-[11px] leading-tight tabular-nums text-muted-foreground">
              {t('observatory.dock.reserve')}{' '}
              <span className="font-semibold text-gradient-signature">
                {reserveEth.toFixed(4)} ETH
              </span>
            </span>
          </span>
          {/* min-w-0 + whitespace-normal: RandomWalk labels carry a token id
              and can outgrow a 320px viewport — wrap inside the pill instead
              of forcing the dock wider than the screen. */}
          <Button
            size="lg"
            data-testid="dock-open-sheet"
            onClick={onOpenSheet}
            aria-label={t('observatory.dock.openPanelAria')}
            className="min-h-11 min-w-0 rounded-full border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] px-4 text-sm font-semibold leading-tight text-white hover:opacity-90 whitespace-normal"
          >
            {submitLabel}
          </Button>
        </section>
      </div>

      {/* Desktop: appears only after the stage scrolls away. A plain div,
          not a landmark — the phone dock already owns the labeled landmark,
          and only one of the two is ever displayed per viewport. */}
      {stageOutOfView && (
        <div className="fixed inset-x-0 bottom-4 z-30 hidden px-4 lg:block motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
          <div
            data-testid="action-dock-desktop"
            className="mx-auto flex max-w-3xl items-center justify-between gap-4 rounded-full border border-white/[0.12] bg-[rgb(10_14_42/0.9)] px-5 py-2 shadow-[0_24px_80px_-40px_rgb(var(--aurora-cyan-rgb)/0.8)] backdrop-blur-xl"
          >
            {clock}
            <span className="flex min-w-0 items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('observatory.dock.reserve')}
              </span>
              <span className="text-sm font-bold tabular-nums text-gradient-signature">
                {reserveEth.toFixed(4)} ETH
              </span>
            </span>
            <Button
              size="sm"
              data-testid="dock-jump-to-panel"
              onClick={onJumpToPanel}
              className="h-9 shrink-0 rounded-full border-0 bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] px-4 text-xs font-semibold text-white hover:opacity-90"
            >
              {submitLabel}
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
