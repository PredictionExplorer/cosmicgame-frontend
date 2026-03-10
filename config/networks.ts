/**
 * Network configuration for Cosmic Signature. Exposes chain params, RPC, explorer,
 * API URLs, and contract addresses per environment (local, sepolia, mainnet).
 */
export type NetworkName = 'local' | 'sepolia' | 'mainnet';

interface NetworkConfig {
  chainId: number;
  chainHex: string;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  apiUrl: string;
  nftApiUrl: string;
  infuraKey: string;
  // Contract addresses
  NFT_ADDRESS: string;
  COSMICGAME_ADDRESS: string;
  COSMIC_SIGNATURE_TOKEN_ADDRESS: string;
  COSMIC_SIGNATURE_ADDRESS: string;
  COSMIC_SIGNATURE_DAO_ADDRESS: string;
  CHARITY_WALLET_ADDRESS: string;
  RAFFLE_WALLET_ADDRESS: string;
  MARKETING_WALLET_ADDRESS: string;
  STAKING_WALLET_CST_ADDRESS: string;
  STAKING_WALLET_RWLK_ADDRESS: string;
  IMPLEMENTATION_ADDRESS: string;
  ART_BLOCKS_ADDRESS: string;
  MARKET_ADDRESS: string;
}

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY || '';

const networks: Record<NetworkName, NetworkConfig> = {
  local: {
    chainId: 31337,
    chainHex: '0x7A69',
    chainName: 'Local Network',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:7070/api/cosmicgame/',
    nftApiUrl: 'https://nfts.cosmicsignature.com/',
    infuraKey,
    NFT_ADDRESS: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
    COSMICGAME_ADDRESS: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    COSMIC_SIGNATURE_TOKEN_ADDRESS: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    COSMIC_SIGNATURE_ADDRESS: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    COSMIC_SIGNATURE_DAO_ADDRESS: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    CHARITY_WALLET_ADDRESS: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    RAFFLE_WALLET_ADDRESS: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
    MARKETING_WALLET_ADDRESS: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    STAKING_WALLET_CST_ADDRESS: '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
    STAKING_WALLET_RWLK_ADDRESS: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    IMPLEMENTATION_ADDRESS: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    ART_BLOCKS_ADDRESS: '',
    MARKET_ADDRESS: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  },

  sepolia: {
    chainId: 421614,
    chainHex: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia-explorer.arbitrum.io',
    apiUrl:
      process.env.NEXT_PUBLIC_API_URL || 'https://api-sepolia.cosmicsignature.com/api/cosmicgame/',
    nftApiUrl: 'https://nfts.cosmicsignature.com/',
    infuraKey,
    NFT_ADDRESS: '0xbB749EfF6018a9213DFbca2a20292DB1576F530d',
    COSMICGAME_ADDRESS: '0xC801d06c9900ef0cD878Ad6f59622aAfAd8F54dE',
    COSMIC_SIGNATURE_TOKEN_ADDRESS: '0xCF4896360C63Fef4ca60e6b4b7c2680ee366468a',
    COSMIC_SIGNATURE_ADDRESS: '0xAbC91c97336E885872a37b3105808e894AbA744E',
    COSMIC_SIGNATURE_DAO_ADDRESS: '0x6993054C1a08Edd7dF8B9EB1b5C29E3Af05638a0',
    CHARITY_WALLET_ADDRESS: '0x5e1DAc81E4f32C20f496a20bcB6C6EBdd9eC5a6C',
    RAFFLE_WALLET_ADDRESS: '0x1d22A8AfBbC2A6d25D5c95eFC84277073b209bD6',
    MARKETING_WALLET_ADDRESS: '0xB96Cb96f6378F8f9e6e002DB15Cd38F33d0e5648',
    STAKING_WALLET_CST_ADDRESS: '0xcF1c54DFd233CD031CE5f4F79fD281A38b37AB7a',
    STAKING_WALLET_RWLK_ADDRESS: '0xbE190dC5bd0f12Dbc189351B6172b6a1312d6f5C',
    IMPLEMENTATION_ADDRESS: '0xC9eb12c122dB86e0CCC48ae62668599dcAc5E049',
    ART_BLOCKS_ADDRESS: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
    MARKET_ADDRESS: '0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08',
  },

  mainnet: {
    chainId: 42161,
    chainHex: '0xa4b1',
    chainName: 'Arbitrum One',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || `https://arbitrum-mainnet.infura.io/v3/${infuraKey}`,
    explorerUrl: 'https://arbiscan.io',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.cosmicsignature.com/api/cosmicgame/',
    nftApiUrl: 'https://nfts.cosmicsignature.com/',
    infuraKey,
    NFT_ADDRESS: '0x895a6F444BE4ba9d124F61DF736605792B35D66b',
    COSMICGAME_ADDRESS: '0x2becB33347D2eFBA4942A1f98950E6C74774679b',
    COSMIC_SIGNATURE_TOKEN_ADDRESS: '0x2c4358acb804873C2dAB4AD917941fCd5d6EA28e',
    COSMIC_SIGNATURE_ADDRESS: '0x1e53209Eb4099988b106be22eDB29192212ad8B7',
    COSMIC_SIGNATURE_DAO_ADDRESS: '0x742b772Aab45335DAcE0EC6099e6Eeb5D0097684',
    CHARITY_WALLET_ADDRESS: '0x2c6a2FC9c65c3457216606a9f24535a17938d9E2',
    RAFFLE_WALLET_ADDRESS: '0x6300E1e97842d96bD84eEB8765867ee0e3F0f05E',
    MARKETING_WALLET_ADDRESS: '0xF6A795C64ad00F87470AbCe565F9546Ee2D27f3e',
    STAKING_WALLET_CST_ADDRESS: '0xee31260Bc475416eCAa6818EC8eFD7D432366a52',
    STAKING_WALLET_RWLK_ADDRESS: '0x82119eEdC25529b4193500555f15DE8794B9Dc56',
    IMPLEMENTATION_ADDRESS: '0xaF142d1dAd42dFaeccE4323793Ef43Be931B79f3',
    ART_BLOCKS_ADDRESS: '0x36b58F5C1969B7b6591D752ea6F5486D069010AB',
    MARKET_ADDRESS: '0x47eF85Dfb775aCE0934fBa9EEd09D22e6eC0Cc08',
  },
};

