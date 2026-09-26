'use client';

import { useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { DateTime } from '@/components/ui/date-time';
import { Skeleton } from '@/components/ui/skeleton';
import { UnknownValue } from '@/components/ui/unknown-value';
import { useFormat } from '@/hooks/useFormat';
import { useHydrated } from '@/hooks/useHydrated';
import { useDashboardInfo } from '@/hooks/useApiQuery';

import { dashboardMetricValue, type DashboardMetric } from './dashboardMetrics';

export type { DashboardMetric } from './dashboardMetrics';

/**
 * One figure of the live dashboard for a page header. It reads the same
 * polled query as the page body, so the header and the body never show two
 * values for one metric. Until the client's first read arrives it shows
 * `seed`, the value the server read for this render, so the server HTML
 * holds the number and hydration does not flicker. The client's reading
 * replaces it only after hydration: the app shell's dashboard query can
 * answer before this island hydrates, and a different number in the first
 * client render would make React discard the server HTML (#418).
 */
export function DashboardFigure({
  metric,
  seed,
  inline = false,
}: {
  metric: DashboardMetric;
  /** The server-read value (`dashboardSeed`); undefined when the server read failed. */
  seed?: number | null;
  /** In a line of text (a facts line): the placeholder is an inline bar at the text's height. */
  inline?: boolean;
}) {
  const t = useTranslations('common');
  const format = useFormat();
  const hydrated = useHydrated();
  const { data, isLoading } = useDashboardInfo();
  const value = hydrated && data ? dashboardMetricValue(data, metric) : seed;

  if (value === undefined) {
    if (hydrated && !isLoading) return <UnknownValue label={t('status.unavailable')} />;
    return inline ? (
      <Skeleton as="span" className="inline-block h-[1em] w-8 align-middle" />
    ) : (
      <Skeleton className="mt-1 h-6 w-20" aria-hidden />
    );
  }
  if (value === null) return <UnknownValue label={t('status.unavailable')} />;

  switch (metric) {
    case 'reserve':
    case 'balance':
      return <Amount value={value} unit="ETH" />;
    case 'outreachCst':
      return <Amount value={value} unit="CST" />;
    case 'opened':
      return <DateTime timestamp={value} showZone />;
    default:
      return format.count(value);
  }
}
