import type { GestureInfo } from '@/services/api';
import { resolveGestureTypeCode } from '@/utils/gestures';

/** A timestamped cycle milestone, reconstructed from indexed Gestures. */
export interface GestureFeedSystemEvent {
  id: string;
  /** Unix seconds, including the exact threshold time for timer milestones. */
  timestamp: number;
  kind:
    | 'cycleOpen'
    | 'cycleStart'
    | 'enduranceGrowing'
    | 'enduranceRecord'
    | 'chronoLead'
    | 'chronoReignEnded'
    | 'finalCstLeader'
    | 'newParticipant'
    | 'gestureMilestone'
    | 'cstCalibrationReady'
    | 'finalWindow'
    | 'clockExtended'
    | 'clockReopened'
    | 'finalizationAvailable'
    | 'cycleFinalized';
  address?: string;
  durationSeconds?: number;
  cycleNumber?: number;
  count?: number;
}

export interface DeriveFeedSystemEventsInput {
  gestures: GestureInfo[];
  cycleNumber?: number;
  roundStartTs?: number;
  activationTs?: number;
  /** Source-aligned current time. Omit to include only indexed history. */
  nowSeconds?: number;
  /** Actual finalization timestamp, never the movable allocation deadline. */
  finalizedAtTs?: number;
  /** Suppress reconstruction while the initial page or indexer has only part of the cycle. */
  expectedGestureCount?: number;
}

const FINAL_WINDOW_THRESHOLDS = [60 * 60, 10 * 60] as const;
const positiveTime = (value: number | undefined): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;

function isActivityMilestone(count: number): boolean {
  if (count < 10) return false;
  const scale = 10 ** Math.floor(Math.log10(count));
  return count === scale || count === 2 * scale || count === 5 * scale;
}

/**
 * Reconstructs both completed and active record stints, matching BidStatisticsV2:
 * a strict greater-than establishes a new record, while Chrono durations use the
 * equality boundary. Same-wallet Gestures still start separate stints/reigns.
 * Event IDs and payloads never use the eventual length of a still-growing record.
 * Missing history cannot establish records or a participant's first appearance.
 */
