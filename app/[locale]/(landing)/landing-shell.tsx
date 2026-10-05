'use client';

/**
 * Landing-host client shell.
 *
 * The marketing route group's root layout (`app/[locale]/(landing)/layout.tsx`)
 * renders this on cosmicsignature.com INSTEAD of the full-featured
 * <Providers> the app group renders on app.cosmicsignature.com. That keeps
 * every Web3-specific dependency — wagmi, viem, RainbowKit, WalletConnect,
 * Coinbase SDK, MetaMask SDK — out of the landing's client bundle.
 *
 * What this shell DOES ship:
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
 * app/[locale]/(app)/__tests__/landing-shell-no-web3.test.ts enforces it for
 * this shell, every landing route file and every landing client island.
 *
 * No toaster: nothing on the landing host raises a toast (sonner is used
 * only by the app's notification and transaction flows), so shipping one
 * would add dead client code and an unlabelled, English-only live region.
 */

import { useEffect, type ReactNode } from 'react';

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
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <SkipLink />
        <div className="site-shell flex min-h-screen flex-col">
          <LandingHeader sections={sections} />
          <div className="min-w-0 flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
          {footer}
        </div>
      </TooltipProvider>
    </ErrorBoundary>
  );
}
