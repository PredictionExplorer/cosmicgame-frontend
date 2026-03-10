/**
 * Wagmi + RainbowKit config for wallet connection. Uses the active chain from
 * config/chains and RPC from config/networks.
 */
import { http } from 'wagmi';
import type { Chain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import { networkConfig } from './networks';
import { activeChain } from './chains';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  'placeholder_get_real_id_from_cloud_walletconnect_com';

/** Wagmi config for RainbowKit; used by the app's wallet provider. */
export const wagmiConfig = getDefaultConfig({
  appName: 'Cosmic Signature',
  projectId,
  chains: [activeChain as Chain],
  transports: {
    [activeChain.id]: http(networkConfig.rpcUrl || undefined),
  },
  ssr: true,
});
