'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, ArrowUp, Clock3 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { getCycleState } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

import { viewForPhase } from './phaseView';

interface DeckMiniBarProps {
  /** True once the Deck has scrolled out of view (IntersectionObserver). */
  visible: boolean;
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  finalizationConfirmed?: boolean;
  account?: string | null;
  canGesture: boolean;
  isGesturing: boolean;
  submitLabel: string;
  onGesture: () => void;
  onJumpToDeck: () => void;
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
 * Slim quick console pinned under the site header once the Deck scrolls out
 * of view, so the countdown, reserve, and the gesture action never leave the
 * screen on desktop. Phones keep the floating CTA instead (hidden < sm).
 */
export function DeckMiniBar({
  visible,
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  finalizationConfirmed,
  account = null,
  canGesture,
  isGesturing,
  submitLabel,
  onGesture,
  onJumpToDeck,
}: DeckMiniBarProps) {
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
  const showGestureAction = !!account && isRoundActive && canGesture;

  if (!visible || loading) return null;

  return (
    <div
      data-testid="deck-mini-bar"
      className="fixed inset-x-0 top-[var(--sticky-offset)] z-30 hidden px-4 sm:block motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-300 print:hidden"
    >
      <section
        aria-label={t('deck.miniBar.aria')}
        className="mx-auto flex max-w-4xl items-center justify-between gap-4 liquid-glass-control liquid-glass-static rounded-full border border-white/[0.12] bg-[rgb(10_14_42/0.72)] px-4 py-2 shadow-[0_24px_80px_-40px_rgb(var(--aurora-cyan-rgb)/0.8)]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Clock3 className={cn('h-4 w-4 shrink-0', view.iconClass)} aria-hidden />
          {showCountdown ? (
            <SmoothCountdown date={targetMs} renderer={renderCompactCountdown} intervalMs={1000} />
          ) : (
            <span className="truncate text-sm font-semibold">
              {t(`chrono.phase.${view.messageKey}.label`)}
            </span>
          )}
        </span>

        <span className="hidden min-w-0 items-center gap-2 md:flex">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {t('deck.miniBar.reserve')}
          </span>
          <span className="text-sm font-bold tabular-nums text-gradient-signature">
            {reserveEth.toFixed(4)} ETH
          </span>
        </span>

        {showGestureAction ? (
          <Button
            size="sm"
            onClick={onGesture}
            disabled={isGesturing}
            data-testid="mini-bar-gesture"
            className="liquid-glass-cta h-9 shrink-0 rounded-full border-0 bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {isGesturing ? t('form.processing') : submitLabel}
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={onJumpToDeck}
            data-testid="mini-bar-jump"
            className="liquid-glass-control h-9 shrink-0 rounded-full px-4 text-xs font-semibold"
          >
            <ArrowUp className="mr-1 h-3.5 w-3.5" aria-hidden />
            {t('deck.miniBar.jump')}
          </Button>
        )}
      </section>
    </div>
  );
}
