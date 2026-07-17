'use client';

import type { CountdownRenderProps } from 'react-countdown';
import { ArrowRight, Clock3 } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import Counter from '@/components/common/Counter';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { getCycleState, type CyclePhase } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

export type ChronoCorePhase = CyclePhase;

interface ChronoCoreTimerProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  canOpenGesturePanel: boolean;
  /** When set, primary CTA submits a gesture (or finalize) instead of only scrolling. */
  onPrimaryCtaClick?: () => void;
}

interface PhaseView {
  eyebrow: string;
  label: string;
  status: string;
  tooltip: string;
  toneClass: string;
  haloClass: string;
  glowClass: string;
  pulseClass: string;
  clockTextClass: string;
  iconClass: string;
  displayText?: string;
}

export function getChronoCorePhase({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
}: Pick<ChronoCoreTimerProps, 'data' | 'loading' | 'allocationTime' | 'activationTime' | 'now'>) {
  return getCycleState({ data, loading, allocationTime, activationTime, now }).phase;
}

function viewForPhase(phase: ChronoCorePhase): PhaseView {
  switch (phase) {
    case 'loading':
      return {
        eyebrow: 'Cycle clock syncing',
        label: 'Syncing',
        status: 'Reading the live cycle timer.',
        tooltip:
          'The app is synchronizing with protocol time before showing the current cycle state.',
        displayText: 'Syncing',
        toneClass: 'border-white/[0.10] bg-white/[0.03]',
        haloClass: 'border-white/10 bg-white/[0.02]',
        glowClass: 'shadow-[0_0_80px_rgb(var(--aurora-cyan-rgb)/0.16)]',
        pulseClass: '',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
    case 'unavailable':
      return {
        eyebrow: 'Cycle clock unavailable',
        label: 'Clock unavailable',
        status: 'Live timer temporarily unavailable.',
        tooltip:
          'The live cycle clock could not be reached. Open cycle details for the latest indexed state.',
        displayText: 'Syncing',
        toneClass: 'border-white/[0.10] bg-white/[0.025]',
        haloClass: 'border-white/10 bg-white/[0.015]',
        glowClass: 'shadow-[0_0_60px_rgb(255_255_255/0.08)]',
        pulseClass: '',
        clockTextClass: 'text-muted-foreground',
        iconClass: 'text-muted-foreground',
      };
    case 'opening-soon':
      return {
        eyebrow: 'Next cycle opens in',
        label: 'Opening soon',
        status: 'Waiting for the next cycle. Gestures open when this countdown reaches zero.',
        tooltip:
          'This clock counts down to cycle opening. Once it reaches zero, the first Gesture can start the finalization clock.',
        toneClass:
          'border-emerald-300/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.13))]',
        haloClass: 'border-emerald-300/35 bg-emerald-400/[0.055]',
        glowClass: 'shadow-[0_0_125px_rgb(var(--impact-green-rgb)/0.34)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass:
          'bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[#7DD3FC] to-[#35C9FF] bg-clip-text text-transparent',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'waiting-first-gesture':
      return {
        eyebrow: 'Cycle is open',
        label: 'Awaiting first Gesture',
        status: 'Cycle is open. The first Gesture starts the finalization clock.',
        tooltip:
          'No finalization countdown is running yet. The first Gesture starts the cycle timer and begins shaping this Signature.',
        displayText: 'Awaiting first Gesture',
        toneClass:
          'border-emerald-300/30 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.13),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.12))]',
        haloClass: 'border-emerald-300/30 bg-emerald-400/[0.045]',
        glowClass: 'shadow-[0_0_105px_rgb(var(--impact-green-rgb)/0.26)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass:
          'bg-gradient-to-r from-[rgb(var(--impact-green-rgb))] via-[#7DD3FC] to-[#35C9FF] bg-clip-text text-transparent',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'approach':
      return {
        eyebrow: 'Cycle finalizes in',
        label: 'Under 12 hours',
        status: 'Cycle is live. Each Gesture can extend the finalization clock.',
        tooltip:
          'This is the Cycle Finalization Time. When it reaches zero, the Final Gesture participant may finalize the cycle.',
        toneClass:
          'border-primary/35 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.14))]',
        haloClass: 'border-primary/30 bg-primary/[0.045]',
        glowClass: 'shadow-[0_0_110px_rgb(var(--aurora-cyan-rgb)/0.32)]',
        pulseClass: 'animate-cosmic-drift',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
    case 'final-hour':
      return {
        eyebrow: 'Final hour',
        label: 'Final hour',
        status: 'Less than one hour remains before this cycle can finalize.',
        tooltip:
          'The finalization clock is under one hour. New Gestures can still extend the Cycle Finalization Time.',
        toneClass:
          'border-[rgb(var(--solar-gold-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-[rgb(var(--solar-gold-rgb)/0.36)] bg-[rgb(var(--solar-gold-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--solar-gold-rgb)/0.30)]',
        pulseClass: 'animate-pulse-glow',
        clockTextClass: 'text-[rgb(var(--solar-gold-rgb))]',
        iconClass: 'text-[rgb(var(--solar-gold-rgb))]',
      };
    case 'final-ten':
      return {
        eyebrow: 'Final 10 minutes',
        label: 'Final 10 minutes',
        status: 'Final minutes. Every Gesture can still change the ending.',
        tooltip:
          'The cycle is inside the final ten minutes. The clock is urgent, but a new Gesture can still extend it.',
        toneClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.46)] bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.36),rgb(var(--nebula-violet-rgb)/0.18))]',
        haloClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.38)] bg-[rgb(var(--chrono-rose-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_130px_rgb(var(--chrono-rose-rgb)/0.32)]',
        pulseClass: 'animate-pulse-glow',
        clockTextClass: 'text-[rgb(var(--chrono-rose-rgb))]',
        iconClass: 'text-[rgb(var(--chrono-rose-rgb))]',
      };
    case 'final-minute':
      return {
        eyebrow: 'Final minute',
        label: 'Final minute',
        status: 'Final minute. Tenths are live.',
        tooltip:
          'The finalization clock is in its last minute. If it reaches zero, the cycle becomes ready to finalize.',
        toneClass:
          'border-red-400/55 bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.24),rgb(127_29_29/0.32),rgb(var(--nebula-violet-rgb)/0.20))]',
        haloClass: 'border-red-400/45 bg-red-500/[0.055]',
        glowClass: 'shadow-[0_0_150px_rgb(248_113_113/0.40)]',
        pulseClass: 'motion-safe:animate-urgency-pulse',
        clockTextClass: 'text-red-300',
        iconClass: 'text-red-300',
      };
    case 'ready-to-finalize':
      return {
        eyebrow: 'Cycle ready to finalize',
        label: 'Ready',
        status: 'Finalization is ready. A new Gesture can still extend the cycle.',
        tooltip:
          'The Cycle Finalization Time reached zero. The Final Gesture participant may finalize; after the exclusivity window, anyone may finalize and receives the Signature Allocation. Gestures remain possible until finalization executes.',
        displayText: '00:00',
        toneClass:
          'border-emerald-400/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.11))]',
        haloClass: 'border-emerald-300/35 bg-emerald-400/[0.045]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--impact-green-rgb)/0.28)]',
        pulseClass: 'animate-signature-pulse',
        clockTextClass: 'text-[rgb(var(--impact-green-rgb))]',
        iconClass: 'text-[rgb(var(--impact-green-rgb))]',
      };
    case 'live':
    default:
      return {
        eyebrow: 'Cycle finalizes in',
        label: 'Cycle is live',
        status: 'Cycle is live. Each Gesture can extend the finalization clock.',
        tooltip:
          'This is the Cycle Finalization Time. When it reaches zero, the Final Gesture participant may finalize the cycle.',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.12),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-primary/25 bg-primary/[0.035]',
        glowClass: 'shadow-[0_0_100px_rgb(var(--aurora-cyan-rgb)/0.26)]',
        pulseClass: '',
        clockTextClass: 'text-gradient-signature',
        iconClass: 'text-primary',
      };
  }
}

