import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';

import { RootDocument } from '../../root-document';
import { createRootMetadata, rootViewport, openGraphLocale } from '../../root-metadata';

import { LandingShell } from './landing-shell';

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
  const metadata = createRootMetadata({
    defaultTitle: t('shared.defaultTitle'),
    defaultOgTitle: t('shared.defaultOgTitle'),
    defaultDescription: t('shared.defaultDescription'),
  });
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, locale: openGraphLocale(locale) },
  };
}

/**
 * Root layout for the marketing route group (cosmicsignature.com):
 * `/landing-site` (rewritten from `/` by proxy.ts), `/about`, and `/learn`.
 *
 * Ships the lightweight LandingShell instead of the Web3 Providers tree so
 * no wallet dependency reaches the landing bundle (enforced by
 * app/[locale]/(app)/__tests__/landing-shell-no-web3.test.ts). Reads no
 * request state — the locale arrives as a route param — so every route in
 * this group is statically generated.
 */
export default async function LandingRootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <RootDocument locale={locale}>
      <NextIntlClientProvider>
        <LandingShell>{children}</LandingShell>
      </NextIntlClientProvider>
    </RootDocument>
  );
}
