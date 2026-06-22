import { useAccount, useChainId } from 'wagmi';

import { networkConfig } from '@/config/networks';
import { UX_SCENARIO_DEMO_ACCOUNT, useUxScenarioSnapshot } from '@/lib/uxCycleScenarios';

/**
 * Provides wallet connection state using native wagmi hooks.
 * Replaces the old ethers.js compatibility shim.
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
