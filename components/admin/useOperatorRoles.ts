'use client';

import { useQuery } from '@tanstack/react-query';
import { usePublicClient } from 'wagmi';

import { cosmicGameAbi, marketingWalletAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { sameAddress } from '@/utils/address';
import { reportError } from '@/utils/errors';

import type { OperatorRole } from './operatorTools';

/** Roles change only when an owner hands one over: one read a minute is plenty. */
const ROLE_STALE_MS = 60_000;

export interface OutreachRoleHolders {
  owner: string;
  treasurer: string;
}

/**
 * The Outreach Reserve's `owner()` and `treasurerAddress()`. Disabled until
 * the reserve's address is known; a failed read is reported once and left to
 * the caller to show.
 */
export function useOutreachRoleHolders() {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { marketing } = useContractAddresses();
  return useQuery<OutreachRoleHolders>({
    queryKey: ['operatorRoles', 'outreach', marketing],
    enabled: Boolean(publicClient && marketing),
    staleTime: ROLE_STALE_MS,
    retry: 1,
    queryFn: async () => {
      const address = marketing as `0x${string}`;
      try {
        const [owner, treasurer] = await Promise.all([
          publicClient!.readContract({ address, abi: marketingWalletAbi, functionName: 'owner' }),
          publicClient!.readContract({
            address,
            abi: marketingWalletAbi,
            functionName: 'treasurerAddress',
          }),
        ]);
        return { owner: String(owner), treasurer: String(treasurer) };
      } catch (error) {
        reportError(error, 'MarketingWallet role read');
        throw error;
      }
    },
  });
}

/** The protocol contract's `owner()`: the account that changes its parameters. */
export function useProtocolOwner() {
  const publicClient = usePublicClient({ chainId: activeChain.id });
  const { cosmicGame } = useContractAddresses();
  return useQuery<string>({
    queryKey: ['operatorRoles', 'protocol', cosmicGame],
    enabled: Boolean(publicClient && cosmicGame),
    staleTime: ROLE_STALE_MS,
    retry: 1,
    queryFn: async () => {
      try {
        const owner = await publicClient!.readContract({
          address: cosmicGame as `0x${string}`,
          abi: cosmicGameAbi,
          functionName: 'owner',
        });
        return String(owner);
      } catch (error) {
        reportError(error, 'CosmicSignatureGame owner read');
        throw error;
      }
    },
  });
}

export interface OperatorRolesState {
  /**
   * `loading` while a read is in flight, `error` when one failed (the roles
   * listed come from the reads that succeeded), otherwise `ready`.
   */
  status: 'loading' | 'ready' | 'error';
  /** The roles `account` holds, in `OPERATOR_ROLES` order. */
  roles: OperatorRole[];
}

/** Which operator roles `account` holds, from the protocol and Outreach Reserve contracts. */
export function useOperatorRoles(account: string | null | undefined): OperatorRolesState {
  const protocol = useProtocolOwner();
  const outreach = useOutreachRoleHolders();
  const reads = [protocol, outreach];

  const roles: OperatorRole[] = [];
  if (sameAddress(account, protocol.data)) roles.push('protocolOwner');
  if (sameAddress(account, outreach.data?.owner)) roles.push('outreachOwner');
  if (sameAddress(account, outreach.data?.treasurer)) roles.push('outreachTreasurer');

  const status = reads.some((read) => read.isLoading)
    ? 'loading'
    : reads.some((read) => read.isError)
      ? 'error'
      : 'ready';
  return { status, roles };
}
