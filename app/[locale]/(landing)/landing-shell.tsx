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
 *
 * What this shell does NOT ship (compared to Providers):
 *   - wagmi / viem / @wagmi/core
 *   - @rainbow-me/rainbowkit (+ its CSS)
 *   - @walletconnect/* / @coinbase/wallet-sdk / @metamask/sdk
 *   - @tanstack/react-query (no API data fetching on landing)
 *   - AnchoredTokenProvider / SystemModeProvider / ApiDataProvider /
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
import { LanguageDirectory } from '@/components/layout/LanguageDirectory';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePathname } from '@/i18n/navigation';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';

export function LandingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The landing home brings its own header pill and footer directory
  // (Hero, LandingFooter); every other marketing page gets the utility pill
  // top-right and the crawlable language directory as its footer.
  const showUtilityChrome = pathname !== '/' && pathname !== '/landing-site';

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <CookiesProvider>
        <TooltipProvider delayDuration={200} skipDelayDuration={300}>
          <SkipLink />
          {showUtilityChrome ? (
            <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
              <LanguageSwitcher />
            </div>
          ) : null}
          <ErrorBoundary>{children}</ErrorBoundary>
          {showUtilityChrome ? (
            <footer className="relative mx-auto w-full max-w-6xl px-6 pb-12">
              <div className="border-t border-white/10 pt-6">
                <LanguageDirectory />
              </div>
            </footer>
          ) : null}
          <Toaster
            position="top-right"
            theme="dark"
            richColors
            closeButton
            toastOptions={{
              duration: NOTIFICATION_AUTO_HIDE_MS,
              className:
                'border border-white/[0.08] bg-card/95 backdrop-blur-md shadow-[var(--elevation-3)]',
            }}
          />
        </TooltipProvider>
      </CookiesProvider>
    </ErrorBoundary>
  );
}
