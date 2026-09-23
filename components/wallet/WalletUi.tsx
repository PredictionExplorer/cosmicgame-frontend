'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RainbowKitProvider,
  useConnectModal,
  type DisclaimerComponent,
  type Locale as RainbowKitLocale,
} from '@rainbow-me/rainbowkit';
import { useLocale, useTranslations } from 'next-intl';
import { useAccount } from 'wagmi';

import { getPathname } from '@/i18n/navigation';
import { pickByLocale, type LocaleRecord } from '@/i18n/locale';
import { cosmicRainbowTheme } from '@/config/rainbowkit-theme';
import { walletAppName, wagmiConfig } from '@/config/wagmi';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';

import { installWalletConnectors } from './wallet-connectors';

// Wallet UI stylesheet travels with this lazy chunk, so visitors who never
// connect a wallet never download it.
import '@rainbow-me/rainbowkit/styles.css';

/**
 * Bridges the imperative "open the connect modal" request into RainbowKit's
 * hook API. Each increment of `connectRequestId` (another click on a connect
 * button) re-opens the modal, including after the visitor dismissed it.
 *
 * RainbowKit only offers `openConnectModal` while no wallet is connected. A
 * request made while connected is settled (not queued), so the modal can
 * never pop up unprompted after a later disconnect.
 */
function ConnectModalOpener({
  connectRequestId,
  onModalOpened,
}: {
  connectRequestId: number;
  onModalOpened?: () => void;
}) {
  const { openConnectModal } = useConnectModal();
  const { status } = useAccount();
  const lastHandledRequestRef = useRef(0);

  useEffect(() => {
    if (connectRequestId <= lastHandledRequestRef.current) return;
    if (!openConnectModal) {
      if (status === 'connected') {
        lastHandledRequestRef.current = connectRequestId;
        onModalOpened?.();
      }
      return;
    }
    lastHandledRequestRef.current = connectRequestId;
    openConnectModal();
    onModalOpened?.();
  }, [connectRequestId, onModalOpened, openConnectModal, status]);

  return null;
}

// RainbowKit ships its own translations; map each app locale onto the
// nearest RainbowKit locale so the wallet modal follows the site language
// (it carries separate Taiwan and Hong Kong Traditional catalogs).
const RAINBOW_KIT_LOCALES: LocaleRecord<RainbowKitLocale> = {
  en: 'en-US',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-HK',
  uk: 'uk-UA',
  ko: 'ko-KR',
  ja: 'ja-JP',
  vi: 'vi-VN',
};

/**
 * The line under the wallet list: connecting means agreeing to the Terms and
 * acknowledging the Risk Disclosures, and gestures need ETH on the protocol's
 * chain. RainbowKit renders it with its own Text and Link so it matches the
 * modal's typography.
 */
const WalletDisclaimer: DisclaimerComponent = ({ Text, Link }) => {
  const t = useTranslations('wallet');
  const locale = useLocale();
  return (
    <Text>
      {t.rich('connect.disclaimer', {
        network: REQUIRED_CHAIN_NAME,
        terms: (chunks) => <Link href={getPathname({ href: '/terms', locale })}>{chunks}</Link>,
        risk: (chunks) => (
          <Link href={getPathname({ href: '/risk-disclosures', locale })}>{chunks}</Link>
        ),
      })}
    </Text>
  );
};

/**
 * The deferred RainbowKit surface. Mounted (and downloaded) only after a
 * visitor asks to connect — see WalletUiProvider. Renders no layout of its
 * own; RainbowKit portals its modal to the document body.
 */
export function WalletUi({
  connectRequestId,
  onModalOpened,
}: {
  connectRequestId: number;
  /** Called once the modal is on screen (or the request is settled). */
  onModalOpened?: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations('wallet');
  const rainbowKitLocale = pickByLocale(RAINBOW_KIT_LOCALES, locale);

  // Install the full wallet list into the live wagmi config BEFORE
  // RainbowKit renders, so the modal sees every wallet. useState (not
  // useEffect) runs the installer during the first render pass.
  useState(() => {
    installWalletConnectors(wagmiConfig, {
      popular: t('groups.popular'),
      more: t('groups.more'),
    });
    return null;
  });

  const appInfo = useMemo(
    () => ({
      appName: walletAppName,
      // RainbowKit's "Learn more" under "What is a wallet?": our guide to
      // taking part on Arbitrum, in the visitor's language.
      learnMoreUrl: localeHref(LANDING_ORIGIN, '/learn/cosmic-signature-on-arbitrum', locale),
      disclaimer: WalletDisclaimer,
    }),
    [locale],
  );

  return (
    <RainbowKitProvider theme={cosmicRainbowTheme} locale={rainbowKitLocale} appInfo={appInfo}>
      <ConnectModalOpener connectRequestId={connectRequestId} onModalOpened={onModalOpened} />
    </RainbowKitProvider>
  );
}
