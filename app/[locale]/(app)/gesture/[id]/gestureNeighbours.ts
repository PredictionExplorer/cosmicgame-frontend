'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import type { GestureInfo } from '@/services/api/types';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * A neighbouring gesture: its record id, its position in the cycle, when it
 * was made and the Cycle Finalization Time it left (Unix seconds; null when
 * the row does not carry them).
 */
export interface GestureNeighbour {
  id: number;
  position: number;
  timestamp: number | null;
  finalizationTime: number | null;
}

/** The gestures around one gesture of its cycle. */
export interface GestureNeighbours {
  previous: GestureNeighbour | null;
  next: GestureNeighbour | null;
  /**
   * The window was read, so a missing `next` means the gesture was the
   * cycle's latest when it was read, not that the read is pending.
   */
  settled: boolean;
}

/**
 * The page of a cycle's gestures (oldest first) that holds the gestures just
 * before and after `position`. Positions start at 1 and a page offset is
 * zero-based, so position P sits at offset P − 1.
 */
export function neighbourWindow(position: number): { offset: number; limit: number } {
  return position > 1 ? { offset: position - 2, limit: 3 } : { offset: 0, limit: 2 };
}

/** A positive Unix time, or null. */
const unixSeconds = (value: unknown): number | null => {
  const seconds = toFiniteNumber(value);
  return seconds !== null && seconds > 0 ? seconds : null;
};

/**
 * The previous and next gesture of the same cycle, found by position:
 * record ids (`EvtLogId`) are not sequential within a cycle, so the page
 * cannot step by id. `null` where there is none (the first gesture, the
 * latest one) or it could not be read.
 */
export function pickNeighbours(
  gestures: readonly Pick<GestureInfo, 'BidPosition' | 'EvtLogId' | 'TimeStamp' | 'PrizeTime'>[],
  position: number,
): Pick<GestureNeighbours, 'previous' | 'next'> {
  const at = (target: number): GestureNeighbour | null => {
    const gesture = gestures.find((entry) => entry.BidPosition === target);
    return gesture && typeof gesture.EvtLogId === 'number'
      ? {
          id: gesture.EvtLogId,
          position: target,
          timestamp: unixSeconds(gesture.TimeStamp),
          finalizationTime: unixSeconds(gesture.PrizeTime),
        }
      : null;
  };
  return { previous: position > 1 ? at(position - 1) : null, next: at(position + 1) };
}

/** The gestures around one gesture of a cycle; both null (and not settled) until read. */
export function useGestureNeighbours(
  cycle: number | undefined,
  position: number | undefined,
): GestureNeighbours {
  const enabled =
    typeof cycle === 'number' && cycle >= 0 && typeof position === 'number' && position > 0;
  const query = useQuery({
    queryKey: ['gestureNeighbours', cycle, position],
    enabled,
    staleTime: 60_000,
    queryFn: ({ signal }) =>
      api.get_bid_list_by_round(cycle as number, 'asc', {
        ...neighbourWindow(position as number),
        signal,
      }),
  });
  return query.data && enabled
    ? { ...pickNeighbours(query.data, position as number), settled: true }
    : { previous: null, next: null, settled: false };
}
