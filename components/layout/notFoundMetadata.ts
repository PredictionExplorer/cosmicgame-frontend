import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';

import { documentTitle } from '@/utils/seo';

/**
 * Head tags for the 404 page of either host: its own tab title
 * ("Page not found · Cosmic Signature") instead of the site default. The
 * title is absolute so the landing's title template cannot add the brand a
 * second time. The robots line overrides the layout's "index, follow", which
 * would otherwise contradict the `noindex` Next.js adds to every 404.
 */
export async function notFoundMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'errors' });
  const title = t('notFound.title');
  return {
    title: { absolute: documentTitle(title) },
    description: t('notFound.description'),
    robots: { index: false, follow: true },
  };
}
