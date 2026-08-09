'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Fallback error boundary for every dApp route without a closer one. */
export default function AppError({
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
      context="app-route"
      title={t('route.titles.app')}
      message={t('route.message')}
    />
  );
}
