import { useMemo } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { getContract, type Abi } from 'viem';

/**
 * Generic contract hook that preserves viem's ABI-level type inference.
 * Each contract hook passes a `const`-asserted ABI, so the returned
 * contract has fully typed `.read`, `.write`, and `.estimateGas` methods.
 */
export default function useContract<const TAbi extends Abi>(address: string, abi: TAbi) {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return useMemo(() => {
    if (!address || !abi || !publicClient) return null;
    try {
      return getContract({
        address: address as `0x${string}`,
        abi,
        client: walletClient ? { public: publicClient, wallet: walletClient } : publicClient,
      });
    } catch (error) {
      console.error('Failed to create contract instance:', error);
      return null;
    }
  }, [address, abi, publicClient, walletClient]);
}
