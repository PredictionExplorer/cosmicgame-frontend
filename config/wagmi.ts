/**
 * Wagmi config for wallet connection state. Uses the active chain from
 * config/chains and RPC from config/networks.
 *
 * Deliberately built with wagmi's own `createConfig` and ONLY the injected
 * connector. RainbowKit's `getDefaultConfig` used to build this config, which
 * statically pulled the entire wallet stack — RainbowKit UI, WalletConnect,
 * Coinbase, Safe — into the entry bundle of every app page (~95 KB gzip, the
 * single largest chunk) even though most sessions never connect a wallet.
 *
 * The full RainbowKit wallet list is installed into this SAME config at
 * runtime by components/wallet/wallet-connectors.ts, which loads:
 *   - on connect intent (the modal chunk), or
 *   - at boot, only for returning visitors whose last session used a heavy
 *     connector (see WalletUiProvider), so their session still restores.
 */
import { createConfig, createStorage, http } from 'wagmi';
import type { Chain } from 'viem';
import { injected } from 'wagmi/connectors';

import { networkConfig } from './networks';
import { activeChain, localChain } from './chains';

// Reown/WalletConnect project ID, consumed by the lazily installed wallet
// list (QR and mobile flows require a real ID).
export const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '';

export const walletAppName = 'Cosmic Signature';

/**
 * Use RPC proxy when the node doesn't support CORS (e.g. self-hosted).
 * Infura/Alchemy have CORS; custom IPs need the proxy.
 */
const rpcUrl = networkConfig.rpcUrl || '';
const useRpcProxy =
  rpcUrl &&
  !rpcUrl.includes('infura.io') &&
  !rpcUrl.includes('alchemy.com') &&
  !rpcUrl.includes('arbitrum-mainnet.infura.io');
// Server: use RPC directly (no CORS). Client: use proxy when RPC lacks CORS.
const transportUrl = useRpcProxy
  ? typeof window !== 'undefined'
    ? `${window.location.origin}/api/rpc`
    : rpcUrl
  : rpcUrl;

export const wagmiChains = [
  activeChain,
  ...(activeChain.id === localChain.id ? [] : [localChain]),
] as [Chain, ...Chain[]];

export const wagmiTransports = {
  [activeChain.id]: http(transportUrl || undefined),
  [localChain.id]: http(
    typeof window !== 'undefined' &&
      rpcUrl &&
      !rpcUrl.includes('infura.io') &&
      !rpcUrl.includes('alchemy.com')
      ? `${window.location.origin}/api/rpc`
      : rpcUrl || 'http://127.0.0.1:8545',
  ),
};

/**
 * Testing mode (the local harness, scripts/harness) keeps wallet sessions in
 * its own storage namespace. Sessions persisted by regular dev runs on this
 * origin (e.g. MetaMask on Arbitrum One) must never be restored against the
 * harness chain: wagmi would reconnect them at boot and every wallet-client
 * query would log ConnectorChainMismatchError before the burner wallet could
 * replace the session.
 */
const harnessStorageNamespace =
  process.env.NEXT_PUBLIC_HARNESS === '1' && process.env.NEXT_PUBLIC_NETWORK === 'local'
    ? 'cosmic-harness-wagmi'
    : null;

/** Wagmi config for the app's wallet provider tree. */
export const wagmiConfig = createConfig({
  chains: wagmiChains,
  transports: wagmiTransports,
  // The injected connector covers in-browser wallets at boot (and EIP-6963
  // discovery adds specific extensions automatically). Everything heavier is
  // installed on demand — see wallet-connectors.ts.
  connectors: [injected({ shimDisconnect: true })],
  ssr: true,
  ...(harnessStorageNamespace ? { storage: createStorage({ key: harnessStorageNamespace }) } : {}),
});
