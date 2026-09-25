'use client';

/**
 * Landing-host client shell.
 *
 * The root layout renders this on the marketing host (cosmicsignature.com,
 * cosmicsignature.com) INSTEAD of the full-featured <Providers> used
 * on app.cosmicsignature.com. That keeps every Web3-specific dependency
 * — wagmi, viem, RainbowKit, WalletConnect, Coinbase SDK, MetaMask SDK —
 * out of the landing page's client bundle.
 *
 * What this shell DOES ship:
 *   - React Cookies context (for analytics consent banner).
 *   - Sonner toaster (small, used by a few shared components).
 *   - Global error handlers (reportError wiring).
 *   - Error boundary.
 *   - The landing header and footer, as top-level landmarks around every
 *     page's <main>, the home included.
 *
 * What this shell does NOT ship (compared to Providers):
 *   - wagmi / viem / @wagmi/core
 *   - @rainbow-me/rainbowkit (+ its CSS)
 *   - @walletconnect/* / @coinbase/wallet-sdk / @metamask/sdk
 *   - @tanstack/react-query (no API data fetching on landing)
 *   - AnchoredTokenProvider / SystemModeProvider / ApiDataProvider /
 *     NotificationProvider — all protocol-state contexts
 *
 * Any static import added here should be reviewed against that contract;
 * see app/__tests__/landing-shell.test.ts for the enforcement check.
 */

import { useEffect, type ReactNode } from 'react';
import { CookiesProvider } from 'react-cookie';
import { Toaster } from 'sonner';

import { NOTIFICATION_AUTO_HIDE_MS } from '@/config/constants';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { LandingHeader, type LandingSectionLabels } from '@/components/landing-v2/LandingHeader';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';

export function LandingShell({
  children,
  footer,
  sections,
}: {
  children: ReactNode;
  /**
   * The footer, rendered by the (server) landing layout: `<LandingFooter>`.
   * A slot keeps the footer's directory out of this client bundle.
   */
  footer: ReactNode;
  /** The home page's section names, linked from the header on every page. */
  sections?: LandingSectionLabels;
}) {
  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <CookiesProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={300}>
          <SkipLink />
          <div className="site-shell flex min-h-screen flex-col">
            <LandingHeader sections={sections} />
            <div className="min-w-0 flex-1">
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
            {footer}
          </div>
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              duration: NOTIFICATION_AUTO_HIDE_MS,
              className: 'border border-rule bg-popover shadow-float',
            }}
          />
        </TooltipProvider>
      </CookiesProvider>
    </ErrorBoundary>
  );
}
