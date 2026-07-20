'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

import { ErrorState } from '@/components/ui/error-state';
import { reportError } from '@/utils/errors';

/** Route-level error boundary for the statistics section pages. */
export default function StatisticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('statistics');

  useEffect(() => {
    reportError(error, 'statistics-route');
  }, [error]);

  return (
    <ErrorState
      title={t('routeError.title')}
      message={t('routeError.message')}
      onRetry={reset}
      surface
    />
  );
}
