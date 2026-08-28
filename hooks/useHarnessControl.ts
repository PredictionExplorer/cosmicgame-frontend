'use client';

/**
 * Client for the local harness director's control API (scripts/harness).
 * Only mounted from the harness dev panel; deliberately independent of the
 * app's API layer (plain fetch, no rotation, no Sentry).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface HarnessCycleStatus {
  index: string;
  active: boolean;
  opened: boolean;
  secondsUntilActivation: string;
  secondsUntilFinalization: string;
  finalizationTime: string;
  lastGestureAddress: string;
  nextEthGestureCost: string;
  nextCstGestureCost: string;
}

export interface HarnessStatus {
  ready: boolean;
  scenario: string;
  phase: string;
  pace: string;
  paused: boolean;
  transition: {
    kind: 'scenario' | 'phase' | 'command' | null;
    state: 'idle' | 'driving' | 'running' | 'error';
    target: string | null;
    error: string | null;
  };
  cycle: HarnessCycleStatus;
  personas: Array<{ name: string; address: string }>;
  scenarios: string[];
  phases: string[];
  paces: string[];
}

/** True when the harness dev UI should exist at all (inlined at build time). */
export function isHarnessUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HARNESS === '1' && process.env.NEXT_PUBLIC_NETWORK === 'local';
}

export function harnessControlUrl(): string {
  return process.env.NEXT_PUBLIC_HARNESS_CONTROL_URL?.trim() || 'http://127.0.0.1:8686';
}

const CONTROL_TIMEOUT_MS = 60_000;

async function controlFetch<T>(
  path: string,
  body?: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const timeoutSignal = AbortSignal.timeout(CONTROL_TIMEOUT_MS);
  const response = await fetch(`${harnessControlUrl()}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? null : JSON.stringify(body),
    signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload;
}

export interface UseHarnessControlResult {
  status: HarnessStatus | null;
  /** Combined compatibility surface: command errors take precedence. */
  error: string | null;
  connectionError: string | null;
  commandError: string | null;
  clearCommandError: () => void;
  switchScenario: (name: string) => Promise<void>;
  driveToPhase: (name: string) => Promise<void>;
  setPace: (name: string) => Promise<void>;
  makeGesture: (options: { persona?: string; kind?: 'eth' | 'cst' | 'rwlk' }) => Promise<void>;
  finalizeCycle: () => Promise<void>;
  setPaused: (paused: boolean) => Promise<void>;
}

const POLL_MS = 3_000;

export function useHarnessControl(): UseHarnessControlResult {
  const [status, setStatus] = useState<HarnessStatus | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [commandError, setCommandError] = useState<string | null>(null);
  const mounted = useRef(true);
  const refreshSequence = useRef(0);
  const commandSequence = useRef(0);
  const statusAbortController = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    const sequence = ++refreshSequence.current;
    statusAbortController.current?.abort();
    const controller = new AbortController();
    statusAbortController.current = controller;
    try {
      const next = await controlFetch<HarnessStatus>('/status', undefined, controller.signal);
      if (!mounted.current || sequence !== refreshSequence.current) return;
      setStatus(next);
      setConnectionError(null);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (!mounted.current || sequence !== refreshSequence.current) return;
      setConnectionError(err instanceof Error ? err.message : String(err));
    } finally {
      if (statusAbortController.current === controller) statusAbortController.current = null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const interval = status?.transition?.state === 'driving' ? 750 : POLL_MS;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const poll = async () => {
      await refresh();
      if (!cancelled) timer = setTimeout(() => void poll(), interval);
    };
    void poll();
    return () => {
      cancelled = true;
      mounted.current = false;
      statusAbortController.current?.abort();
      if (timer) clearTimeout(timer);
    };
  }, [refresh, status?.transition?.state]);

  const run = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      const sequence = ++commandSequence.current;
      setCommandError(null);
      try {
        await controlFetch(path, body);
        if (mounted.current && sequence === commandSequence.current) setCommandError(null);
      } catch (err) {
        if (mounted.current && sequence === commandSequence.current) {
          setCommandError(err instanceof Error ? err.message : String(err));
        }
        throw err;
      } finally {
        await refresh();
      }
    },
    [refresh],
  );

  return {
    status,
    error: commandError ?? connectionError,
    connectionError,
    commandError,
    clearCommandError: useCallback(() => setCommandError(null), []),
    switchScenario: useCallback((name: string) => run('/scenario', { name }), [run]),
    driveToPhase: useCallback((name: string) => run('/phase', { name }), [run]),
    setPace: useCallback((name: string) => run('/pace', { name }), [run]),
    makeGesture: useCallback(
      (options: { persona?: string; kind?: 'eth' | 'cst' | 'rwlk' }) =>
        run('/gesture', { ...options }),
      [run],
    ),
    finalizeCycle: useCallback(() => run('/finalize', {}), [run]),
    setPaused: useCallback((paused: boolean) => run(paused ? '/pause' : '/resume', {}), [run]),
  };
}
