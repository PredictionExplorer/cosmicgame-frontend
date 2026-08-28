'use client';

import { useMemo } from 'react';

import {
  useSpecialAllocationSnapshot,
  type SpecialAllocationSnapshot,
} from '@/hooks/useSpecialAllocationSnapshot';
import { useNow } from '@/hooks/useNow';
import type { LatestParticipantEvidence } from '@/lib/latestGesture';
import type { SpecialRecipients } from '@/services/api/types';

export type { LatestParticipantEvidence } from '@/lib/latestGesture';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface ChampionRoleState {
  address: string | null;
  duration: number;
  lockedDuration: number;
  isLive: boolean;
  statusText?: string;
  sourceText?: string;
  currentSegmentDuration?: number;
  startsGrowingIn?: number;
  willStopGrowingIn?: number;
  hasLiveDetails?: boolean;
}

export interface ChronoChallengeState {
  address: string | null;
  duration?: number;
  recordToBeat: number;
  isLive: boolean;
  isRecordHolder: boolean;
  hasDetails: boolean;
  startsGrowingIn?: number;
  willStopGrowingIn?: number;
}

export interface LatestGestureState {
  address: string | null;
  holdDuration: number;
  latestGestureTime: number | null;
  isCurrentEnduranceChampion: boolean;
  isExtendingEnduranceRecord: boolean;
  durationToBeat: number;
  secondsUntilEnduranceChampion: number;
  progressToEnduranceChampion: number;
}

export interface ChampionsState {
  isLoading: boolean;
  hasData: boolean;
  endurance: ChampionRoleState;
  chrono: ChampionRoleState;
  chronoChallenge: ChronoChallengeState;
  lastCst: {
    address: string | null;
  };
  latestGesture: LatestGestureState;
  raw: SpecialRecipients | null | undefined;
  source: 'api-v2' | 'api-v1+chain' | 'api-v1' | 'none';
}

interface DeriveChampionsStateArgs {
  data: SpecialAllocationSnapshot | SpecialRecipients | null | undefined;
  isLoading?: boolean;
  nowMs: number;
  latestParticipantEvidence?: LatestParticipantEvidence;
}

function cleanAddress(address: string | null | undefined): string | null {
  if (!address) return null;
  return address.toLowerCase() === ZERO_ADDRESS ? null : address;
}

function sameAddress(left: string | null, right: string | null): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

