'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { useOptionalWalletUi } from '@/contexts/WalletUiContext';
import { useClipboard } from '@/hooks/useClipboard';
import { useRequireChain } from '@/hooks/useRequireChain';
import { useActiveWeb3React } from '@/hooks/web3';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { reportError } from '@/utils/errors';
import { getExplorerUrl } from '@/utils/urls';

/** How long "Copied" stays on the copy control (ms). */
const COPIED_FEEDBACK_MS = 2_000;

export interface WalletAccountState {
  /** The connected address, or null. */
  address: `0x${string}` | null;
  isConnected: boolean;
  /** Wallet brand from the connector ("MetaMask", "Rabby"), when known. */
  walletName: string | null;
  /** Explorer page for the address, and the explorer's display name. */
  explorerUrl: string | null;
  explorerName: string;
  /** Network facts and the switch action from `useRequireChain`. */
  requiredChainName: string;
  connectedChainName: string | null;
  isWrongChain: boolean;
  isSwitching: boolean;
  switchToRequiredChain: () => Promise<boolean>;
  /** Copies the address; `copied` is true for two seconds afterwards. */
  copyAddress: () => Promise<void>;
  copied: boolean;
  /** Ends the session in this app (the wallet itself stays unlocked). */
  disconnect: () => Promise<void>;
  /**
   * Disconnects, then opens the wallet list so another wallet can connect.
   * (Switching accounts inside one wallet happens in the wallet; wagmi
   * follows it automatically.)
   */
  switchWallet: () => Promise<void>;
  isDisconnecting: boolean;
}

/**
 * Everything an account menu needs, at any width: address, copy, explorer
 * link, network state with a one-click switch, disconnect and switch wallet.
 * `WalletAccountPanel` renders it; header and drawer redesigns can use the
 * hook directly.
 */
export function useWalletAccount(): WalletAccountState {
  // The same account the wallet pill shows (including the UX-scenario demo
  // account), so the panel never disagrees with its trigger.
  const { account } = useActiveWeb3React();
  const { connector } = useAccount();
  const address = (account ?? null) as `0x${string}` | null;
  const { disconnectAsync, isPending: isDisconnecting = false } = useDisconnect();
  const walletUi = useOptionalWalletUi();
  const { copy } = useClipboard();
  const chain = useRequireChain();
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const copyAddress = useCallback(async () => {
    if (!address) return;
    await copy(address);
    setCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  }, [address, copy]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectAsync();
    } catch (err) {
      reportError(err, 'wallet-disconnect');
    }
  }, [disconnectAsync]);

  const switchWallet = useCallback(async () => {
    await disconnect();
    // RainbowKit only opens its list while nothing is connected, so the
    // request follows the disconnect instead of racing it.
    walletUi?.requestConnectModal();
  }, [disconnect, walletUi]);

  return {
    address,
    isConnected: Boolean(address),
    walletName: connector?.name ?? null,
    explorerUrl: address ? getExplorerUrl('address', address) : null,
    explorerName: EXPLORER_NAME,
    requiredChainName: chain.requiredChainName,
    connectedChainName: chain.connectedChainName,
    isWrongChain: chain.isWrongChain,
    isSwitching: chain.isSwitching,
    switchToRequiredChain: chain.switchToRequiredChain,
    copyAddress,
    copied,
    disconnect,
    switchWallet,
    isDisconnecting,
  };
}
