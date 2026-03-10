import type { Metadata, Viewport } from 'next';
import Script from 'next/script';

import { inter, clashDisplay } from '../config/fonts';
import { GA_TRACKING_ID } from '../utils/analytics';
import { logoImgUrl } from '../utils';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ErrorBoundary from '../components/layout/ErrorBoundary';

import ParticlesBg from './particles-bg';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Cosmic Signature',
    template: '%s | Cosmic Signature',
  },
  description: 'Cosmic Signature is a strategy bidding game.',
  openGraph: {
    type: 'website',
    siteName: 'Cosmic Signature',
    title: 'Cosmic Signature',
    description: 'Cosmic Signature is a strategy bidding game.',
    images: [logoImgUrl],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmic Signature',
    description: 'Cosmic Signature is a strategy bidding game.',
    images: [logoImgUrl],
  },
  verification: {
    google: 'ZUw5gzqw7CFIEZgCJ2pLy-MhDe7Fdotpc31fS75v3dE',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15BFFD',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${clashDisplay.variable}`}>
      <head>
        {GA_TRACKING_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <Script id="paint-worklet" strategy="beforeInteractive">
          {`
            if (typeof CSS !== 'undefined' && 'paintWorklet' in CSS) {
              CSS.paintWorklet.addModule('/paint-worklet.js');
            }
          `}
        </Script>
      </head>
      <body>
        <Providers>
          <ParticlesBg />
          <ErrorBoundary>
            <Header />
            <ErrorBoundary>{children}</ErrorBoundary>
            <Footer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
