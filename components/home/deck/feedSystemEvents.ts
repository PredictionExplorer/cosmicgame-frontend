import type { GestureInfo } from '@/services/api';

/**
 * A derived cycle moment interleaved into the Gesture Chat feed. All events
 * are computed deterministically from data the page already holds (the
 * gesture list and the dashboard read) — no extra API traffic and no clock
 * ticking, so the memoized feed stays referentially stable between polls.
 */
export interface GestureFeedSystemEvent {
  id: string;
  /** Unix seconds; merged into the feed next to same-time messages. */
  timestamp: number;
  kind: 'cycleStart' | 'enduranceRecord';
  address?: string;
  durationSeconds?: number;
  cycleNumber?: number;
}

interface DeriveFeedSystemEventsInput {
  gestures: GestureInfo[];
  cycleNumber?: number;
  /** Dashboard `TsRoundStart`; 0 while the cycle awaits its first gesture. */
  roundStartTs?: number;
}

/**
 * Derives the cycle-start marker and every completed Endurance-record stint.
 * A record event is stamped at the gesture that ended the stint (the moment
 * the record length became final); the still-growing stint of the current
 * latest participant is deliberately excluded so the feed never flickers.
 */
export function deriveFeedSystemEvents({
  gestures,
  cycleNumber,
  roundStartTs = 0,
}: DeriveFeedSystemEventsInput): GestureFeedSystemEvent[] {
  const events: GestureFeedSystemEvent[] = [];

  if (roundStartTs > 0) {
    events.push({
      id: `cycle-start-${cycleNumber ?? roundStartTs}`,
      timestamp: roundStartTs,
      kind: 'cycleStart',
      cycleNumber,
    });
  }

  const sorted = gestures
    .filter((gesture) => Number.isFinite(gesture.TimeStamp) && gesture.TimeStamp > 0)
    .sort((a, b) => a.TimeStamp - b.TimeStamp);

  let record = 0;
  for (let i = 1; i < sorted.length; i++) {
    const holder = sorted[i - 1]!;
    const stintSeconds = sorted[i]!.TimeStamp - holder.TimeStamp;
    if (stintSeconds > record) {
      events.push({
        id: `endurance-${holder.EvtLogId ?? holder.TimeStamp}-${stintSeconds}`,
        timestamp: sorted[i]!.TimeStamp,
        kind: 'enduranceRecord',
        address: holder.BidderAddr,
        durationSeconds: stintSeconds,
      });
      record = stintSeconds;
    }
  }

  return events;
}
