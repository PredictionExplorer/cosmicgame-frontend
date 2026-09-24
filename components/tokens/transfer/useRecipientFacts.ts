'use client';

import { useQuery } from '@tanstack/react-query';
import type { Address, PublicClient } from 'viem';
import { usePublicClient } from 'wagmi';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { findKnownAddress, type KnownAddressKey } from '@/utils/format';

/** What the chain says about a recipient before anything is sent to it. */
export interface RecipientFacts {
  /** Transactions the address has sent on the protocol's chain (its nonce). */
  transactionCount: number;
  /** The address holds contract code: a smart wallet, a vault, a token… */
  isContract: boolean;
}

/**
 * Reads a recipient's nonce and code from the public client, the same RPC
 * every wallet uses, so the check works with WalletConnect and smart wallets
 * too (it used to ask `window.ethereum`, which only injected wallets have).
 */
export async function readRecipientFacts(
  client: Pick<PublicClient, 'getTransactionCount' | 'getCode'>,
  address: Address,
): Promise<RecipientFacts> {
  const [transactionCount, code] = await Promise.all([
    client.getTransactionCount({ address }),
    client.getCode({ address }),
  ]);
  return { transactionCount, isContract: Boolean(code && code !== '0x') };
}

/**
 * A recipient worth a second look before an irreversible transfer:
 *
 * - `protocol`: a Cosmic Signature contract, which does not expect tokens sent to it
 * - `contract`: any other contract, which may not be able to move them on
 * - `fresh`: an address that has never sent a transaction, often a typo or a
 *   wallet on another network
 */
export type RecipientWarning = 'protocol' | 'contract' | 'fresh';

export type RecipientCheck =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'failed' }
  | {
      status: 'ready';
      facts: RecipientFacts;
      /** The protocol contract's `formats` `address.known` key, when it is one. */
      known: KnownAddressKey | null;
      warning: RecipientWarning | null;
    };

/** The warning a recipient's facts call for, if any; exported for tests. */
export function recipientWarning(
  facts: RecipientFacts,
  known: KnownAddressKey | null,
): RecipientWarning | null {
  if (known) return 'protocol';
  if (facts.isContract) return 'contract';
  if (facts.transactionCount === 0) return 'fresh';
  return null;
}

/**
 * Checks a valid recipient on the protocol's chain (cached per address for a
 * minute, so retyping the same address does not ask again). `idle` until
 * there is an address; `failed` when the RPC cannot answer, which never
 * blocks the transfer — the person is told the check did not run.
 */
export function useRecipientFacts(address: Address | null): RecipientCheck {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const contracts = useContractAddresses();
  const query = useQuery({
    queryKey: ['recipientFacts', activeChain.id, address],
    queryFn: () => readRecipientFacts(publicClient!, address!),
    enabled: Boolean(address && publicClient),
    staleTime: 60_000,
    retry: 1,
  });

  if (!address) return { status: 'idle' };
  if (!publicClient || query.isError) return { status: 'failed' };
  if (!query.data) return { status: 'checking' };
  const known = findKnownAddress(address, contracts);
  return {
    status: 'ready',
    facts: query.data,
    known,
    warning: recipientWarning(query.data, known),
  };
}
