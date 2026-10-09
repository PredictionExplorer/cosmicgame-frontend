'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useConnection, useSwitchChain } from 'wagmi';

import { activeChain } from '@/config/chains';
import { useNotify } from '@/hooks/useNotify';
import { REQUIRED_CHAIN_NAME, getChainDisplayName, type ChainGuardStatus } from '@/lib/chainGuard';
import { isUserRejection } from '@/utils/errors';

export interface UseWalletNetworkOptions {
  /**
   * Message shown when the wallet could not be moved to the app chain.
   * Defaults to the generic wrong-network copy naming the required chain.
   */
  switchFailedMessage?: string;
}

export interface WalletNetworkState {
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
  /**
   * Explicit, user-initiated switch. Resolves true once the wallet is on the
   * app chain; shows a message and resolves false otherwise.
   */
  switchToRequiredChain: () => Promise<boolean>;
}

/**
 * The toast for a chain-guard outcome that stops a write: a declined switch
 * is a neutral "cancelled", a failed one names the network, a missing wallet
 * asks to connect. `ok` shows nothing.
 */
export function useChainGuardNotice(
  switchFailedMessage?: string,
): (status: ChainGuardStatus) => void {
  const t = useTranslations('toasts');
  const { notify } = useNotify();
  const failedMessage =
    switchFailedMessage ?? t('network.wrongChain', { network: REQUIRED_CHAIN_NAME });
  return useCallback(
    (status: ChainGuardStatus) => {
      if (status === 'rejected') notify('info', t('walletTransactionCancelled'));
      else if (status === 'failed') notify('error', failedMessage);
      else if (status === 'no-wallet') notify('error', t('wallet.notReady'));
    },
    [failedMessage, notify, t],
  );
}

/**
 * Display-level network state for chrome and inline prompts — the header
 * chip, the account panel, `ChainGuard` — plus the one-click switch. Reads
 * only wagmi's connection (no wallet-client queries), so it is cheap to mount
 * on every page. Contract writes use `useRequireChain().ensureChain` (or
 * `useTxFlow`, which guards for you), which re-reads the wallet's real chain.
 */
export function useWalletNetwork(options: UseWalletNetworkOptions = {}): WalletNetworkState {
  const t = useTranslations('toasts');
  const { notify } = useNotify();
  const notifyStatus = useChainGuardNotice(options.switchFailedMessage);
  const { isConnected, chainId: walletChainId } = useConnection();
  const { mutateAsync: switchChainAsync, isPending: isSwitching = false } = useSwitchChain();

  const requiredChainId: number = activeChain.id;
  const connectedChainId = isConnected ? (walletChainId ?? null) : null;
  const isWrongChain = connectedChainId !== null && connectedChainId !== requiredChainId;

  const switchToRequiredChain = useCallback(async (): Promise<boolean> => {
    if (!isConnected) {
      notify('error', t('wallet.connect'));
      return false;
    }
    if (!isWrongChain) return true;
    try {
      await switchChainAsync({ chainId: requiredChainId });
      return true;
    } catch (err) {
      notifyStatus(isUserRejection(err) ? 'rejected' : 'failed');
      return false;
    }
  }, [isConnected, isWrongChain, notify, notifyStatus, requiredChainId, switchChainAsync, t]);

  return {
    requiredChainId,
    requiredChainName: REQUIRED_CHAIN_NAME,
    connectedChainId,
    connectedChainName: getChainDisplayName(connectedChainId),
    isWrongChain,
    isConnected: Boolean(isConnected),
    isSwitching,
    switchToRequiredChain,
  };
}
