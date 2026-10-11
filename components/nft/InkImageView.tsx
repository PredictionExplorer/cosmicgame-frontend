'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { InkImage } from '@/lib/nftMetadata/ink';
import { ArtImage, useArtSourceChain, type ArtStatus } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InkImageViewProps {
  image: InkImage;
  subject: string;
  /** Pointer shortcut for the containing viewer's keyboard-accessible full-screen control. */
  onOpenFullscreen?: () => void;
  onStatusChange?: (status: ArtStatus) => void;
}

/** Full-resolution ink still, requested only when the reader selects Image. */
export function InkImageView({
  image,
  subject,
  onOpenFullscreen,
  onStatusChange,
}: InkImageViewProps) {
  const [attempt, setAttempt] = useState(0);
  return (
    <InkImageAttempt
      key={attempt}
      image={image}
      subject={subject}
      retry={() => setAttempt((value) => value + 1)}
      onOpenFullscreen={onOpenFullscreen}
      onStatusChange={onStatusChange}
    />
  );
}

function InkImageAttempt({
  image,
  subject,
  retry,
  onOpenFullscreen,
  onStatusChange,
}: InkImageViewProps & {
  retry: () => void;
}) {
  const t = useTranslations('detail.ink');
  const sources =
    image.sourceUrl && image.sourceUrl !== image.url ? [image.url, image.sourceUrl] : [image.url];
  const chain = useArtSourceChain(sources);
  useEffect(() => {
    onStatusChange?.(chain.status);
  }, [chain.status, onStatusChange]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center bg-art-ground"
      aria-busy={chain.status === 'loading' || undefined}
      data-testid="ink-image-view"
    >
      {chain.status === 'loading' ? (
        <span
          role="status"
          className="absolute inset-0 flex items-center justify-center type-caption text-subtle"
        >
          {t('loading')}
        </span>
      ) : null}
      {chain.source ? (
        // The viewer provides the named, keyboard-accessible Full screen button.
        <div
          onClick={onOpenFullscreen}
          className={cn('relative h-full w-full', onOpenFullscreen && 'cursor-zoom-in')}
        >
          <ArtImage
            source={chain.source}
            alt={t('imageLabel', { subject })}
            sizes="(max-width: 1024px) 100vw, 64rem"
            loading="eager"
            onError={chain.onError}
            onLoad={chain.onLoad}
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p role="status" className="type-body-sm text-subtle">
            {t('imageError')}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            {t('retry')}
          </Button>
        </div>
      )}
    </div>
  );
}
