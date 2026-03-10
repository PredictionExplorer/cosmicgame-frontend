import { useMemo } from 'react';
import { createPublicClient, getContract, http, type Abi } from 'viem';

import { networkConfig } from '../config/networks';
import { activeChain } from '../config/chains';
import { reportError } from '../utils/errors';

const readOnlyClient = createPublicClient({
  chain: activeChain,
  transport: http(networkConfig.rpcUrl),
});

/**
 * Returns a read-only viem contract instance (no wallet/signer).
 * Preserves full ABI type inference like useContract.
 */
export default function useContractNoSigner<const TAbi extends Abi>(address: string, abi: TAbi) {
  return useMemo(() => {
    if (!address || !abi) return null;
    try {
      return getContract({
        address: address as `0x${string}`,
        abi,
        client: readOnlyClient,
      });
    } catch (err) {
      reportError(err, 'useContractNoSigner init');
      return null;
    }
  }, [address, abi]);
}
