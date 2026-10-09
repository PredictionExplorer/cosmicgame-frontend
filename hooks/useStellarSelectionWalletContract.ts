import { useCallback } from 'react';
import { usePublicClient, useWalletClient, useConnectorClient } from 'wagmi';
import { getContract, type Client } from 'viem';

import { prizesWalletAbi } from '@/contracts/abis';

import { activeChain } from '@/config/chains';
import { reportError } from '@/utils/errors';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';

import useContract from './useContract';

export default function useStellarSelectionWalletContract() {
  const { prizesWallet } = useContractAddresses();
  return useContract(prizesWallet, prizesWalletAbi);
}

export type StellarSelectionWalletContract = NonNullable<
  ReturnType<typeof useStellarSelectionWalletContract>
>;

/**
 * Factory for stellar-selection wallet contracts at arbitrary addresses.
 *
 * The game can be pointed at a replacement wallet contract; allocations
 * deposited into the superseded wallet stay there until their winners
 * retrieve them, so retrieval transactions must target the wallet recorded
 * on each allocation row. Hooks cannot be called per row, hence a factory:
 * the returned function builds a typed contract for the given address (the
 * current wallet when the address is empty/missing — rows from a backend
 * that predates multi-wallet support carry none).
 */
export function useStellarSelectionWalletContractFactory() {
  const { prizesWallet } = useContractAddresses();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient({ chainId: activeChain.id });
  const { data: connectorClient } = useConnectorClient({ chainId: activeChain.id });
  const signerClient = connectorClient ?? walletClient;

  return useCallback(
    (address?: string): StellarSelectionWalletContract | null => {
      const target = address && address.length >= 10 ? address : prizesWallet;
      if (!target || !publicClient) return null;
      try {
        // Same client normalization as useContract (wagmi wallet-client chain
        // generics differ from the public client's).
        const client: Client | { public: Client; wallet: Client } = signerClient
          ? { public: publicClient as Client, wallet: signerClient as Client }
          : (publicClient as Client);
        return getContract({
          address: target as `0x${string}`,
          abi: prizesWalletAbi,
          client,
        });
      } catch (error) {
        reportError(error, 'stellar selection wallet contract init');
        return null;
      }
    },
    [prizesWallet, publicClient, signerClient],
  );
}
