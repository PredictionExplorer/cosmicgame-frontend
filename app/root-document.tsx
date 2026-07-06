import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';
import { Analytics as VercelAnalytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { clashDisplay, inter } from '@/lib/fonts';
import { GA_TRACKING_ID } from '@/utils/analytics';

import { Analytics } from './analytics';

import '@/styles/global.css';

/**
 * Shared `<html>`/`<body>` document rendered by BOTH root layouts —
 * `app/(app)/layout.tsx` and `app/(landing)/layout.tsx`.
 *
 * Neither layout reads request state (no `headers()` / `cookies()`), which is
 * what allows content routes to be statically generated and CDN-cached. Host
 * separation is enforced entirely at the edge by proxy.ts, so the layouts can
 * be resolved from the URL path alone.
 */
export function RootDocument({
  children,
  headExtras,
}: {
  children: ReactNode;
  /** Host-specific head content (e.g. JSON-LD blocks). */
  headExtras?: ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${clashDisplay.variable} ${inter.variable}`}
    >
      <head>
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
