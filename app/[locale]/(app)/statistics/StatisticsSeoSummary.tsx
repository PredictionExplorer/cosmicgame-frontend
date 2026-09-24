import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { LiveStatus } from '@/components/ui/live-status';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

import { ActiveCycleGesturesCaption } from './ActiveCycleGesturesCaption';
import { STATISTICS_HEADER_CLASS } from './StatisticsPageIntro';
import { StatisticsSubNav } from './StatisticsSubNav';

/**
 * The statistics hub header, rendered on the server: the hub's one headline
 * figure row (the active cycle with its gestures, allocations distributed,
 * NFTs imprinted, contract balance), read from the same polled dashboard
 * query as the hub panel, so no metric appears twice. The figures start from
 * this request's server read, so the server HTML holds them.
 */
export async function StatisticsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'statistics' });
  const dashboard = await readDashboard();
  const seed = (metric: DashboardMetric) => dashboardSeed(dashboard.data, metric);
  const figure = (metric: DashboardMetric) => (
    <DashboardFigure metric={metric} seed={seed(metric)} />
  );

  return (
    <>
      <PageHeader
        section="explore"
        sectionHub
        className={STATISTICS_HEADER_CLASS}
        title={t('hub.seo.heading')}
        titleId="statistics-heading"
        subtitle={t('hub.seo.description')}
        figures={[
          {
            id: 'activePerformanceCycle',
            label: t('metrics.activePerformanceCycle.label'),
            value: figure('cycle'),
            info: t('metrics.activePerformanceCycle.tooltip'),
            caption: <ActiveCycleGesturesCaption seed={seed('gestures')} />,
          },
          {
            id: 'allocationsDistributed',
            label: t('metrics.allocationsDistributed.label'),
            value: figure('allocations'),
            info: t('metrics.allocationsDistributed.tooltip'),
          },
          {
            id: 'cosmicSignatureNftsImprinted',
            label: t('metrics.cosmicSignatureNftsImprinted.shortLabel'),
            value: figure('imprinted'),
            info: t('metrics.cosmicSignatureNftsImprinted.tooltip'),
          },
          {
            id: 'contractBalance',
            label: t('metrics.contractBalance.label'),
            value: figure('balance'),
            info: t('metrics.contractBalance.tooltip'),
          },
        ]}
        meta={<LiveStatus variant="inline" />}
        related={[
          { href: '/current-cycle', label: t('hub.seo.links.currentCycle') },
          { href: '/how-it-works', label: t('hub.seo.links.howItWorks') },
          { href: '/contracts', label: t('hub.seo.links.contracts') },
          { href: '/faq', label: t('hub.seo.links.faq') },
        ]}
        relatedLabel={t('hub.seo.relatedPagesAria')}
      />
      <StatisticsSubNav />
    </>
  );
}
