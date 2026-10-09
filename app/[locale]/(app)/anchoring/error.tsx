'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the anchoring pages. */
export default function AnchoringError({
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
      context="anchoring-route"
      title={t('route.titles.anchoring')}
      message={t('route.message')}
    />
  );
}
