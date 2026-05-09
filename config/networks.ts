/**
 * Network configuration for Cosmic Signature: chain params, RPC, explorer, and API URLs.
 * Contract addresses are not configured here — they come from the dashboard API
 * (`GET …/statistics/dashboard` → `ContractAddrs`) and are published via
 * {@link publishDashboardContractAddresses} from `ContractAddressesProvider`.
 *
 * No defaults for network, API URL, RPC URL, or WalletConnect project ID — they
 * must be set via environment variables to avoid running against the wrong
 * backend, chain, or wallet connection project.
 */
export type NetworkName = 'local' | 'sepolia' | 'mainnet';

export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_NETWORK',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_RPC_URL',
  'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
] as const;

export interface EnvValidation {
  valid: boolean;
  missing: string[];
}

/** Returns validation result. Call before using networkConfig. */
export function getEnvValidation(): EnvValidation {
  const missing: string[] = [];
  const network = process.env.NEXT_PUBLIC_NETWORK?.trim();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL?.trim();
  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim();

  if (!network) missing.push('NEXT_PUBLIC_NETWORK');
  else if (network !== 'local' && network !== 'sepolia' && network !== 'mainnet') {
    missing.push('NEXT_PUBLIC_NETWORK (must be: local, sepolia, or mainnet)');
  }
  if (!apiUrl) missing.push('NEXT_PUBLIC_API_URL');
  if (!rpcUrl) missing.push('NEXT_PUBLIC_RPC_URL');
  if (!walletConnectProjectId) missing.push('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');

  return {
    valid: missing.length === 0,
    missing,
  };
}

interface NetworkConfig {
  chainId: number;
  chainHex: string;
  chainName: string;
  rpcUrl: string;
  explorerUrl: string;
  apiUrl: string;
  nftApiUrl: string;
  infuraKey: string;
}

const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY || '';

const networkDefaults: Record<NetworkName, Omit<NetworkConfig, 'apiUrl' | 'rpcUrl'>> = {
  local: {
    chainId: 31337,
    chainHex: '0x7A69',
    chainName: 'Local Network',
    // Indexed txs from dev APIs are on Arbitrum Sepolia; Anvil has no public explorer.
    explorerUrl: 'https://sepolia.arbiscan.io',
    nftApiUrl: 'https://nfts-local.cosmicsignature.com/',
    infuraKey,
  },
  sepolia: {
    chainId: 421614,
    chainHex: '0x66eee',
    chainName: 'Arbitrum Sepolia',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nftApiUrl: 'https://nfts-sepolia.cosmicsignature.com/',
    infuraKey,
  },
  mainnet: {
    chainId: 42161,
    chainHex: '0xa4b1',
    chainName: 'Arbitrum One',
    explorerUrl: 'https://arbiscan.io',
    nftApiUrl: 'https://nfts.cosmicsignature.com/',
    infuraKey,
  },
};

const networkNameRaw = process.env.NEXT_PUBLIC_NETWORK?.trim();
const resolvedNetworkName: NetworkName =
  networkNameRaw === 'local' || networkNameRaw === 'sepolia' || networkNameRaw === 'mainnet'
    ? networkNameRaw
    : 'sepolia'; // fallback only for building the object; getEnvValidation() will report invalid

const defaults = networkDefaults[resolvedNetworkName] ?? networkDefaults.sepolia;

/** API and RPC URLs come only from env; no defaults. */
export const networkConfig: NetworkConfig = {
  ...defaults,
  apiUrl: process.env.NEXT_PUBLIC_API_URL?.trim() ?? '',
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL?.trim() ?? '',
  explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL?.trim() || defaults.explorerUrl,
};

export const INFURA_KEY = networkConfig.infuraKey;

/**
 * Canonical contract addresses for hooks and RPC reads. Resolved from dashboard
 * `ContractAddrs` plus {@link publishDashboardContractAddresses}.
 */
export interface AppContractAddresses {
  randomWalkNft: string;
  cosmicGame: string;
  cosmicSignature: string;
  cosmicToken: string;
  cosmicDao: string;
  charity: string;
  /** Escrow holding allocation / stellar-selection prizes (`PrizesWalletAddr`). */
  prizesWallet: string;
  stakingCst: string;
  stakingRwalk: string;
  marketing: string;
  implementation: string;
}

export function emptyContractAddresses(): AppContractAddresses {
  return {
    randomWalkNft: '',
    cosmicGame: '',
    cosmicSignature: '',
    cosmicToken: '',
    cosmicDao: '',
    charity: '',
    prizesWallet: '',
    stakingCst: '',
    stakingRwalk: '',
    marketing: '',
    implementation: '',
  };
}

let dashboardContractSnapshot: AppContractAddresses | null = null;

/**
 * Mirrors the merged dashboard addresses for code outside React (and for hook tests).
 * Cleared implicitly when publishing {@link emptyContractAddresses}.
 */
export function publishDashboardContractAddresses(addrs: AppContractAddresses): void {
  dashboardContractSnapshot = addrs;
}

export function getCachedDashboardContractAddresses(): AppContractAddresses {
  return dashboardContractSnapshot ?? emptyContractAddresses();
}

/**
 * RPC URL to use for viem public client (e.g. useContractNoSigner).
 * In the browser with a custom RPC (no Infura/Alchemy), returns the app's /api/rpc proxy
 * to avoid CORS; otherwise returns networkConfig.rpcUrl.
 */
export function getPublicClientRpcUrl(): string {
  const rpc = networkConfig.rpcUrl || '';
  if (typeof window === 'undefined') return rpc;
  if (!rpc) return '';
  if (rpc.includes('infura.io') || rpc.includes('alchemy.com')) return rpc;
  return `${window.location.origin}/api/rpc`;
}
