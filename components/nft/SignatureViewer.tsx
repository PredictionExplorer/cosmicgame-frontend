'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Expand, Film, ImageIcon, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useInkFilms } from '@/hooks/useInkFilms';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { chooseDefaultInkFilm } from '@/lib/nftMetadata/ink';
import { Button } from '@/components/ui/button';
import { ART_PLATE_CLASS, ArtFrame, type ArtStatus } from '@/components/ui/art-frame';
import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control';

import { ArtLightbox } from './ArtLightbox';
import { InkFilmVideo } from './InkFilmVideo';
import { InkImageView } from './InkImageView';
import { InkShareMenu } from './InkShareMenu';
import { NFTShareMenu } from './NFTShareMenu';
import type { InkView } from './inkLinks';
import { useInkViewLink } from './useInkViewLink';
import { signatureSources, type SignatureMedia } from './signatureArt';

export type ArtMode = 'still' | 'motion' | 'sweep';
interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}
function fullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}
function enterVideoFullscreen(video: WebkitVideoElement | null) {
  if (video?.requestFullscreen) void video.requestFullscreen().catch(() => {});
  else video?.webkitEnterFullscreen?.();
}
const FULLSCREEN_CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const;

export interface SignatureViewerProps {
  seed?: string | number;
  tokenId?: number;
  /** Mirror the selected ink view in the full detail page's URL. */
  inkLinkable?: boolean;
  media: SignatureMedia | null;
  alt: string;
  subject: string;
  tokenLabel: string;
  unavailableLabel: string;
  renderPending?: boolean;
  sizes: string;
  /** The gallery also offers the spectral interpretation, within this same frame. */
  spectralSweepUrl?: string;
  className?: string;
  plateClassName?: string;
  controlsClassName?: string;
}
interface InkState {
  query: ReturnType<typeof useInkFilms>;
  view: InkView | null;
  select: (view: InkView) => void;
  exit: () => void;
}

export function prefersStillArt(reducedMotion: boolean): boolean {
  return (
    reducedMotion ||
    (typeof document !== 'undefined' && document.documentElement.dataset.motion === 'reduced')
  );
}

/**
 * One frame for every edition. The query reader has a server-renderable original
 * as its Suspense fallback, preserving the artwork and the page's ISR policy.
 * Gallery previews share the same frame and controls, with local selection only.
 */
export function SignatureViewer(props: SignatureViewerProps) {
  if (props.seed == null || props.tokenId == null) return <SignatureViewerFrame {...props} />;
  return props.inkLinkable ? (
    <Suspense fallback={<SignatureViewerFrame {...props} />}>
      <LinkedSignatureViewer key={String(props.seed)} {...props} />
    </Suspense>
  ) : (
    <LocalSignatureViewer key={String(props.seed)} {...props} />
  );
}
function LinkedSignatureViewer(props: SignatureViewerProps) {
  const query = useInkFilms(props.seed);
  const link = useInkViewLink(true);
  return (
    <SignatureViewerFrame
      {...props}
      ink={{
        query,
        view: link.view,
        select: link.view ? link.select : link.open,
        exit: link.close,
      }}
    />
  );
}
function LocalSignatureViewer(props: SignatureViewerProps) {
  const query = useInkFilms(props.seed);
  const [view, setView] = useState<InkView | null>(null);
  return (
    <SignatureViewerFrame
      {...props}
      ink={{ query, view, select: setView, exit: () => setView(null) }}
    />
  );
}

