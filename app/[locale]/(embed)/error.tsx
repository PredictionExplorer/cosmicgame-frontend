'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Error boundary of every embed: the retry surface, alone in the window. */
export default function EmbedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <main id="main" tabIndex={-1} className="min-h-screen w-full bg-background px-4 py-10 sm:px-8">
      <RouteError
        error={error}
        reset={reset}
        context="embed-route"
        title={t('route.titles.app')}
        message={t('route.message')}
      />
    </main>
  );
}
