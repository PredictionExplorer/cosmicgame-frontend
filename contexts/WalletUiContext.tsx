'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';

import { reportError } from '@/utils/errors';

const WalletUi = dynamic(() => import('@/components/wallet/WalletUi').then((m) => m.WalletUi), {
  ssr: false,
});

/**
 * The connector id wagmi persisted for the previous session, or null. The
 * boot config only registers the plain injected connector, so any other id
 * means the heavy connector module must load before the session can resume.
 */
function readRecentConnectorId(): string | null {
  try {
    const raw = window.localStorage.getItem('wagmi.recentConnectorId');
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'string' && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

interface WalletUiContextValue {
  /**
   * Opens the wallet-connection modal, mounting the RainbowKit UI (and
   * downloading its chunk) on first use.
   */
  requestConnectModal: () => void;
  /**
   * Starts downloading the wallet UI chunk without opening anything. Wire to
   * pointerenter/focus on connect buttons so the click feels instant.
   */
  warmConnectModal: () => void;
}

const WalletUiContext = createContext<WalletUiContextValue | null>(null);

export function useWalletUi(): WalletUiContextValue {
  const context = useContext(WalletUiContext);
  if (!context) {
    throw new Error('useWalletUi must be used inside WalletUiProvider');
  }
  return context;
}

/**
 * Defers the entire RainbowKit surface (provider, modal, stylesheet) until a
 * visitor actually asks to connect.
 *
 * Rationale: the wallet modal UI was statically imported by the providers
 * tree, so every visitor on every page downloaded it — the single largest
 * chunk of the app-home bundle — even though most sessions never connect.
 * wagmi itself stays eager (hooks like useAccount render everywhere, and
 * returning users must silently reconnect); only the modal UI is deferred.
 *
 * Must be mounted INSIDE WagmiProvider: the lazily mounted RainbowKit
 * provider reads wagmi context.
 */
export function WalletUiProvider({ children }: { children: ReactNode }) {
  const [connectRequestId, setConnectRequestId] = useState(0);

  // Session restore for returning wallet users: their previous session used
  // a connector that is not part of the light boot config (WalletConnect,
  // Coinbase, Rabby, ...), so load the connector module and replay wagmi's
  // reconnect. First-time and injected-wallet visitors skip this entirely.
  // Both imports are dynamic so this context module stays free of wagmi in
  // module graphs that never restore a session (also keeps unit tests light).
  useEffect(() => {
    const recentConnectorId = readRecentConnectorId();
    if (!recentConnectorId || recentConnectorId === 'injected') return;
    void Promise.all([import('@/components/wallet/wallet-connectors'), import('@/config/wagmi')])
      .then(([connectors, config]) => connectors.restoreWalletSession(config.wagmiConfig))
      .catch((error) => reportError(error, 'walletSessionRestore'));
  }, []);

  const requestConnectModal = useCallback(() => {
    setConnectRequestId((id) => id + 1);
  }, []);

  const warmConnectModal = useCallback(() => {
    void import('@/components/wallet/WalletUi');
  }, []);

  const value = useMemo(
    () => ({ requestConnectModal, warmConnectModal }),
    [requestConnectModal, warmConnectModal],
  );

  return (
    <WalletUiContext.Provider value={value}>
      {children}
      {connectRequestId > 0 && <WalletUi connectRequestId={connectRequestId} />}
    </WalletUiContext.Provider>
  );
}
