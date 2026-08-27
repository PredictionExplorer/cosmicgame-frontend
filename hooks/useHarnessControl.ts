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
  pace: string;
  paused: boolean;
  cycle: HarnessCycleStatus;
  personas: Array<{ name: string; address: string }>;
  scenarios: string[];
}

/** True when the harness dev UI should exist at all (inlined at build time). */
export function isHarnessUiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HARNESS === '1' && process.env.NEXT_PUBLIC_NETWORK === 'local';
}

export function harnessControlUrl(): string {
  return process.env.NEXT_PUBLIC_HARNESS_CONTROL_URL?.trim() || 'http://127.0.0.1:8686';
}

async function controlFetch<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${harnessControlUrl()}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? null : JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`);
  return payload;
}

export interface UseHarnessControlResult {
  status: HarnessStatus | null;
  /** Non-null when the director is unreachable or a command failed. */
  error: string | null;
  switchScenario: (name: string) => Promise<void>;
  makeGesture: (options: { persona?: string; kind?: 'eth' | 'cst' | 'rwlk' }) => Promise<void>;
  finalizeCycle: () => Promise<void>;
  setPaused: (paused: boolean) => Promise<void>;
}

const POLL_MS = 3_000;

export function useHarnessControl(): UseHarnessControlResult {
  const [status, setStatus] = useState<HarnessStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const next = await controlFetch<HarnessStatus>('/status');
      if (!mounted.current) return;
      setStatus(next);
      setError(null);
    } catch (err) {
      if (!mounted.current) return;
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  const run = useCallback(
    async (path: string, body: Record<string, unknown>) => {
      try {
        await controlFetch(path, body);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      } finally {
        void refresh();
      }
    },
    [refresh],
  );

  return {
    status,
    error,
    switchScenario: useCallback((name: string) => run('/scenario', { name }), [run]),
    makeGesture: useCallback(
      (options: { persona?: string; kind?: 'eth' | 'cst' | 'rwlk' }) =>
        run('/gesture', { ...options }),
      [run],
    ),
    finalizeCycle: useCallback(() => run('/finalize', {}), [run]),
    setPaused: useCallback((paused: boolean) => run(paused ? '/pause' : '/resume', {}), [run]),
  };
}
