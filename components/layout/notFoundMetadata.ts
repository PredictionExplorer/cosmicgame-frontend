import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { documentTitle } from '@/utils/seo';

/**
 * Head tags for a missing page on either host: its own tab title ("Page not
 * found · Cosmic Signature") instead of the site default. The title is
 * absolute so the landing's title template cannot add the brand a second
 * time. The robots line overrides the layout's "index, follow", which would
 * otherwise contradict the `noindex` Next.js adds to every 404.
 *
 * Return it from the `generateMetadata` of the page that calls `notFound()`
 * (the catch-all, or a page whose record is missing): Next.js resolves a
 * page's metadata independently of the `notFound()` its render throws, and
 * the client keeps that head once it renders the not-found boundary. The
 * locale comes from the route's params, never from request headers, so a
 * statically generated route stays static when it 404s.
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