export function deriveFeedSystemEvents({
  gestures,
  cycleNumber,
  roundStartTs = 0,
  activationTs = 0,
  nowSeconds,
  finalizedAtTs = 0,
  expectedGestureCount,
}: DeriveFeedSystemEventsInput): GestureFeedSystemEvent[] {
  const seen = new Set<string>();
  const sorted = gestures
    .filter((gesture) => {
      if (!positiveTime(gesture.TimeStamp)) return false;
      if (cycleNumber !== undefined && gesture.RoundNum !== cycleNumber) return false;
      const key = `${gesture.EvtLogId ?? gesture.BidPosition ?? ''}:${gesture.TimeStamp}:${gesture.BidderAddr}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) =>
        a.TimeStamp - b.TimeStamp ||
        (a.BidPosition !== undefined && b.BidPosition !== undefined
          ? a.BidPosition - b.BidPosition
          : (a.EvtLogId ?? 0) - (b.EvtLogId ?? 0)),
    );
  const horizon = positiveTime(finalizedAtTs)
    ? finalizedAtTs
    : positiveTime(nowSeconds)
      ? nowSeconds
      : (sorted.at(-1)?.TimeStamp ?? roundStartTs);
  const events: GestureFeedSystemEvent[] = [];
  const add = (event: GestureFeedSystemEvent) => {
    if (positiveTime(event.timestamp) && event.timestamp <= horizon) events.push(event);
  };
  const cycleId = cycleNumber ?? roundStartTs;
  if (positiveTime(activationTs)) {
    add({ id: `cycle-open-${cycleId}`, timestamp: activationTs, kind: 'cycleOpen', cycleNumber });
  }
  if (positiveTime(roundStartTs)) {
    add({ id: `cycle-start-${cycleId}`, timestamp: roundStartTs, kind: 'cycleStart', cycleNumber });
  }
  if (positiveTime(finalizedAtTs)) {
    add({
      id: `cycle-finalized-${cycleId}`,
      timestamp: finalizedAtTs,
      kind: 'cycleFinalized',
      cycleNumber,
    });
  }

  const historyIsIncomplete =
    (expectedGestureCount !== undefined && sorted.length < expectedGestureCount) ||
    sorted.some(
      (gesture, index) => gesture.BidPosition !== undefined && gesture.BidPosition !== index + 1,
    ) ||
    (positiveTime(roundStartTs) && sorted.length > 0 && sorted[0]!.TimeStamp !== roundStartTs);
  if (historyIsIncomplete) return events;

  const observed = sorted.filter((gesture) => gesture.TimeStamp <= horizon);
  interface RecordStint {
    address: string;
    key: string;
    start: number;
    duration: number;
    previousRecord: number;
    first: boolean;
  }
  const lineage: RecordStint[] = [];
  let enduranceRecord = 0;
  const participants = new Set<string>();
  let finalCstAddress: string | undefined;
  let calibrationStart = observed[0]?.TimeStamp ?? 0;
  let calibrationHasReachedFloor = false;
  let calibrationStateKnown = true;
  let calibrationKey = `${cycleId}-${observed[0]?.EvtLogId ?? observed[0]?.BidPosition ?? 0}`;

  for (let i = 0; i < observed.length; i++) {
    const gesture = observed[i]!;
    const next = observed[i + 1];
    const previous = observed[i - 1];
    const end = next?.TimeStamp ?? horizon;
    const key = `${cycleId}-${gesture.EvtLogId ?? gesture.BidPosition ?? i}`;
    const address = gesture.BidderAddr;
    const addressKey = address.toLowerCase();
    const duration = end - gesture.TimeStamp;
    const first = i === 0;
    if (first || duration > enduranceRecord) {
      const previousRecord = enduranceRecord;
      lineage.push({ address, key, start: gesture.TimeStamp, duration, previousRecord, first });
      add({
        id: `endurance-growing-${key}`,
        timestamp: gesture.TimeStamp + (first ? 0 : previousRecord + 1),
        kind: 'enduranceGrowing',
        address,
        durationSeconds: first ? 0 : previousRecord + 1,
      });
      if (next || positiveTime(finalizedAtTs)) {
        add({
          id: `endurance-record-${key}`,
          timestamp: end,
          kind: 'enduranceRecord',
          address,
          durationSeconds: duration,
        });
      }
      enduranceRecord = duration;
    }

    if (!participants.has(addressKey)) {
      participants.add(addressKey);
      add({
        id: `participant-${key}`,
        timestamp: gesture.TimeStamp,
        kind: 'newParticipant',
        address,
      });
    }
    const count = i + 1;
    if (isActivityMilestone(count)) {
      add({
        id: `activity-${cycleId}-${count}`,
        timestamp: gesture.TimeStamp,
        kind: 'gestureMilestone',
        count,
      });
    }
    const gestureType = resolveGestureTypeCode(gesture);
    if (gestureType === undefined) calibrationStart = 0;
    if (gestureType === 2) {
      if (finalCstAddress !== addressKey) {
        add({
          id: `final-cst-${key}`,
          timestamp: gesture.TimeStamp,
          kind: 'finalCstLeader',
          address,
        });
        finalCstAddress = addressKey;
      }
      calibrationStart = gesture.TimeStamp;
      calibrationKey = key;
      calibrationHasReachedFloor = false;
      calibrationStateKnown = true;
    }

    // ETH adjusts the window length without resetting its start. A shorter
    // window can reach its floor at the Gesture itself, never retroactively.
    const calibrationDuration = gesture.CstDutchAuctionDurationInt;
    if (
      typeof calibrationDuration === 'number' &&
      Number.isSafeInteger(calibrationDuration) &&
      calibrationDuration >= 0
    ) {
      const nominalReadyAt = calibrationStart + calibrationDuration;
      const readyAt = Math.max(gesture.TimeStamp, nominalReadyAt);
      // After missing data, an already-open floor has no recoverable crossing
      // time. A known future threshold or an explicit CST reset restores it.
      const canTimestampCrossing: boolean =
        calibrationStart > 0 && (calibrationStateKnown || nominalReadyAt > gesture.TimeStamp);
      if (!calibrationHasReachedFloor && canTimestampCrossing && readyAt <= end) {
        add({
          id: `cst-ready-${calibrationKey}`,
          timestamp: readyAt,
          kind: 'cstCalibrationReady',
        });
        calibrationHasReachedFloor = true;
      }
      calibrationStateKnown = canTimestampCrossing;
    } else {
      calibrationStateKnown = false;
    }

    const deadline = gesture.PrizeTime;
    const previousDeadline = previous?.PrizeTime;
    if (positiveTime(deadline)) {
      if (
        positiveTime(previousDeadline) &&
        deadline > previousDeadline &&
        gesture.TimeStamp >= previousDeadline - FINAL_WINDOW_THRESHOLDS[0]
      ) {
        add({
          id: `clock-extension-${key}`,
          timestamp: gesture.TimeStamp,
          kind: gesture.TimeStamp >= previousDeadline ? 'clockReopened' : 'clockExtended',
          address,
          durationSeconds: deadline - previousDeadline,
        });
      }
      for (const remaining of FINAL_WINDOW_THRESHOLDS) {
        const reachedAt = deadline - remaining;
        // Only real downward crossings. A Gesture that extends the deadline
        // within the same window must not re-announce entry into that window.
        if (reachedAt >= gesture.TimeStamp && reachedAt <= end) {
          add({
            id: `final-window-${cycleId}-${deadline}-${remaining}`,
            timestamp: reachedAt,
            kind: 'finalWindow',
            durationSeconds: remaining,
          });
        }
      }
      if (deadline >= gesture.TimeStamp && deadline <= end) {
        add({
          id: `clock-zero-${cycleId}-${deadline}`,
          timestamp: deadline,
          kind: 'finalizationAvailable',
          address,
        });
      }
    }
  }

  // The stored initial Chrono value is the signed sentinel -1, so the first
  // participant establishes a zero-length reign at the first Gesture.
  let chronoRecord = -1;
  for (let i = 0; i < lineage.length; i++) {
    const current = lineage[i]!;
    const next = lineage[i + 1];
    const reignStart = current.start + current.previousRecord;
    const reignEnd = next ? next.start + current.duration : horizon;
    const reignDuration = Math.max(0, reignEnd - reignStart);
    const growingAt = reignStart + chronoRecord + 1;
    if (growingAt <= reignEnd) {
      add({
        id: `chrono-growing-${current.key}`,
        timestamp: growingAt,
        kind: 'chronoLead',
        address: current.address,
        durationSeconds: chronoRecord + 1,
      });
    }
    if (next || positiveTime(finalizedAtTs)) {
      add({
        id: `chrono-ended-${current.key}`,
        // At equality the outgoing champion still holds the record. The
        // contract closes the numerical duration at that boundary one second
        // before the strict takeover becomes observable.
        timestamp: next ? reignEnd + 1 : reignEnd,
        kind: 'chronoReignEnded',
        address: current.address,
        durationSeconds: reignDuration,
      });
      chronoRecord = Math.max(chronoRecord, reignDuration);
    }
  }

  return events.sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
}
