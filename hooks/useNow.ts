'use client';

import { useSyncExternalStore } from 'react';

/**
 * useNow — re-renders the consumer every `intervalMs` with the current
 * epoch ms. Designed to replace bare `Date.now()` calls in render bodies,
 * which the React-hooks lint rule (rightly) flags as impure.
 *
 * Sharing a single global ticker keeps the cost flat: N callers means
 * 1 setInterval + N subscribers, not N intervals. The ticker only runs
 * when at least one subscriber is mounted, and it stops as soon as the
 * last one unmounts.
 *
 * For SSR, getServerSnapshot returns 0. Components that compare against
 * `Date.now()`-shaped values should branch on the falsy initial value
 * (or use the `useNowMs` non-zero guard accessor).
 */

const tickers = new Map<number, Ticker>();

interface Ticker {
  intervalMs: number;
  intervalId: ReturnType<typeof setInterval> | null;
  lastTick: number;
  subscribers: Set<() => void>;
}

function getTicker(intervalMs: number): Ticker {
  let t = tickers.get(intervalMs);
  if (!t) {
    t = { intervalMs, intervalId: null, lastTick: 0, subscribers: new Set() };
    tickers.set(intervalMs, t);
  }
  return t;
}

function startIfNeeded(t: Ticker): void {
  if (t.intervalId !== null || t.subscribers.size === 0) return;
  t.intervalId = setInterval(() => {
    t.lastTick = Date.now();
    t.subscribers.forEach((s) => s());
  }, t.intervalMs);
}

function stopIfIdle(t: Ticker): void {
  if (t.subscribers.size === 0 && t.intervalId !== null) {
    clearInterval(t.intervalId);
    t.intervalId = null;
  }
}

// Memoize subscribe + getSnapshot per-intervalMs so useSyncExternalStore
// sees a stable reference across renders and doesn't resubscribe constantly.
const subscribeByInterval = new Map<number, (cb: () => void) => () => void>();
const getSnapshotByInterval = new Map<number, () => number>();

function getSubscribe(intervalMs: number): (cb: () => void) => () => void {
  let fn = subscribeByInterval.get(intervalMs);
  if (!fn) {
    fn = (callback: () => void) => {
      const t = getTicker(intervalMs);
      if (t.lastTick === 0) t.lastTick = Date.now();
      t.subscribers.add(callback);
      startIfNeeded(t);
      return () => {
        t.subscribers.delete(callback);
        stopIfIdle(t);
      };
    };
    subscribeByInterval.set(intervalMs, fn);
  }
  return fn;
}

function getGetSnapshot(intervalMs: number): () => number {
  let fn = getSnapshotByInterval.get(intervalMs);
  if (!fn) {
    fn = () => {
      const t = getTicker(intervalMs);
      if (t.lastTick === 0) t.lastTick = Date.now();
      return t.lastTick;
    };
    getSnapshotByInterval.set(intervalMs, fn);
  }
  return fn;
}

function getServerSnapshot(): number {
  return 0;
}

/**
 * Returns the current epoch ms, re-rendering the consumer every
 * `intervalMs` (default 1000). Use this in place of `Date.now()` when
 * you need a comparison or display that must refresh as time passes.
 */
export function useNow(intervalMs: number = 1000): number {
  return useSyncExternalStore(
    getSubscribe(intervalMs),
    getGetSnapshot(intervalMs),
    getServerSnapshot,
  );
}
