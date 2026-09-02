import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { networkConfig } from '@/config/networks';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, type AppLocale } from '@/i18n/routing';
import { clashDisplay, inter, notoSansSC, onest } from '@/lib/fonts';
import { apiBaseUrls } from '@/lib/serverRotation';
import { GA_TRACKING_ID } from '@/utils/analytics';

import { Analytics } from './analytics';

import '@/styles/global.css';

/**
 * Candidate NFT-media origins, known at build time (env-inlined). Artwork now
 * leads both home pages, so warming the TLS connection to every rotation
 * candidate shaves the first image's latency regardless of which origin the
 * client's hourly rotation slot picks. The list is 1–2 origins in practice.
 */
const MEDIA_PRECONNECT_ORIGINS: string[] = Array.from(
  new Set(
    [...apiBaseUrls, networkConfig.nftApiUrl || '']
      .map((url) => {
        try {
          return new URL(url).origin;
        } catch {
          return '';
        }
      })
      .filter(Boolean),
  ),
);

/**
 * Shared `<html>`/`<body>` document rendered by BOTH root layouts —
 * `app/[locale]/(app)/layout.tsx` and `app/[locale]/(landing)/layout.tsx`.
 *
 * Neither layout reads request state (no `headers()` / `cookies()`), which is
 * what allows content routes to be statically generated and CDN-cached. Host
 * separation is enforced entirely at the edge by proxy.ts, and the locale
 * arrives as a route param, so the layouts can be resolved from the URL path
 * alone.
 */
export function RootDocument({
  children,
  headExtras,
  locale = routing.defaultLocale,
}: {
  children: ReactNode;
  /** Host-specific head content (e.g. JSON-LD blocks). */
  headExtras?: ReactNode;
  /** App locale from the [locale] segment; also selects `<html dir>`. */
  locale?: AppLocale;
}) {
  return (
    <html
      lang={locale}
      dir={getLocaleConfig(locale).textDirection}
      data-scroll-behavior="smooth"
      className={`${clashDisplay.variable} ${inter.variable} ${notoSansSC.variable} ${onest.variable}`}
    >
      <head>
        {/* No `crossOrigin`: artwork loads as plain <img> requests (no CORS),
            and a crossorigin preconnect would warm the wrong connection. */}
        {MEDIA_PRECONNECT_ORIGINS.map((origin) => (
          <link key={origin} rel="preconnect" href={origin} />
        ))}
        {headExtras}
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="lazyOnload"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
              `}
            </Script>
          </>
        )}
      </head>
      <body>
        {children}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        <VercelAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
