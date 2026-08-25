import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, webPageJsonLd } from '@/utils/jsonLd';
import { createMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { STATISTICS_SECTIONS } from '../statistics-sections';
import { StatisticsPageIntro } from '../StatisticsPageIntro';

import PerformancePanel from './PerformancePanel';

const section = STATISTICS_SECTIONS.find((s) => s.slug === 'performance')!;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createMetadata(
    t('statisticsPerformance.title'),
    t('statisticsPerformance.description'),
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
  const inLanguage = locale === 'zh' ? 'zh-Hans' : 'en';

  return (
    <PageMessages namespaces={['marketing', 'statistics', 'tables']}>
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
        <StatisticsPageIntro eyebrow={t('intro.eyebrow')} title={title} description={description} />
        <PerformancePanel />
      </>
    </PageMessages>
  );
}
