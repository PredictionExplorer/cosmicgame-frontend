'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { viewForPhase } from '@/components/home/observatory/phaseView';
import type { PositionMoment } from '@/hooks/usePositionMoment';
import { getLocaleConfig } from '@/i18n/localeConfig';
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
 * own moment (its Gesture landed, its place was taken) leads, followed by a
 * new Last Gesture by someone else and the clock's phase changes (the final
 * hour, the final minute, zero, a clock that a Gesture moved back). Within
 * a burst the wallet's moment is kept and the other changes collapse into
 * the latest one, so one sentence says both; nothing is spoken on load (F206).
 */
export function useHomeAnnouncer({
  phase,
  latestAddress,
  gestureCount,
  account,
  moment,
}: HomeAnnouncerInput): HomeAnnouncement {
  const t = useTranslations('home');
  // Sentences join with a space only where the language spaces its words.
  const sentenceGap = getLocaleConfig(useLocale()).wordSpacing ? ' ' : '';
  const [announcement, setAnnouncement] = useState<HomeAnnouncement>({ id: 0, text: '' });
  const previous = useRef<{
    phase: CyclePhase;
    count: number | null;
    momentAt: number | null;
  } | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  // What the next sentence will say: the wallet's own moment, then the
  // latest other change. Both effects of one commit write here, so neither
  // can overwrite the other.
  const queued = useRef<{ moment: string | null; change: string | null }>({
    moment: null,
    change: null,
  });
  const tRef = useRef(t);
  const gapRef = useRef(sentenceGap);
  useEffect(() => {
    tRef.current = t;
    gapRef.current = sentenceGap;
  });

  const say = useCallback((part: 'moment' | 'change', text: string) => {
    queued.current[part] = text;
    if (pending.current) clearTimeout(pending.current);
    pending.current = setTimeout(() => {
      pending.current = null;
      const { moment: own, change } = queued.current;
      queued.current = { moment: null, change: null };
      const sentence = [own, change].filter(Boolean).join(gapRef.current);
      if (sentence) setAnnouncement((current) => ({ id: current.id + 1, text: sentence }));
    }, ANNOUNCE_DEBOUNCE_MS);
  }, []);

  useEffect(
    () => () => {
      if (pending.current) clearTimeout(pending.current);
    },
    [],
  );

  // The wallet's own moment: one sentence each. A taken place names who
  // holds the Last Gesture now, so no second sentence repeats it.
  const momentKind = moment?.kind ?? null;
  const momentAt = moment?.atMs ?? null;
  const momentBy = moment?.by ?? null;
  useEffect(() => {
    if (!momentKind) return;
    say(
      'moment',
      momentKind === 'landed'
        ? tRef.current('observatory.standing.landed')
        : momentBy
          ? tRef.current('announce.placeTaken', { address: formatAddress(momentBy) })
          : tRef.current('observatory.standing.positionTaken'),
    );
  }, [momentKind, momentAt, momentBy, say]);

  // Someone else's Gesture, and the clock's phase, against the previous reading.
  useEffect(() => {
    const count = gestureCount ?? null;
    const before = previous.current;
    previous.current = { phase, count, momentAt };
    if (!before) return;
    // This commit's own moment already says who holds the Last Gesture.
    const momentSaysIt = momentKind !== null && momentAt !== before.momentAt;
    const parts: string[] = [];
    if (
      count != null &&
      before.count != null &&
      count > before.count &&
      latestAddress &&
      !sameAddress(latestAddress, account) &&
      momentKind !== 'landed' &&
      !momentSaysIt
    ) {
      parts.push(tRef.current('announce.newGesture', { address: formatAddress(latestAddress) }));
    }
    if (phase !== before.phase && isAnnounced(phase) && isAnnounced(before.phase)) {
      parts.push(tRef.current(`chrono.phase.${viewForPhase(phase).messageKey}.status`));
    }
    if (parts.length > 0) say('change', parts.join(gapRef.current));
  }, [phase, gestureCount, latestAddress, account, momentKind, momentAt, say]);

  return announcement;
}
