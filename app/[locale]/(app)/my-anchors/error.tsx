'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the My Anchors page. */
export default function MyAnchorsError({
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
      context="my-anchors-route"
      title={t('route.titles.myAnchors')}
      message={t('route.message')}
    />
  );
}
