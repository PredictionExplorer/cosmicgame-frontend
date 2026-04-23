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
  'Cosmic Signature is a procedural on-chain art protocol on Arbitrum where participants make gestures across a Performance Cycle; generative NFT art is inspired by the three-body problem. The protocol distributes ETH across allocation tracks, anchors Cosmic Signature NFTs for per-cycle shares, and forwards a portion to public goods (Protocol Guild).';

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
    'Arbitrum',
    'Ethereum',
    'generative art',
    'three-body problem',
    'NFT anchoring',
    'on-chain protocol',
    'Cosmic Signature NFT',
    'ERC-721',
    'RandomWalkNFT',
    'Cosmic Signature Token',
    'CST',
    'Stellar Selection',
    'Protocol Guild',
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
