'use client';

import Countdown from 'react-countdown';
import type { CountdownRenderProps } from 'react-countdown';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Activity, ArrowRight, Clock3, Radio, SatelliteDish, ShieldCheck, Zap } from 'lucide-react';

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
  title: string;
  body: string;
  status: string;
  toneClass: string;
  ringClass: string;
  beamClass: string;
  digitAuraClass: string;
  pulseClass: string;
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

function viewForPhase(phase: ChronoCorePhase, cycleNumber: number | null): PhaseView {
  const cycleLabel = cycleNumber == null ? 'Current cycle' : `Cycle #${cycleNumber}`;

  switch (phase) {
    case 'loading':
      return {
        label: 'Synchronizing',
        title: 'Locking onto Cycle Finalization Time',
        body: 'Reading the protocol clock before the live timer appears.',
        status: 'Protocol clock syncing',
        toneClass: 'border-white/[0.10] bg-white/[0.035]',
        ringClass: 'border-white/10',
        beamClass: 'from-primary/30 via-white/35 to-accent/30',
        digitAuraClass: 'shadow-[0_0_80px_rgb(var(--aurora-cyan-rgb)/0.18)]',
        pulseClass: '',
      };
    case 'unavailable':
      return {
        label: 'Clock unavailable',
        title: 'Cycle clock is temporarily unreachable',
        body: 'Open the app details for the latest protocol state while this page reconnects.',
        status: 'Retrying protocol clock',
        toneClass: 'border-white/[0.10] bg-white/[0.03]',
        ringClass: 'border-white/10',
        beamClass: 'from-white/10 via-white/20 to-white/10',
        digitAuraClass: 'shadow-[0_0_60px_rgb(255_255_255/0.08)]',
        pulseClass: '',
      };
    case 'pre-activation':
      return {
        label: 'Cycle opening',
        title: `${cycleLabel} opens soon`,
        body: 'The next Performance Cycle is approaching its activation time.',
        status: 'Opening sequence armed',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.10),rgb(var(--nebula-violet-rgb)/0.08))]',
        ringClass: 'border-primary/20',
        beamClass: 'from-primary/40 via-white/40 to-accent/35',
        digitAuraClass: 'shadow-[0_0_90px_rgb(var(--aurora-cyan-rgb)/0.26)]',
        pulseClass: '',
      };
    case 'waiting':
      return {
        label: 'Awaiting first Gesture',
        title: `${cycleLabel} is ready for ignition`,
        body: 'The first Gesture starts the timer and begins shaping the Signature.',
        status: 'Awaiting first Gesture',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.11),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.10))]',
        ringClass: 'border-primary/20',
        beamClass: 'from-primary/45 via-white/45 to-accent/35',
        digitAuraClass: 'shadow-[0_0_90px_rgb(var(--aurora-cyan-rgb)/0.24)]',
        pulseClass: 'animate-cosmic-drift',
      };
    case 'approach':
      return {
        label: 'Approach window',
        title: `${cycleLabel} is inside the 12-hour approach`,
        body: 'The horizon is brightening. Each new Gesture can extend the countdown.',
        status: 'Finalization approaching',
        toneClass:
          'border-primary/35 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.14))]',
        ringClass: 'border-primary/30',
        beamClass: 'from-primary/60 via-white/55 to-accent/45',
        digitAuraClass: 'shadow-[0_0_110px_rgb(var(--aurora-cyan-rgb)/0.34)]',
        pulseClass: 'animate-cosmic-drift',
      };
    case 'final-hour':
      return {
        label: 'Final hour',
        title: `${cycleLabel} is in the final hour`,
        body: 'The clock has turned gold. The next Gesture can still extend the horizon.',
        status: 'Final hour signal',
        toneClass:
          'border-[rgb(var(--solar-gold-rgb)/0.42)] bg-[linear-gradient(135deg,rgb(var(--solar-gold-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        ringClass: 'border-[rgb(var(--solar-gold-rgb)/0.36)]',
        beamClass: 'from-[rgb(var(--solar-gold-rgb)/0.70)] via-white/55 to-primary/45',
        digitAuraClass: 'shadow-[0_0_120px_rgb(var(--solar-gold-rgb)/0.32)]',
        pulseClass: 'animate-pulse-glow',
      };
    case 'final-ten':
      return {
        label: 'Final ten',
        title: `${cycleLabel} is inside the final ten minutes`,
        body: 'The signal is hot. Every second is now part of the final shape.',
        status: 'Final ten alert',
        toneClass:
          'border-[rgb(var(--chrono-rose-rgb)/0.46)] bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.18),rgb(var(--cosmic-indigo-rgb)/0.36),rgb(var(--nebula-violet-rgb)/0.18))]',
        ringClass: 'border-[rgb(var(--chrono-rose-rgb)/0.38)]',
        beamClass: 'from-[rgb(var(--chrono-rose-rgb)/0.72)] via-white/50 to-accent/55',
        digitAuraClass: 'shadow-[0_0_130px_rgb(var(--chrono-rose-rgb)/0.34)]',
        pulseClass: 'animate-pulse-glow',
      };
    case 'final-minute':
      return {
        label: 'Final minute',
        title: `${cycleLabel} is in the last moments`,
        body: 'Tenths are live. The timer is at critical intensity.',
        status: 'Critical final minute',
        toneClass:
          'border-red-400/55 bg-[linear-gradient(135deg,rgb(var(--chrono-rose-rgb)/0.24),rgb(127_29_29/0.32),rgb(var(--nebula-violet-rgb)/0.20))]',
        ringClass: 'border-red-400/45',
        beamClass: 'from-red-400/80 via-white/60 to-[rgb(var(--chrono-rose-rgb)/0.75)]',
        digitAuraClass: 'shadow-[0_0_150px_rgb(248_113_113/0.42)]',
        pulseClass: 'motion-safe:animate-urgency-pulse',
      };
    case 'ready':
      return {
        label: 'Ready',
        title: `${cycleLabel} is ready to finalize`,
        body: 'The horizon has closed. The protocol is ready to transform this cycle into a final Signature.',
        status: 'Ready to finalize',
        toneClass:
          'border-emerald-400/35 bg-[linear-gradient(135deg,rgb(var(--impact-green-rgb)/0.16),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--aurora-cyan-rgb)/0.11))]',
        ringClass: 'border-emerald-300/35',
        beamClass: 'from-emerald-300/65 via-white/50 to-primary/50',
        digitAuraClass: 'shadow-[0_0_120px_rgb(var(--impact-green-rgb)/0.30)]',
        pulseClass: 'animate-signature-pulse',
      };
    case 'stable':
    default:
      return {
        label: 'Stable orbit',
        title: `${cycleLabel} finalizes in`,
        body: 'This is the live Cycle Finalization Time. Each Gesture shapes the Signature and can extend the horizon.',
        status: 'Protocol clock locked',
        toneClass:
          'border-primary/25 bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.12),rgb(var(--cosmic-indigo-rgb)/0.34),rgb(var(--nebula-violet-rgb)/0.13))]',
        ringClass: 'border-primary/24',
        beamClass: 'from-primary/50 via-white/45 to-accent/45',
        digitAuraClass: 'shadow-[0_0_100px_rgb(var(--aurora-cyan-rgb)/0.28)]',
        pulseClass: '',
      };
  }
}

