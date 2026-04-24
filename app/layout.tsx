import type { Metadata, Viewport } from 'next';
import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';

import { logoImgUrl } from '@/utils';

import { isLandingHost } from '@/lib/hostRouting';
import { clashDisplay, inter } from '@/lib/fonts';
import { GA_TRACKING_ID } from '@/utils/analytics';
import { JsonLd, websiteJsonLd, organizationJsonLd, webApplicationJsonLd } from '@/utils/jsonLd';

import { Providers } from './providers';
import { LandingShell } from './landing-shell';
import { Analytics } from './analytics';

// NOTE: '@rainbow-me/rainbowkit/styles.css' is intentionally imported
// inside app/providers.tsx (not here) so the landing host never ships
// the RainbowKit stylesheet.
import '@/styles/global.css';

const defaultTitle = 'Cosmic Signature';
const defaultDescription =
  'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild.';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cosmicsignature.com'),
  title: { default: defaultTitle, template: '%s' },
  description: defaultDescription,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
  },
  verification: {
    google: 'ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE',
  },
  alternates: {
    canonical: 'https://www.cosmicsignature.com',
  },
  openGraph: {
    type: 'website',
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [logoImgUrl],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CosmicSignature',
    title: defaultTitle,
    description: defaultDescription,
    images: [logoImgUrl],
  },
  keywords: [
    'Cosmic Signature',
    'NFT',
    'procedural art protocol',
    'Arbitrum',
    'Ethereum',
    'generative art',
    'three-body problem',
    'anchoring',
    'CC0',
    'formally verified',
    'on-chain art',
    'public goods',
    'Protocol Guild',
    'ERC-721',
    'RandomWalkNFT',
    'Cosmic Signature Token',
    'CST',
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15BFFD',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const isLanding = isLandingHost(host);

  return (
    <html lang="en" className={`${clashDisplay.variable} ${inter.variable}`}>
      <head>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd(), webApplicationJsonLd()]} />
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
        <Script id="paint-worklet" strategy="afterInteractive">
          {`
            if ('paintWorklet' in CSS) {
              CSS.paintWorklet.addModule('/paint-worklet.js');
            }
          `}
        </Script>
      </head>
      <body>
        {isLanding ? (
          <LandingShell>{children}</LandingShell>
        ) : (
          <Providers showAppChrome>{children}</Providers>
        )}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
