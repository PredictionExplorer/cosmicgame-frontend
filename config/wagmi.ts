import { http } from 'wagmi';
import type { Chain } from 'viem';
import { arbitrum, arbitrumSepolia, hardhat } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

import { networkConfig } from './networks';

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  'placeholder_get_real_id_from_cloud_walletconnect_com';

const chainMap = {
  42161: arbitrum,
  421614: arbitrumSepolia,
  31337: {
    ...hardhat,
    rpcUrls: {
      default: { http: [networkConfig.rpcUrl] },
    },
  },
} as const;

const activeChain = chainMap[networkConfig.chainId as keyof typeof chainMap] ?? arbitrumSepolia;

export const wagmiConfig = getDefaultConfig({
  appName: 'Cosmic Signature',
  projectId,
  chains: [activeChain as Chain],
  transports: {
    [activeChain.id]: http(networkConfig.rpcUrl || undefined),
  },
  ssr: true,
});
