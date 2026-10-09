'use client';

import { useTranslations } from 'next-intl';

import { RouteError } from '@/components/layout/RouteError';

/** Route-level error boundary for the NFT gallery. */
export default function GalleryError({
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
      context="gallery-route"
      title={t('route.titles.gallery')}
      message={t('route.message')}
    />
  );
}
