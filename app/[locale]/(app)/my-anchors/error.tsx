'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the My Anchors page. */
export default function MyAnchorsError({
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
      context="my-anchors-route"
      title={t('route.titles.myAnchors')}
      message={t('route.message')}
    />
  );
}
