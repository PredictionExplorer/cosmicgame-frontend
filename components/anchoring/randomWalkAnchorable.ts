import type { Address, PublicClient } from 'viem';

import { randomWalkNftAbi, stakingWalletRwlkAbi } from '@/contracts/abis';

/** The query key of a wallet's anchorable Random Walk NFTs (invalidated after every anchor). */
export const RWLK_ANCHORABLE_QUERY_KEY = 'rwlkAnchorable';

export interface RandomWalkAnchorableSource {
  account: Address;
  /** The Random Walk NFT contract (`walletOfOwner`). */
  nft: Address;
  /** The Random Walk anchoring contract (`usedNfts`). */
  anchoring: Address;
}

/** Each id's `usedNfts` flag, in one multicall where the chain has one. */
async function readUsedFlags(
  client: PublicClient,
  anchoring: Address,
  ids: readonly bigint[],
): Promise<readonly unknown[]> {
  const calls = ids.map((id) => ({
    address: anchoring,
    abi: stakingWalletRwlkAbi,
    functionName: 'usedNfts',
    args: [id],
  }));
  if (client.chain?.contracts?.multicall3) {
    return client.multicall({ contracts: calls, allowFailure: false });
  }
  return Promise.all(calls.map((call) => client.readContract(call)));
}

/**
 * The Random Walk NFTs a wallet holds that can still be anchored, ascending.
 * The anchoring contract lets each NFT be anchored once, ever, whoever held
 * it: its `usedNfts(id)` is non-zero from the first anchor on. So an NFT the
 * wallet bought after an earlier owner anchored and released it is left out,
 * as the contract would revert the whole batch on it. Rejects when either
 * read fails, so a failure is never shown as "nothing to anchor".
 */
export async function readAnchorableRandomWalkIds(
  client: PublicClient,
  { account, nft, anchoring }: RandomWalkAnchorableSource,
): Promise<number[]> {
  const owned = (await client.readContract({
    address: nft,
    abi: randomWalkNftAbi,
    functionName: 'walletOfOwner',
    args: [account],
  })) as readonly bigint[];
  if (owned.length === 0) return [];
  const used = await readUsedFlags(client, anchoring, owned);
  return owned
    .filter((_, index) => BigInt(used[index] as bigint | number | string) === 0n)
    .map(Number)
    .sort((a, b) => a - b);
}
