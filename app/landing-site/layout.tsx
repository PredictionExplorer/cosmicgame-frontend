import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { landingContent } from '@/content/landing';

import { JsonLd, artProtocolJsonLd, organizationJsonLd, websiteJsonLd } from '@/utils/jsonLd';

import { LandingProviders } from './providers';

const { meta } = landingContent;

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cosmicsignature.com'),
  title: { default: meta.title, template: '%s \u00b7 Cosmic Signature' },
  description: meta.description,
  keywords: [...meta.keywords],
  alternates: { canonical: 'https://www.cosmicsignature.com' },
  openGraph: {
    type: 'website',
    siteName: 'Cosmic Signature',
    title: meta.title,
    description: meta.description,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CosmicSignature',
    title: meta.title,
    description: meta.description,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0B1028',
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <LandingProviders>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(), artProtocolJsonLd()]} />
      <div className="relative min-h-screen overflow-x-clip bg-deep-space text-stellar-white antialiased">
        {children}
      </div>
    </LandingProviders>
  );
}
