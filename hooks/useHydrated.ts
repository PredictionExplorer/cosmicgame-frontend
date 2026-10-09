'use client';

import { useSyncExternalStore } from 'react';

const subscribeToNothing = () => () => undefined;

/**
 * `false` on the server and during hydration, `true` from the first render
 * after it (and at once on a client-side navigation). Gate markup that only
 * the browser can know — the connected wallet, the reader's time zone —
 * behind it, so the first client render matches the server's HTML and React
 * does not throw the page away and render it again.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}
