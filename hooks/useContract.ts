import { useMemo } from 'react';
import { usePublicClient, useWalletClient, useConnectorClient } from 'wagmi';
import { getContract, type Abi } from 'viem';

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
  const { data: walletClient } = useWalletClient();
  const { data: connectorClient } = useConnectorClient();
  const signerClient = connectorClient ?? walletClient;

  return useMemo(() => {
    if (!address || !abi || !publicClient) return null;
    try {
      return getContract({
        address: address as `0x${string}`,
        abi,
        client: signerClient
          ? { public: publicClient, wallet: signerClient }
          : publicClient,
      });
    } catch (error) {
      reportError(error, 'useContract init');
      return null;
    }
  }, [address, abi, publicClient, signerClient]);
}
