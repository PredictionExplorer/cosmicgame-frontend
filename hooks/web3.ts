import { useAccount, useChainId } from 'wagmi';

import { networkConfig } from '../config/networks';

/**
 * Provides wallet connection state using native wagmi hooks.
 * Replaces the old ethers.js compatibility shim.
 */
export function useActiveWeb3React() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  return {
    account: address ?? null,
    chainId: chainId ?? networkConfig.chainId,
    active: isConnected,
  };
}
