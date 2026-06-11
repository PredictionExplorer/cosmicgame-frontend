/**
 * Wagmi + RainbowKit config for wallet connection. Uses the active chain from
 * config/chains and RPC from config/networks.
 */
import { createConnector, http } from 'wagmi';
import type { Chain } from 'viem';
import { injected } from 'wagmi/connectors';
import { getDefaultConfig, type Wallet, type WalletList } from '@rainbow-me/rainbowkit';
import {
  baseAccount,
  coinbaseWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

import { networkConfig } from './networks';
import { activeChain, localChain } from './chains';

/*
 * Minimal no-op indexedDB stub for server / SSG environments.
 * WalletConnect's connector calls indexedDB.open() during setup which throws
 * ReferenceError in Node.  This shim satisfies the idb-keyval interface used
 * internally (open -> onupgradeneeded/onsuccess, store CRUD returning
 * IDBRequest-like objects, and store.transaction back-reference) without
 * persisting anything.
 */
if (typeof globalThis.indexedDB === 'undefined') {
  type Cb = null | ((e: unknown) => void);
  function fakeReq(value?: unknown) {
    const r: Record<string, unknown> = {
      result: value,
      error: null,
      readyState: 'done',
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      oncomplete: null,
    };
    queueMicrotask(() => {
      (r.oncomplete as Cb)?.({ target: r });
      (r.onsuccess as Cb)?.({ target: r });
    });
    return r;
  }
  const fakeTx: Record<string, unknown> = {
    objectStore: () => fakeStore,
    oncomplete: null,
    onerror: null,
    onabort: null,
    abort: () => {},
  };
  const fakeStore: Record<string, unknown> = {
    transaction: fakeTx,
    get: () => fakeReq(undefined),
    put: () => fakeReq(undefined),
    add: () => fakeReq(undefined),
    delete: () => fakeReq(undefined),
    clear: () => fakeReq(undefined),
    getAll: () => fakeReq([]),
    getAllKeys: () => fakeReq([]),
    count: () => fakeReq(0),
  };
  const fakeDb: Record<string, unknown> = {
    createObjectStore: () => fakeStore,
    objectStoreNames: { contains: () => false, length: 0 },
    transaction: () => {
      queueMicrotask(() => {
        (fakeTx.oncomplete as Cb)?.({ target: fakeTx });
      });
      return fakeTx;
    },
    close: () => {},
    onclose: null,
  };
  function fakeOpen() {
    const req = fakeReq(fakeDb);
    queueMicrotask(() => {
      (req.onupgradeneeded as Cb)?.({ target: req });
    });
    return req;
  }
  (globalThis as Record<string, unknown>).indexedDB = {
    open: fakeOpen,
    deleteDatabase: fakeOpen,
    databases: () => Promise.resolve([]),
  };
}

// RainbowKit requires a real Reown/WalletConnect project ID for QR and mobile flows.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? '';

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

export const walletList: WalletList = [
  {
    groupName: 'Popular',
    wallets: [rabbyWallet, rainbowWallet, baseAccount, injectedMetaMaskWallet, walletConnectWallet],
  },
  {
    groupName: 'More',
    wallets: [coinbaseWallet],
  },
];

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

/** Wagmi config for RainbowKit; used by the app's wallet provider. */
export const wagmiConfig = getDefaultConfig({
  appName: 'Cosmic Signature',
  projectId,
  wallets: walletList,
  chains: [activeChain, ...(activeChain.id === localChain.id ? [] : [localChain])] as [
    Chain,
    ...Chain[],
  ],
  transports: {
    [activeChain.id]: http(transportUrl || undefined),
    [localChain.id]: http(
      typeof window !== 'undefined' &&
        rpcUrl &&
        !rpcUrl.includes('infura.io') &&
        !rpcUrl.includes('alchemy.com')
        ? `${window.location.origin}/api/rpc`
        : rpcUrl || 'http://127.0.0.1:8545',
    ),
  },
  ssr: true,
});
