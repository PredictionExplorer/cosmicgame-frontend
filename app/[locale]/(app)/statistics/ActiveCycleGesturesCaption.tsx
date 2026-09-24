'use client';

import { useTranslations } from 'next-intl';

import { useDashboardInfo } from '@/hooks/useApiQuery';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * "1,135 gestures this cycle" under the hub's active-cycle figure, from the
 * same live dashboard query, as one message per locale (so each language
 * places the number and its counter itself).
 */
export function ActiveCycleGesturesCaption() {
  const t = useTranslations('statistics');
  const { data } = useDashboardInfo();
  const count = toFiniteNumber(data?.CurNumBids);
  if (count === null) return null;
  return <>{t('hub.seo.gesturesCaption', { count })}</>;
}