function nonNegativeSeconds(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function optionalNonNegativeSeconds(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(99.9, Math.max(0, value));
}

function isSnapshot(
  data: SpecialAllocationSnapshot | SpecialRecipients,
): data is SpecialAllocationSnapshot {
  return typeof (data as SpecialAllocationSnapshot).source === 'string';
}

function sourceNowSeconds(
  data: SpecialAllocationSnapshot | SpecialRecipients | null | undefined,
  nowMs: number,
): number | null {
  if (!data || !isSnapshot(data) || !nonNegativeSeconds(data.SourceBlockTimeStamp)) return null;
  const sourceTime = nonNegativeSeconds(data.SourceBlockTimeStamp);
  const elapsed =
    data.receivedAtMs > 0 && nowMs >= data.receivedAtMs
      ? Math.floor((nowMs - data.receivedAtMs) / 1000)
      : 0;
  return sourceTime + elapsed;
}

function sourceText(source: ChampionsState['source']): string {
  if (source === 'api-v2') return 'API confirmed';
  if (source === 'api-v1+chain') return 'Chain verified';
  if (source === 'api-v1') return 'Snapshot only';
  return 'No source';
}

/**
 * Derives source-backed live champion state from the API-first snapshot.
 *
 * Latest Participant and Endurance Champion can be extrapolated from the V1 API.
 * Chrono-Warrior requires the contract segment fields supplied by API V2 or the
 * public-chain fallback; otherwise it remains a confirmed snapshot value.
 */
export function deriveChampionsState({
  data,
  isLoading = false,
  nowMs,
  latestParticipantEvidence,
}: DeriveChampionsStateArgs): ChampionsState {
  const nowSec = Math.floor(nowMs / 1000);
  const enduranceAddress = cleanAddress(data?.EnduranceChampionAddress);
  const chronoAddress = cleanAddress(data?.ChronoWarriorAddress);
  const latestGestureAddress = latestParticipantEvidence
    ? cleanAddress(latestParticipantEvidence.address)
    : cleanAddress(data?.LastBidderAddress);
  const lastCstAddress = cleanAddress(data?.LastCstBidderAddress);
  const latestGestureTime = latestParticipantEvidence
    ? nonNegativeSeconds(latestParticipantEvidence.timestamp)
    : nonNegativeSeconds(data?.LastBidderLastBidTime);

  const enduranceLockedDuration = nonNegativeSeconds(data?.EnduranceChampionDuration);
  const chronoLockedDuration = nonNegativeSeconds(data?.ChronoWarriorDuration);
  const holdDuration =
    latestGestureTime > 0 && nowSec >= latestGestureTime
      ? Math.max(0, nowSec - latestGestureTime)
      : 0;

  const latestMatchesEndurance = sameAddress(latestGestureAddress, enduranceAddress);
  const latestBeatsEnduranceRecord =
    !!latestGestureAddress && holdDuration > enduranceLockedDuration;
  const effectiveEnduranceAddress = latestBeatsEnduranceRecord
    ? latestGestureAddress
    : enduranceAddress;
  const enduranceIsLive = latestBeatsEnduranceRecord;
  const enduranceDuration = enduranceIsLive ? holdDuration : enduranceLockedDuration;
  const hasLatestGesture = !!latestGestureAddress;
  const hasEnduranceRecord = !!enduranceAddress;
  const durationToBeat = hasLatestGesture && hasEnduranceRecord ? enduranceLockedDuration + 1 : 0;
  const secondsUntilEnduranceChampion =
    durationToBeat > 0 ? Math.max(0, durationToBeat - holdDuration) : 0;
  const progressToEnduranceChampion =
    durationToBeat > 0 && holdDuration >= durationToBeat
      ? 100
      : durationToBeat > 0
        ? clampProgress((holdDuration / durationToBeat) * 100)
        : 0;

  const source = data && isSnapshot(data) ? data.source : data ? 'api-v1' : 'none';
  const hasChronoSegmentData = !!(data && isSnapshot(data) && data.hasChronoSegmentData);
  const sourceNowSec = sourceNowSeconds(data, nowMs);
  const sourceChronoSegmentStart =
    nonNegativeSeconds(data?.EnduranceChampionStartTimeStamp) +
    nonNegativeSeconds(data?.PrevEnduranceChampionDuration);
  const chronoSegmentStart = sourceChronoSegmentStart;
  const sourceBlockTimeStamp = optionalNonNegativeSeconds(data?.SourceBlockTimeStamp);
  const sourceChronoSegmentDuration =
    hasChronoSegmentData && sourceBlockTimeStamp !== undefined && chronoSegmentStart > 0
      ? Math.max(0, sourceBlockTimeStamp - chronoSegmentStart)
      : undefined;
  const currentChronoSegmentDuration =
    hasChronoSegmentData && sourceNowSec !== null && chronoSegmentStart > 0
      ? Math.max(0, sourceNowSec - chronoSegmentStart)
      : undefined;
  const storedChronoDuration = optionalNonNegativeSeconds(
    data && isSnapshot(data) ? data.StoredChronoWarriorDuration : undefined,
  );
  const chronoSegmentMatchesReturnedRecord =
    hasChronoSegmentData &&
    sourceChronoSegmentDuration !== undefined &&
    sourceChronoSegmentDuration === chronoLockedDuration;
  const chronoSegmentIsBelowRecord =
    hasChronoSegmentData &&
    sourceChronoSegmentDuration !== undefined &&
    sourceChronoSegmentDuration <= chronoLockedDuration;
  const apiSaysChronoIsLive =
    typeof data?.ChronoWarriorIsLive === 'boolean' ? data.ChronoWarriorIsLive : undefined;
  const chronoSegmentBeatsStoredRecord =
    storedChronoDuration !== undefined &&
    sourceChronoSegmentDuration !== undefined &&
    sourceChronoSegmentDuration > storedChronoDuration;
  const chronoChallengeAddress = effectiveEnduranceAddress;
  const chronoChallengeIsRecordHolder = sameAddress(chronoChallengeAddress, chronoAddress);
  const chronoIsLive =
    hasChronoSegmentData &&
    chronoChallengeIsRecordHolder &&
    chronoSegmentMatchesReturnedRecord &&
    (apiSaysChronoIsLive === true || chronoSegmentBeatsStoredRecord);
  const chronoChallengeHasDetails =
    hasChronoSegmentData &&
    chronoChallengeAddress !== null &&
    sourceChronoSegmentDuration !== undefined &&
    currentChronoSegmentDuration !== undefined;
  const visibleChronoSegmentDuration = chronoIsLive ? currentChronoSegmentDuration : undefined;
  const chronoDuration =
    chronoIsLive && visibleChronoSegmentDuration !== undefined
      ? Math.max(chronoLockedDuration, visibleChronoSegmentDuration)
      : chronoLockedDuration;
  const chronoChallengeStartsGrowingIn =
    chronoChallengeHasDetails && !chronoIsLive && chronoSegmentIsBelowRecord
      ? Math.max(0, chronoLockedDuration + 1 - currentChronoSegmentDuration)
      : undefined;
  const willStopGrowingIn =
    chronoIsLive && durationToBeat > 0 ? Math.max(0, durationToBeat - holdDuration) : undefined;
  const chronoStatusText = chronoIsLive ? 'Growing now' : 'Record standing';

  return {
    isLoading,
    hasData: !!data || !!latestGestureAddress,
    endurance: {
      address: effectiveEnduranceAddress,
      duration: enduranceDuration,
      lockedDuration: enduranceLockedDuration,
      isLive: enduranceIsLive,
    },
    chrono: {
      address: chronoAddress,
      duration: chronoDuration,
      lockedDuration: chronoLockedDuration,
      isLive: chronoIsLive,
      statusText: chronoStatusText,
      sourceText: sourceText(source),
      currentSegmentDuration: visibleChronoSegmentDuration,
      startsGrowingIn: undefined,
      willStopGrowingIn,
      hasLiveDetails: chronoIsLive,
    },
    chronoChallenge: {
      address: chronoChallengeAddress,
      duration: chronoChallengeHasDetails ? currentChronoSegmentDuration : undefined,
      recordToBeat: chronoLockedDuration,
      isLive: chronoIsLive,
      isRecordHolder: chronoChallengeIsRecordHolder,
      hasDetails: chronoChallengeHasDetails,
      startsGrowingIn: chronoChallengeStartsGrowingIn,
      willStopGrowingIn,
    },
    lastCst: {
      address: lastCstAddress,
    },
    latestGesture: {
      address: latestGestureAddress,
      holdDuration,
      latestGestureTime: latestGestureTime > 0 ? latestGestureTime : null,
      isCurrentEnduranceChampion: latestMatchesEndurance || latestBeatsEnduranceRecord,
      isExtendingEnduranceRecord: enduranceIsLive,
      durationToBeat,
      secondsUntilEnduranceChampion,
      progressToEnduranceChampion,
    },
    raw: data,
    source,
  };
}

/** Reads the current special-recipient snapshot and adds precise live timer semantics for UI. */
export function useChampions(
  initialData?: SpecialRecipients | null,
  latestParticipantEvidence?: LatestParticipantEvidence,
  enabled = true,
): ChampionsState {
  const { snapshot, isLoading } = useSpecialAllocationSnapshot(initialData, enabled);
  const nowMs = useNow(1000);

  return useMemo(
    () =>
      deriveChampionsState({
        data: snapshot,
        isLoading,
        nowMs,
        latestParticipantEvidence,
      }),
    [snapshot, isLoading, nowMs, latestParticipantEvidence],
  );
}
