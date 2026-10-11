'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Brush } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useInkFilms } from '@/hooks/useInkFilms';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import {
  chooseDefaultInkFilm,
  type InkFilm,
  type InkFilms,
  type InkFilmVariant,
} from '@/lib/nftMetadata/ink';
import { mediaFailoverUrl } from '@/utils/urls';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SegmentedControl } from '@/components/ui/segmented-control';

interface InkFilmDialogProps {
  seed: string | number;
  subject: string;
  /** Pause the primary animation when the reader opens the ink study. */
  onOpenChange?: (open: boolean) => void;
}

/**
 * An optional study beside the primary artwork. Only the focused artwork
 * reads a small manifest; neither the poster nor a film loads before opening.
 * Keyed content prevents an open film or a selected length following a reader
 * to a different Signature.
 */
export function InkFilmDialog({ seed, ...props }: InkFilmDialogProps) {
  const { data } = useInkFilms(seed);
  if (!data?.films.length) return null;
  return <InkFilmDialogContent key={String(seed)} media={data} {...props} />;
}

function InkFilmDialogContent({
  media,
  subject,
  onOpenChange,
}: Omit<InkFilmDialogProps, 'seed'> & { media: InkFilms }) {
  const t = useTranslations('detail.ink');
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<InkFilmVariant>('medium');
  const film =
    media.films.find((item) => item.variant === variant) ?? chooseDefaultInkFilm(media.films);
  const lengthLabel = (item: InkFilm) =>
    item.variant === 'short'
      ? t('seconds', { seconds: 30 })
      : t('minutes', { minutes: item.variant === 'medium' ? 2 : 5 });

  function handleOpenChange(next: boolean) {
    if (next) setVariant(chooseDefaultInkFilm(media.films)!.variant);
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="quiet" size="sm" className="font-normal text-subtle">
          <Brush aria-hidden className="size-3.5" />
          {t('trigger')}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-5xl gap-0 overflow-y-auto overscroll-contain p-0"
        data-testid="ink-film-dialog"
        // A portal still bubbles through the gallery quick view's React tree.
        // Arrows belong to this study, never to the artwork behind it.
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') event.stopPropagation();
        }}
      >
        <div className="space-y-2 px-4 pb-4 pt-5 pe-16 sm:px-6 sm:pe-16">
          <DialogTitle className="break-words">{t('title', { subject })}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </div>
        {open && film ? (
          <InkFilmPlayer key={film.variant} film={film} poster={media.poster} subject={subject} />
        ) : null}
        {film ? (
          <div className="px-4 py-4 sm:px-6">
            {media.films.length === 1 ? (
              <p className="type-caption text-subtle">
                {t('lengthLabel')} · {lengthLabel(film)}
              </p>
            ) : (
              <SegmentedControl
                label={t('lengthLabel')}
                value={film.variant}
                onValueChange={setVariant}
                options={media.films.map((item) => ({
                  value: item.variant,
                  label: lengthLabel(item),
                }))}
              />
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Mounted only for the selected film; switching or closing releases the video. */
function InkFilmPlayer({
  film,
  poster,
  subject,
}: {
  film: InkFilm;
  poster: string | undefined;
  subject: string;
}) {
  const t = useTranslations('detail.ink');
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  // A background availability refresh may answer from a different mirror.
  // Keep this viewing session intact until the reader changes the length.
  const [initialUrl] = useState(film.url);
  const [src, setSrc] = useState(initialUrl);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // These films are large. Explicitly release the source on close, length
  // changes, and mirror failover instead of relying on detached-node cleanup.
  const attachVideo = useCallback(
    (video: HTMLVideoElement | null) => {
      videoRef.current = video;
      if (!video) return;
      // StrictMode replays ref setup after cleanup on the same DOM element.
      if (video.getAttribute('src') !== src) video.setAttribute('src', src);
      return () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        videoRef.current = null;
      };
    },
    [src],
  );
  const keepStill =
    reducedMotion ||
    (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced');

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.visibilityState === 'hidden') videoRef.current?.pause();
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => document.removeEventListener('visibilitychange', pauseWhenHidden);
  }, []);

  function handleError() {
    const fallback = src === initialUrl ? mediaFailoverUrl(initialUrl) : null;
    if (fallback) setSrc(fallback);
    else setFailed(true);
  }

  return failed ? (
    <div className="flex aspect-art max-h-[60dvh] flex-col items-center justify-center gap-4 bg-art-ground px-6 text-center">
      <p role="status" className="type-body-sm text-subtle">
        {t('loadError')}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSrc(initialUrl);
          setFailed(false);
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
      className="aspect-art max-h-[60dvh] w-full bg-art-ground object-contain"
      data-testid="ink-film-video"
    />
  );
}
