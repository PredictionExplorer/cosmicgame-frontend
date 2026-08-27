'use client';

/**
 * Floating dev panel for the local test harness: shows the live cycle state,
 * switches scenarios, fires one-shot gestures/finalizations, pauses the
 * director, and drives the burner wallet's persona switcher.
 *
 * Mounted only in testing mode (see the gate in app providers); all strings
 * are intentionally English-only dev copy in the product's coined vocabulary.
 */

import { useCallback, useEffect, useState } from 'react';
import { useConfig } from 'wagmi';
import { FlaskConical, Pause, Play, X } from 'lucide-react';

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

export default function HarnessPanel() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [persona, setPersona] = useState<string>('Nova');
  const [personaOptions, setPersonaOptions] = useState<Array<{ name: string; address: string }>>(
    [],
  );
  const [burner, setBurner] = useState<BurnerModule | null>(null);
  const wagmiConfig = useConfig();
  const { status, error, switchScenario, makeGesture, finalizeCycle, setPaused } =
    useHarnessControl();

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

  const withBusy = useCallback(async (action: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await action();
    } catch {
      // Errors surface through useHarnessControl's error state.
    } finally {
      setBusy(false);
    }
  }, []);

  const onPersonaChange = useCallback(
    (name: string) => {
      setPersona(name);
      if (burner) void burner.setHarnessPersona(wagmiConfig, name);
    },
    [burner, wagmiConfig],
  );

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
      className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-amber-400/30 bg-black/90 p-3 text-xs text-white shadow-2xl backdrop-blur print:hidden"
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

      {error ? (
        <p role="alert" className="mb-2 rounded bg-red-500/15 px-2 py-1 text-red-300">
          {error}
        </p>
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
        <dt>Finalization in</dt>
        <dd data-testid="harness-finalization-in">
          {cycle ? formatSeconds(cycle.secondsUntilFinalization) : '…'}
        </dd>
      </dl>

      <label className="mb-2 block">
        <span className="mb-0.5 block text-white/60">Scenario</span>
        <select
          className={inputClass}
          value={status?.scenario ?? 'ambient'}
          disabled={busy || !status}
          data-testid="harness-scenario-select"
          onChange={(event) => void withBusy(() => switchScenario(event.target.value))}
        >
          {(status?.scenarios ?? ['ambient']).map((name) => (
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
          disabled={busy}
          data-testid="harness-gesture-eth"
          onClick={() => void withBusy(() => makeGesture({ persona, kind: 'eth' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          ETH gesture
        </button>
        <button
          type="button"
          disabled={busy}
          data-testid="harness-gesture-cst"
          onClick={() => void withBusy(() => makeGesture({ persona, kind: 'cst' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          CST gesture
        </button>
        <button
          type="button"
          disabled={busy}
          data-testid="harness-gesture-rwlk"
          onClick={() => void withBusy(() => makeGesture({ persona, kind: 'rwlk' }))}
          className="rounded bg-amber-500/20 px-2 py-1 text-amber-200 hover:bg-amber-500/30 disabled:opacity-50"
        >
          RWLK gesture
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={busy}
          data-testid="harness-finalize"
          onClick={() => void withBusy(() => finalizeCycle())}
          className="flex-1 rounded bg-emerald-500/20 px-2 py-1 text-emerald-200 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          Finalize cycle
        </button>
        <button
          type="button"
          disabled={busy || !status}
          aria-label={status?.paused ? 'Resume activity' : 'Pause activity'}
          data-testid="harness-pause"
          onClick={() => void withBusy(() => setPaused(!(status?.paused ?? false)))}
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
