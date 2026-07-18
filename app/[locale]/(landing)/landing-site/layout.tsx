import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, artProtocolJsonLd, organizationJsonLd, websiteJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const { meta } = getLandingContent(locale);
  const metadata = createMetadata(meta.title, meta.description, undefined, '/', {
    canonicalHost: 'landing',
    locale,
  });

  return {
    ...metadata,
    metadataBase: new URL(LANDING_ORIGIN),
    title: { default: meta.title, template: '%s \u00b7 Cosmic Signature' },
    keywords: [...meta.keywords],
    openGraph: {
      ...metadata.openGraph,
      type: 'website',
      siteName: 'Cosmic Signature',
    },
    twitter: {
      ...metadata.twitter,
      site: '@CosmicSignature',
    },
  };
}

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
export default async function LandingLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { meta } = getLandingContent(locale);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';
  const landingUrl = localeHref(LANDING_ORIGIN, '/', locale);

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd({
            description: meta.description,
            inLanguage,
            url: landingUrl,
            searchUrlTemplate: `${localeHref(APP_ORIGIN, '/gallery', locale)}?search={search_term_string}`,
          }),
          organizationJsonLd({
            description: meta.description,
            inLanguage,
            url: landingUrl,
          }),
          artProtocolJsonLd({
            description: meta.description,
            inLanguage,
            keywords: meta.keywords,
            url: landingUrl,
          }),
        ]}
      />
      <div className="relative min-h-screen overflow-x-clip bg-deep-space text-stellar-white antialiased">
        {children}
      </div>
    </>
  );
}
