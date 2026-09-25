import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';

import { DashboardFigure } from '../DashboardFigure';
import { dashboardSeed, type DashboardMetric } from '../dashboardMetrics';
import { readDashboard } from '../publicDataReads';

import { CurrentCycleTitle } from './CurrentCycleTitle';

/**
 * The /current-cycle page header, rendered on the server: the page's name as
 * the eyebrow, the cycle itself as the H1 ("Cycle #2"), a one-sentence lede
 * and the cycle's live figures (gestures, and its opening time, which names
 * its zone itself). The figures read the same polled dashboard query as the
 * page body and start from this request's server read, so the server HTML
 * holds them. They are plain labels: the page explains its coined words in
 * place (dotted terms) and the allocations in one disclosure, so the first
 * screen has one explanation pattern. The Signature Allocation is the Last
 * Gesture's figure in the standings, shown once. The header sits in the
 * page's hero row beside the clock, which draws the space under both; the
 * related pages close the page (CurrentCycleRelated).
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
          id: 'opened',
          label: t('currentCycleSummary.cards.opened'),
          value: figure('opened'),
          // A date is set a size down from the counts, and names its zone.
          size: 'md',
        },
      ]}
      // The section bar under the hero row (or its stand-in while the body loads) draws its rule.
      className="mb-0 border-b-0 pb-0 sm:mb-0 sm:pb-0"
    />
  );
}
