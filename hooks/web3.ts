import { useAccount, useChainId } from 'wagmi';

import { networkConfig } from '@/config/networks';
import { UX_SCENARIO_DEMO_ACCOUNT, useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';

/**
 * Provides wallet connection state using native wagmi hooks.
 * Replaces the old ethers.js compatibility shim.
 *
 * `chainId` here is wagmi's connection state, which resolves to a configured
 * chain even when the wallet itself is elsewhere, so it cannot be used to
 * decide whether the user is on the right network. Gate contract writes and
 * chain-sensitive UI on `useRequireChain` instead.
 */
export function useActiveWeb3React() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const uxScenario = useUxScenarioSnapshot();
  const demoAccount = uxScenario ? (UX_SCENARIO_DEMO_ACCOUNT as `0x${string}`) : null;

  return {
    account: address ?? demoAccount,
    chainId: chainId ?? networkConfig.chainId,
    active: isConnected || !!demoAccount,
  };
}
