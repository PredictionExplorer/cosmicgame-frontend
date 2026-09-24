import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { LiveStatus } from '@/components/ui/live-status';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

/**
 * The /current-cycle page header, rendered on the server: H1, lede and
 * related pages, with the cycle's live figures (cycle, gestures, Signature
 * Allocation, opening time). The figures read the same polled dashboard query
 * as the page body and start from this request's server read, so the server
 * HTML holds them; the live status says how fresh they are.
 */
export async function CurrentCycleSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const dashboard = await readDashboard();
  const figure = (metric: DashboardMetric) => (
    <DashboardFigure metric={metric} seed={dashboardSeed(dashboard.data, metric)} />
  );

  return (
    <PageHeader
      section="participate"
      title={t('currentCycleSummary.heading')}
      titleId="current-cycle-heading"
      subtitle={t('currentCycleSummary.description')}
      figures={[
        { id: 'cycle', label: t('currentCycleSummary.cards.cycle'), value: figure('cycle') },
        {
          id: 'gestures',
          label: t('currentCycleSummary.cards.gestures'),
          value: figure('gestures'),
          info: t('currentCycleSummary.info.gestures'),
        },
        {
          id: 'signatureAllocation',
          label: t('currentCycleSummary.cards.signatureAllocation'),
          value: figure('reserve'),
          info: t('currentCycleSummary.info.signatureAllocation'),
        },
        { id: 'opened', label: t('currentCycleSummary.cards.opened'), value: figure('opened') },
      ]}
      meta={<LiveStatus variant="inline" />}
      related={[
        { href: '/how-it-works', label: t('currentCycleSummary.links.learn') },
        { href: '/statistics', label: t('currentCycleSummary.links.statistics') },
        { href: '/contracts', label: t('currentCycleSummary.links.contracts') },
      ]}
      relatedLabel={t('currentCycleSummary.relatedAria')}
    />
  );
}