export function ChronoCoreTimer({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  canOpenGesturePanel,
  onPrimaryCtaClick,
}: ChronoCoreTimerProps) {
  const cycleState = getCycleState({ data, loading, allocationTime, activationTime, now });
  const phase = cycleState.phase;
  const view = viewForPhase(phase);
  const targetMs = cycleState.isOpeningSoon
    ? (cycleState.activationTime ?? activationTime) * 1000
    : allocationTime;
  const showCountdown = cycleState.isOpeningSoon || cycleState.isFinalizationCountdownActive;
  const isReady = cycleState.isReadyToFinalize;
  const emphasizeStatus = cycleState.isOpeningSoon || cycleState.isWaitingForFirstGesture;
  const renderMonumentCounter = (props: CountdownRenderProps) => (
    <Counter {...props} size="xl" tone={cycleState.isOpeningSoon ? 'impact' : 'default'} />
  );
  const primaryHref = canOpenGesturePanel ? '#make-gesture' : '/current-cycle';
  const primaryLabel = isReady
    ? 'Finalize Cycle'
    : phase === 'waiting-first-gesture' && canOpenGesturePanel
      ? 'Make the first Gesture'
      : canOpenGesturePanel
        ? 'Make a Gesture'
        : 'View Cycle';

  return (
    <section
      aria-label="Cycle Finalization Time"
      className="print-motion-visible relative z-[1] mb-8"
      data-testid="chrono-core-timer"
      data-phase={phase}
    >
      <Surface
        variant="gradient-border-accent"
        radius="xl"
        padding="none"
        className={cn('isolate overflow-hidden', view.toneClass, view.glowClass)}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-70 sm:h-96 sm:w-96',
            view.haloClass,
            view.pulseClass,
          )}
        />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />

        <div className="relative mx-auto max-w-5xl px-4 py-7 text-center sm:px-8 sm:py-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.045] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            <Clock3 className={cn('h-3.5 w-3.5', view.iconClass)} aria-hidden />
            {view.eyebrow}
            <InfoTooltip content={view.tooltip} className="ml-0" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div
              className={cn(
                'rounded-[1.75rem] border border-white/[0.10] bg-black/20 p-4 text-center backdrop-blur-md sm:p-7',
                phase === 'final-minute' && 'motion-safe:animate-urgency-pulse',
              )}
              role="timer"
              aria-live="off"
              aria-label={`${view.label}. ${view.status}`}
            >
              {showCountdown ? (
                <SmoothCountdown date={targetMs} renderer={renderMonumentCounter} />
              ) : (
                <div className="flex min-h-[112px] items-center justify-center">
                  <p
                    className={cn(
                      'font-display text-4xl font-bold tracking-tight sm:text-6xl',
                      view.clockTextClass,
                    )}
                  >
                    {view.displayText}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              'mt-5 flex flex-col items-center justify-center gap-3 text-center sm:flex-row',
              emphasizeStatus ? 'text-base sm:text-lg' : 'text-sm text-muted-foreground',
            )}
          >
            <span
              data-testid="chrono-status"
              className={cn(
                emphasizeStatus
                  ? 'max-w-3xl font-semibold leading-relaxed text-foreground'
                  : undefined,
              )}
            >
              {view.status}
            </span>
            {onPrimaryCtaClick && primaryHref === '#make-gesture' ? (
              <button
                type="button"
                onClick={onPrimaryCtaClick}
                className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-foreground"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-foreground"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </Surface>
    </section>
  );
}
