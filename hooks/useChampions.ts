'use client';

import { useMemo } from 'react';

import { useCurrentSpecialRecipients } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';
import type { SpecialRecipients } from '@/services/api/types';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface ChampionRoleState {
  address: string | null;
  duration: number;
  lockedDuration: number;
  isLive: boolean;
}

export interface LatestGestureState {
  address: string | null;
  holdDuration: number;
  latestGestureTime: number | null;
}

export interface ChampionsState {
  isLoading: boolean;
  hasData: boolean;
  endurance: ChampionRoleState;
  chrono: ChampionRoleState;
  lastCst: {
    address: string | null;
  };
  latestGesture: LatestGestureState;
  raw: SpecialRecipients | null | undefined;
}

interface DeriveChampionsStateArgs {
  data: SpecialRecipients | null | undefined;
  isLoading?: boolean;
  nowMs: number;
  dataUpdatedAt?: number;
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

/**
 * Derives the frontend's live champion state from the backend's indexed snapshot.
 *
 * The backend already exposes the same conceptual surface as the on-chain
 * `tryGetCurrentChampions()` read. This function preserves the stored durations
 * when a role is no longer live, and only extends a timer when the address
 * relationship proves the record is still actively growing.
 */
export function deriveChampionsState({
  data,
  isLoading = false,
  nowMs,
  dataUpdatedAt = 0,
}: DeriveChampionsStateArgs): ChampionsState {
  const nowSec = Math.floor(nowMs / 1000);
  const enduranceAddress = cleanAddress(data?.EnduranceChampionAddress);
  const chronoAddress = cleanAddress(data?.ChronoWarriorAddress);
  const latestGestureAddress = cleanAddress(data?.LastBidderAddress);
  const lastCstAddress = cleanAddress(data?.LastCstBidderAddress);
  const latestGestureTime = nonNegativeSeconds(data?.LastBidderLastBidTime);

  const enduranceLockedDuration = nonNegativeSeconds(data?.EnduranceChampionDuration);
  const chronoLockedDuration = nonNegativeSeconds(data?.ChronoWarriorDuration);
  const holdDuration =
    latestGestureTime > 0 && nowSec >= latestGestureTime
      ? Math.max(0, nowSec - latestGestureTime)
      : 0;

  const enduranceIsLive = sameAddress(enduranceAddress, latestGestureAddress);
  const enduranceDuration = enduranceIsLive
    ? Math.max(enduranceLockedDuration, holdDuration)
    : enduranceLockedDuration;

  const chronoIsLive = sameAddress(chronoAddress, enduranceAddress);
  const chronoExtension =
    chronoIsLive && dataUpdatedAt > 0 && nowMs >= dataUpdatedAt
      ? Math.floor((nowMs - dataUpdatedAt) / 1000)
      : 0;
  const chronoDuration = chronoLockedDuration + chronoExtension;

  return {
    isLoading,
    hasData: !!data,
    endurance: {
      address: enduranceAddress,
      duration: enduranceDuration,
      lockedDuration: enduranceLockedDuration,
      isLive: enduranceIsLive,
    },
    chrono: {
      address: chronoAddress,
      duration: chronoDuration,
      lockedDuration: chronoLockedDuration,
      isLive: chronoIsLive,
    },
    lastCst: {
      address: lastCstAddress,
    },
    latestGesture: {
      address: latestGestureAddress,
      holdDuration,
      latestGestureTime: latestGestureTime > 0 ? latestGestureTime : null,
    },
    raw: data,
  };
}

/** Reads the current special-recipient snapshot and adds precise live timer semantics for UI. */
export function useChampions(): ChampionsState {
  const query = useCurrentSpecialRecipients();
  const nowMs = useNow(1000);

  return useMemo(
    () =>
      deriveChampionsState({
        data: query.data,
        isLoading: query.isLoading,
        nowMs,
        dataUpdatedAt: query.dataUpdatedAt,
      }),
    [query.data, query.dataUpdatedAt, query.isLoading, nowMs],
  );
}
