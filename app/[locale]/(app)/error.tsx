'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Fallback error boundary for every dApp route without a closer one. */
export default function AppError({
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
      context="app-route"
      title={t('route.titles.app')}
      message={t('route.message')}
    />
  );
}
