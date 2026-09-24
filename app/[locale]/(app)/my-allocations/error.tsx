'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the My Allocations page. */
export default function MyAllocationsError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <RouteError
      error={error}
      retry={retry}
      context="my-allocations-route"
      title={t('route.titles.myAllocations')}
      message={t('route.message')}
    />
  );
}
