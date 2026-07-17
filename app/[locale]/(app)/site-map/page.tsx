import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import SiteMapPage from './SiteMapPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('meta');
  return createMetadata(t('siteMap.title'), t('siteMap.description'), undefined, '/site-map', {
    locale,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [meta, t] = await Promise.all([getTranslations('meta'), getTranslations('siteMap')]);
  const description = meta('siteMap.description');

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({
            name: t('page.jsonLdName'),
            description,
            url: localeHref(APP_ORIGIN, '/site-map', locale),
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
      <SiteMapPage />
    </>
  );
}
