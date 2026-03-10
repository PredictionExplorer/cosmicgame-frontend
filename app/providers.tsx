'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import type { ISourceOptions } from '@tsparticles/engine';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';

import { wagmiConfig } from '@/config/wagmi';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { StakedTokenProvider } from '@/contexts/StakedTokenContext';
import { SystemModeProvider } from '@/contexts/SystemModeContext';
import { ApiDataProvider } from '@/contexts/ApiDataContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

const Particles = dynamic(
  () => import('@tsparticles/react').then((mod) => ({ default: mod.default })),
  { ssr: false },
);

const queryClient = new QueryClient();

const particleOptions = {
  background: { color: { value: 'transparent' } },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: false },
    },
    modes: {
      grab: { distance: 140, links: { opacity: 0.3 } },
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
    links: { color: '#ffffff', distance: 150, enable: true, opacity: 0.15, width: 1 },
    collisions: { enable: false },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'out' },
      random: true,
      speed: 0.5,
      straight: false,
    },
    number: { density: { enable: true, area: 1000 }, value: 30 },
    opacity: {
      value: { min: 0.1, max: 0.4 },
      animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false },
    },
    shape: { type: 'circle' },
    size: {
      value: { min: 1, max: 3 },
      animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false },
    },
  },
  detectRetina: true,
};

export function Providers({ children }: { children: ReactNode }) {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    (async () => {
      const { initParticlesEngine } = await import('@tsparticles/react');
      const { loadSlim } = await import('@tsparticles/slim');
      await initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      });
      setEngineReady(true);
    })();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {engineReady && (
            <Particles
              id="tsparticles"
              options={particleOptions as unknown as ISourceOptions}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
              }}
              aria-hidden="true"
            />
          )}
          <ErrorBoundary>
            {/* @ts-expect-error TS2786 - react-cookie CookiesProvider has React 18 types incompatible with React 19 */}
            <CookiesProvider>
              <StakedTokenProvider>
                <SystemModeProvider>
                  <ApiDataProvider>
                    <NotificationProvider>
                      <Header />
                      <ErrorBoundary>{children}</ErrorBoundary>
                      <Footer />
                    </NotificationProvider>
                  </ApiDataProvider>
                </SystemModeProvider>
              </StakedTokenProvider>
            </CookiesProvider>
          </ErrorBoundary>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              className: 'bg-card text-foreground border-border',
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
