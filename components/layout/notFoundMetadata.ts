import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { documentTitle } from '@/utils/seo';

/**
 * Head tags for a missing page on either host: its own tab title ("Page not
 * found · Cosmic Signature") instead of the site default. The title is
 * absolute so the landing's title template cannot add the brand a second
 * time. The robots line overrides the layout's "index, follow", which would
 * otherwise contradict the `noindex` Next.js adds to every 404.
 *
 * The locale always comes from route params, never from request headers, so
 * a statically generated route stays static when it 404s.
 */
export async function notFoundMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'errors' });
  const title = t('notFound.title');
  return {
    title: { absolute: documentTitle(title) },
    description: t('notFound.description'),
    robots: { index: false, follow: true },
  };
}

/**
 * `generateMetadata` for a `not-found.tsx` under `[locale]`. Whatever calls
 * `notFound()` (a catch-all page, a segment layout that rejects an id, a
 * page's own `generateMetadata`), Next.js renders the head of the error from
 * the layouts plus the nearest not-found file, with that file's segment
 * params: the only head crawlers get with blocking metadata. The params carry
 * the locale, so no request header is read.
 */
export async function generateNotFoundMetadata({
  params,
}: {
  params?: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const locale = (await params)?.locale;
  return notFoundMetadata(
    locale && hasLocale(routing.locales, locale) ? locale : routing.defaultLocale,
  );
}
