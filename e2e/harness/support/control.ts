/**
 * Test-side client for the harness director's control API, plus the
 * anti-flake polling helpers: specs never sleep for guessed durations — they
 * wait on explicit chain state (control API) or indexed state (backend API).
 */

import { apiUrl, controlUrl, readStackState, type HarnessStackState } from './stack';

export interface ControlCycleStatus {
  index: string;
  active: boolean;
  opened: boolean;
  secondsUntilActivation: string;
  secondsUntilFinalization: string;
  lastGestureAddress: string;
}

export interface ControlStatus {
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
  cycle: ControlCycleStatus;
  personas: Array<{ name: string; address: string }>;
}

export function requireStack(): HarnessStackState {
  const state = readStackState();
  if (!state) throw new Error('Harness stack is not running (missing .harness/state.json)');
  return state;
}

export async function control<T = Record<string, unknown>>(
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const state = requireStack();
  const response = await fetch(`${controlUrl(state)}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? null : JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `control ${path}: HTTP ${response.status}`);
  return payload;
}

export const controlStatus = (): Promise<ControlStatus> => control<ControlStatus>('/status');

export async function switchScenario(name: string): Promise<void> {
  await control('/scenario', { name });
}

/** Poll until the predicate holds; throws with `what` after the timeout. */
export async function waitUntil<T>(
  what: string,
  probe: () => Promise<T | false | null | undefined>,
  timeoutMs = 120_000,
  intervalMs = 1_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;
  for (;;) {
    try {
      const value = await probe();
      if (value) return value;
    } catch (err) {
      lastError = err;
    }
    if (Date.now() > deadline) {
      const detail = lastError instanceof Error ? ` Last error: ${lastError.message}` : '';
      throw new Error(`Timed out waiting for ${what}.${detail}`);
    }
    await new Promise((resolveSleep) => setTimeout(resolveSleep, intervalMs));
  }
}

/** Wait for a chain-state condition as reported by the director. */
export async function awaitCycleState(
  what: string,
  predicate: (status: ControlStatus) => boolean,
  timeoutMs?: number,
): Promise<ControlStatus> {
  return waitUntil(
    what,
    async () => {
      const status = await controlStatus();
      return predicate(status) ? status : false;
    },
    timeoutMs,
  );
}

interface DashboardShape {
  CurRoundNum?: number;
  CurNumBids?: number;
  LastBidderAddr?: string;
  PrizeClaimTs?: number;
  TsRoundStart?: number;
  CurRoundStats?: { ActivationTime?: number };
  /** Test-only sample from `time/current`, attached by readDashboard. */
  CurrentChainTime?: number;
  [key: string]: unknown;
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function dashboardShowsUnopenedActiveCycle(d: DashboardShape): boolean {
  const nowSec = d.CurrentChainTime ?? Math.floor(Date.now() / 1000);
  const activation = d.CurRoundStats?.ActivationTime ?? 0;
  return (
    activation > 0 && activation <= nowSec && (d.LastBidderAddr ?? ZERO_ADDRESS) === ZERO_ADDRESS
  );
}

export function dashboardShowsOpenedCycle(d: DashboardShape): boolean {
  return (d.LastBidderAddr ?? ZERO_ADDRESS) !== ZERO_ADDRESS;
}

export async function readDashboard(): Promise<DashboardShape> {
  const state = requireStack();
  const [dashboardResponse, timeResponse] = await Promise.all([
    fetch(`${apiUrl(state)}/statistics/dashboard`),
    fetch(`${apiUrl(state)}/time/current`),
  ]);
  if (!dashboardResponse.ok) throw new Error(`dashboard: HTTP ${dashboardResponse.status}`);
  if (!timeResponse.ok) throw new Error(`current time: HTTP ${timeResponse.status}`);
  const dashboard = (await dashboardResponse.json()) as DashboardShape;
  const time = (await timeResponse.json()) as { CurrentTimeStamp?: number };
  return {
    ...dashboard,
    ...(typeof time.CurrentTimeStamp === 'number'
      ? { CurrentChainTime: time.CurrentTimeStamp }
      : {}),
  };
}

/**
 * Wait until the indexer has caught up to a condition — the harness
 * equivalent of "await the ETL" (the UI tolerates this lag with delayed
 * re-invalidation; tests make it explicit).
 */
export async function awaitIndexed(
  what: string,
  predicate: (dashboard: DashboardShape) => boolean,
  timeoutMs = 180_000,
): Promise<DashboardShape> {
  return waitUntil(
    what,
    async () => {
      const dashboard = await readDashboard();
      return predicate(dashboard) ? dashboard : false;
    },
    timeoutMs,
  );
}
