import { useMemo } from 'react';
import { usePublicClient, useWalletClient, useConnectorClient } from 'wagmi';
import { getContract, type Abi, type Client } from 'viem';

import { activeChain } from '@/config/chains';
import { reportError } from '@/utils/errors';

/**
 * Generic contract hook that preserves viem's ABI-level type inference.
 * Each contract hook passes a `const`-asserted ABI, so the returned
 * contract has fully typed `.read`, `.write`, and `.estimateGas` methods.
 * Uses connectorClient ?? walletClient so write capability is available
 * even when only one of them is populated (wagmi hydration timing).
 */
export default function useContract<const TAbi extends Abi>(address: string, abi: TAbi) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient({ chainId: activeChain.id });
  const { data: connectorClient } = useConnectorClient({ chainId: activeChain.id });
  const signerClient = connectorClient ?? walletClient;

  return useMemo(() => {
    if (!address || !abi || !publicClient) return null;
    try {
      // Wagmi's `useWalletClient({ chainId })` wallet client carries different `chain` generics than
      // `usePublicClient()`, which makes `getContract`'s `write` a broken union unless normalized.
      const client: Client | { public: Client; wallet: Client } = signerClient
        ? { public: publicClient as Client, wallet: signerClient as Client }
        : (publicClient as Client);
      return getContract({
        address: address as `0x${string}`,
        abi,
        client,
      });
    } catch (error) {
      reportError(error, 'useContract init');
      return null;
    }
  }, [address, abi, publicClient, signerClient]);
}
