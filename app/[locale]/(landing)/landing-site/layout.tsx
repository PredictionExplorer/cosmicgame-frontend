import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { getLandingContent } from '@/content/landing';

import { LANDING_ORIGIN } from '@/lib/hostRouting';
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

/**
 * Landing-site nested layout.
 *
 * The route group's root layout (`app/[locale]/(landing)/layout.tsx`) already
 * renders <LandingShell> (cookies, error boundaries, the header and footer)
 * around every marketing page. This nested layout only adds the home's page
 * background container. Landing-wide JSON-LD lives in that shared layout so
 * `/about`, `/learn/*`, the white paper and the quiz receive the same
 * entities.
 */
export default async function LandingLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground antialiased">
      {children}
    </div>
  );
}
