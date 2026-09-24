'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';

import { reportError } from '@/utils/errors';

const loadWalletUi = () => import('@/components/wallet/WalletUi');

const WalletUi = dynamic(() => loadWalletUi().then((m) => m.WalletUi), {
  ssr: false,
});

/**
 * Upper bound on the "opening the wallet list…" state: if the chunk has not
 * produced a modal by then (offline, blocked script), the button returns to
 * normal instead of spinning forever.
 */
const CONNECT_PENDING_TIMEOUT_MS = 15_000;

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
  /**
   * True from a connect request until the modal is on screen. On a phone the
   * first request downloads the wallet UI, so connect buttons show a spinner
   * and `aria-busy` for that moment instead of looking dead.
   */
  connectPending: boolean;
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
 * Like `useWalletUi`, but returns null outside the provider — for shared
 * hooks (useTxFlow) that offer a "Connect wallet" action when they can and
 * still work in isolation.
 */
export function useOptionalWalletUi(): WalletUiContextValue | null {
  return useContext(WalletUiContext);
}

/**
 * Defers the entire RainbowKit surface (provider, modal, stylesheet) until a
 * visitor actually asks to connect.
 *
 * Rationale: the wallet modal UI was statically imported by the providers
 * tree, so every visitor on every page downloaded it — the single largest
 * chunk of the app-home bundle — even though most sessions never connect.
 * wagmi itself stays eager (hooks like useConnection render everywhere, and
 * returning users must silently reconnect); only the modal UI is deferred.
 *
 * Must be mounted INSIDE WagmiProvider: the lazily mounted RainbowKit
 * provider reads wagmi context.
 */
export function WalletUiProvider({ children }: { children: ReactNode }) {
  const [connectRequestId, setConnectRequestId] = useState(0);
  const [connectPending, setConnectPending] = useState(false);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations('wallet');

  // RainbowKit bakes the wallet-group headers into the connectors when they
  // are installed, so resolve them once for the page session instead of
  // re-running the restore effect on every locale change.
  const [walletGroupLabels] = useState(() => ({
    popular: t('groups.popular'),
    more: t('groups.more'),
  }));

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
      .then(([connectors, config]) =>
        connectors.restoreWalletSession(config.wagmiConfig, walletGroupLabels),
      )
      .catch((error) => reportError(error, 'walletSessionRestore'));
  }, [walletGroupLabels]);

  const clearPending = useCallback(() => {
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = null;
    setConnectPending(false);
  }, []);

  useEffect(
    () => () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    },
    [],
  );

  const requestConnectModal = useCallback(() => {
    setConnectPending(true);
    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(clearPending, CONNECT_PENDING_TIMEOUT_MS);
    // Surface a failed chunk download (offline, blocked script) instead of
    // leaving the request waiting; the dynamic component retries on the next
    // request.
    loadWalletUi().catch((error) => {
      reportError(error, 'walletUiChunk');
      clearPending();
    });
    setConnectRequestId((id) => id + 1);
  }, [clearPending]);

  const warmConnectModal = useCallback(() => {
    void loadWalletUi().catch(() => undefined);
  }, []);

  const value = useMemo(
    () => ({ requestConnectModal, warmConnectModal, connectPending }),
    [requestConnectModal, warmConnectModal, connectPending],
  );

  return (
    <WalletUiContext.Provider value={value}>
      {children}
      {connectRequestId > 0 && (
        <WalletUi connectRequestId={connectRequestId} onModalOpened={clearPending} />
      )}
    </WalletUiContext.Provider>
  );
}
