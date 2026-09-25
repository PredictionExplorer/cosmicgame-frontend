'use client';

import { useState, useSyncExternalStore } from 'react';

import { getLiveFreshness } from '@/lib/liveFreshness';
import { useNow } from '@/hooks/useNow';
import { LiveStatusView } from '@/components/ui/live-status-view';

/** What a polled contract read last did. */
export interface ContractReadHealth {
  /** When the read last succeeded (epoch ms); `null` before the first success. */
  lastSuccessAtMs: number | null;
  /** The latest attempt failed. */
  lastAttemptFailed: boolean;
}

/**
 * The health of a polled read, kept outside React state: the poll records
 * each attempt here, and only the stamp that shows it re-renders, not the
 * page around the poll.
 */
export interface ContractReadHealthStore {
  succeeded: () => void;
  failed: () => void;
  get: () => ContractReadHealth;
  subscribe: (listener: () => void) => () => void;
}

const INITIAL_HEALTH: ContractReadHealth = { lastSuccessAtMs: null, lastAttemptFailed: false };

export function createContractReadHealthStore(): ContractReadHealthStore {
  let health = INITIAL_HEALTH;
  const listeners = new Set<() => void>();
  const set = (next: ContractReadHealth) => {
    health = next;
    listeners.forEach((listener) => listener());
  };
  return {
    succeeded: () => set({ lastSuccessAtMs: Date.now(), lastAttemptFailed: false }),
    // A failure keeps the last success, so the stamp can say how old the figures are.
    failed: () => set({ ...health, lastAttemptFailed: true }),
    get: () => health,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

/** One health store for the lifetime of the component that polls. */
export function useContractReadHealthStore(): ContractReadHealthStore {
  const [store] = useState(createContractReadHealthStore);
  return store;
}

const serverHealth = () => INITIAL_HEALTH;

/**
 * The freshness stamp of values this page polls from the contracts
 * directly (not through the query cache that `LiveStatus` reads): "Live"
 * while the reads succeed, "Updated 2 min ago" once they stall, reconnecting
 * after a failure. It uses the shared freshness model, and its dot holds
 * still: nothing on /contracts is the page's one breathing live signal.
 */
export function ContractReadStatus({
  store,
  pollIntervalMs,
}: {
  store: ContractReadHealthStore;
  pollIntervalMs: number;
}) {
  const health = useSyncExternalStore(store.subscribe, store.get, serverHealth);
  const nowMs = useNow(1_000);
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  const state =
    nowMs > 0
      ? getLiveFreshness({
          lastSuccessAtMs: health.lastSuccessAtMs,
          lastAttemptFailed: health.lastAttemptFailed,
          online,
          pollIntervalMs,
          nowMs,
        })
      : 'connecting';
  const ageMs = health.lastSuccessAtMs && nowMs > 0 ? nowMs - health.lastSuccessAtMs : 0;
  return <LiveStatusView state={state} ageMs={ageMs} variant="inline" still />;
}
