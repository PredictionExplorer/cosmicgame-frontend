import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { APP_ORIGIN, localeHref } from '@/lib/hostRouting';
import { JsonLd, breadcrumbJsonLd, jsonLdInLanguage, webPageJsonLd } from '@/utils/jsonLd';
import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { STATISTICS_SECTIONS } from '../statistics-sections';
import { readDashboard } from '../../publicDataReads';
import { StatisticsPageIntro } from '../StatisticsPageIntro';
import { ActiveAnchorHoldersFigure, DashboardCountFigure } from '../StatisticsFigures';
import { dashboardCount, type DashboardCountMetric } from '../dashboardCounts';

import ParticipationPanel from './ParticipationPanel';

const section = STATISTICS_SECTIONS.find((s) => s.slug === 'participation')!;

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
    t('statisticsParticipation.title'),
    t('statisticsParticipation.description'),
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
  const dashboard = await readDashboard();
  const seed = (metric: DashboardCountMetric) =>
    dashboard.data ? dashboardCount(dashboard.data, metric) : undefined;

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
        <StatisticsPageIntro
          title={title}
          description={description}
          figures={[
            {
              id: 'uniqueParticipants',
              label: t('metrics.uniqueParticipants.label'),
              info: t('metrics.uniqueParticipants.tooltip'),
              value: (
                <DashboardCountFigure
                  metric="uniqueParticipants"
                  seed={seed('uniqueParticipants')}
                />
              ),
            },
            {
              id: 'uniqueRecipients',
              label: t('metrics.uniqueRecipients.label'),
              info: t('metrics.uniqueRecipients.tooltip'),
              value: (
                <DashboardCountFigure metric="uniqueRecipients" seed={seed('uniqueRecipients')} />
              ),
            },
            {
              id: 'uniqueContributors',
              label: t('metrics.uniqueEthContributors.label'),
              info: t('metrics.uniqueEthContributors.tooltip'),
              value: (
                <DashboardCountFigure
                  metric="uniqueContributors"
                  seed={seed('uniqueContributors')}
                />
              ),
            },
            {
              id: 'activeAnchorHolders',
              label: t('anchoringPage.snapshot.activeHoldersLabel'),
              info: t('anchoringPage.snapshot.activeHoldersTooltip'),
              value: <ActiveAnchorHoldersFigure />,
            },
          ]}
        />
        <ParticipationPanel />
      </>
    </PageMessages>
  );
}
