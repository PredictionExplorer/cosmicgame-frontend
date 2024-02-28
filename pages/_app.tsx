import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Web3ReactProvider } from '@web3-react/core'

const Web3ProviderNetwork = dynamic(
  () => import('../components/Web3ProviderNetwork'),
  { ssr: false },
)

import Web3ReactManager from '../components/Web3ReactManager'
import Header from '../components/Header'
import Footer from '../components/Footer'

import createEmotionCache from '../cache/createEmotionCache'
import getLibrary from '../utils/getLibrary'
import theme from '../config/styles'
import { formatId } from '../utils'

import '../styles/global.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import * as ga from '../utils/analytics'
import { ApiDataProvider } from '../contexts/ApiDataContext'
import ApiDataFetcher from '../contexts/ApiDataFetcher'
import { CookiesProvider } from 'react-cookie'
import { StakedTokenProvider } from '../contexts/StakedTokenContext'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props
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
  const canonicalUrl = (`https://www.randomwalknft.com` + (router.asPath === "/" ? "": router.asPath)).split("?")[0];

  return (
    <>
      <Head>
        <title>Cosmic Signature</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content={theme.palette.primary.main} />
        <meta
          name="google-site-verification"
          content="ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE"
        />
        <meta
          name="description"
          content="Programmatically generated CosmicSignature image and video NFTs. ETH spent on minting goes back to the minters."
        />
        <link rel="canonical" href={canonicalUrl} />
        {pageProps.nft && (
          <>
            <meta
              property="og:title"
              content={`CosmicSignature NFT: Details for ${formatId(
                pageProps.nft.TokenId,
              )}`}
            />
            <meta property="og:image" content={pageProps.nft.black_image_thumb_url} />
            <meta
              property="og:description"
              content={`Programmatically generated CosmicSignature image and video NFTs. ETH spent on minting goes back to the minters. These are the details for ${formatId(
                pageProps.nft.TokenId,
              )}`}
            />

            <meta name="twitter:card" content="summary" />
            <meta
              name="twitter:title"
              content={`CosmicSignature NFT: Details for ${formatId(
                pageProps.nft.TokenId,
              )}`}
            />
            <meta
              name="twitter:image"
              content={pageProps.nft.black_image_thumb_url}
            />
            <meta
              name="twitter:description"
              content={`Programmatically generated CosmicSignature image and video NFTs. ETH spent on minting goes back to the minters. These are the details for ${formatId(
                pageProps.nft.TokenId,
              )}`}
            />
          </>
        )}
      </Head>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ProviderNetwork getLibrary={getLibrary}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Web3ReactManager>
              <CookiesProvider>
                <StakedTokenProvider>
                  <ApiDataProvider>
                    <Header />
                    <Component {...pageProps} />
                    <Footer />
                    <ApiDataFetcher interval={30000} />
                  </ApiDataProvider>
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
