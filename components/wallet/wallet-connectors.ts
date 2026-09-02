'use client';

/**
 * Runtime installation of the full RainbowKit wallet list into the light
 * wagmi config (see config/wagmi.ts for why the config boots with only the
 * injected connector). This module is only ever loaded lazily:
 *   - with the connect-modal chunk on connect intent, or
 *   - at boot for returning visitors whose previous session used one of
 *     these connectors (restoreWalletSession), so it never taxes first-time
 *     visitors.
 *
 * Injecting connectors after config creation uses `config._internal
 * .connectors.setup/setState` — the same typed mechanism wagmi itself uses
 * to add EIP-6963-discovered wallets at runtime.
 */
import { createConnector, type Config } from 'wagmi';
import { reconnect } from 'wagmi/actions';
import { injected } from 'wagmi/connectors';
import { connectorsForWallets, type Wallet, type WalletList } from '@rainbow-me/rainbowkit';
import {
  baseAccount,
  coinbaseWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

import { walletAppName, walletConnectProjectId } from '@/config/wagmi';

type InjectedEthereumProvider = {
  isMetaMask?: boolean;
  providers?: InjectedEthereumProvider[];
};

function getInjectedMetaMaskProvider(windowObject?: Window): InjectedEthereumProvider | undefined {
  const ethereum = windowObject?.ethereum as InjectedEthereumProvider | undefined;
  if (!ethereum) return undefined;
  if (ethereum.isMetaMask) return ethereum;
  return ethereum.providers?.find((provider) => provider.isMetaMask);
}

export function injectedMetaMaskWallet(): Wallet {
  return {
    id: 'metaMask',
    name: 'MetaMask',
    rdns: 'io.metamask',
    iconUrl:
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2214%22 fill=%22%23f6851b%22/%3E%3Cpath fill=%22%23fff%22 d=%22M17 18l11 8 4 10 4-10 11-8-5 20-10 8-10-8z%22/%3E%3C/svg%3E',
    iconBackground: '#f6851b',
    installed:
      typeof window !== 'undefined' && getInjectedMetaMaskProvider(window) ? true : undefined,
    downloadUrls: {
      browserExtension: 'https://metamask.io/download/',
    },
    createConnector: (walletDetails) => {
      const injectedConnector = injected({
        shimDisconnect: true,
        unstable_shimAsyncInject: 1_000,
        target: 'metaMask',
      });
      return createConnector((config) => ({
        ...injectedConnector(config),
        ...walletDetails,
      }));
    },
  };
}

/**
 * Section headers RainbowKit renders above each wallet group in the connect
 * modal. RainbowKit's own locale pack does not cover them, so callers pass
 * the translated strings from the `wallet` catalog (`groups.*`).
 */
export interface WalletGroupLabels {
  popular: string;
  more: string;
}

export function buildWalletList(labels: WalletGroupLabels): WalletList {
  return [
    {
      groupName: labels.popular,
      wallets: [
        rabbyWallet,
        rainbowWallet,
        baseAccount,
        injectedMetaMaskWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: labels.more,
      wallets: [coinbaseWallet],
    },
  ];
}

let installed = false;

/**
 * Adds the RainbowKit wallet connectors to the given config exactly once.
 * Idempotent: the modal chunk and the session-restore path can both call it.
 * The group labels are baked into the connectors at install time, so the
 * first caller's language holds for the rest of the page session (a locale
 * switch is a soft navigation and does not re-run the installer).
 */
export function installWalletConnectors(config: Config, groupLabels: WalletGroupLabels): void {
  if (installed) return;
  installed = true;

  const connectorFns = connectorsForWallets(buildWalletList(groupLabels), {
    appName: walletAppName,
    projectId: walletConnectProjectId,
  });

  config._internal.connectors.setState((current) => {
    const existingIds = new Set(current.map((connector) => connector.id));
    const added = connectorFns
      .map((connectorFn) => config._internal.connectors.setup(connectorFn))
      .filter((connector) => !existingIds.has(connector.id));
    return [...current, ...added];
  });
}

/**
 * Boot path for returning visitors: installs the wallet list and replays
 * wagmi's reconnect so a WalletConnect/Coinbase/etc session restores even
 * though its connector was not part of the initial config.
 */
export async function restoreWalletSession(
  config: Config,
  groupLabels: WalletGroupLabels,
): Promise<void> {
  installWalletConnectors(config, groupLabels);
  try {
    await reconnect(config);
  } catch {
    // A failed replay leaves the visitor disconnected — the same outcome as
    // an expired session; the connect button still works.
  }
}
