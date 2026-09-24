import { getLocale, getTranslations } from 'next-intl/server';

import { ZERO_ADDRESS } from '@/lib/cycleState';
import { PageHeader } from '@/components/layout/PageHeader';
import { TimeZoneNote } from '@/components/ui/date-time';
import { LiveStatus } from '@/components/ui/live-status';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

import { CurrentCycleTitle } from './CurrentCycleTitle';

/**
 * The /current-cycle page header, rendered on the server: the page's name as
 * the eyebrow, the cycle itself as the H1 ("Cycle #2"), a one-sentence lede
 * and the cycle's live figures (gestures, Signature Allocation, opening time
 * with its zone). The figures read the same polled dashboard query as the
 * page body and start from this request's server read, so the server HTML
 * holds them. The live status sits in the standings ledger when there is
 * one, so the page carries a single freshness stamp; before the first
 * gesture it stays here.
 */
export async function CurrentCycleSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const dashboard = await readDashboard();
  const data = dashboard.data;
  const figure = (metric: DashboardMetric) => (
    <DashboardFigure metric={metric} seed={dashboardSeed(data, metric)} />
  );
  const hasStandings = !!data && data.TsRoundStart !== 0 && data.LastBidderAddr !== ZERO_ADDRESS;
  const pageName = t('currentCycleSummary.heading');

  return (
    <PageHeader
      section="explore"
      eyebrow={pageName}
      title={<CurrentCycleTitle seed={dashboardSeed(data, 'cycle')} fallback={pageName} />}
      titleId="current-cycle-heading"
      subtitle={t('currentCycleSummary.description')}
      figures={[
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
        {
          id: 'opened',
          label: t('currentCycleSummary.cards.opened'),
          value: figure('opened'),
          // A date is set a size down from the amounts, and names its zone.
          size: 'md',
          caption: <TimeZoneNote />,
        },
      ]}
      meta={hasStandings ? undefined : <LiveStatus variant="inline" />}
      related={[
        { href: '/how-it-works', label: t('currentCycleSummary.links.learn') },
        { href: '/statistics', label: t('currentCycleSummary.links.statistics') },
        { href: '/contracts', label: t('currentCycleSummary.links.contracts') },
      ]}
      relatedLabel={t('currentCycleSummary.relatedAria')}
      // The section bar under the header draws its bottom rule.
      className="mb-0 border-b-0 sm:mb-0"
    />
  );
}
