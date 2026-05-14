'use client';

import { memo, useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { ISourceOptions } from '@tsparticles/engine';
import { offchainLookupSignature } from 'viem/utils';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';

import { wagmiConfig } from '@/config/wagmi';
import { cosmicRainbowTheme } from '@/config/rainbowkit-theme';
import { networkConfig, getEnvValidation } from '@/config/networks';
import { NOTIFICATION_AUTO_HIDE_MS } from '@/config/constants';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnchoredTokenProvider } from '@/contexts/AnchoredTokenContext';
import { SystemModeProvider } from '@/contexts/SystemModeContext';
import { ApiDataProvider } from '@/contexts/ApiDataContext';
import { ContractAddressesProvider } from '@/contexts/ContractAddressesContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { reportError } from '@/utils/errors';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';
import { getClientBuildInfo } from '@/lib/buildInfo';

// Wallet UI stylesheet — kept scoped to Providers (the app-only tree) so
// the landing host never ships it.
import '@rainbow-me/rainbowkit/styles.css';

// Viem's `call()` dynamically imports CCIP helpers on revert paths; that async chunk
// can fail after deploys or HMR and surfaces as a misleading contract read error.
void offchainLookupSignature;

const Particles = dynamic(
  () => import('@tsparticles/react').then((mod) => ({ default: mod.default })),
  { ssr: false },
);

const ParticleBackdrop = memo(function ParticleBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 touch-none [contain:strict] motion-reduce:hidden print:hidden"
    >
      <Particles id="tsparticles" options={particleOptions} className="h-full w-full" />
    </div>
  );
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 300_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}

const particleOptions: ISourceOptions = {
  fullScreen: { enable: false },
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    detectsOn: 'window',
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
      resize: { enable: true },
    },
    modes: {
      grab: { distance: 120, links: { opacity: 0.22 } },
    },
  },
  particles: {
    color: {
      value: '#ffffff',
      animation: {
        enable: true,
        speed: 20,
        sync: true,
        h: { enable: true, offset: 0, speed: 0.5, sync: false },
        s: { enable: false, offset: 0, speed: 1, sync: true },
        l: { enable: false, offset: 0, speed: 1, sync: true },
      },
    },
    links: { color: '#ffffff', distance: 150, enable: true, opacity: 0.1, width: 1 },
    collisions: { enable: false },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'out' },
      random: true,
      speed: 0.35,
      straight: false,
    },
    number: { density: { enable: true, width: 1000, height: 1000 }, value: 20 },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.5, startValue: 'min', sync: false },
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 1, max: 3 },
      animation: { enable: true, speed: 2, startValue: 'min', sync: false },
    },
  },
  detectRetina: true,
};

const envValidation = getEnvValidation();

function EnvErrorScreen({ missing }: { missing: string[] }) {
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
        <h1 style={{ fontSize: '1.25rem', marginBottom: 16 }}>
          Can&apos;t run because environment variables aren&apos;t set.
        </h1>
        <p style={{ marginBottom: 24, opacity: 0.9 }}>
          We can&apos;t assume any defaults for networks or API URLs — that is prone to bugs.
        </p>
        <p style={{ marginBottom: 8, fontSize: '0.875rem' }}>Missing or invalid:</p>
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
          Set them in your shell or in a .env file, then restart the dev server.
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
  const [engineReady, setEngineReady] = useState(false);

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
        `  NFT CDN: ${networkConfig.nftApiUrl}` +
        buildLines,
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { initParticlesEngine } = await import('@tsparticles/react');
        const { loadSlim } = await import('@tsparticles/slim');
        await initParticlesEngine(async (engine) => {
          await loadSlim(engine);
        });
        setEngineReady(true);
      } catch (err) {
        reportError(err, 'particlesInit');
      }
    })();
  }, []);

  if (!envValidation.valid) {
    return <EnvErrorScreen missing={envValidation.missing} />;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ContractAddressesProvider>
          <RainbowKitProvider theme={cosmicRainbowTheme}>
            {engineReady && <ParticleBackdrop />}
            <ErrorBoundary>
              <CookiesProvider>
                <AnchoredTokenProvider>
                  <SystemModeProvider>
                    <ApiDataProvider>
                      <NotificationProvider>
                        <TooltipProvider delayDuration={200} skipDelayDuration={300}>
                          <SkipLink />
                          {showAppChrome && <Header />}
                          <ErrorBoundary>{children}</ErrorBoundary>
                          {showAppChrome && <Footer />}
                        </TooltipProvider>
                      </NotificationProvider>
                    </ApiDataProvider>
                  </SystemModeProvider>
                </AnchoredTokenProvider>
              </CookiesProvider>
            </ErrorBoundary>
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              closeButton
              toastOptions={{
                duration: NOTIFICATION_AUTO_HIDE_MS,
                className:
                  'border border-white/[0.08] bg-card/95 backdrop-blur-md shadow-[var(--elevation-3)]',
                classNames: {
                  toast: 'group',
                  title: 'type-body-md text-foreground',
                  description: 'type-body-sm text-muted-foreground',
                  actionButton: 'bg-primary text-primary-foreground',
                  cancelButton: 'bg-muted text-muted-foreground',
                  success: 'border-[rgb(var(--impact-green-rgb)/0.4)]',
                  error: 'border-[rgb(var(--chrono-rose-rgb)/0.4)]',
                  warning: 'border-[rgb(var(--solar-gold-rgb)/0.4)]',
                  info: 'border-[rgb(var(--aurora-cyan-rgb)/0.4)]',
                },
              }}
            />
          </RainbowKitProvider>
        </ContractAddressesProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
