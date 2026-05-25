'use client';

import Countdown from 'react-countdown';
import type { CountdownRenderProps } from 'react-countdown';
import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';

import Counter from '@/components/common/Counter';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Surface } from '@/components/ui/surface';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type ChronoCorePhase =
  | 'loading'
  | 'unavailable'
  | 'pre-activation'
  | 'waiting'
  | 'stable'
  | 'approach'
  | 'final-hour'
  | 'final-ten'
  | 'final-minute'
  | 'ready';

interface ChronoCoreTimerProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
  canOpenGesturePanel: boolean;
}

interface PhaseView {
  label: string;
  status: string;
  toneClass: string;
  haloClass: string;
  glowClass: string;
  pulseClass: string;
  displayText?: string;
}

export function getChronoCorePhase({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
}: Pick<ChronoCoreTimerProps, 'data' | 'loading' | 'allocationTime' | 'activationTime' | 'now'>) {
  if (loading) return 'loading' satisfies ChronoCorePhase;
  if (!data) return 'unavailable' satisfies ChronoCorePhase;
  if (activationTime > now / 1000) return 'pre-activation' satisfies ChronoCorePhase;
  if (data.TsRoundStart === 0 || data.LastBidderAddr === ZERO_ADDRESS) {
    return 'waiting' satisfies ChronoCorePhase;
  }

  const remainingMs = allocationTime - now;
  if (remainingMs <= 0) return 'ready' satisfies ChronoCorePhase;
  if (remainingMs <= 60_000) return 'final-minute' satisfies ChronoCorePhase;
  if (remainingMs <= 10 * 60_000) return 'final-ten' satisfies ChronoCorePhase;
  if (remainingMs <= 60 * 60_000) return 'final-hour' satisfies ChronoCorePhase;
  if (remainingMs <= 12 * 60 * 60_000) return 'approach' satisfies ChronoCorePhase;
  return 'stable' satisfies ChronoCorePhase;
}

