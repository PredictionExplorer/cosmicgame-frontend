import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, datasetJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { DashboardQuerySeed } from '../QuerySeed';

import { StatisticsSeoSummary } from './StatisticsSeoSummary';
import StatisticsHubPanel from './StatisticsHubPanel';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('statistics.title'),
    t('statistics.description'),
    undefined,
    '/statistics',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'statistics' });
  const inLanguage = jsonLdInLanguage(locale);
  const url = localeHref(APP_ORIGIN, '/statistics', locale);

  return (
    <PageMessages namespaces={['statistics', 'tables']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: t('hub.jsonLd.webPageName'),
              description: t('hub.jsonLd.webPageDescription'),
              url,
              inLanguage,
            }),
            datasetJsonLd({
              name: t('hub.jsonLd.datasetName'),
              description: t('hub.jsonLd.datasetDescription'),
              url,
              dateModified: new Date().toISOString(),
              inLanguage,
            }),
          ]}
        />
        <DashboardQuerySeed>
          <StatisticsSeoSummary />
          <StatisticsHubPanel />
        </DashboardQuerySeed>
      </>
    </PageMessages>
  );
}
