'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAccount, useConfig, useConnectorClient, useSwitchChain, useWalletClient } from 'wagmi';

import { activeChain } from '@/config/chains';
import { useNotify } from '@/hooks/useNotify';
import {
  REQUIRED_CHAIN_NAME,
  ensureWalletOnRequiredChain,
  getChainDisplayName,
  type ChainGuardStatus,
} from '@/lib/chainGuard';
import { isUserRejection } from '@/utils/errors';

export type { ChainGuardStatus } from '@/lib/chainGuard';

export interface UseRequireChainOptions {
  /**
   * Message shown when the wallet could not be moved to the app chain.
   * Defaults to the generic wrong-network copy naming the required chain;
   * flows with their own wording (the gesture form) pass a localized override.
   */
  switchFailedMessage?: string;
}

export interface RequireChainResult {
  /** Chain the app's contracts are deployed on. */
  requiredChainId: number;
  /** Display name of the required chain ("Arbitrum One"). */
  requiredChainName: string;
  /** Chain the connected wallet reports, or `null` when no wallet is connected. */
  connectedChainId: number | null;
  /** Display name of the wallet's chain, or `null` when unknown or disconnected. */
  connectedChainName: string | null;
  /** True only when a wallet IS connected and reports a different chain. */
  isWrongChain: boolean;
  isConnected: boolean;
  /** True while a switch request is waiting in the wallet. */
  isSwitching: boolean;
  /** Explicit, user-initiated switch. Resolves true once the wallet is on the app chain. */
  switchToRequiredChain: () => Promise<boolean>;
  /**
   * Silent gate for contract writes: re-reads the chain from the wallet (not
   * wagmi's cached state) and asks the wallet to switch on a mismatch. Shows
   * nothing; the caller explains each status. `useTxFlow` uses this.
   */
  ensureChain: () => Promise<ChainGuardStatus>;
  /**
   * `ensureChain` plus the matching notification. Resolves false, having
   * already shown a message, when the write must not proceed.
   */
  ensureCorrectChain: () => Promise<boolean>;
}

/**
 * Centralised chain guard.
 *
 * `useActiveWeb3React().chainId` reads wagmi's connection state, which
 * resolves to a configured chain even when the wallet itself is elsewhere, so
 * callers cannot tell "on the app chain" from "wagmi assumed the app chain".
 * Every contract write goes through `ensureChain()` / `ensureCorrectChain()`
 * (useTxFlow and useContract's writes do it for you), and chain-sensitive UI
 * reads `isWrongChain` — see `WrongNetworkChip` and `ChainGuard` in
 * components/wallet.
 *
 * Nothing here switches networks on its own: the guards only run from an
 * action the person already started, and the wallet still prompts.
 */
export function useRequireChain(options: UseRequireChainOptions = {}): RequireChainResult {
  const t = useTranslations('toasts');
  const { notify } = useNotify();
  const config = useConfig();
  const { isConnected, chainId: walletChainId } = useAccount();
  const { switchChainAsync, isPending: isSwitching = false } = useSwitchChain();
  const { data: connectorClient } = useConnectorClient({ chainId: activeChain.id });
  const { data: walletClient } = useWalletClient({ chainId: activeChain.id });

  const requiredChainId: number = activeChain.id;
  const connectedChainId = isConnected ? (walletChainId ?? null) : null;
  const isWrongChain = connectedChainId !== null && connectedChainId !== requiredChainId;
  const switchFailedMessage =
    options.switchFailedMessage ?? t('network.wrongChain', { network: REQUIRED_CHAIN_NAME });

  const switchTo = useCallback(
    (chainId: number) => switchChainAsync({ chainId }),
    [switchChainAsync],
  );

  const notifyStatus = useCallback(
    (status: ChainGuardStatus) => {
      if (status === 'rejected') notify('info', t('walletTransactionCancelled'));
      else if (status === 'failed') notify('error', switchFailedMessage);
      else if (status === 'no-wallet') notify('error', t('wallet.notReady'));
    },
    [notify, switchFailedMessage, t],
  );

  const ensureChain = useCallback(
    () =>
      ensureWalletOnRequiredChain(config, {
        signer: connectorClient ?? walletClient,
        fallbackChainId: walletChainId ?? null,
        switchTo,
      }),
    [config, connectorClient, switchTo, walletChainId, walletClient],
  );

  const switchToRequiredChain = useCallback(async (): Promise<boolean> => {
    if (!isConnected) {
      notify('error', t('wallet.connect'));
      return false;
    }
    if (!isWrongChain) return true;
    try {
      await switchTo(requiredChainId);
      return true;
    } catch (err) {
      notifyStatus(isUserRejection(err) ? 'rejected' : 'failed');
      return false;
    }
  }, [isConnected, isWrongChain, notify, notifyStatus, requiredChainId, switchTo, t]);

  const ensureCorrectChain = useCallback(async (): Promise<boolean> => {
    const status = await ensureChain();
    if (status === 'ok') return true;
    notifyStatus(status);
    return false;
  }, [ensureChain, notifyStatus]);

  return {
    requiredChainId,
    requiredChainName: REQUIRED_CHAIN_NAME,
    connectedChainId,
    connectedChainName: getChainDisplayName(connectedChainId),
    isWrongChain,
    isConnected: Boolean(isConnected),
    isSwitching,
    switchToRequiredChain,
    ensureChain,
    ensureCorrectChain,
  };
}
