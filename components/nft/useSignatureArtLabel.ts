import { useTranslations } from 'next-intl';

import { useNow } from '@/hooks/useNow';

import { isRenderPending } from './signatureMedia';

/**
 * The caption of a Signature's missing-art plate, the same on every surface:
 * "Rendering" within an hour of imprinting (the renderer publishes the files
 * some time after the transaction), "Artwork unavailable" after that. Before
 * the page knows the time (the server render) it reads as unavailable.
 *
 * Its own module, because it reads the `detail` catalog: pages that only
 * compose alt text from `signatureArt` need not load that namespace.
 */
export function useSignatureArtLabel(imprintedAt: number | null | undefined): {
  label: string;
  renderPending: boolean;
} {
  const t = useTranslations('detail');
  const nowMs = useNow(60_000);
  const renderPending = isRenderPending(imprintedAt, nowMs);
  return {
    label: renderPending ? t('image.rendering') : t('image.artworkUnavailable'),
    renderPending,
  };
}
