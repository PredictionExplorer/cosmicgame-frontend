// External dependencies for Web3 connectors
import { Web3Provider } from "@ethersproject/providers";
import { SafeAppConnector } from "@gnosis.pm/safe-apps-web3-react";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

// Application-specific configuration
import { INFURA_KEY } from "../config/app";
import {
  ALL_SUPPORTED_CHAIN_IDS,
  DEFAULT_CHAIN_ID,
  SupportedChainId,
} from "../config/chains";
import getLibrary from "../utils/getLibrary";
import { NetworkConnector } from "./NetworkConnector";

/**
 * Mapping of supported chain IDs to their respective RPC URLs.
 * This includes Infura endpoints for Arbitrum networks and local/other chains.
 */
const NETWORK_URLS: Record<SupportedChainId, string> = {
  [SupportedChainId.ARBITRUM_ONE]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_RINKEBY]: `https://arbitrum-rinkeby.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.ARBITRUM_GOERLI]: `https://arbitrum-goerli.infura.io/v3/${INFURA_KEY}`,
  [SupportedChainId.LOCAL_NETWORK]: "http://161.129.67.42:22945",
  [SupportedChainId.SEPOLIA]: "https://sepolia-rollup.arbitrum.io/rpc",
};

/**
 * Network connector for interacting with configured RPC URLs.
 * Uses `DEFAULT_CHAIN_ID` if no chain is explicitly specified.
 */
export const network = new NetworkConnector({
  urls: NETWORK_URLS,
  defaultChainId: DEFAULT_CHAIN_ID,
});

/**
 * Singleton instance of Web3Provider for the network connector.
 * Lazily initialized only on first use.
 */
let networkLibrary: Web3Provider | undefined;

/**
 * Get the singleton Web3Provider instance for the network connector.
 */
export function getNetworkLibrary(): Web3Provider {
  if (!networkLibrary) {
    networkLibrary = getLibrary(network.provider);
  }
  return networkLibrary;
}

/**
 * Injected connector for browser wallets like MetaMask.
 * Supports all chains specified in `ALL_SUPPORTED_CHAIN_IDS`.
 */
export const injected = new InjectedConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
});

/**
 * Gnosis Safe connector (only if running in a browser context).
 * Returns `null` in SSR environments.
 */
export const gnosisSafe =
  typeof window !== "undefined" ? new SafeAppConnector() : null;

/**
 * WalletConnect connector for QR code-based wallet connection.
 * Supports all configured chains and displays QR code modal.
 */
export const walletconnect = new WalletConnectConnector({
  supportedChainIds: ALL_SUPPORTED_CHAIN_IDS,
  rpc: NETWORK_URLS,
  qrcode: true,
});
