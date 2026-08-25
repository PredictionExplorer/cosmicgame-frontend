import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

import type { Namespace } from '@/i18n/request';
import { APP_CHROME_NAMESPACES, pickMessages } from '@/lib/i18n/clientMessages';

/**
 * Per-page message scoping (server component).
 *
 * Wrap a page's content and declare which namespaces its client tree uses;
 * only those (plus the app chrome set — nested next-intl providers replace
 * rather than merge messages) are serialized into the HTML. The layout's
 * provider covers the shell around the page; this one covers the page.
 *
 * The declared list is verified by the i18n-scoping jest walker, which
 * fails with the exact missing namespaces if a page under-declares.
 */
export async function PageMessages({
  namespaces,
  children,
}: {
  namespaces: readonly Namespace[];
  children: ReactNode;
}) {
  const all = await getMessages();
  const scoped = pickMessages(all, [...APP_CHROME_NAMESPACES, ...namespaces]);
  return <NextIntlClientProvider messages={scoped}>{children}</NextIntlClientProvider>;
}
