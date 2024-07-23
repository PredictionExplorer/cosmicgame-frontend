import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { Web3ReactProvider } from '@web3-react/core';

const Web3ProviderNetwork = dynamic(
  () => import('../components/Web3ProviderNetwork'),
  { ssr: false },
)

import Web3ReactManager from '../components/Web3ReactManager';
import Header from '../components/Header';
import Footer from '../components/Footer';

import createEmotionCache from '../cache/createEmotionCache';
import getLibrary from '../utils/getLibrary';
import theme from '../config/styles';

import '../styles/global.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import * as ga from '../utils/analytics';
import { ApiDataProvider } from '../contexts/ApiDataContext';
import ApiDataFetcher from '../contexts/ApiDataFetcher';
import { CookiesProvider } from 'react-cookie';
import { StakedTokenProvider } from '../contexts/StakedTokenContext';
import { SystemModeProvider } from '../contexts/SystemModeContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

const defaultTitle = "Cosmic Signature";
const defaultDescription = "Cosmic Signature is a strategy bidding game.";
const defaultImage = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

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
  { property: "og:image", content: defaultImage },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: defaultTitle },
  { name: "twitter:description", content: defaultDescription },
  { name: "twitter:image", content: defaultImage },
];


function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
  const { openGraphData = defaultOpenGraphData, title, description } = pageProps;
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      ga.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

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
