import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { pickMessages } from '@/lib/i18n/clientMessages';

import { RootDocument } from '../../root-document';
import { createRootMetadata, rootViewport, openGraphLocale } from '../../root-metadata';

import { EMBED_NAMESPACES } from './embedMessages';
import { EmbedProviders } from './EmbedProviders';

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
    // An embed is a fragment of the app, never a page to index.
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
    openGraph: { ...metadata.openGraph, locale: openGraphLocale(locale) },
  };
}

/**
 * Root layout for embeds (`/embed/...` on app.cosmicsignature.com): one
 * artifact, such as a cycle's Endurance timeline, in a window of its own or
 * a third-party iframe. It shares the document (theme, fonts, analytics)
 * with the app but not the app's shell: no header or footer, no wallet
 * stack, and only the message namespaces an embed reads. Moving between an
 * embed and the app is a full page load, which suits a link that opens in a
 * new window.
 */
export default async function EmbedRootLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = pickMessages(await getMessages({ locale }), EMBED_NAMESPACES);

  return (
    <RootDocument locale={locale}>
      <NextIntlClientProvider messages={messages}>
        <EmbedProviders>{children}</EmbedProviders>
      </NextIntlClientProvider>
    </RootDocument>
  );
}
