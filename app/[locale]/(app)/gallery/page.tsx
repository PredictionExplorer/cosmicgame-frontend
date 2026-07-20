import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, collectionPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import GalleryPage from './GalleryPage';
import { GallerySeoSummary } from './GallerySeoSummary';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(t('gallery.title'), t('gallery.description'), undefined, '/gallery', {
    locale,
  });
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, meta, common] = await Promise.all([
    getTranslations({ locale, namespace: 'gallery' }),
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <>
      <JsonLd
        data={[
          collectionPageJsonLd({
            name: t('jsonLd.name'),
            // Single source of truth: the CollectionPage description is the
            // meta description, so it is read from the meta namespace instead
            // of being duplicated into gallery.json.
            description: meta('gallery.description'),
            url: localeHref(APP_ORIGIN, '/gallery', locale),
            inLanguage,
          }),
          breadcrumbJsonLd(
            [
              { name: common('breadcrumbs.home'), path: '/' },
              { name: common('breadcrumbs.gallery'), path: '/gallery' },
            ],
            localeHref(APP_ORIGIN, '/', locale),
          ),
        ]}
      />
      <GallerySeoSummary />
      <Suspense>
        <GalleryPage />
      </Suspense>
    </>
  );
}
