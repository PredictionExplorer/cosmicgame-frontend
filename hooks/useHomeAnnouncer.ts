'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { viewForPhase } from '@/components/home/observatory/phaseView';
import type { PositionMoment } from '@/hooks/usePositionMoment';
import type { CyclePhase } from '@/lib/cycleState';
import { formatAddress, sameAddress } from '@/utils/format';

/** Changes inside this window are spoken once, as the latest of them. */
export const ANNOUNCE_DEBOUNCE_MS = 1_200;

/** Phases worth a sentence; loading and outages are not changes of the cycle. */
function isAnnounced(phase: CyclePhase): boolean {
  return phase !== 'loading' && phase !== 'unavailable';
}

export interface HomeAnnouncerInput {
  phase: CyclePhase;
  /** The Last Gesture holder (undefined while unknown). */
  latestAddress?: string | null;
  /** This cycle's Gesture count (null while unknown). */
  gestureCount?: number | null;
  account?: string | null;
  /** The wallet's own position moment, which speaks first. */
  moment?: PositionMoment | null;
}

export interface HomeAnnouncement {
  /** Changes whenever a new sentence is due, so a repeat is spoken again. */
  id: number;
  text: string;
}

/**
 * What the Observatory says to screen readers, in one polite status: the
 * changes a participant decides on, never every chat update. The wallet's
 * own moment (its Gesture landed, its place was taken) first; otherwise a
 * new Last Gesture by someone else and the clock's phase changes (the final
 * hour, the final minute, zero, a clock that a Gesture moved back). Bursts
 * collapse into the latest sentence; nothing is spoken on load (F206).
 */
export function useHomeAnnouncer({
  phase,
  latestAddress,
  gestureCount,
  account,
  moment,
}: HomeAnnouncerInput): HomeAnnouncement {
  const t = useTranslations('home');
  const [announcement, setAnnouncement] = useState<HomeAnnouncement>({ id: 0, text: '' });
  const previous = useRef<{ phase: CyclePhase; count: number | null } | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  });

  const say = useCallback((text: string) => {
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      pending.current = null;
      setAnnouncement((current) => ({ id: current.id + 1, text }));
    }, ANNOUNCE_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
    },
    [],
  );

  // The wallet's own moment: one sentence each.
  const momentKind = moment?.kind ?? null;
  const momentAt = moment?.atMs ?? null;
  useEffect(() => {
    if (!momentKind) return;
    say(
      momentKind === 'taken'
        ? tRef.current('observatory.standing.positionTaken')
        : tRef.current('observatory.standing.landed'),
    );
  }, [momentKind, momentAt, say]);

  // Someone else's Gesture, and the clock's phase, against the previous reading.
  const ownLanded = momentKind === 'landed';
  useEffect(() => {
    const count = gestureCount ?? null;
    const before = previous.current;
    previous.current = { phase, count };
    if (!before) return;
    const parts: string[] = [];
    if (
      count != null &&
      before.count != null &&
      count > before.count &&
      latestAddress &&
      !sameAddress(latestAddress, account) &&
      !ownLanded
    ) {
      parts.push(tRef.current('announce.newGesture', { address: formatAddress(latestAddress) }));
    }
    if (phase !== before.phase && isAnnounced(phase) && isAnnounced(before.phase)) {
      parts.push(tRef.current(`chrono.phase.${viewForPhase(phase).messageKey}.status`));
    }
    if (parts.length > 0) say(parts.join(' '));
  }, [phase, gestureCount, latestAddress, account, ownLanded, say]);

  return announcement;
}
