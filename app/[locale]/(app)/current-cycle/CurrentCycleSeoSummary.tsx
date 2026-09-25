import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

import { CurrentCycleTitle } from './CurrentCycleTitle';

/**
 * The /current-cycle page header, rendered on the server: the page's name as
 * the eyebrow, the cycle itself as the H1 ("Cycle 2"), a one-sentence lede
 * and the cycle's live figures (gestures, Signature Allocation, opening time
 * with its zone). The figures read the same polled dashboard query as the
 * page body and start from this request's server read, so the server HTML
 * holds them. They are plain labels: the page explains its coined words in
 * place (dotted terms) and the allocations in one disclosure, so the first
 * screen has one explanation pattern. The page's one freshness stamp is in
 * the body, which follows the live cycle: on the standings ledger, or on
 * the status column before the first gesture.
 */
export async function CurrentCycleSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });
  const dashboard = await readDashboard();
  const data = dashboard.data;
  const figure = (metric: DashboardMetric) => (
    <DashboardFigure metric={metric} seed={dashboardSeed(data, metric)} />
  );
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
        },
        {
          id: 'signatureAllocation',
          label: t('currentCycleSummary.cards.signatureAllocation'),
          value: figure('reserve'),
        },
        {
          id: 'opened',
          label: t('currentCycleSummary.cards.opened'),
          value: figure('opened'),
          // A date is set a size down from the amounts; it names its zone inline.
          size: 'md',
        },
      ]}
      related={[
        { href: '/how-it-works', label: t('currentCycleSummary.links.learn') },
        { href: '/statistics', label: t('currentCycleSummary.links.statistics') },
        { href: '/contracts', label: t('currentCycleSummary.links.contracts') },
      ]}
      relatedLabel={t('currentCycleSummary.relatedAria')}
      // The section bar under the header (or its stand-in while the body loads) draws its bottom rule.
      className="mb-0 border-b-0 sm:mb-0"
    />
  );
}
