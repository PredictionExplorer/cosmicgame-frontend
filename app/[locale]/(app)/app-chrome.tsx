import type { ComponentType, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import Footer from '@/components/layout/Footer';
import type { AppLocale } from '@/i18n/routing';
import { APP_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';

/** The client shell the chrome wraps a page in: `Providers`, or a lazy stand-in for it. */
export type AppShellComponent = ComponentType<{ footer: ReactNode; children: ReactNode }>;

/**
 * The app host's chrome around a page: the chrome-scoped messages, the
 * client shell with the header, and the server-rendered footer. The (app)
 * root layout renders it with `Providers`; the global 404
 * (app/global-not-found.tsx) with a lazily loaded `Providers`, so an unknown
 * URL on app.cosmicsignature.com gets the same header and footer as every
 * other app page. The shell is passed in rather than imported, so this
 * module adds no client code of its own to whoever renders it.
 */
export async function AppChrome({
  locale,
  shell: Shell,
  children,
}: {
  locale: AppLocale;
  shell: AppShellComponent;
  children: ReactNode;
}) {
  // Chrome-scoped: only the namespaces the persistent shell (header, footer,
  // toasts, ...) needs are serialized here. Each page adds its own set via
  // <PageMessages>; without scoping the full ~300 KB catalog shipped in
  // every HTML document.
  const chromeMessages = pickMessages(await getMessages({ locale }), APP_CHROME_NAMESPACES);
  return (
    <NextIntlClientProvider messages={chromeMessages}>
      <Shell footer={<Footer />}>{children}</Shell>
    </NextIntlClientProvider>
  );
}
