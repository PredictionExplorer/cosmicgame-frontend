'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
 * The indexed row for a pending message: the same transaction when both sides
 * know it, so a repeated message ("gm") never hides a new one; otherwise the
 * same sender and text.
 */
function isEcho(gesture: GestureInfo, entry: PendingChatMessage): boolean {
  if (entry.txHash && typeof gesture.TxHash === 'string' && gesture.TxHash) {
    return gesture.TxHash.toLowerCase() === entry.txHash.toLowerCase();
  }
  return (
    sameAddress(gesture.BidderAddr, entry.address) &&
    typeof gesture.Message === 'string' &&
    gesture.Message.trim() === entry.message
  );
}

/**
 * Optimistic chat rows. A message sent with a confirmed Gesture shows at once
 * as "Indexing" and leaves as soon as the indexer echoes it. A slow indexer
 * never drops it silently: after 90 seconds it reads "Still indexing" beside
 * its transaction, and only after 15 minutes does it give way (F221).
 */
export function usePendingChatMessages(chatGestures: readonly GestureInfo[]): PendingChatMessages {
  const [stored, setStored] = useState<PendingChatMessage[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const gesturesRef = useRef(chatGestures);

  useEffect(() => {
    gesturesRef.current = chatGestures;
  }, [chatGestures]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const record = useCallback((address: string, message: string, txHash: string | null) => {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setStored((previous) => [
      ...previous,
      { id, address, message, txHash, timestamp: Math.floor(Date.now() / 1000) },
    ]);
    timersRef.current.push(
      setTimeout(() => {
        // An echoed entry leaves the store here; one still unechoed says so.
        setStored((previous) =>
          previous.flatMap((entry) => {
            if (entry.id !== id) return [entry];
            if (gesturesRef.current.some((gesture) => isEcho(gesture, entry))) return [];
            return [{ ...entry, stale: true }];
          }),
        );
      }, PENDING_MESSAGE_STALE_MS),
      setTimeout(() => {
        setStored((previous) => previous.filter((entry) => entry.id !== id));
      }, PENDING_MESSAGE_EXPIRY_MS),
    );
  }, []);

  // The indexer echoed the message: the real row replaces the pending one.
  // Derived during render, so the echo and the real row land in the same frame;
  // the stored entry leaves with its stale timer.
  const visible = useMemo(
    () =>
      stored.length === 0
        ? stored
        : stored.filter((entry) => !chatGestures.some((gesture) => isEcho(gesture, entry))),
    [stored, chatGestures],
  );

  return { pending: visible, record };
}
