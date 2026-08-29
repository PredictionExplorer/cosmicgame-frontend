import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PageMessages } from '@/components/i18n/PageMessages';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { getCstInfoSeed, getDashboardInfoSeed } from '@/services/api/server';
import type { CSTTokenInfo, DashboardInfo } from '@/services/api';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';

import ExperimentalHomePage from './ExperimentalHomePage';

export const revalidate = 15;

interface PageProps {
  params: Promise<{ locale: string }>;
}

interface InitialBannerToken {
  id: number;
  info: CSTTokenInfo;
}

async function pickInitialBannerToken(
  dashboard: DashboardInfo | null,
): Promise<InitialBannerToken | null> {
  const imprintedCount = dashboard?.MainStats?.NumCSTokenMints ?? 0;
  if (!Number.isFinite(imprintedCount) || imprintedCount <= 0) return null;

  const id = Math.floor(Math.random() * imprintedCount);
  const info = await getCstInfoSeed(id);
  return info?.Seed ? { id, info } : null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'meta' });

  return createMetadata(
    t('experimentalUi.title'),
    t('experimentalUi.description'),
    undefined,
    '/experimental-ui',
    { index: false, locale },
  );
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const initialDashboardData = await getDashboardInfoSeed();
  const initialBannerToken = await pickInitialBannerToken(initialDashboardData);
  const [meta, experiment] = await Promise.all([
    getTranslations({ locale, namespace: 'meta' }),
    getTranslations({ locale, namespace: 'home' }),
  ]);
  const description = meta('experimentalUi.description');
  const pageUrl = localeHref(APP_ORIGIN, '/experimental-ui', locale);
  const localizedOrigin = localeHref(APP_ORIGIN, '/', locale);

  return (
    <PageMessages namespaces={['currentCycle', 'detail', 'home', 'statistics', 'tables']}>
      <JsonLd
        data={[
          webPageJsonLd({
            name: meta('experimentalUi.title'),
            description,
            url: pageUrl,
            inLanguage: locale === 'zh' ? 'zh-Hans' : 'en',
          }),
          breadcrumbJsonLd(
            [
              { name: 'Cosmic Signature', path: '/' },
              { name: experiment('deck.experimentalUi'), path: '/experimental-ui' },
            ],
            localizedOrigin,
          ),
        ]}
      />
      <ExperimentalHomePage
        initialDashboardData={initialDashboardData}
        initialBannerToken={initialBannerToken}
      />
    </PageMessages>
  );
}
