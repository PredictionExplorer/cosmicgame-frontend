'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the My Tokens page. */
export default function MyTokensError({
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
      context="my-tokens-route"
      title={t('route.titles.myTokens')}
      message={t('route.message')}
    />
  );
}
