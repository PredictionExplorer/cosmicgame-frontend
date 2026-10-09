import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getLearnContent } from '@/content/learn';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import SiteMapPage from './SiteMapPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('siteMap.title'),
    t('siteMap.description'),
    undefined,
    '/site-map',
    { locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, t] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'siteMap' }),
  ]);
  const description = meta('siteMap.description');
  const inLanguage = jsonLdInLanguage(locale);
  // The site map lists only each guide's slug and title, not its body.
  const articles = getLearnContent(locale).articles.map(({ slug, h1 }) => ({ slug, title: h1 }));

  return (
    <PageMessages namespaces={['siteMap']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: t('page.jsonLdName'),
              description,
              url: localeHref(APP_ORIGIN, '/site-map', locale),
              inLanguage,
            }),
            breadcrumbJsonLd(
              [
                { name: t('page.home'), path: '/' },
                { name: t('page.title'), path: '/site-map' },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <SiteMapPage articles={articles} />
      </>
    </PageMessages>
  );
}
