'use client';

import { useCallback } from 'react';
import { useConfig, useConnection, useSwitchChain } from 'wagmi';

import {
  useChainGuardNotice,
  useWalletNetwork,
  type UseWalletNetworkOptions,
  type WalletNetworkState,
} from '@/hooks/useWalletNetwork';
import { ensureWalletOnRequiredChain, type ChainGuardStatus } from '@/lib/chainGuard';

export type { ChainGuardStatus } from '@/lib/chainGuard';

export type UseRequireChainOptions = UseWalletNetworkOptions;

export interface RequireChainResult extends WalletNetworkState {
  /**
   * Silent gate for contract writes: re-reads the chain from the wallet (not
   * wagmi's cached state) and asks the wallet to switch on a mismatch. Shows
   * nothing; the caller explains each status. `useTxFlow` uses the same guard.
   */
  ensureChain: () => Promise<ChainGuardStatus>;
  /**
   * `ensureChain` plus the matching notification. Resolves false, having
   * already shown a message, when the write must not proceed.
   */
  ensureCorrectChain: () => Promise<boolean>;
}

/**
 * The chain guard for code that sends a contract write itself (outside
 * `useTxFlow`, which guards for you).
 *
 * `useActiveWeb3React().chainId` reads wagmi's configured chain, which
 * resolves to the app chain even when the wallet itself is elsewhere, so
 * callers cannot tell "on the app chain" from "wagmi assumed the app chain".
 * `ensureChain()` asks the wallet (`eth_chainId`) and switches on a mismatch.
 * For display only — a chip, a disabled state — `useWalletNetwork` is enough.
 *
 * Nothing here switches networks on its own: the guards only run from an
 * action the person already started, and the wallet still prompts.
 */
export function useRequireChain(options: UseRequireChainOptions = {}): RequireChainResult {
  const network = useWalletNetwork(options);
  const notifyStatus = useChainGuardNotice(options.switchFailedMessage);
  const config = useConfig();
  const { chainId: walletChainId } = useConnection();
  const { mutateAsync: switchChainAsync } = useSwitchChain();

  // The guard resolves the wallet's client when it runs (unpinned, so a
  // wallet on another chain still answers), instead of keeping a
  // chain-pinned client query that fails for as long as it sits there.
  const ensureChain = useCallback(
    () =>
      ensureWalletOnRequiredChain(config, {
        fallbackChainId: walletChainId ?? null,
        switchTo: (chainId) => switchChainAsync({ chainId }),
      }),
    [config, switchChainAsync, walletChainId],
  );

  const ensureCorrectChain = useCallback(async (): Promise<boolean> => {
    const status = await ensureChain();
    if (status === 'ok') return true;
    notifyStatus(status);
    return false;
  }, [ensureChain, notifyStatus]);

  return { ...network, ensureChain, ensureCorrectChain };
}
