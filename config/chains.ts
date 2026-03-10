import { arbitrum, arbitrumSepolia, hardhat } from 'viem/chains';

import { networkConfig } from './networks';

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

export const activeChain =
  chainMap[networkConfig.chainId as keyof typeof chainMap] ?? arbitrumSepolia;
