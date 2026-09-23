import { getConnectorClient, switchChain, type Config } from '@wagmi/core';
import { getChainId } from 'viem/actions';
import type { Client } from 'viem';

import { activeChain } from '@/config/chains';
import { networkConfig } from '@/config/networks';
import { isUserRejection } from '@/utils/errors';

/**
 * Outcome of making sure the wallet is on the protocol's chain before a write.
 *
 * - `ok`: the wallet is (now) on the required chain.
 * - `rejected`: the person declined the switch prompt.
 * - `failed`: the wallet could not switch (unsupported, chain unknown to it, …).
 * - `no-wallet`: nothing is connected, or the connector is not ready yet.
 */
export type ChainGuardStatus = 'ok' | 'rejected' | 'failed' | 'no-wallet';

/** Display name of the chain the protocol runs on ("Arbitrum One", "Arbitrum Sepolia"). */
export const REQUIRED_CHAIN_NAME: string = networkConfig.chainName || activeChain.name;

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Display name of the configured block explorer ("Arbiscan"). Taken from the
 * chain definition when the configured explorer is that chain's default, and
 * otherwise from the explorer's host name, so a custom or test explorer is
 * never mislabelled.
 */
export const EXPLORER_NAME: string = (() => {
  const configuredHost = hostOf(networkConfig.explorerUrl);
  const chainExplorer = activeChain.blockExplorers?.default;
  if (chainExplorer && configuredHost && hostOf(chainExplorer.url) === configuredHost) {
    return chainExplorer.name;
  }
  return configuredHost?.replace(/^www\./, '') ?? chainExplorer?.name ?? 'Explorer';
})();

/**
 * Names for chains wallets commonly sit on, so the wrong-network state can say
 * where the wallet is. Unlisted chains read as "another network".
 */
const KNOWN_CHAIN_NAMES: Readonly<Record<number, string>> = {
  1: 'Ethereum',
  10: 'OP Mainnet',
  56: 'BNB Chain',
  100: 'Gnosis',
  137: 'Polygon',
  324: 'zkSync Era',
  8453: 'Base',
  42161: 'Arbitrum One',
  42170: 'Arbitrum Nova',
  43114: 'Avalanche',
  59144: 'Linea',
  81457: 'Blast',
  534352: 'Scroll',
  11155111: 'Sepolia',
  421614: 'Arbitrum Sepolia',
  31337: 'Local Network',
};

/** Human name for a chain id, or null when the id is not one we recognise. */
export function getChainDisplayName(chainId: number | null | undefined): string | null {
  if (chainId == null) return null;
  if (chainId === activeChain.id) return REQUIRED_CHAIN_NAME;
  return KNOWN_CHAIN_NAMES[chainId] ?? null;
}

export interface EnsureWalletChainOptions {
  /** A connected client whose `eth_chainId` is the wallet's real chain, if one is at hand. */
  signer?: unknown;
  /** Chain id wagmi reports, used only when the wallet refuses `eth_chainId`. */
  fallbackChainId?: number | null;
  /** Switch implementation; defaults to wagmi's imperative `switchChain`. */
  switchTo?: (chainId: number) => Promise<unknown>;
}

/**
 * Reads the wallet's actual chain (not wagmi's cached connection state, which
 * resolves to a configured chain even when the wallet is elsewhere) and asks
 * the wallet to switch when it differs. Never shows UI; callers decide what to
 * say for each status. Only call it from an action the person started — the
 * wallet shows its own prompt, which they still have to approve.
 */
export async function ensureWalletOnRequiredChain(
  config: Config,
  { signer, fallbackChainId = null, switchTo }: EnsureWalletChainOptions = {},
): Promise<ChainGuardStatus> {
  let client = signer;
  if (!client) {
    // Deliberately unpinned: wagmi rejects a pinned chainId while the
    // connector sits on another chain (ConnectorChainMismatchError), and a
    // client on the wallet's current chain is what detects the mismatch.
    try {
      client = await getConnectorClient(config);
    } catch {
      client = undefined;
    }
  }
  if (!client) return 'no-wallet';

  let walletChainId: number;
  try {
    walletChainId = await getChainId(client as Client);
  } catch {
    walletChainId = fallbackChainId ?? activeChain.id;
  }
  if (walletChainId === activeChain.id) return 'ok';

  try {
    if (switchTo) await switchTo(activeChain.id);
    else await switchChain(config, { chainId: activeChain.id });
    return 'ok';
  } catch (err) {
    return isUserRejection(err) ? 'rejected' : 'failed';
  }
}

/**
 * Error a guarded write throws when the chain guard did not reach `ok`. Named
 * like the wagmi/viem errors so `classifyTxError` maps it without special
 * cases: a declined switch reads as a cancellation, the rest as wrong network
 * or no wallet.
 */
export class ChainGuardError extends Error {
  readonly status: Exclude<ChainGuardStatus, 'ok'>;
  readonly code?: number;
  constructor(status: Exclude<ChainGuardStatus, 'ok'>) {
    super(
      status === 'rejected'
        ? 'User rejected the network switch request.'
        : status === 'no-wallet'
          ? 'No connected wallet.'
          : `Wallet is not on chain ${activeChain.id}.`,
    );
    this.status = status;
    this.name =
      status === 'rejected'
        ? 'UserRejectedRequestError'
        : status === 'no-wallet'
          ? 'ConnectorNotConnectedError'
          : 'ChainMismatchError';
    if (status === 'rejected') this.code = 4001;
  }
}
