'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { INK_VIEW_PARAM, parseInkView, type InkView } from './inkLinks';

const HISTORY_KEY = 'cosmicInkView';

/** Duplicate values are ambiguous: do not choose an arbitrary asset to download. */
function readView(params: Pick<URLSearchParams, 'getAll'>): InkView | null {
  const values = params.getAll(INK_VIEW_PARAM);
  return values.length === 1 ? parseInkView(values[0] ?? null) : null;
}

function relativeHref(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

function customHistoryState(): Record<string, unknown> {
  const state = { ...window.history.state };
  // Next's public history integration restores these internals. Passing its
  // router sentinels ourselves would bypass that integration and leave
  // useSearchParams stale (see next/dist/client/components/app-router.js).
  delete state.__NA;
  delete state._N;
  delete state.__PRIVATE_NEXTJS_INTERNALS_TREE;
  return state;
}

/**
 * The detail viewer follows the URL, including browser Back/Forward. Its caller
 * must sit inside Suspense because useSearchParams also runs during prerendering.
 * Opening adds one history entry; selecting another view replaces that entry.
 */
export function useInkViewLink(enabled: boolean): {
  view: InkView | null;
  open: (view: InkView) => void;
  select: (view: InkView) => void;
  close: () => void;
} {
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const historyId = useId();
  const entryCount = useRef(0);
  const ownedEntry = useRef<{ id: string; returnHref: string } | null>(null);
  const closing = useRef(false);

  useEffect(() => {
    closing.current = false;
  }, [search]);

  const update = useCallback(
    (next: InkView, opening: boolean) => {
      if (!enabled) return;
      const url = new URL(window.location.href);
      if (readView(url.searchParams) === next) return;
      const push = opening && !url.searchParams.has(INK_VIEW_PARAM);
      const state = customHistoryState();
      if (push) {
        // URLSearchParams serializes spaces as '+'. Normalize the return URL
        // the same way so an existing '%20' does not prevent closing via Back.
        url.searchParams.delete(INK_VIEW_PARAM);
        const entry = {
          id: `${historyId}:${++entryCount.current}`,
          returnHref: relativeHref(url),
        };
        ownedEntry.current = entry;
        state[HISTORY_KEY] = entry.id;
      }
      closing.current = false;
      url.searchParams.set(INK_VIEW_PARAM, next);
      if (push) window.history.pushState(state, '', relativeHref(url));
      else window.history.replaceState(state, '', relativeHref(url));
    },
    [enabled, historyId],
  );

  const open = useCallback((next: InkView) => update(next, true), [update]);
  const select = useCallback((next: InkView) => update(next, false), [update]);

  const close = useCallback(() => {
    if (!enabled || closing.current) return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has(INK_VIEW_PARAM)) return;
    url.searchParams.delete(INK_VIEW_PARAM);
    const entry = ownedEntry.current;
    // Only traverse an entry we created in this mounted viewer, and only when
    // Back also preserves unrelated URL changes made while it was open. Fresh
    // links (including reloads) close in place, never leaving the artwork.
    if (
      entry &&
      window.history.state?.[HISTORY_KEY] === entry.id &&
      relativeHref(url) === entry.returnHref
    ) {
      closing.current = true;
      window.history.back();
      return;
    }
    const state = customHistoryState();
    delete state[HISTORY_KEY];
    window.history.replaceState(state, '', relativeHref(url));
  }, [enabled]);

  return { view: enabled ? readView(searchParams) : null, open, select, close };
}
