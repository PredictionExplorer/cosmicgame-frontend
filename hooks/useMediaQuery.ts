'use client';

import { useSyncExternalStore } from 'react';

/**
 * useMediaQuery — subscribes a component to a CSS media query string and
 * re-renders when its match state changes. Uses useSyncExternalStore so
 * SSR and React Compiler memoization both work without a setState-in-
 * effect anti-pattern.
 *
 * Subscribe + getSnapshot are memoized per query so multiple components
 * watching the same query share the underlying MediaQueryList listener.
 */

const subscribeByQuery = new Map<string, (cb: () => void) => () => void>();
const getSnapshotByQuery = new Map<string, () => boolean>();

function getSubscribe(query: string): (cb: () => void) => () => void {
  let fn = subscribeByQuery.get(query);
  if (!fn) {
    fn = (callback: () => void) => {
      if (typeof window === 'undefined' || !window.matchMedia) return () => {};
      const mq = window.matchMedia(query);
      mq.addEventListener('change', callback);
      return () => mq.removeEventListener('change', callback);
    };
    subscribeByQuery.set(query, fn);
  }
  return fn;
}

function getGetSnapshot(query: string): () => boolean {
  let fn = getSnapshotByQuery.get(query);
  if (!fn) {
    fn = () => {
      if (typeof window === 'undefined' || !window.matchMedia) return false;
      return window.matchMedia(query).matches;
    };
    getSnapshotByQuery.set(query, fn);
  }
  return fn;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns whether the given media query matches. Re-renders the consumer
 * when the match state changes.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(getSubscribe(query), getGetSnapshot(query), getServerSnapshot);
}
