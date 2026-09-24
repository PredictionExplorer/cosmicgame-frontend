'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { offchainLookupSignature } from 'viem/utils';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { CookiesProvider } from 'react-cookie';
import { MotionConfig } from 'framer-motion';

import { wagmiConfig } from '@/config/wagmi';
import { networkConfig, getEnvValidation } from '@/config/networks';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AppToaster } from '@/components/ui/app-toaster';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnchoredTokenProvider } from '@/contexts/AnchoredTokenContext';
import { SystemModeProvider } from '@/contexts/SystemModeContext';
import { ApiDataProvider } from '@/contexts/ApiDataContext';
import { ContractAddressesProvider } from '@/contexts/ContractAddressesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { WalletUiProvider } from '@/contexts/WalletUiContext';
import { useLiveGameDataRefresh } from '@/hooks/useLiveGameDataRefresh';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';
import { getClientBuildInfo } from '@/lib/buildInfo';
import { makeQueryClient } from '@/lib/queryClient';
import { baseTransition } from '@/lib/motion';
import { getApiBase, getApiOrigin, getRpcUrl } from '@/lib/serverRotation';

// NOTE: RainbowKit (provider, modal, stylesheet) is intentionally NOT
// imported here. It lives behind WalletUiProvider's dynamic import so the
// wallet-modal chunk downloads only on connect intent — most sessions never
// connect, and this was the largest chunk in the app-home bundle.

// Viem's `call()` dynamically imports CCIP helpers on revert paths; that async chunk
// can fail after deploys or HMR and surfaces as a misleading contract read error.
void offchainLookupSignature;

// Local test-harness dev panel (scripts/harness). The literal env checks are
// inlined at build time, so production builds (any non-local network, or no
// NEXT_PUBLIC_HARNESS) drop both the flag and the dynamically imported chunk.
const harnessUiEnabled =
  process.env.NEXT_PUBLIC_HARNESS === '1' && process.env.NEXT_PUBLIC_NETWORK === 'local';
const HarnessPanel = harnessUiEnabled
  ? dynamic(() => import('@/components/dev/HarnessPanel'), { ssr: false })
  : null;

function LiveGameDataRefresh() {
  useLiveGameDataRefresh();
  return null;
}

const envValidation = getEnvValidation();

function EnvErrorScreen({ missing }: { missing: string[] }) {
  const t = useTranslations('errors');

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: '#0a0a0a',
        color: '#e5e5e5',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: 16 }}>{t('environment.title')}</h1>
        <p style={{ marginBottom: 24, opacity: 0.9 }}>{t('environment.description')}</p>
        <p style={{ marginBottom: 8, fontSize: '0.875rem' }}>{t('environment.missing')}</p>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', opacity: 0.9 }}>
          {missing.map((name) => (
            <li key={name} style={{ marginBottom: 4 }}>
              <code style={{ background: '#222', padding: '2px 6px', borderRadius: 4 }}>
                {name}
              </code>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: 24, fontSize: '0.8125rem', opacity: 0.7 }}>
          {t('environment.resolution')}
        </p>
      </div>
    </div>
  );
}

export function Providers({
  children,
  showAppChrome = true,
}: {
  children: ReactNode;
  /** When false (marketing hosts), header/footer are hidden. */
  showAppChrome?: boolean;
}) {
  const [queryClient] = useState(() => makeQueryClient());

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  useEffect(() => {
    const onBefore = () => document.documentElement.setAttribute('data-cosmic-print', '1');
    const onAfter = () => document.documentElement.removeAttribute('data-cosmic-print');
    window.addEventListener('beforeprint', onBefore);
    window.addEventListener('afterprint', onAfter);
    return () => {
      window.removeEventListener('beforeprint', onBefore);
      window.removeEventListener('afterprint', onAfter);
    };
  }, []);

  useEffect(() => {
    if (!envValidation.valid) return;
    const showConfigLog =
      process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
    if (!showConfigLog) return;

    const rpcDisplay =
      typeof window !== 'undefined' && networkConfig.rpcUrl.includes('161.129.67.42')
        ? `${window.location.origin}/api/rpc → ${networkConfig.rpcUrl}`
        : networkConfig.rpcUrl;

    const build = getClientBuildInfo();
    const buildLines =
      build != null
        ? `\n  Build: ${build.shortSha}${build.ref ? ` (${build.ref})` : ''}\n  Commit: ${build.fullSha}`
        : '';

    // console.log (not warn): dev-only banner; warn is forwarded as an error-looking stack in Next.
    // eslint-disable-next-line no-console -- dev/preview config banner should not look like a warning.
    console.log(
      '[Cosmic Signature] Config:\n' +
        `  Network: ${process.env.NEXT_PUBLIC_NETWORK}\n` +
        `  Chain ID: ${networkConfig.chainId}\n` +
        `  RPC URL: ${rpcDisplay}\n` +
        `  API URL: ${networkConfig.apiUrl}\n` +
        `  NFT media: ${getApiOrigin() || networkConfig.nftApiUrl} (follows API rotation)` +
        buildLines,
    );
  }, []);

  useEffect(() => {
    // Announce the rotation picks at startup ("[serverRotation] using RPC/API
    // = ..."); later changes (hour flip, failover) are logged by pickServer.
    getRpcUrl();
    getApiBase();
  }, []);

  if (!envValidation.valid) {
    return <EnvErrorScreen missing={envValidation.missing} />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ContractAddressesProvider>
          <LiveGameDataRefresh />
          <WalletUiProvider>
            {/* Framer Motion defaults for the app host: honour the OS "reduce
                motion" setting (transforms and layout animations are skipped;
                opacity still fades) and use the shared transition token
                wherever a component sets none. The landing shell does the same. */}
            <MotionConfig reducedMotion="user" transition={baseTransition}>
              <ErrorBoundary>
                <CookiesProvider>
                  <AnchoredTokenProvider>
                    <SystemModeProvider>
                      <ApiDataProvider>
                        <NotificationProvider>
                          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
                            <div
                              className={
                                showAppChrome ? 'site-shell flex min-h-screen flex-col' : undefined
                              }
                            >
                              <SkipLink />
                              {showAppChrome && <Header />}
                              <div className={showAppChrome ? 'min-w-0 flex-1' : undefined}>
                                <ErrorBoundary>{children}</ErrorBoundary>
                              </div>
                              {showAppChrome && <Footer />}
                            </div>
                          </TooltipProvider>
                        </NotificationProvider>
                      </ApiDataProvider>
                    </SystemModeProvider>
                  </AnchoredTokenProvider>
                </CookiesProvider>
              </ErrorBoundary>
            </MotionConfig>
            {HarnessPanel ? <HarnessPanel /> : null}
            <AppToaster />
          </WalletUiProvider>
        </ContractAddressesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
