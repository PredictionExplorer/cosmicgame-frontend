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
  kind: 'cycleStart' | 'enduranceRecord' | 'chronoLead';
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
 * Derives the cycle-start marker, every completed Endurance-record stint,
 * and every Chrono-Warrior lead change. Endurance events are stamped at the
 * gesture that ended the record stint (the moment the record length became
 * final); Chrono events at the moment a champion's reign surpassed the
 * standing Chrono record. The still-growing stint/reign of the current
 * holders is deliberately excluded, so every event is deterministic from
 * indexed data and the memoized feed never flickers with the clock.
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

  // Record-setting stints double as the Endurance-champion lineage that the
  // Chrono-Warrior reign segments tile over (same math as utils/endurance).
  interface RecordStint {
    address: string;
    startTs: number;
    stintSeconds: number;
  }
  const lineage: RecordStint[] = [];

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
      lineage.push({ address: holder.BidderAddr, startTs: holder.TimeStamp, stintSeconds });
      record = stintSeconds;
    }
  }

  // A champion's reign runs from the moment they took the endurance record
  // until the next champion takes it. Only completed reigns (there IS a next
  // champion) can be stamped without consulting the live clock.
  let chronoRecord = 0;
  for (let i = 0; i < lineage.length - 1; i++) {
    const current = lineage[i]!;
    const previous = i > 0 ? lineage[i - 1]! : null;
    const reignStart = previous ? current.startTs + previous.stintSeconds : current.startTs;
    const reignEnd = lineage[i + 1]!.startTs + current.stintSeconds;
    const reignSeconds = Math.max(0, reignEnd - reignStart);
    if (reignSeconds > chronoRecord) {
      events.push({
        id: `chrono-${current.address}-${reignStart}-${reignSeconds}`,
        // The instant the growing reign passed the standing record.
        timestamp: reignStart + chronoRecord,
        kind: 'chronoLead',
        address: current.address,
        durationSeconds: reignSeconds,
      });
      chronoRecord = reignSeconds;
    }
  }

  return events;
}
