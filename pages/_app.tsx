import type { AppProps } from 'next/app';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { useState, useEffect, useCallback } from 'react';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

const Particles = dynamic(
  () => import('react-tsparticles').then((mod) => ({ default: mod.default })),
  { ssr: false },
);
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

import { wagmiConfig } from '../config/wagmi';
// import { inter, clashDisplay } from '../config/fonts';
import ErrorBoundary from '../components/layout/ErrorBoundary';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../config/styles';

import '../styles/global.css';
import { useRouter } from 'next/router';

import * as ga from '../utils/analytics';
import { ApiDataProvider } from '../contexts/ApiDataContext';
import ApiDataFetcher from '../contexts/ApiDataFetcher';

import { CookiesProvider } from 'react-cookie';

import { StakedTokenProvider } from '../contexts/StakedTokenContext';
import { SystemModeProvider } from '../contexts/SystemModeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { logoImgUrl } from '../utils';

const clientSideEmotionCache = createEmotionCache();
const queryClient = new QueryClient();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const defaultTitle = 'Cosmic Signature';
const defaultDescription = 'Cosmic Signature is a strategy bidding game.';

interface OpenGraphDataItem {
  property?: string;
  name?: string;
  content: string;
}

const defaultOpenGraphData = [
  { property: 'og:type', content: 'website' },
  { property: 'og:site_name', content: defaultTitle },
  { property: 'og:description', content: defaultDescription },
  { property: 'og:title', content: defaultTitle },
  { property: 'og:image', content: logoImgUrl },
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:title', content: defaultTitle },
  { name: 'twitter:description', content: defaultDescription },
  { name: 'twitter:image', content: logoImgUrl },
];

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

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const { openGraphData = defaultOpenGraphData, title, description } = pageProps;
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async () => {}, []);

  return (
    <>
      <Head>
        <title>{title || defaultTitle}</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <meta
          name="google-site-verification"
          content="ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE"
        />
        <meta name="description" content={description || defaultDescription} />
        {openGraphData.map((og: OpenGraphDataItem) => (
          <meta key={og.property || og.name} {...og} />
        ))}
      </Head>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()}>
            <CacheProvider value={emotionCache}>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  loaded={particlesLoaded}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tsparticles ISourceOptions type is incompatible with react-tsparticles prop types
                  options={particleOptions as any}
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
                <ErrorBoundary>
                  {/* @ts-expect-error React types version mismatch */}
                  <CookiesProvider>
                    <StakedTokenProvider>
                      <SystemModeProvider>
                        <ApiDataProvider>
                          <NotificationProvider>
                            <Header />
                            <ErrorBoundary>
                              <Component {...pageProps} />
                            </ErrorBoundary>
                            <Footer />
                            <ApiDataFetcher interval={30000} />
                          </NotificationProvider>
                        </ApiDataProvider>
                      </SystemModeProvider>
                    </StakedTokenProvider>
                  </CookiesProvider>
                </ErrorBoundary>
              </ThemeProvider>
            </CacheProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
