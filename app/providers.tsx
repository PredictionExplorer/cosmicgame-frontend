'use client';

import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { CookiesProvider } from 'react-cookie';

import { wagmiConfig } from '../config/wagmi';
import createEmotionCache from '../utils/createEmotionCache';
import theme from '../config/styles';
import { StakedTokenProvider } from '../contexts/StakedTokenContext';
import { SystemModeProvider } from '../contexts/SystemModeContext';
import { ApiDataProvider } from '../contexts/ApiDataContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import ApiDataFetcher from '../contexts/ApiDataFetcher';

const emotionCache = createEmotionCache();

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <CacheProvider value={emotionCache}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {/* @ts-expect-error React 19 type mismatch with react-cookie */}
              <CookiesProvider>
                <StakedTokenProvider>
                  <SystemModeProvider>
                    <ApiDataProvider>
                      <NotificationProvider>
                        {children}
                        <ApiDataFetcher interval={30000} />
                      </NotificationProvider>
                    </ApiDataProvider>
                  </SystemModeProvider>
                </StakedTokenProvider>
              </CookiesProvider>
            </ThemeProvider>
          </CacheProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
