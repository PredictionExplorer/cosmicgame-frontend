'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { cosmicGameAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useCurrentSpecialRecipients } from '@/hooks/useApiQuery';
import type { SpecialRecipients } from '@/services/api/types';
import { reportError } from '@/utils/errors';

export type SpecialAllocationSource = 'api-v2' | 'api-v1+chain' | 'api-v1';

export interface SpecialAllocationSnapshot extends SpecialRecipients {
  source: SpecialAllocationSource;
  receivedAtMs: number;
  hasChronoSegmentData: boolean;
  hasFinalCstTime: boolean;
  StoredChronoWarriorDuration?: number;
}

interface ChainSpecialAllocationSnapshot {
  data: Partial<SpecialRecipients> & {
    StoredChronoWarriorDuration?: number;
  };
}

type ParticipantInfoResult =
  | readonly [bigint, bigint, bigint]
  | {
      totalSpentEthAmount?: bigint;
      totalSpentCstAmount?: bigint;
      lastBidTimeStamp?: bigint;
      [key: string]: unknown;
    };

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function bigintToSafeNumber(value: unknown): number | undefined {
  if (typeof value !== 'bigint') return undefined;
  const numberValue = Number(value);
  return Number.isSafeInteger(numberValue) ? numberValue : undefined;
}

