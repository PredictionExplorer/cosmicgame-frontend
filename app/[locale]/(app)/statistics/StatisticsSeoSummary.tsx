import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { LiveStatus } from '@/components/ui/live-status';

import { DashboardFigure } from '../DashboardFigure';

import { ActiveCycleGesturesCaption } from './ActiveCycleGesturesCaption';

/**
 * The statistics hub header, rendered on the server: the hub's one headline
 * figure row (the active cycle with its gestures, allocations distributed,
 * NFTs imprinted, contract balance), read from the same polled dashboard
 * query as the hub panel, so no metric appears twice. Render it inside
 * `DashboardQuerySeed` so the server HTML holds the figures.
 */
export async function StatisticsSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'statistics' });

  return (
    <PageHeader
      section="insights"
      sectionHub
      title={t('hub.seo.heading')}
      titleId="statistics-heading"
      subtitle={t('hub.seo.description')}
      figures={[
        {
          id: 'activePerformanceCycle',
          label: t('metrics.activePerformanceCycle.label'),
          value: <DashboardFigure metric="cycle" />,
          info: t('metrics.activePerformanceCycle.tooltip'),
          caption: <ActiveCycleGesturesCaption />,
        },
        {
          id: 'allocationsDistributed',
          label: t('metrics.allocationsDistributed.label'),
          value: <DashboardFigure metric="allocations" />,
          info: t('metrics.allocationsDistributed.tooltip'),
        },
        {
          id: 'cosmicSignatureNftsImprinted',
          label: t('metrics.cosmicSignatureNftsImprinted.shortLabel'),
          value: <DashboardFigure metric="imprinted" />,
          info: t('metrics.cosmicSignatureNftsImprinted.tooltip'),
        },
        {
          id: 'contractBalance',
          label: t('metrics.contractBalance.label'),
          value: <DashboardFigure metric="balance" />,
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
  );
}
