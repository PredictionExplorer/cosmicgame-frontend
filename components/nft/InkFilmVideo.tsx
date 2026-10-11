'use client';

import { useCallback, useEffect, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';

import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { InkFilm } from '@/lib/nftMetadata/ink';
import { mediaFailoverUrl } from '@/utils/urls';
import { Button } from '@/components/ui/button';
import type { ArtStatus } from '@/components/ui/art-frame';

/** Mounted only for the selected film; switching or closing releases the video. */
export function InkFilmVideo({
  film,
  poster,
  subject,
  videoRef,
  onStatusChange,
}: {
  film: InkFilm;
  poster: string | undefined;
  subject: string;
  /** Lets the containing viewer open the selected film in native full screen. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  onStatusChange?: (status: ArtStatus) => void;
}) {
  const t = useTranslations('detail.ink');
  const reducedMotion = usePrefersReducedMotion();
  // A background availability refresh may answer from a different mirror.
  // Keep this viewing session intact until the reader changes the length.
  const [initialUrl] = useState(film.url);
  const [src, setSrc] = useState(initialUrl);
  const [status, setStatus] = useState<ArtStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // These films are large. Explicitly release the source on close, length
  // changes, and mirror failover instead of relying on detached-node cleanup.
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      if (videoRef) videoRef.current = video;
      if (!video) return;
      // StrictMode replays ref setup after cleanup on the same DOM element.
      if (video.getAttribute('src') !== src) video.setAttribute('src', src);
      let visible = true;
      const pauseWhenHidden = () => {
        if (!visible || document.visibilityState === 'hidden') video.pause();
      };
      const observer =
        typeof IntersectionObserver === 'undefined'
          ? null
          : new IntersectionObserver(([entry]) => {
              if (!entry) return;
              visible = entry.isIntersecting;
              pauseWhenHidden();
            });
      observer?.observe(video);
      document.addEventListener('visibilitychange', pauseWhenHidden);
      // Autoplay can settle after an offscreen/hidden notification. Guard the
      // play event too, and leave resuming to the reader's native controls.
      video.addEventListener('play', pauseWhenHidden);
      pauseWhenHidden();
      return () => {
        observer?.disconnect();
        document.removeEventListener('visibilitychange', pauseWhenHidden);
        video.removeEventListener('play', pauseWhenHidden);
        video.pause();
        video.removeAttribute('src');
        video.load();
        if (videoRef?.current === video) videoRef.current = null;
      };
    },
    [src, videoRef],
  );
  const keepStill =
    reducedMotion ||
    (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced');

  function handleError() {
    const fallback = src === initialUrl ? mediaFailoverUrl(initialUrl) : null;
    if (fallback) {
      setSrc(fallback);
      setStatus('loading');
    } else setStatus('unavailable');
  }

  return status === 'unavailable' ? (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-art-ground px-6 text-center">
      <p role="status" className="type-body-sm text-subtle">
        {t('loadError')}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSrc(initialUrl);
          setStatus('loading');
          setAttempt((value) => value + 1);
        }}
      >
        {t('retry')}
      </Button>
    </div>
  ) : (
    <video
      key={`${src}:${attempt}`}
      ref={attachVideo}
      src={src}
      poster={poster}
      controls
      playsInline
      muted
      autoPlay={!keepStill}
      preload={keepStill ? 'none' : 'metadata'}
      width={3456}
      height={2234}
      aria-label={t('videoLabel', { subject })}
      onError={handleError}
      onLoadedData={() => setStatus('loaded')}
      className="h-full w-full bg-art-ground object-contain"
      data-testid="ink-film-video"
    />
  );
}
