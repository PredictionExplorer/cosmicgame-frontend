'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the statistics section pages. */
export default function StatisticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('statistics');

  return (
    <RouteError
      error={error}
      reset={reset}
      context="statistics-route"
      title={t('routeError.title')}
      message={t('routeError.message')}
    />
  );
}