function SignatureViewerFrame({
  tokenId,
  media,
  alt,
  subject,
  tokenLabel,
  unavailableLabel,
  renderPending = false,
  sizes,
  spectralSweepUrl,
  className,
  plateClassName,
  controlsClassName,
  ink,
}: SignatureViewerProps & { ink?: InkState }) {
  const t = useTranslations('detail');
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<ArtMode>('still');
  const [artStatus, setArtStatus] = useState<ArtStatus>('loading');
  const [inkStatus, setInkStatus] = useState<ArtStatus>('loading');
  const [failedMotions, setFailedMotions] = useState<Partial<Record<ArtMode, boolean>>>({});
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<WebkitVideoElement>(null);
  const inkVideoRef = useRef<HTMLVideoElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const autoPaused = useRef(false);
  const visible = useRef(true);
  const showInk = ink?.view != null;
  const inkMedia = ink?.query.data;
  const hasInk = Boolean(inkMedia?.films.length || inkMedia?.image);
  const inkFilm = inkMedia?.films.find((film) => film.variant === ink?.view);
  const inkImage = ink?.view === 'image' ? inkMedia?.image : undefined;
  const inkUrl = inkImage?.url ?? inkFilm?.url;
  const motionUrl = mode === 'sweep' ? spectralSweepUrl : media?.video;
  const showMotion = !showInk && mode !== 'still' && Boolean(motionUrl) && !failedMotions[mode];
  const motionFailed = Boolean(failedMotions.motion || failedMotions.sweep);

  // Release even the original film on edition changes. Ref setup also restores
  // the source after StrictMode's setup/cleanup replay in development.
  const attachVideo = useCallback(
    (video: WebkitVideoElement | null) => {
      videoRef.current = video;
      if (!video) return;
      if (motionUrl && video.getAttribute('src') !== motionUrl)
        video.setAttribute('src', motionUrl);
      return () => {
        video.pause();
        video.removeAttribute('src');
        video.load();
        videoRef.current = null;
      };
    },
    [motionUrl],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (
      !showMotion ||
      !video ||
      prefersStillArt(reducedMotion) ||
      document.visibilityState === 'hidden'
    )
      return;
    void video.play()?.catch(() => {});
  }, [showMotion, motionUrl, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    const plate = plateRef.current;
    if (!showMotion || !video || !plate) return;
    const pause = () => {
      if (!video.paused) {
        autoPaused.current = true;
        video.pause();
      }
    };
    const resume = () => {
      if (autoPaused.current && visible.current && document.visibilityState !== 'hidden') {
        autoPaused.current = false;
        void video.play()?.catch(() => {});
      }
    };
    const onVisibility = () => (document.visibilityState === 'hidden' ? pause() : resume());
    document.addEventListener('visibilitychange', onVisibility);
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) => {
            visible.current = Boolean(entry?.isIntersecting);
            if (visible.current) resume();
            else pause();
          });
    observer?.observe(plate);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      autoPaused.current = false;
      visible.current = true;
    };
  }, [showMotion, motionUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!showMotion || !video) return;
    const syncControls = () => {
      video.controls = fullscreenElement() === video || mode === 'sweep';
    };
    for (const event of FULLSCREEN_CHANGE_EVENTS) document.addEventListener(event, syncControls);
    return () => {
      for (const event of FULLSCREEN_CHANGE_EVENTS)
        document.removeEventListener(event, syncControls);
    };
  }, [showMotion, motionUrl, mode]);

  const selectMode = (next: ArtMode) => {
    setMode(next);
    setPlaying(false);
    autoPaused.current = false;
  };
  const selectEdition = (edition: 'original' | 'ink') => {
    selectMode('still');
    if (edition === 'original') ink?.exit();
    else {
      const next =
        chooseDefaultInkFilm(inkMedia?.films ?? [])?.variant ?? (inkMedia?.image ? 'image' : null);
      if (next) ink?.select(next);
    }
  };
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    autoPaused.current = false;
    if (video.paused) void video.play()?.catch(() => {});
    else video.pause();
  };
  const canFullscreen = showInk
    ? Boolean(inkUrl) && inkStatus !== 'unavailable'
    : showMotion || (media !== null && artStatus !== 'unavailable');
  const showOriginalModes =
    media !== null &&
    artStatus !== 'unavailable' &&
    (!renderPending || artStatus === 'loaded' || showMotion);
  const inkOptions: SegmentedOption<InkView>[] = [
    ...(inkMedia?.image
      ? [{ value: 'image' as const, label: t('ink.image'), icon: <ImageIcon aria-hidden /> }]
      : []),
    ...(inkMedia?.films ?? []).map((film) => ({
      value: film.variant,
      label:
        film.variant === 'short'
          ? t('ink.seconds', { seconds: 30 })
          : t('ink.minutes', { minutes: film.variant === 'medium' ? 2 : 5 }),
    })),
  ];
  const lightboxSources =
    showInk && inkImage
      ? [inkImage.url, inkImage.sourceUrl]
      : media
        ? [media.webImage, media.sourceImage]
        : [];

  return (
    <div
      role="group"
      aria-label={subject}
      className={cn('flex min-w-0 flex-col gap-3', className)}
      data-testid="signature-viewer"
    >
      <div
        ref={plateRef}
        className={cn(
          ART_PLATE_CLASS,
          'relative aspect-art w-full overflow-hidden',
          plateClassName,
        )}
        data-testid="artwork-stage"
        data-edition={showInk ? 'ink' : 'original'}
      >
        {showInk ? (
          inkImage ? (
            <InkImageView image={inkImage} subject={subject} onStatusChange={setInkStatus} />
          ) : inkFilm ? (
            <InkFilmVideo
              key={inkFilm.variant}
              film={inkFilm}
              poster={inkMedia?.poster}
              subject={subject}
              videoRef={inkVideoRef}
              onStatusChange={setInkStatus}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-art-ground px-6 text-center">
              <p role="status" className="type-body-sm text-subtle">
                {ink?.query.isPending
                  ? t('ink.loading')
                  : ink?.query.isError
                    ? t('ink.availabilityError')
                    : t('ink.unavailable')}
              </p>
              {ink?.query.isError ? (
                <Button
                  variant="outline"
                  size="sm"
                  loading={ink.query.isFetching}
                  onClick={() => void ink.query.refetch()}
                >
                  {t('ink.retry')}
                </Button>
              ) : null}
            </div>
          )
        ) : showMotion && media ? (
          <video
            key={motionUrl}
            ref={attachVideo}
            src={motionUrl}
            poster={media.webImage}
            muted
            loop
            playsInline
            preload="auto"
            controls={mode === 'sweep'}
            autoPlay={!prefersStillArt(reducedMotion)}
            aria-label={
              mode === 'sweep'
                ? t('viewer.spectralLabel', { subject })
                : t('viewer.motionLabel', { subject })
            }
            onPlay={() => {
              if (document.visibilityState === 'hidden' || !visible.current) {
                autoPaused.current = true;
                videoRef.current?.pause();
                setPlaying(false);
              } else setPlaying(true);
            }}
            onPause={() => setPlaying(false)}
            onError={() => {
              setFailedMotions((failed) => ({ ...failed, [mode]: true }));
              selectMode('still');
            }}
            onClick={() => {
              if (!videoRef.current?.controls) togglePlayback();
            }}
            className="relative z-[1] h-full w-full cursor-pointer object-contain"
            data-testid={mode === 'sweep' ? 'spectral-sweep-video' : 'signature-motion'}
          />
        ) : (
          <div className="h-full w-full">
            <ArtFrame
              sources={signatureSources(media)}
              alt={alt}
              sizes={sizes}
              priority
              unavailableLabel={unavailableLabel}
              unavailableDetail={tokenLabel}
              onStatusChange={setArtStatus}
              className="h-full rounded-none shadow-none after:hidden hover:shadow-none [&_img]:h-full [&_img]:object-contain"
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          'space-y-3 pointer-coarse:[&_label]:min-h-11 pointer-coarse:[&_button]:min-h-11 pointer-coarse:[&_button]:min-w-11',
          controlsClassName,
        )}
      >
        <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule-faint">
          {hasInk || showInk ? (
            <SegmentedControl
              label={t('viewer.editionLabel')}
              hideLabel
              variant="underline"
              value={showInk ? 'ink' : 'original'}
              onValueChange={selectEdition}
              options={[
                { value: 'original', label: t('viewer.original') },
                { value: 'ink', label: t('ink.trigger') },
              ]}
            />
          ) : (
            <span className="type-label text-subtle">{t('viewer.original')}</span>
          )}
          <div className="flex items-center gap-1">
            {canFullscreen && ((!showInk && !showMotion) || inkImage) ? (
              <ImageFullscreenControl
                key={showInk ? 'ink' : 'original'}
                sources={lightboxSources.filter((source): source is string => Boolean(source))}
                alt={showInk ? t('ink.imageLabel', { subject }) : alt}
                title={subject}
                unavailableLabel={showInk ? t('ink.imageError') : unavailableLabel}
              />
            ) : canFullscreen ? (
              <Button
                type="button"
                variant="quiet"
                size="sm"
                onClick={() =>
                  enterVideoFullscreen(showInk ? inkVideoRef.current : videoRef.current)
                }
                className="font-normal text-subtle"
              >
                <Expand aria-hidden />
                <span className="max-sm:sr-only">{t('viewer.fullscreen')}</span>
              </Button>
            ) : null}
            {showInk ? (
              tokenId != null && inkUrl && ink?.view ? (
                <InkShareMenu tokenId={tokenId} view={ink.view} mediaUrl={inkUrl} />
              ) : null
            ) : media ? (
              <NFTShareMenu
                imageUrl={media.sourceImage}
                videoUrl={mode === 'sweep' ? spectralSweepUrl : media.video}
                variant="quiet"
              />
            ) : null}
          </div>
        </div>
        <div className="flex min-h-11 flex-wrap items-center gap-2">
          {showInk && ink ? (
            inkOptions.length === 1 && inkUrl ? (
              <p className="type-caption text-subtle">
                {t('ink.mediaLabel')} · {inkOptions[0]!.label}
              </p>
            ) : inkOptions.length > 0 ? (
              <SegmentedControl
                label={t('ink.mediaLabel')}
                hideLabel
                value={ink.view!}
                onValueChange={ink.select}
                options={inkOptions}
              />
            ) : null
          ) : showOriginalModes ? (
            <SegmentedControl<ArtMode>
              label={t('viewer.modeLabel')}
              hideLabel
              value={showMotion ? mode : 'still'}
              onValueChange={selectMode}
              options={[
                { value: 'still', label: t('viewer.still'), icon: <ImageIcon aria-hidden /> },
                {
                  value: 'motion',
                  label: t('viewer.motion'),
                  icon: <Film aria-hidden />,
                  disabled: !media?.video || failedMotions.motion,
                },
                ...(spectralSweepUrl
                  ? [
                      {
                        value: 'sweep' as const,
                        label: t('viewer.spectral'),
                        disabled: failedMotions.sweep,
                      },
                    ]
                  : []),
              ]}
            />
          ) : null}
          {showMotion && mode === 'motion' ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              aria-label={playing ? t('viewer.pause') : t('viewer.play')}
              className="text-subtle"
              data-testid="signature-playback"
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </Button>
          ) : null}
        </div>
        {showInk ? (
          <p className="type-caption text-subtle">{t('ink.description')}</p>
        ) : motionFailed ? (
          <p role="status" className="type-caption text-subtle">
            {t('viewer.motionError')}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Fullscreen is an explicit utility; changing the inline view disposes it. */
function ImageFullscreenControl({
  sources,
  alt,
  title,
  unavailableLabel,
}: {
  sources: string[];
  alt: string;
  title: string;
  unavailableLabel: string;
}) {
  const t = useTranslations('detail');
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={buttonRef}
        type="button"
        variant="quiet"
        size="sm"
        onClick={() => setOpen(true)}
        className="font-normal text-subtle"
      >
        <Expand aria-hidden />
        <span className="max-sm:sr-only">{t('viewer.fullscreen')}</span>
      </Button>
      <ArtLightbox
        open={open}
        onOpenChange={setOpen}
        sources={sources}
        alt={alt}
        title={title}
        unavailableLabel={unavailableLabel}
        returnFocusRef={buttonRef}
      />
    </>
  );
}
