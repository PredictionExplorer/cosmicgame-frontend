'use client';

/**
 * Landing-host client shell.
 *
 * The root layout renders this on the marketing host (cosmicsignature.com,
 * www.cosmicsignature.com) INSTEAD of the full-featured <Providers> used
 * on app.cosmicsignature.com. That keeps every Web3-specific dependency
 * — wagmi, viem, RainbowKit, WalletConnect, Coinbase SDK, MetaMask SDK —
 * out of the landing page's client bundle.
 *
 * What this shell DOES ship:
 *   - React Cookies context (for analytics consent banner).
 *   - Sonner toaster (small, used by a few shared components).
 *   - Global error handlers (reportError wiring).
 *   - Error boundary.
 *
 * What this shell does NOT ship (compared to Providers):
 *   - wagmi / viem / @wagmi/core
 *   - @rainbow-me/rainbowkit (+ its CSS)
 *   - @walletconnect/* / @coinbase/wallet-sdk / @metamask/sdk
 *   - @tanstack/react-query (no API data fetching on landing)
 *   - StakedTokenProvider / SystemModeProvider / ApiDataProvider /
 *     NotificationProvider — all protocol-state contexts
 *   - tsparticles — the landing uses its own three.js / CSS background
 *
 * Any static import added here should be reviewed against that contract;
 * see app/__tests__/landing-shell.test.ts for the enforcement check.
 */

import { useEffect, type ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';

import { NOTIFICATION_AUTO_HIDE_MS } from '@/config/constants';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';

export function LandingShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <CookiesProvider>
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: NOTIFICATION_AUTO_HIDE_MS,
            className: 'bg-card text-foreground border-border',
          }}
        />
      </CookiesProvider>
    </ErrorBoundary>
  );
}
