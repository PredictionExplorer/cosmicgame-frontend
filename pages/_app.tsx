import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Web3ReactProvider } from '@web3-react/core';
import { useState, useEffect, useCallback } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';

// Correctly restore dynamic import for Web3ProviderNetwork
const Web3ProviderNetwork = dynamic(
  () => import('../components/Web3ProviderNetwork'),
  { ssr: false },
);

import Web3ReactManager from '../components/Web3ReactManager';
import Header from '../components/Header';
import Footer from '../components/Footer';
import createEmotionCache from '../cache/createEmotionCache';
import getLibrary from '../utils/getLibrary';
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

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const defaultTitle = "Cosmic Signature";
const defaultDescription = "Cosmic Signature is a strategy bidding game.";

interface OpenGraphDataItem {
  property?: string;
  name?: string;
  content: string;
}

const defaultOpenGraphData = [
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: defaultTitle },
  { property: "og:description", content: defaultDescription },
  { property: "og:title", content: defaultTitle },
  { property: "og:image", content: logoImgUrl },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: defaultTitle },
  { name: "twitter:description", content: defaultDescription },
  { name: "twitter:image", content: logoImgUrl },
];

const particleOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab',
      },
      onClick: {
        enable: false,
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.3,
        },
      },
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
    links: {
      color: '#ffffff',
      distance: 150,
      enable: true,
      opacity: 0.15,
      width: 1,
    },
    collisions: {
      enable: false,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: { default: 'out' },
      random: true,
      speed: 0.5,
      straight: false,
    },
    number: {
      density: { enable: true, area: 1000 },
      value: 30,
    },
    opacity: {
      value: {min: 0.1, max: 0.4},
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
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const { openGraphData = defaultOpenGraphData, title, description } = pageProps;
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // particlesInit function for the init prop
  const particlesInit = useCallback(async (engine: Engine) => {
    // console.log(engine);
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: any) => {
    // await console.log("Particles container loaded", container);
  }, []);

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
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
                <Particles
                  id="tsparticles"
                  init={particlesInit}
                  loaded={particlesLoaded}
                  options={particleOptions as any}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                  }}
                />
              <Web3ReactManager>
              <CookiesProvider>
                <StakedTokenProvider>
                  <SystemModeProvider>
                    <ApiDataProvider>
                      <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                        <Footer />
                        <ApiDataFetcher interval={30000} />
                      </NotificationProvider>
                    </ApiDataProvider>
                  </SystemModeProvider>
                </StakedTokenProvider>
              </CookiesProvider>
              </Web3ReactManager>
            </ThemeProvider>
          </CacheProvider>
        </Web3ProviderNetwork>
      </Web3ReactProvider>
    </>
  )
}

export default MyApp
