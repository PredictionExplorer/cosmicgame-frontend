'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the My Statistics page. */
export default function MyStatisticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <RouteError
      error={error}
      reset={reset}
      context="my-statistics-route"
      title={t('route.titles.myStatistics')}
      message={t('route.message')}
    />
  );
}
