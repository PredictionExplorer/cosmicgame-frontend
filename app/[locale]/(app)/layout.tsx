import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { APP_ORIGIN, LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';
import { APP_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';
import {
  JsonLd,
  jsonLdInLanguage,
  websiteJsonLd,
  organizationJsonLd,
  webApplicationJsonLd,
} from '@/utils/jsonLd';

import { RootDocument } from '../../root-document';
import { createRootMetadata, rootViewport, openGraphLocale } from '../../root-metadata';

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
 * default locale with the path handled by the [...notFound] catch-all.
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
  // Chrome-scoped: only the namespaces the persistent shell (header, footer,
  // toasts, ...) needs are serialized here. Each page adds its own set via
  // <PageMessages>; without scoping the full ~300 KB catalog shipped in
  // every HTML document.
  const chromeMessages = pickMessages(await getMessages({ locale }), APP_CHROME_NAMESPACES);

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
      <NextIntlClientProvider messages={chromeMessages}>
        <Providers showAppChrome>{children}</Providers>
      </NextIntlClientProvider>
    </RootDocument>
  );
}