function cleanAddress(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function latestParticipantLastGestureTime(result: unknown): number | undefined {
  const info = result as ParticipantInfoResult;
  if (Array.isArray(info)) {
    return bigintToSafeNumber((info as readonly unknown[])[2]);
  }
  return bigintToSafeNumber((info as Record<string, unknown> | undefined)?.lastBidTimeStamp);
}

export function hasApiV2SpecialAllocationData(data: SpecialRecipients | null | undefined): boolean {
  return (
    isFiniteNumber(data?.EnduranceChampionStartTimeStamp) &&
    isFiniteNumber(data?.PrevEnduranceChampionDuration) &&
    isFiniteNumber(data?.SourceBlockTimeStamp) &&
    typeof data?.ChronoWarriorIsLive === 'boolean'
  );
}

export function normalizeSpecialAllocationSnapshot({
  apiData,
  chainData,
  apiReceivedAtMs,
  chainReceivedAtMs,
}: {
  apiData: SpecialRecipients | null | undefined;
  chainData?: ChainSpecialAllocationSnapshot | null;
  apiReceivedAtMs: number;
  chainReceivedAtMs?: number;
}): SpecialAllocationSnapshot | null {
  if (!apiData && !chainData?.data) return null;

  const hasApiV2 = hasApiV2SpecialAllocationData(apiData);
  const shouldUseChain = !hasApiV2 && !!chainData?.data;
  const merged = {
    ...(apiData ?? {}),
    ...(shouldUseChain ? chainData?.data : {}),
  } as SpecialRecipients & { StoredChronoWarriorDuration?: number };

  const hasChronoSegmentData =
    isFiniteNumber(merged.EnduranceChampionStartTimeStamp) &&
    isFiniteNumber(merged.PrevEnduranceChampionDuration) &&
    isFiniteNumber(merged.SourceBlockTimeStamp) &&
    (typeof merged.ChronoWarriorIsLive === 'boolean' ||
      isFiniteNumber(merged.StoredChronoWarriorDuration));

  return {
    ...merged,
    source: hasApiV2 ? 'api-v2' : shouldUseChain ? 'api-v1+chain' : 'api-v1',
    receivedAtMs: shouldUseChain ? (chainReceivedAtMs ?? apiReceivedAtMs) : apiReceivedAtMs,
    hasChronoSegmentData,
    hasFinalCstTime: isFiniteNumber(merged.LastCstBidderLastBidTime),
    StoredChronoWarriorDuration: merged.StoredChronoWarriorDuration,
  };
}

export function keepPreviousSpecialAllocationChainSnapshot(
  previousData: ChainSpecialAllocationSnapshot | null | undefined,
) {
  return previousData;
}

export async function fetchChainSpecialAllocationSnapshot({
  publicClient,
  cosmicGameAddress,
}: {
  publicClient: PublicClient;
  cosmicGameAddress: string;
}): Promise<ChainSpecialAllocationSnapshot | null> {
  if (!cosmicGameAddress) return null;

  const address = cosmicGameAddress as `0x${string}`;
  const read = (functionName: string, args?: readonly unknown[]) =>
    publicClient.readContract({
      address,
      abi: cosmicGameAbi,
      functionName,
      args,
    });

  const [
    block,
    champions,
    enduranceChampionStartTimeStamp,
    prevEnduranceChampionDuration,
    storedChronoWarriorDuration,
    lastBidderAddress,
    lastCstBidderAddress,
    roundNum,
  ] = await Promise.all([
    publicClient.getBlock({ blockTag: 'latest' }),
    read('tryGetCurrentChampions'),
    read('enduranceChampionStartTimeStamp'),
    read('prevEnduranceChampionDuration'),
    read('chronoWarriorDuration'),
    read('lastBidderAddress'),
    read('lastCstBidderAddress'),
    read('roundNum'),
  ]);

  const [
    enduranceChampionAddress,
    enduranceChampionDuration,
    chronoWarriorAddress,
    chronoDuration,
  ] = champions as readonly [`0x${string}`, bigint, `0x${string}`, bigint];

  const roundNumber = bigintToSafeNumber(roundNum);
  const latestParticipant = cleanAddress(lastBidderAddress);
  let latestParticipantLastGestureTimeValue: number | undefined;

  if (roundNumber !== undefined && latestParticipant && latestParticipant !== ZERO_ADDRESS) {
    const info = await read('biddersInfo', [BigInt(roundNumber), latestParticipant]);
    latestParticipantLastGestureTimeValue = latestParticipantLastGestureTime(info);
  }

  const sourceBlockNumber = bigintToSafeNumber(block.number);
  const sourceBlockTimeStamp = bigintToSafeNumber(block.timestamp);
  const currentChronoSegmentDuration =
    sourceBlockTimeStamp !== undefined
      ? sourceBlockTimeStamp -
        ((bigintToSafeNumber(enduranceChampionStartTimeStamp) ?? 0) +
          (bigintToSafeNumber(prevEnduranceChampionDuration) ?? 0))
      : undefined;
  const storedChronoDuration = bigintToSafeNumber(storedChronoWarriorDuration);

  return {
    data: {
      EnduranceChampionAddress: enduranceChampionAddress,
      EnduranceChampionDuration: bigintToSafeNumber(enduranceChampionDuration),
      EnduranceChampionStartTimeStamp: bigintToSafeNumber(enduranceChampionStartTimeStamp),
      PrevEnduranceChampionDuration: bigintToSafeNumber(prevEnduranceChampionDuration),
      ChronoWarriorAddress: chronoWarriorAddress,
      ChronoWarriorDuration: bigintToSafeNumber(chronoDuration),
      ChronoWarriorIsLive:
        currentChronoSegmentDuration !== undefined && storedChronoDuration !== undefined
          ? currentChronoSegmentDuration > storedChronoDuration
          : undefined,
      StoredChronoWarriorDuration: storedChronoDuration,
      LastBidderAddress: latestParticipant,
      LastBidderLastBidTime: latestParticipantLastGestureTimeValue,
      LastCstBidderAddress: cleanAddress(lastCstBidderAddress),
      RoundNum: roundNumber,
      SourceBlockNumber: sourceBlockNumber,
      SourceBlockTimeStamp: sourceBlockTimeStamp,
    },
  };
}

export function useSpecialAllocationSnapshot(): {
  snapshot: SpecialAllocationSnapshot | null;
  isLoading: boolean;
  raw: SpecialRecipients | null | undefined;
} {
  const apiQuery = useCurrentSpecialRecipients();
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const apiHasV2 = hasApiV2SpecialAllocationData(apiQuery.data);
  const shouldReadChain = !!apiQuery.data && !apiHasV2 && !!publicClient && !!cosmicGame;

  const chainQuery = useQuery<ChainSpecialAllocationSnapshot | null>({
    queryKey: ['specialAllocationChainSnapshot', cosmicGame, apiQuery.dataUpdatedAt],
    enabled: shouldReadChain,
    placeholderData: keepPreviousSpecialAllocationChainSnapshot,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    queryFn: async () => {
      try {
        return await fetchChainSpecialAllocationSnapshot({
          publicClient: publicClient!,
          cosmicGameAddress: cosmicGame,
        });
      } catch (error) {
        reportError(error, 'special allocation chain fallback');
        return null;
      }
    },
  });

  const snapshot = useMemo(
    () =>
      normalizeSpecialAllocationSnapshot({
        apiData: apiQuery.data,
        chainData: chainQuery.data,
        apiReceivedAtMs: apiQuery.dataUpdatedAt,
        chainReceivedAtMs: chainQuery.dataUpdatedAt,
      }),
    [apiQuery.data, apiQuery.dataUpdatedAt, chainQuery.data, chainQuery.dataUpdatedAt],
  );

  return {
    snapshot,
    isLoading: apiQuery.isLoading || (shouldReadChain && chainQuery.isLoading && !snapshot),
    raw: apiQuery.data,
  };
}
