import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import Footer from '@/components/layout/Footer';
import type { AppLocale } from '@/i18n/routing';
import { APP_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';

import { Providers } from './providers';

/**
 * The app host's chrome around a page: the chrome-scoped messages, the
 * client providers with the header, and the server-rendered footer. The
 * (app) root layout and the global 404 (app/global-not-found.tsx) both
 * render it, so an unknown URL on app.cosmicsignature.com gets the same
 * header and footer as every other app page.
 */
export async function AppChrome({ locale, children }: { locale: AppLocale; children: ReactNode }) {
  // Chrome-scoped: only the namespaces the persistent shell (header, footer,
  // toasts, ...) needs are serialized here. Each page adds its own set via
  // <PageMessages>; without scoping the full ~300 KB catalog shipped in
  // every HTML document.
  const chromeMessages = pickMessages(await getMessages({ locale }), APP_CHROME_NAMESPACES);
  return (
    <NextIntlClientProvider messages={chromeMessages}>
      <Providers footer={<Footer />}>{children}</Providers>
    </NextIntlClientProvider>
  );
}
