import type { Metadata, Viewport } from 'next';
import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';
import { headers } from 'next/headers';

import { logoImgUrl } from '@/utils';

import { isLandingHost } from '@/lib/hostRouting';
import { GA_TRACKING_ID } from '@/utils/analytics';
import { JsonLd, websiteJsonLd, organizationJsonLd, webApplicationJsonLd } from '@/utils/jsonLd';

import { Providers } from './providers';
import { Analytics } from './analytics';

import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/global.css';

const defaultTitle = 'Cosmic Signature';
const defaultDescription =
  'Cosmic Signature is a strategy bidding game on the Arbitrum blockchain featuring generative NFT art inspired by the three-body problem, ETH prizes, staking rewards, and charitable giving.';

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
    'bidding game',
    'Arbitrum',
    'Ethereum',
    'generative art',
    'three-body problem',
    'staking',
    'crypto game',
    'NFT game',
    'ETH prizes',
    'blockchain game',
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
  const showAppChrome = !isLandingHost(host);

  return (
    <html lang="en">
      <head>
        <JsonLd data={[websiteJsonLd(), organizationJsonLd(), webApplicationJsonLd()]} />
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
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
        <Providers showAppChrome={showAppChrome}>{children}</Providers>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
