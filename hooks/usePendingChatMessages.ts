'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { PendingChatMessage } from '@/components/home/GestureMessageChat';
import type { GestureInfo } from '@/services/api';
import { sameAddress } from '@/utils/format';

/** A pending row not echoed by the indexer by then says "Still indexing". */
export const PENDING_MESSAGE_STALE_MS = 90_000;
/** ...and gives way after this long. */
export const PENDING_MESSAGE_EXPIRY_MS = 15 * 60_000;

export interface PendingChatMessages {
  pending: PendingChatMessage[];
  /** Shows a just-sent message at once, with its confirmed transaction. */
  record: (address: string, message: string, txHash: string | null) => void;
}

/**
 * Optimistic chat rows. A message sent with a confirmed Gesture shows at once
 * as "Indexing" and leaves as soon as the indexer echoes it. A slow indexer
 * never drops it silently: after 90 seconds it reads "Still indexing" beside
 * its transaction, and only after 15 minutes does it give way (F221).
 */
export function usePendingChatMessages(chatGestures: readonly GestureInfo[]): PendingChatMessages {
  const [pending, setPending] = useState<PendingChatMessage[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const record = useCallback((address: string, message: string, txHash: string | null) => {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPending((previous) => [
      ...previous,
      { id, address, message, txHash, timestamp: Math.floor(Date.now() / 1000) },
    ]);
    timersRef.current.push(
      setTimeout(() => {
        setPending((previous) =>
          previous.map((entry) => (entry.id === id ? { ...entry, stale: true } : entry)),
        );
      }, PENDING_MESSAGE_STALE_MS),
      setTimeout(() => {
        setPending((previous) => previous.filter((entry) => entry.id !== id));
      }, PENDING_MESSAGE_EXPIRY_MS),
    );
  }, []);

  // The indexer echoed the message: the real row replaces the pending one.
  useEffect(() => {
    setPending((previous) => {
      if (previous.length === 0) return previous;
      const next = previous.filter(
        (entry) =>
          !chatGestures.some(
            (gesture) =>
              sameAddress(gesture.BidderAddr, entry.address) &&
              typeof gesture.Message === 'string' &&
              gesture.Message.trim() === entry.message,
          ),
      );
      return next.length === previous.length ? previous : next;
    });
  }, [chatGestures]);

  return { pending, record };
}
