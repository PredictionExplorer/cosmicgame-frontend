'use client';

import { useMemo } from 'react';

import { useBannedGestures } from '@/hooks/useApiQuery';

/**
 * Whether a gesture's message may be shown, from the list of messages
 * moderation has hidden.
 *
 * - `ready`: the list is known; a message is shown unless its gesture is
 *   in `hidden`.
 * - `pending`: the list is loading; no message is shown yet.
 * - `failed`: the list could not be read; no message is shown, and
 *   `retry` reads it again.
 *
 * Moderation fails closed: a hidden message must never reach a public
 * ledger or the chat because the list that hides it did not load. The
 * gestures themselves still show; only their messages wait.
 */
export type GestureModeration =
  | { status: 'ready'; hidden: ReadonlySet<number> }
  | { status: 'pending' }
  | { status: 'failed'; retry: () => void };

const NOTHING_HIDDEN: GestureModeration = { status: 'ready', hidden: new Set() };

/**
 * The hidden-message list as a moderation state. Pass `enabled: false`
 * where the messages arrive already moderated by the server: nothing is
 * read, and nothing is hidden on top.
 */
export function useGestureModeration({
  enabled = true,
}: { enabled?: boolean } = {}): GestureModeration {
  const { data, isError, refetch } = useBannedGestures({ enabled });

  return useMemo<GestureModeration>(() => {
    if (!enabled) return NOTHING_HIDDEN;
    // A list read before stays in force while a later refresh fails.
    if (data) return { status: 'ready', hidden: new Set(data.map((entry) => entry.bid_id)) };
    if (isError) return { status: 'failed', retry: () => void refetch() };
    return { status: 'pending' };
  }, [data, enabled, isError, refetch]);
}

/** Whether moderation lets this gesture's message be shown. */
export function mayShowMessage(moderation: GestureModeration, gestureId: number): boolean {
  return moderation.status === 'ready' && !moderation.hidden.has(gestureId);
}
