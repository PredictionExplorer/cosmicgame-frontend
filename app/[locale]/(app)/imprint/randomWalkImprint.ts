'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { decodeEventLog, isAddress, zeroAddress, type Log } from 'viem';
import { usePublicClient } from 'wagmi';

import { cosmicGameAbi, randomWalkNftAbi } from '@/contracts/generated';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import useRWLKNFTContract from '@/hooks/useRWLKNFTContract';
import { sameAddress } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';

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

/** The query key of the collection's next token id, for refreshing after an imprint. */
export const nextRandomWalkKey = ['rwlkNextTokenId'] as const;

/**
 * The newest Random Walk NFT's id: the collection's next id less one (ids
 * start at 0). `seed` is the server's reading of the next id, so the plate
 * is in the first HTML; the client keeps it fresh. `null` while nothing has
 * been read, or when the collection is empty.
 */
export function useLatestRandomWalk(seed: number | null) {
  const contract = useRWLKNFTContract();
  const query = useQuery({
    queryKey: nextRandomWalkKey,
    enabled: !!contract,
    refetchInterval: COST_REFRESH_MS,
    queryFn: async () => {
      const next = await contract?.read.nextTokenId?.();
      const value = toFiniteNumber(next);
      if (value === null) throw new Error('Random Walk next token id read returned no value');
      return value;
    },
  });
  const next = query.data ?? seed;
  return {
    latest: next !== null && next > 0 ? next - 1 : null,
    isError: query.isError && next === null,
  };
}

/** Whether a Random Walk NFT has reduced a gesture yet. */
export type RandomWalkUse = 'used' | 'unused' | 'unknown';

/**
 * One token's use. The game contract's own record (`usedRandomWalkNfts`) is
 * the authority; the indexer's list can lag behind a recent gesture, so it
 * can only say "used" (a use never reverts), never "unused". Without a
 * chain reading the answer is `unknown`, and the page offers no gesture.
 */
export function randomWalkUse(
  tokenId: number,
  onChain: ReadonlyMap<number, boolean> | null,
  indexedUsed: ReadonlySet<number> | null,
): RandomWalkUse {
  const recorded = onChain?.get(tokenId);
  if (recorded !== undefined) return recorded ? 'used' : 'unused';
  return indexedUsed?.has(tokenId) ? 'used' : 'unknown';
}

/**
 * The use of each of an account's Random Walk NFTs: read from the game
 * contract in one multicall, with the indexer's list as a second source for
 * "used". `checking` while the contract read is in flight; once it has
 * failed, tokens the indexer does not list stay `unknown`.
 */
export function useRandomWalkUse(tokenIds: readonly number[] | null) {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  const indexed = useUsedRWLKNFTs();
  const game = cosmicGame && isAddress(cosmicGame) ? cosmicGame : null;
  const enabled = !!publicClient && !!game && !!tokenIds && tokenIds.length > 0;
  const onChain = useQuery({
    queryKey: ['rwlkUsedOnChain', game, tokenIds?.join(',') ?? ''],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const ids = tokenIds ?? [];
      const results = await publicClient!.multicall({
        allowFailure: true,
        contracts: ids.map((id) => ({
          address: game!,
          abi: cosmicGameAbi,
          functionName: 'usedRandomWalkNfts' as const,
          args: [BigInt(id)] as const,
        })),
      });
      const used = new Map<number, boolean>();
      results.forEach((result, index) => {
        if (result.status === 'success') used.set(ids[index]!, result.result !== 0n);
      });
      return used;
    },
  });
  const indexedUsed = indexed.data
    ? new Set(indexed.data.map((entry) => Number(entry.RWalkTokenId)))
    : null;
  const chain = onChain.data ?? null;
  return {
    useOf: (tokenId: number) => randomWalkUse(tokenId, chain, indexedUsed),
    /** The contract read is still on its way. */
    checking: enabled && onChain.isPending,
  };
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
