'use client';

import { useTranslations } from 'next-intl';

import { useDashboardInfo } from '@/hooks/useApiQuery';

import { dashboardMetricValue } from '../dashboardMetrics';

/**
 * "1,135 gestures this cycle" under the hub's active-cycle figure, from the
 * same live dashboard query (the server-read `seed` until the first client
 * read), as one message per locale so each language places the number and
 * its counter itself.
 */
export function ActiveCycleGesturesCaption({ seed }: { seed?: number | null }) {
  const t = useTranslations('statistics');
  const { data } = useDashboardInfo();
  const count = data ? dashboardMetricValue(data, 'gestures') : seed;
  if (count === null || count === undefined) return null;
  return <>{t('hub.seo.gesturesCaption', { count })}</>;
}
