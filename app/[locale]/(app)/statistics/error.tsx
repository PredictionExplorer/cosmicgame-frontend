'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the statistics section pages. */
export default function StatisticsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('statistics');

  return (
    <RouteError
      error={error}
      retry={retry}
      context="statistics-route"
      title={t('routeError.title')}
      message={t('routeError.message')}
    />
  );
}
