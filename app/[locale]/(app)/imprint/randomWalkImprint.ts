'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeEventLog, zeroAddress, type Log } from 'viem';

import { randomWalkNftAbi } from '@/contracts/generated';

import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { sameAddress } from '@/utils/format';

/** Imprint cost query: it rises after every imprint, so it refreshes on its own. */
const COST_REFRESH_MS = 30_000;

/** The contract's own name for its imprint event. */
const IMPRINT_EVENT = 'MintEvent'; // lexicon-allow-abi

/**
 * The Random Walk NFT a confirmed imprint created for `account`: the id in
 * the contract's imprint event (its first, indexed argument), or, failing
 * that, the token transferred from the zero address to the account. `null`
 * when the receipt carries neither (a replaced or foreign transaction).
 */
export function imprintedTokenId(
  receipt: { logs: readonly Pick<Log, 'address' | 'data' | 'topics'>[] },
  account: string,
  contractAddress: string,
): number | null {
  let transferred: number | null = null;
  for (const log of receipt.logs) {
    if (!sameAddress(log.address, contractAddress)) continue;
    let event: { eventName?: string; args?: unknown };
    try {
      event = decodeEventLog({
        abi: randomWalkNftAbi,
        data: log.data,
        topics: log.topics,
        strict: false,
      });
    } catch {
      continue; // Not one of this contract's events.
    }
    const args = (event.args ?? {}) as Record<string, unknown>;
    if (event.eventName === IMPRINT_EVENT && typeof args.param0 === 'bigint') {
      if (!args.param1 || sameAddress(String(args.param1), account)) return Number(args.param0);
    }
    if (
      event.eventName === 'Transfer' &&
      sameAddress(String(args.param0), zeroAddress) &&
      sameAddress(String(args.param1), account) &&
      typeof args.param2 === 'bigint'
    ) {
      transferred = Number(args.param2);
    }
  }
  return transferred;
}

/**
 * The contract's current imprint cost in wei, read from the chain. `null`
 * while loading or when the read failed (`isError`); never a guessed 0.
 */
export function useImprintCost() {
  const contract = useRWLKNFTContract();
  const query = useQuery({
    queryKey: ['rwlkImprintCost'],
    enabled: !!contract,
    refetchInterval: COST_REFRESH_MS,
    queryFn: async () => {
      const cost = await contract?.read.getMintPrice?.(); // lexicon-allow-abi
      if (typeof cost !== 'bigint') throw new Error('Imprint cost read returned no value');
      return cost;
    },
  });
  return { costWei: query.data ?? null, isError: query.isError && query.data === undefined };
}

/** The query key of an account's Random Walk NFTs, for refreshing after an imprint. */
export const ownedRandomWalksKey = (account: string | null | undefined) =>
  ['rwlkOwned', account?.toLowerCase() ?? null] as const;

/**
 * The Random Walk NFTs an account holds, newest first: `tokens` is `null`
 * until the first read lands, and `isError` says that read failed (a later
 * failed refresh keeps the tokens already shown); `retry` reads again.
 */
export function useOwnedRandomWalks(account: string | null | undefined) {
  const contract = useRWLKNFTContract();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ownedRandomWalksKey(account),
    enabled: !!contract && !!account,
    queryFn: async () => {
      const tokens = (await contract?.read.walletOfOwner?.([account])) as
        | readonly bigint[]
        | undefined;
      return [...(tokens ?? [])].map(Number).sort((a, b) => b - a);
    },
  });
  return {
    tokens: query.data ?? null,
    isError: query.isError && query.data === undefined,
    retry: () => void query.refetch(),
    refresh: () => queryClient.invalidateQueries({ queryKey: ownedRandomWalksKey(account) }),
  };
}
