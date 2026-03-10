import type { Metadata, Viewport } from 'next';
import { Suspense, type ReactNode } from 'react';
import Script from 'next/script';

import { logoImgUrl } from '@/utils';

import { GA_TRACKING_ID } from '@/utils/analytics';

import { Providers } from './providers';
import { Analytics } from './analytics';

import '@rainbow-me/rainbowkit/styles.css';
import '@/styles/global.css';

const defaultTitle = 'Cosmic Signature';
const defaultDescription = 'Cosmic Signature is a strategy bidding game.';

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
  openGraph: {
    type: 'website',
    siteName: defaultTitle,
    title: defaultTitle,
    description: defaultDescription,
    images: [logoImgUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [logoImgUrl],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15BFFD',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
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
        <Providers>{children}</Providers>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