function viewForPhase(phase: ChronoCorePhase): PhaseView {
  switch (phase) {
    case 'loading':
      return {
        label: 'Syncing',
        status: 'Reading the live cycle timer.',
        displayText: 'Syncing',
        toneClass: 'border-white/[0.10] bg-white/[0.03]',
        haloClass: 'border-white/10 bg-white/[0.02]',
        glowClass: 'shadow-[0_0_80px_rgb(var(--aurora-cyan-rgb)/0.16)]',
        pulseClass: '',
      };
    case 'unavailable':
      return {
        label: 'Clock unavailable',
        status: 'Live timer temporarily unavailable.',
        displayText: 'Syncing',
        toneClass: 'border-white/[0.10] bg-white/[0.025]',
        haloClass: 'border-white/10 bg-white/[0.015]',
        glowClass: 'shadow-[0_0_60px_rgb(255_255_255/0.08)]',
        pulseClass: '',
      };
    case 'pre-activation':
      return {
        label: 'Cycle opens soon',
        status: 'The next cycle is preparing to open.',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(var(--nebula-violet-rgb)/0.08))]',
        haloClass: 'border-primary/20 bg-primary/[0.03]',
        glowClass: 'shadow-[0_0_90px_rgb(var(--aurora-cyan-rgb)/0.24)]',
        pulseClass: '',
      };
    case 'waiting':
      return {
        label: 'Waiting for first Gesture',
        status: 'First Gesture starts the timer.',
        displayText: 'Awaiting Gesture',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.11),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.10))]',
        haloClass: 'border-primary/20 bg-primary/[0.035]',
        glowClass: 'shadow-[0_0_90px_rgb(var(--aurora-cyan-rgb)/0.22)]',
        pulseClass: 'animate-cosmic-drift',
      };
    case 'approach':
      return {
        label: 'Under 12 hours',
        status: 'Each Gesture extends the Cycle Finalization Time.',
        toneClass:
          'border-primary/35 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.14))]',
        haloClass: 'border-primary/30 bg-primary/[0.045]',
        glowClass: 'shadow-[0_0_110px_rgb(var(--aurora-cyan-rgb)/0.32)]',
        pulseClass: 'animate-cosmic-drift',
      };
    case 'final-hour':
      return {
        label: 'Final hour',
        status: 'Less than one hour remains.',
        toneClass:
          'border-[rgb(var(--solar-gold-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-[rgb(var(--solar-gold-rgb)/0.36)] bg-[rgb(var(--solar-gold-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--solar-gold-rgb)/0.30)]',
        pulseClass: 'animate-pulse-glow',
      };
    case 'final-ten':
      return {
        label: 'Final 10 minutes',
        status: 'Final minutes. Every second matters.',
        toneClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.46)] bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.36),rgb(var(--nebula-violet-rgb)/0.18))]',
        haloClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.38)] bg-[rgb(var(--chrono-rose-rgb)/0.045)]',
        glowClass: 'shadow-[0_0_130px_rgb(var(--chrono-rose-rgb)/0.32)]',
        pulseClass: 'animate-pulse-glow',
      };
    case 'final-minute':
      return {
        label: 'Final minute',
        status: 'Final minute. Tenths are live.',
        toneClass:
          'border-red-400/55 bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.24),rgb(127_29_29/0.32),rgb(var(--nebula-violet-rgb)/0.20))]',
        haloClass: 'border-red-400/45 bg-red-500/[0.055]',
        glowClass: 'shadow-[0_0_150px_rgb(248_113_113/0.40)]',
        pulseClass: 'motion-safe:animate-urgency-pulse',
      };
    case 'ready':
      return {
        label: 'Ready',
        status: 'Cycle ready to finalize.',
        displayText: '00:00',
        toneClass:
          'border-emerald-400/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.11))]',
        haloClass: 'border-emerald-300/35 bg-emerald-400/[0.045]',
        glowClass: 'shadow-[0_0_120px_rgb(var(--impact-green-rgb)/0.28)]',
        pulseClass: 'animate-signature-pulse',
      };
    case 'stable':
    default:
      return {
        label: 'Time left',
        status: 'Each Gesture extends the Cycle Finalization Time.',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.12),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        haloClass: 'border-primary/25 bg-primary/[0.035]',
        glowClass: 'shadow-[0_0_100px_rgb(var(--aurora-cyan-rgb)/0.26)]',
        pulseClass: '',
      };
  }
}

function renderMonumentCounter(props: CountdownRenderProps) {
  return <Counter {...props} size="xl" />;
}

export function ChronoCoreTimer({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
  canOpenGesturePanel,
}: ChronoCoreTimerProps) {
  const phase = getChronoCorePhase({ data, loading, allocationTime, activationTime, now });
  const view = viewForPhase(phase);
  const targetMs = phase === 'pre-activation' ? activationTime * 1000 : allocationTime;
  const showCountdown =
    phase === 'pre-activation' ||
    phase === 'stable' ||
    phase === 'approach' ||
    phase === 'final-hour' ||
    phase === 'final-ten' ||
    phase === 'final-minute';
  const isReady = phase === 'ready';
  const primaryHref = canOpenGesturePanel ? '#make-gesture' : '/current-cycle';
  const primaryLabel = isReady
    ? 'Finalize Cycle'
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
            <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
            Time left in this cycle
            <InfoTooltip
              content="When this timer hits zero, the participant who made the Final Gesture may finalize the cycle and receive the Signature Allocation. Each new gesture extends the timer."
              className="ml-0"
            />
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
                <Countdown
                  key={phase}
                  date={targetMs}
                  renderer={renderMonumentCounter}
                  intervalDelay={100}
                  precision={1}
                />
              ) : (
                <div className="flex min-h-[112px] items-center justify-center">
                  <p className="font-display text-4xl font-bold tracking-tight text-gradient-signature sm:text-6xl">
                    {view.displayText}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row">
            <span>{view.status}</span>
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-foreground"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Surface>
    </section>
  );
}
