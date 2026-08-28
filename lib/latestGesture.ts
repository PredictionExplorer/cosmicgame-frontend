import type { GestureInfo } from '@/services/api/types';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function cleanAddress(value: string | null | undefined): string | null {
  if (!value || value.toLowerCase() === ZERO_ADDRESS) return null;
  return value;
}

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function timestampOf(gesture: GestureInfo): number {
  const value = Number(gesture.TimeStamp);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Selects the newest gesture without trusting endpoint sort order. */
export function newestGesture(gestures: readonly GestureInfo[]): GestureInfo | null {
  return gestures.reduce<GestureInfo | null>((latest, gesture) => {
    if (!latest) return gesture;
    const gestureTime = timestampOf(gesture);
    const latestTime = timestampOf(latest);
    if (gestureTime !== latestTime) return gestureTime > latestTime ? gesture : latest;
    return (gesture.EvtLogId ?? 0) > (latest.EvtLogId ?? 0) ? gesture : latest;
  }, null);
}

export interface LatestGestureResolution {
  /** Dashboard/list-reconciled participant identity. */
  address: string | null;
  /** Transaction record belonging to that participant, when indexed. */
  gesture: GestureInfo | null;
  /** Newest indexed record, useful for diagnostics but never misattributed. */
  newestIndexedGesture: GestureInfo | null;
  /** Evidence fed into the shared champion derivation. */
  evidence?: LatestParticipantEvidence;
  /** Dashboard knows a participant but their transaction row has not arrived yet. */
  isSyncing: boolean;
}

export interface LatestParticipantEvidence {
  address: string;
  /** Unix seconds; null means identity is known but transaction details are still indexing. */
  timestamp: number | null;
}

/**
 * Reconciles the dashboard's authoritative latest-participant address with
 * the independently indexed gesture list.
 *
 * A matching gesture is the only record safe to display as that participant's
 * transaction. When it is temporarily absent, callers render a stable syncing
 * panel rather than either hiding Last Gesture or showing the previous
 * participant's transaction under the new address.
 */
export function resolveLatestGesture({
  dashboardLastAddress,
  gestures,
}: {
  dashboardLastAddress?: string | null;
  gestures: readonly GestureInfo[];
}): LatestGestureResolution {
  const newestIndexedGesture = newestGesture(gestures);
  const dashboardAddress = cleanAddress(dashboardLastAddress);
  const address = dashboardAddress ?? cleanAddress(newestIndexedGesture?.BidderAddr);

  if (!address) {
    return {
      address: null,
      gesture: null,
      newestIndexedGesture,
      evidence: undefined,
      isSyncing: false,
    };
  }

  const matchingGestures = gestures.filter((gesture) => sameAddress(gesture.BidderAddr, address));
  const gesture = newestGesture(matchingGestures);
  const timestamp = gesture ? timestampOf(gesture) : null;

  return {
    address,
    gesture,
    newestIndexedGesture,
    evidence: { address, timestamp },
    isSyncing: !gesture,
  };
}