function formatEth(value: number | undefined): string {
  return `${(value ?? 0).toFixed(4)} ETH`;
}

function renderLargeCounter(props: CountdownRenderProps) {
  return <Counter {...props} size="lg" />;
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
  const view = viewForPhase(phase, data?.CurRoundNum ?? null);
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
        className={cn('isolate overflow-hidden', view.toneClass, view.digitAuraClass)}
      >
        <div className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 -top-20 h-80 w-80 rounded-full bg-[rgb(var(--nebula-violet-rgb)/0.26)] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-60',
            view.ringClass,
            view.pulseClass,
          )}
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r opacity-70',
            view.beamClass,
          )}
        />

        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[0.76fr_1.24fr] lg:items-center lg:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.055] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isReady
                      ? 'bg-emerald-300 animate-signature-pulse'
                      : 'bg-primary animate-live-dot',
                  )}
                />
                Chrono Core
              </span>
              <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {view.label}
              </span>
            </div>

            <div>
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden />
                Cycle Finalization Time
                <InfoTooltip
                  content="When this timer hits zero, the participant who made the Final Gesture may finalize the cycle and receive the Signature Allocation. Each new gesture extends the timer."
                  className="ml-0"
                />
              </p>
              <h2 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {view.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {view.body}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              <TelemetryChip
                icon={<Radio className="h-3.5 w-3.5" />}
                label="Cycle"
                value={data ? `#${data.CurRoundNum}` : '--'}
              />
              <TelemetryChip
                icon={<Activity className="h-3.5 w-3.5" />}
                label="Gestures"
                value={String(data?.CurNumBids ?? 0)}
              />
              <TelemetryChip
                icon={<Zap className="h-3.5 w-3.5" />}
                label="Signature"
                value={formatEth(data?.PrizeAmountEth ?? data?.CurPrizeAmountEth)}
              />
              <TelemetryChip
                icon={<ShieldCheck className="h-3.5 w-3.5" />}
                label="Clock"
                value="Synced"
              />
            </div>
          </div>

          <div className="relative">
            <div
              className={cn(
                'rounded-[1.75rem] border border-white/[0.10] bg-black/20 p-4 text-center backdrop-blur-md sm:p-6',
                phase === 'final-minute' && 'motion-safe:animate-urgency-pulse',
              )}
              role="timer"
              aria-live="off"
              aria-label={view.title}
            >
              {showCountdown ? (
                <Countdown
                  key={`${phase}-${targetMs}`}
                  date={targetMs}
                  renderer={renderLargeCounter}
                  intervalDelay={100}
                  precision={1}
                />
              ) : (
                <div className="flex min-h-[112px] items-center justify-center">
                  <div>
                    <p className="font-display text-4xl font-bold tracking-tight text-gradient-signature sm:text-5xl">
                      {isReady ? '00:00' : phase === 'waiting' ? 'Awaiting Gesture' : 'Syncing'}
                    </p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {view.status}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 text-sm text-muted-foreground backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-2">
                <SatelliteDish className="h-4 w-4 text-primary" aria-hidden />
                {view.status}
              </span>
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-foreground"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Surface>
    </section>
  );
}

function TelemetryChip({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-primary/80">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-1.5 truncate font-display text-base font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