const networkName = (process.env.NEXT_PUBLIC_NETWORK || 'sepolia') as NetworkName;
export const networkConfig: NetworkConfig = networks[networkName] ?? networks.sepolia;

export const INFURA_KEY = networkConfig.infuraKey;
export const MARKET_ADDRESS = networkConfig.MARKET_ADDRESS;
export const NFT_ADDRESS = networkConfig.NFT_ADDRESS;
export const COSMICGAME_ADDRESS = networkConfig.COSMICGAME_ADDRESS;
export const COSMIC_SIGNATURE_TOKEN_ADDRESS = networkConfig.COSMIC_SIGNATURE_TOKEN_ADDRESS;
export const COSMIC_SIGNATURE_ADDRESS = networkConfig.COSMIC_SIGNATURE_ADDRESS;
export const COSMIC_SIGNATURE_DAO_ADDRESS = networkConfig.COSMIC_SIGNATURE_DAO_ADDRESS;
export const CHARITY_WALLET_ADDRESS = networkConfig.CHARITY_WALLET_ADDRESS;
export const RAFFLE_WALLET_ADDRESS = networkConfig.RAFFLE_WALLET_ADDRESS;
export const MARKETING_WALLET_ADDRESS = networkConfig.MARKETING_WALLET_ADDRESS;
export const STAKING_WALLET_CST_ADDRESS = networkConfig.STAKING_WALLET_CST_ADDRESS;
export const STAKING_WALLET_RWLK_ADDRESS = networkConfig.STAKING_WALLET_RWLK_ADDRESS;
export const IMPLEMENTATION_ADDRESS = networkConfig.IMPLEMENTATION_ADDRESS;
export const ART_BLOCKS_ADDRESS = networkConfig.ART_BLOCKS_ADDRESS;
