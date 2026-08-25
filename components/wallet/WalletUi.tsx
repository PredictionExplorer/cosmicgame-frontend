'use client';

import { useEffect, useRef, useState } from 'react';
import {
  RainbowKitProvider,
  useConnectModal,
  type Locale as RainbowKitLocale,
} from '@rainbow-me/rainbowkit';
import { useLocale } from 'next-intl';

import { cosmicRainbowTheme } from '@/config/rainbowkit-theme';
import { wagmiConfig } from '@/config/wagmi';

import { installWalletConnectors } from './wallet-connectors';

// Wallet UI stylesheet travels with this lazy chunk, so visitors who never
// connect a wallet never download it.
import '@rainbow-me/rainbowkit/styles.css';

/**
 * Bridges the imperative "open the connect modal" request into RainbowKit's
 * hook API. Each increment of `connectRequestId` (another click on a connect
 * button) re-opens the modal, including after the visitor dismissed it.
 */
function ConnectModalOpener({ connectRequestId }: { connectRequestId: number }) {
  const { openConnectModal } = useConnectModal();
  const lastHandledRequestRef = useRef(0);

  useEffect(() => {
    if (connectRequestId <= lastHandledRequestRef.current) return;
    if (!openConnectModal) return;
    lastHandledRequestRef.current = connectRequestId;
    openConnectModal();
  }, [connectRequestId, openConnectModal]);

  return null;
}

/**
 * The deferred RainbowKit surface. Mounted (and downloaded) only after a
 * visitor asks to connect — see WalletUiProvider. Renders no layout of its
 * own; RainbowKit portals its modal to the document body.
 */
export function WalletUi({ connectRequestId }: { connectRequestId: number }) {
  const locale = useLocale();
  // RainbowKit ships its own translations; map our locale so the wallet
  // modal follows the site language (zh-CN for the Chinese locale).
  const rainbowKitLocale: RainbowKitLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

  // Install the full wallet list into the live wagmi config BEFORE
  // RainbowKit renders, so the modal sees every wallet. useState (not
  // useEffect) runs the installer during the first render pass.
  useState(() => {
    installWalletConnectors(wagmiConfig);
    return null;
  });

  return (
    <RainbowKitProvider theme={cosmicRainbowTheme} locale={rainbowKitLocale}>
      <ConnectModalOpener connectRequestId={connectRequestId} />
    </RainbowKitProvider>
  );
}
