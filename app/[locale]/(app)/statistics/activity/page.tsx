import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { capCacheWindow } from '@/lib/cacheWindow';
import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { QuerySeed } from '../../QuerySeed';
import { STATISTICS_SECTIONS } from '../statistics-sections';
import { StatisticsPageIntro } from '../StatisticsPageIntro';

import ActivityPanel from './ActivityPanel';
import { readActivity } from './activityReads';

const section = STATISTICS_SECTIONS.find((s) => s.slug === 'activity')!;

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
    t('statisticsActivity.title'),
    t('statisticsActivity.description'),
    undefined,
    section.href,
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'statistics' });
  const title = t(`navigation.${section.messageKey}.title`);
  const description = t(`navigation.${section.messageKey}.description`);
  const inLanguage = jsonLdInLanguage(locale);
  // Read on the server, so the all-time sections' figures are the first HTML.
  const { seeds, dashboard, cacheWindow } = await readActivity();
  await capCacheWindow(cacheWindow);

  return (
    <PageMessages namespaces={['statistics', 'tables']}>
      <>
        <JsonLd
          data={[
            webPageJsonLd({
              name: title,
              description,
              url: localeHref(APP_ORIGIN, section.href, locale),
              inLanguage,
            }),
            breadcrumbJsonLd(
              [
                { name: t('breadcrumbs.statistics'), path: '/statistics' },
                { name: t(`navigation.${section.messageKey}.label`), path: section.href },
              ],
              localeHref(APP_ORIGIN, '/', locale),
            ),
          ]}
        />
        <StatisticsPageIntro title={title} description={description} />
        <QuerySeed seeds={seeds}>
          <ActivityPanel initialDashboard={dashboard} />
        </QuerySeed>
      </>
    </PageMessages>
  );
}
