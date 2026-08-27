import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { formatId, getAssetsUrl } from '@/utils';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { getCstInfoSeed, getDashboardInfoSeed } from '@/services/api/server';
import {
  JsonLd,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  visualArtworkJsonLd,
} from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import GalleryPage from './GalleryPage';
import { GallerySeoSummary } from './GallerySeoSummary';

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Newest imprinted token, for the collection's featured-artwork JSON-LD.
 * Fail-safe: any API problem returns null and the node is simply omitted —
 * the seed helpers never fail the prerender.
 */
async function loadLatestImprint() {
  const dashboard = await getDashboardInfoSeed();
  const imprintedCount = dashboard?.MainStats?.NumCSTokenMints ?? 0;
  if (!Number.isFinite(imprintedCount) || imprintedCount <= 0) return null;
  const id = imprintedCount - 1;
  const info = await getCstInfoSeed(id);
  if (!info?.Seed) return null;
  return { id, seed: info.Seed };
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
  const [t, meta, common, detail, latestImprint] = await Promise.all([
    getTranslations({ locale, namespace: 'gallery' }),
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'detail' }),
    loadLatestImprint(),
  ]);
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <PageMessages namespaces={['detail', 'gallery', 'tables']}>
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
            // The collection's newest imprint as a licensed VisualArtwork, so
            // image/AI crawlers land on concrete art, not just a list page.
            ...(latestImprint
              ? [
                  visualArtworkJsonLd({
                    tokenId: latestImprint.id,
                    name: `Cosmic Signature ${formatId(latestImprint.id)}`,
                    description: detail('jsonLd.productDescription'),
                    imageUrl: getAssetsUrl(`cosmicsignature/0x${latestImprint.seed}.png`),
                    inLanguage,
                  }),
                ]
              : []),
          ]}
        />
        <GallerySeoSummary />
        <Suspense>
          <GalleryPage />
        </Suspense>
      </>
    </PageMessages>
  );
}
