'use client';

import { useTranslations } from 'next-intl';

import { useDashboardInfo } from '@/hooks/useApiQuery';
import { useHydrated } from '@/hooks/useHydrated';

import { dashboardMetricValue } from '../dashboardMetrics';

/**
 * "1,135 gestures this cycle" under the hub's active-cycle figure, from the
 * same live dashboard query (the server-read `seed` until the first client
 * read), as one message per locale so each language places the number and
 * its counter itself. The live count replaces the seed only after hydration,
 * so the first client render matches the server HTML.
 */
export function ActiveCycleGesturesCaption({ seed }: { seed?: number | null }) {
  const t = useTranslations('statistics');
  const hydrated = useHydrated();
  const { data } = useDashboardInfo();
  const count = hydrated && data ? dashboardMetricValue(data, 'gestures') : seed;
  if (count === null || count === undefined) return null;
  return <>{t('hub.seo.gesturesCaption', { count })}</>;
}
