import { useMemo } from 'react';
import { createPublicClient, getContract, http, type Abi } from 'viem';

import { getPublicClientRpcUrl } from '@/config/networks';
import { activeChain } from '@/config/chains';
import { reportError } from '@/utils/errors';

/**
 * Returns a read-only viem contract instance (no wallet/signer).
 * Uses the app's RPC proxy in the browser when RPC is custom (avoids CORS).
 * Preserves full ABI type inference like useContract.
 */
export default function useContractNoSigner<const TAbi extends Abi>(address: string, abi: TAbi) {
  return useMemo(() => {
    if (!address || !abi) return null;
    try {
      const transportUrl = getPublicClientRpcUrl();
      const client = createPublicClient({
        chain: activeChain,
        transport: http(transportUrl || undefined),
      });
      return getContract({
        address: address as `0x${string}`,
        abi,
        client,
      });
    } catch (err) {
      reportError(err, 'useContractNoSigner init');
      return null;
    }
  }, [address, abi]);
}
