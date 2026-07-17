'use client';

import { useSyncExternalStore } from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { getCycleState, type CyclePhase } from '@/lib/cycleState';
import { cn } from '@/lib/utils';
import type { DashboardInfo } from '@/services/api';

interface CyclePhaseGuideProps {
  data: DashboardInfo | null;
  loading: boolean;
  allocationTime: number;
  activationTime: number;
  now: number;
}

const explainerStorageKey = 'cosmic-cycle-explainer-dismissed';
const explainerDismissedEvent = 'cosmic:explainer-dismissed';

// localStorage as an external store: avoids setState-in-effect and renders
// the dismissed state on the server so the explainer never flashes for
// returning visitors.
function subscribeToExplainerDismissal(onStoreChange: () => void): () => void {
  window.addEventListener(explainerDismissedEvent, onStoreChange);
  return () => window.removeEventListener(explainerDismissedEvent, onStoreChange);
}
const getExplainerDismissedSnapshot = (): boolean =>
  window.localStorage.getItem(explainerStorageKey) === '1';
const getExplainerDismissedServerSnapshot = (): boolean => true;

const timelineSteps = [
  {
    id: 'opening-soon',
    label: 'Opening Soon',
    detail: 'The next cycle is scheduled and waiting to open.',
  },
  {
    id: 'first-gesture',
    label: 'First Gesture',
    detail: 'The first Gesture starts the finalization clock.',
  },
  {
    id: 'open',
    label: 'Open Cycle',
    detail: 'Gestures shape the Signature and extend time.',
  },
  {
    id: 'final-window',
    label: 'Final Window',
    detail: 'The clock nears zero. A new Gesture can still extend it.',
  },
  {
    id: 'finalization',
    label: 'Finalization',
    detail: 'The Final Gesture participant can close the cycle.',
  },
  {
    id: 'allocation',
    label: 'Allocation',
    detail: 'The reserve distributes across protocol tracks.',
  },
] as const;

function phaseToTimelineId(phase: CyclePhase): (typeof timelineSteps)[number]['id'] {
  if (phase === 'opening-soon' || phase === 'loading' || phase === 'unavailable') {
    return 'opening-soon';
  }
  if (phase === 'waiting-first-gesture') return 'first-gesture';
  if (phase === 'ready-to-finalize') return 'finalization';
  if (phase === 'final-hour' || phase === 'final-ten' || phase === 'final-minute') {
    return 'final-window';
  }
  if (phase === 'live' || phase === 'approach') return 'open';
  return 'opening-soon';
}

export function CyclePhaseGuide({
  data,
  loading,
  allocationTime,
  activationTime,
  now,
}: CyclePhaseGuideProps) {
  const phase = getCycleState({ data, loading, allocationTime, activationTime, now }).phase;
  const activeStepId = phaseToTimelineId(phase);
  const activeIndex = timelineSteps.findIndex((step) => step.id === activeStepId);
  const explainerDismissed = useSyncExternalStore(
    subscribeToExplainerDismissal,
    getExplainerDismissedSnapshot,
    getExplainerDismissedServerSnapshot,
  );
  const showExplainer = !explainerDismissed;

  const dismissExplainer = () => {
    window.localStorage.setItem(explainerStorageKey, '1');
    window.dispatchEvent(new Event(explainerDismissedEvent));
  };

  return (
    <section aria-labelledby="cycle-phase-guide-title" className="mb-8">
      <Surface variant="glass-bordered" radius="xl" padding="none" className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="type-eyebrow text-muted-foreground">Cycle phase</p>
            <h2 id="cycle-phase-guide-title" className="mt-2 font-display text-xl font-bold">
              Where this Performance Cycle is now
            </h2>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href="/how-it-works">
              How it works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <ol
          className="mt-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6"
          aria-label="Performance Cycle phases"
        >
          {timelineSteps.map((step, index) => {
            const isActive = step.id === activeStepId;
            const isComplete = index < activeIndex;
            return (
              <li
                key={step.id}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'relative rounded-2xl border p-4 transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/[0.10] text-foreground shadow-[0_18px_70px_-56px_rgb(var(--aurora-cyan-rgb)/0.9)]'
                    : isComplete
                      ? 'border-emerald-300/20 bg-emerald-400/[0.045]'
                      : 'border-white/[0.06] bg-white/[0.025]',
                )}
              >
                <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border text-[10px]',
                      isActive
                        ? 'border-primary/50 bg-primary/20 text-primary'
                        : isComplete
                          ? 'border-emerald-300/35 bg-emerald-400/10 text-emerald-300'
                          : 'border-white/[0.10] bg-white/[0.03]',
                    )}
                  >
                    {isComplete ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  {isActive ? 'Now' : isComplete ? 'Passed' : 'Next'}
                </span>
                <h3 className="mt-3 text-sm font-semibold">{step.label}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.detail}</p>
              </li>
            );
          })}
        </ol>

        {showExplainer && (
          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold">
                  New here? Read the cycle in 30 seconds.
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Wait for the cycle to open, make a Gesture once Gestures are available, and watch
                  the finalization clock. Each Gesture helps shape the final Signature, can extend
                  time, and updates who is in line for allocations. When time expires, the cycle
                  finalizes and the reserve distributes on-chain.
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <Link className="text-primary underline-offset-4 hover:underline" href="/faq">
                    Read the FAQ
                  </Link>
                  <Link
                    className="text-primary underline-offset-4 hover:underline"
                    href="/how-it-works"
                  >
                    See the full walkthrough
                  </Link>
                </div>
              </div>
              <button
                type="button"
                aria-label="Dismiss cycle explainer"
                onClick={dismissExplainer}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Surface>
    </section>
  );
}
