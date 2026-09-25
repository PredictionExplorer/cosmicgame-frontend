import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import {
  JsonLd,
  jsonLdInLanguage,
  websiteJsonLd,
  organizationJsonLd,
  webApplicationJsonLd,
} from '@/utils/jsonLd';

import { RootDocument } from '../../root-document';
import { createRootMetadata, rootViewport, openGraphLocale } from '../../root-metadata';

import { AppChrome } from './app-chrome';
import { webManifestPath } from './manifest.webmanifest/build-manifest';
import { Providers } from './providers';

// NOTE: '@rainbow-me/rainbowkit/styles.css' is intentionally imported
// inside providers.tsx (not here) so the landing route group never ships
// the RainbowKit stylesheet.

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport = rootViewport;

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('meta');
  const metadata = createRootMetadata(
    {
      defaultTitle: t('shared.defaultTitle'),
      defaultOgTitle: t('shared.defaultOgTitle'),
      defaultDescription: t('shared.defaultDescription'),
    },
    {
      origin: APP_ORIGIN,
      canonical: localeHref(APP_ORIGIN, '/', locale),
      manifest: webManifestPath(locale),
    },
  );
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, locale: openGraphLocale(locale) },
  };
}

/**
 * Root layout for the dApp route group (served on app.cosmicsignature.com).
 *
 * Reads no request headers — host routing is enforced by proxy.ts and the
 * locale arrives as a route param — so content routes in this group (FAQ,
 * How It Works, Terms, ...) can be statically generated and data routes can
 * use ISR (`revalidate`). `setRequestLocale` keeps next-intl compatible with
 * static rendering.
 *
 * The `hasLocale` guard is defense-in-depth: proxy.ts only ever rewrites to
 * configured locales, and unknown first segments (e.g. /foo) resolve as the
 * default locale with a path no route matches, which app/global-not-found.tsx
 * answers.
 */
export default async function AppRootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const seo = await getTranslations({ locale, namespace: 'seo' });
  const inLanguage = jsonLdInLanguage(locale);
  const landingUrl = localeHref(LANDING_ORIGIN, '/', locale);
  const appUrl = localeHref(APP_ORIGIN, '/', locale);
  const protocolDescription = seo('jsonLd.app.protocolDescription');

  return (
    <RootDocument
      locale={locale}
      headExtras={
        <JsonLd
          data={[
            websiteJsonLd({
              description: protocolDescription,
              inLanguage,
              url: landingUrl,
            }),
            organizationJsonLd({
              description: protocolDescription,
              url: landingUrl,
            }),
            webApplicationJsonLd({
              browserRequirements: seo('jsonLd.app.browserRequirements'),
              description: seo('jsonLd.app.webApplicationDescription'),
              inLanguage,
              url: appUrl,
            }),
          ]}
        />
      }
    >
      <AppChrome locale={locale} shell={Providers}>
        {children}
      </AppChrome>
    </RootDocument>
  );
}
