import { getLocale, getTranslations } from 'next-intl/server';

import { PageHeader } from '@/components/layout/PageHeader';
import { LiveStatus } from '@/components/ui/live-status';

import { DashboardFigure } from '../DashboardFigure';

/**
 * The /current-cycle page header, rendered on the server: H1, lede and
 * related pages, with the cycle's live figures (cycle, gestures, Signature
 * Allocation, opening time) read from the same polled dashboard query as the
 * page body. Render it inside `DashboardQuerySeed` so the server HTML holds
 * the figures; the live status says how fresh they are.
 */
export async function CurrentCycleSeoSummary() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'seo' });

  return (
    <PageHeader
      section="participate"
      title={t('currentCycleSummary.heading')}
      titleId="current-cycle-heading"
      subtitle={t('currentCycleSummary.description')}
      figures={[
        {
          id: 'cycle',
          label: t('currentCycleSummary.cards.cycle'),
          value: <DashboardFigure metric="cycle" />,
        },
        {
          id: 'gestures',
          label: t('currentCycleSummary.cards.gestures'),
          value: <DashboardFigure metric="gestures" />,
        },
        {
          id: 'signatureAllocation',
          label: t('currentCycleSummary.cards.signatureAllocation'),
          value: <DashboardFigure metric="reserve" />,
        },
        {
          id: 'opened',
          label: t('currentCycleSummary.cards.opened'),
          value: <DashboardFigure metric="opened" />,
        },
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
