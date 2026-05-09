/**
 * Wagmi + RainbowKit config for wallet connection. Uses the active chain from
 * config/chains and RPC from config/networks.
 */
import { http } from 'wagmi';
import type { Chain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

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
