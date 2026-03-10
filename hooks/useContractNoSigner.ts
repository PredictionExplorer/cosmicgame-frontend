import { useMemo } from 'react';
import { createPublicClient, getContract, http, type Abi } from 'viem';
import { arbitrum, arbitrumSepolia, hardhat } from 'viem/chains';

import { networkConfig } from '../config/networks';

const chainMap = {
  42161: arbitrum,
  421614: arbitrumSepolia,
  31337: hardhat,
} as const;

const chain = chainMap[networkConfig.chainId as keyof typeof chainMap] ?? arbitrumSepolia;

const readOnlyClient = createPublicClient({
  chain,
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
      console.error('useContractNoSigner → contract init error:', err);
      return null;
    }
  }, [address, abi]);
}
