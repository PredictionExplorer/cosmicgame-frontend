'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/**
 * The landing's route error boundary: a failed landing page shows the shared
 * error state inside the landing chrome, with a retry and a way back to the
 * landing home, instead of falling through to the generic client boundary.
 */
export default function LandingError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations('errors');

  return (
    <main id="main" tabIndex={-1} className="site-container py-16">
      <RouteError
        error={error}
        retry={retry}
        context="landing-route"
        title={t('route.titles.app')}
        message={t('route.message')}
        home={{ href: '/', label: t('boundary.home') }}
      />
    </main>
  );
}
