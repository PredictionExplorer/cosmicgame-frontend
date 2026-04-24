import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { landingContent } from '@/content/landing';

import { JsonLd, artProtocolJsonLd, organizationJsonLd, websiteJsonLd } from '@/utils/jsonLd';

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

/**
 * Landing-site nested layout.
 *
 * The root layout (app/layout.tsx) already renders <LandingShell> on the
 * marketing host, which provides React Cookies + Toaster + error
 * boundaries. This nested layout only adds landing-specific chrome:
 * JSON-LD blocks and the page background container.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd(), artProtocolJsonLd()]} />
      <div className="relative min-h-screen overflow-x-clip bg-deep-space text-stellar-white antialiased">
        {children}
      </div>
    </>
  );
}
