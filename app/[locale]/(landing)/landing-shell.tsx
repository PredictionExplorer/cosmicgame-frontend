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
import { MotionConfig } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { LandingContent } from '@/content/landing/types';

import { NOTIFICATION_AUTO_HIDE_MS } from '@/config/constants';
import ErrorBoundary from '@/components/layout/ErrorBoundary';
import { LandingFooter } from '@/components/landing-v2/LandingFooter';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { BrandMark } from '@/components/layout/BrandMark';
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Link, usePathname } from '@/i18n/navigation';
import { APP_ORIGIN, localeHref, publicPathname } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { installGlobalErrorHandlers } from '@/utils/globalErrorHandlers';

export function LandingShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer: LandingContent['footer'];
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const footerT = useTranslations('footer');
  const landingT = useTranslations('landing');
  // The home composition includes its own Hero header and LandingFooter.
  // Subpages share the same complete navigation and footer through this shell.
  const publicPath = publicPathname(pathname);
  const showSiteChrome = publicPath !== '/';
  const navigation = [
    { href: '/about', label: footerT('links.about') },
    { href: '/learn', label: footerT('links.learn') },
    { href: '/white-paper', label: footerT('links.whitePaper') },
  ];

  useEffect(() => {
    installGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <CookiesProvider>
          <TooltipProvider delayDuration={200} skipDelayDuration={300}>
            <SkipLink />
            <div className="site-shell flex min-h-screen flex-col">
              {showSiteChrome ? (
                <header className="relative z-30 bg-background/90">
                  <div className="site-container flex min-h-21 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-white/10 py-4 lg:flex-nowrap lg:py-0">
                    <Link
                      href="/"
                      aria-label={t('brand.homeLabel')}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2.5 font-display text-base font-semibold tracking-tight text-foreground no-underline sm:text-lg"
                    >
                      <BrandMark className="h-8 w-8 shrink-0 text-primary" />
                      <span>
                        Cosmic <span className="text-primary">Signature</span>
                      </span>
                    </Link>
                    <nav
                      aria-label={t('primaryLabel')}
                      className="order-3 flex w-full flex-wrap items-center gap-x-5 gap-y-1 lg:order-none lg:w-auto lg:justify-center"
                    >
                      {navigation.map((item) => {
                        const active =
                          publicPath === item.href || publicPath.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'inline-flex min-h-11 items-center border-b text-xs no-underline transition-colors hover:text-foreground sm:text-sm',
                              active
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground',
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                      <a
                        href={localeHref(APP_ORIGIN, '/', locale)}
                        className="inline-flex min-h-11 items-center gap-1.5 text-xs text-primary no-underline transition-colors hover:text-foreground sm:text-sm"
                      >
                        {landingT('timer.openLiveCycle')}
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      </a>
                    </nav>
                    <LanguageSwitcher variant="compact" className="shrink-0" />
                  </div>
                </header>
              ) : null}
              <div className="min-w-0 flex-1">
                <ErrorBoundary>{children}</ErrorBoundary>
              </div>
              {showSiteChrome ? <LandingFooter footer={footer} /> : null}
            </div>
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
      </MotionConfig>
    </ErrorBoundary>
  );
}
