'use client';

/**
 * Floating dev panel for the local test harness: shows the live cycle state,
 * switches scenarios, fires one-shot gestures/finalizations, pauses the
 * director, and drives the burner wallet's persona switcher.
 *
 * Mounted only in testing mode (see the gate in app providers); all strings
 * are intentionally English-only dev copy in the product's coined vocabulary.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useConfig } from 'wagmi';
import { FlaskConical, Pause, Play, X } from 'lucide-react';

import { ETL_ECHO_DELAY_MS, invalidateLiveGameQueries } from '@/hooks/useLiveGameDataRefresh';
import { useHarnessControl } from '@/hooks/useHarnessControl';

type BurnerModule = typeof import('@/components/wallet/harness-burner');

function formatSeconds(raw: string): string {
  const total = Number.parseInt(raw, 10);
  if (!Number.isFinite(total) || total <= 0) return '0s';
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

const inputClass = 'w-full rounded border border-white/15 bg-black/40 px-2 py-1 text-xs text-white';
const HARNESS_ETL_RETRY_MS = [ETL_ECHO_DELAY_MS, 5_000, 10_000] as const;
const DEFAULT_PHASES = [
  'opening-soon',
  'waiting-first-gesture',
  'live',
  'approach',
  'final-hour',
  'final-ten',
  'final-minute',
  'ready-to-finalize',
  'exclusivity-expired',
] as const;

export default function HarnessPanel() {
  const [open, setOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [pendingScenario, setPendingScenario] = useState<string | null>(null);
  const [persona, setPersona] = useState<string>('Nova');
  const [personaOptions, setPersonaOptions] = useState<Array<{ name: string; address: string }>>(
    [],
  );
  const [burner, setBurner] = useState<BurnerModule | null>(null);
  const wagmiConfig = useConfig();
  const queryClient = useQueryClient();
  const echoTimers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const busySequence = useRef(0);
  const completedTransition = useRef<string | null>(null);
  const {
    status,
    error,
    commandError,
    clearCommandError,
    switchScenario,
    setPace,
    makeGesture,
    finalizeCycle,
    setPaused,
  } = useHarnessControl();

  // Load the burner wallet module and auto-connect the first persona.
  useEffect(() => {
    let cancelled = false;
    void import('@/components/wallet/harness-burner').then(async (mod) => {
      if (cancelled) return;
      setBurner(mod);
      setPersonaOptions(mod.harnessPersonaOptions());
      try {
        const active = await mod.connectHarnessBurner(wagmiConfig);
        if (!cancelled) setPersona(active);
      } catch {
        // Wallet connection is a convenience; the panel still works without it.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [wagmiConfig]);

  const refreshAppData = useCallback(
    (includeCurrentSpecialRecipients: boolean) => {
      echoTimers.current.forEach((timer) => clearTimeout(timer));
      echoTimers.current.clear();
      void invalidateLiveGameQueries(queryClient, { includeCurrentSpecialRecipients });
      HARNESS_ETL_RETRY_MS.forEach((delay, index) => {
        const timer = setTimeout(() => {
          echoTimers.current.delete(timer);
          void invalidateLiveGameQueries(queryClient, {
            includeCurrentSpecialRecipients:
              includeCurrentSpecialRecipients || index === HARNESS_ETL_RETRY_MS.length - 1,
          });
        }, delay);
        echoTimers.current.add(timer);
      });
    },
    [queryClient],
  );

  useEffect(
    () => () => {
      echoTimers.current.forEach((timer) => clearTimeout(timer));
      echoTimers.current.clear();
    },
    [],
  );

  const withBusy = useCallback(
    async (label: string, action: () => Promise<unknown>) => {
      const sequence = ++busySequence.current;
      setBusyAction(label);
      try {
        await action();
        if (label === 'gesture' || label === 'finalize') {
          refreshAppData(label === 'gesture');
        }
      } catch {
        // Errors surface through useHarnessControl's persistent command state.
      } finally {
        if (busySequence.current === sequence) setBusyAction(null);
      }
    },
    [refreshAppData],
  );

  const onPersonaChange = useCallback(
    (name: string) => {
      setPersona(name);
      if (burner) void burner.setHarnessPersona(wagmiConfig, name);
    },
    [burner, wagmiConfig],
  );

  const phases = status?.phases ?? DEFAULT_PHASES;
  const phaseSet = useMemo(() => new Set<string>(phases), [phases]);
  const activityScenarios = useMemo(
    () => (status?.scenarios ?? ['ambient']).filter((name) => !phaseSet.has(name)),
    [phaseSet, status?.scenarios],
  );
  const selectedScenario = pendingScenario ?? status?.scenario ?? '';
  const selectedPhase = phaseSet.has(selectedScenario) ? selectedScenario : '';
  const selectedActivity = activityScenarios.includes(selectedScenario) ? selectedScenario : '';
  const transition = status?.transition;
  const panelError = error ?? (transition?.state === 'error' ? transition.error : null);
  const transitionText =
    transition?.state === 'driving'
      ? `Driving to ${transition.target ?? 'target'}…`
      : transition?.state === 'error'
        ? `Failed: ${transition.error ?? 'unknown error'}`
        : transition?.state === 'running'
          ? `Ready: ${transition.target ?? status?.scenario ?? 'quiet'}`
          : 'Idle';

  useEffect(() => {
    if (
      pendingScenario &&
      status?.scenario === pendingScenario &&
      status.transition?.state === 'running'
    ) {
      setPendingScenario(null);
    }
  }, [pendingScenario, status?.scenario, status?.transition?.state]);

  useEffect(() => {
    if (transition?.state !== 'running' || transition.kind === 'command') return;
    const key = `${transition.kind}:${transition.target}:${status?.cycle.index ?? ''}`;
    if (completedTransition.current === key) return;
    completedTransition.current = key;
    refreshAppData(transition.target === 'gesture');
  }, [
    refreshAppData,
    status?.cycle.index,
    transition?.kind,
    transition?.state,
    transition?.target,
  ]);

  const chooseScenario = (name: string) => {
    if (!name) return;
    setPendingScenario(name);
    void withBusy('scenario', async () => {
      try {
        await switchScenario(name);
      } catch (err) {
        setPendingScenario((current) => (current === name ? null : current));
        throw err;
      }
    });
  };
  const mutationBusy = busyAction !== null;
  const transitionBusy = transition?.state === 'driving';

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open harness panel"
        data-testid="harness-open"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-black/80 px-3 py-1.5 text-xs text-amber-300 shadow-lg backdrop-blur hover:bg-black/95 print:hidden"
      >
        <FlaskConical className="h-3.5 w-3.5" aria-hidden />
        Harness
      </button>
    );
  }

  const cycle = status?.cycle;

  return (
    <section
      aria-label="Harness control panel"
      data-testid="harness-panel"
      className="fixed bottom-4 right-4 z-50 max-h-[calc(100dvh-2rem)] w-72 overflow-y-auto rounded-lg border border-amber-400/30 bg-black/90 p-3 text-xs text-white shadow-2xl backdrop-blur print:hidden"
    >
      <header className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-amber-300">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden />
          Testing harness
        </span>
        <button
          type="button"
          aria-label="Close harness panel"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-white/60 hover:text-white"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </header>

      {panelError ? (
        <div
          role="alert"
          className="mb-2 flex items-start justify-between gap-2 rounded bg-red-500/15 px-2 py-1 text-red-300"
        >
          <span>{panelError}</span>
          {commandError ? (
            <button
              type="button"
              onClick={clearCommandError}
              aria-label="Dismiss harness error"
              className="shrink-0 text-red-200/70 hover:text-red-100"
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          ) : null}
        </div>
      ) : null}

      <dl className="mb-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-white/80">
        <dt>Cycle</dt>
        <dd data-testid="harness-cycle-index">{cycle?.index ?? '…'}</dd>
        <dt>Scenario</dt>
        <dd>
          {status?.scenario ?? '…'}
          {status?.paused ? ' (paused)' : ''}
        </dd>
        <dt>Pace</dt>
        <dd>{status?.pace ?? '…'}</dd>
        <dt>State</dt>
        <dd
          data-testid="harness-transition-state"
          className={transition?.state === 'error' ? 'text-red-300' : 'text-white/80'}
        >
          {transitionText}
        </dd>
        <dt>Finalization in</dt>
        <dd data-testid="harness-finalization-in">
          {cycle ? formatSeconds(cycle.secondsUntilFinalization) : '…'}
        </dd>
      </dl>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-white/60">Hold UI phase</span>
        <select
          className={inputClass}
          value={selectedPhase}
          disabled={!status}
          data-testid="harness-phase-select"
          onChange={(event) => chooseScenario(event.target.value)}
        >
          <option value="">Choose phase…</option>
          {phases.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-white/60">Activity scenario</span>
        <select
          className={inputClass}
          value={selectedActivity}
          disabled={!status}
          data-testid="harness-scenario-select"
          onChange={(event) => chooseScenario(event.target.value)}
        >
          <option value="">Choose activity…</option>
          {activityScenarios.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-white/60">Pace (next configured cycle)</span>
        <select
          className={inputClass}
          value={status?.pace ?? 'demo'}
          disabled={!status || mutationBusy}
          data-testid="harness-pace-select"
          onChange={(event) => void withBusy('pace', () => setPace(event.target.value))}
        >
          {(status?.paces ?? ['realtime', 'demo', 'fast']).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-white/60">Persona (burner wallet)</span>
        <select
          className={inputClass}
          value={persona}
          data-testid="harness-persona-select"
          onChange={(event) => onPersonaChange(event.target.value)}
        >
          {(personaOptions.length > 0 ? personaOptions : [{ name: persona, address: '' }]).map(
            (option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ),
          )}
        </select>
      </label>

      <div className="mb-2 grid grid-cols-3 gap-1.5">
        <button
          type="button"
          disabled={mutationBusy || transitionBusy}
          data-testid="harness-gesture-eth"
          onClick={() => void withBusy('gesture', () => makeGesture({ persona, kind: 'eth' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          ETH gesture
        </button>
        <button
          type="button"
          disabled={mutationBusy || transitionBusy}
          data-testid="harness-gesture-cst"
          onClick={() => void withBusy('gesture', () => makeGesture({ persona, kind: 'cst' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          CST gesture
        </button>
        <button
          type="button"
          disabled={mutationBusy || transitionBusy}
          data-testid="harness-gesture-rwlk"
          onClick={() => void withBusy('gesture', () => makeGesture({ persona, kind: 'rwlk' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          RWLK gesture
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={mutationBusy || transitionBusy}
          data-testid="harness-finalize"
          onClick={() => void withBusy('finalize', () => finalizeCycle())}
          className="flex-1 rounded bg-emerald-500/20 px-2 py-1 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          Finalize cycle
        </button>
        <button
          type="button"
          disabled={mutationBusy || !status}
          aria-label={status?.paused ? 'Resume activity' : 'Pause activity'}
          data-testid="harness-pause"
          onClick={() => void withBusy('pause', () => setPaused(!(status?.paused ?? false)))}
          className="rounded bg-white/10 p-1.5 text-white/80 hover:bg-white/20 disabled:opacity-50"
        >
          {status?.paused ? (
            <Play className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Pause className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
      </div>
    </section>
  );
}
