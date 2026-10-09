import { cache } from 'react';
import { createPublicClient, http, zeroAddress } from 'viem';

import { ARBITRUM_ONE_CHAIN_ID } from '@/content/legal/officialAddresses';
import type { ProtocolOwner } from '@/content/legal/SecurityContent';
import { protocolFacts } from '@/content/protocol-facts';

import { networkConfig } from '@/config/networks';
import { activeChain } from '@/config/chains';

/** How long the page waits for the chain before it says the owner could not be read. */
const CHAIN_READ_TIMEOUT_MS = 5_000;

/** `owner()` of an OpenZeppelin `Ownable` contract. */
const OWNABLE_ABI = [
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/**
 * Who owns the Cosmic Signature Protocol contract (the verified proxy in
 * `protocolFacts`), read from Arbitrum One for this render: the account and
 * whether it is a single-key wallet (no code) or a contract such as a
 * multisig; `renounced` for the zero address. Any failure, or a build for
 * another network, is `unavailable`, never a guess.
 */
export const readProtocolOwner = cache(async (): Promise<ProtocolOwner> => {
  if (activeChain.id !== ARBITRUM_ONE_CHAIN_ID || !networkConfig.rpcUrl) {
    return { status: 'unavailable' };
  }
  const client = createPublicClient({
    chain: activeChain,
    transport: http(networkConfig.rpcUrl, { timeout: CHAIN_READ_TIMEOUT_MS, retryCount: 1 }),
  });
  try {
    const owner = await client.readContract({
      address: protocolFacts.contractAddresses.proxy,
      abi: OWNABLE_ABI,
      functionName: 'owner',
    });
    if (owner.toLowerCase() === zeroAddress) return { status: 'renounced' };
    const code = await client.getCode({ address: owner });
    return {
      status: 'account',
      address: owner,
      kind: code && code !== '0x' ? 'contract' : 'singleKey',
    };
  } catch {
    return { status: 'unavailable' };
  }
});
