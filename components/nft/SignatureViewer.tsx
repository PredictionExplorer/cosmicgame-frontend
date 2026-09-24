'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Expand, Film, ImageIcon, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { Button } from '@/components/ui/button';
import { ART_PLATE_CLASS, ArtFrame, type ArtStatus } from '@/components/ui/art-frame';

import { ArtLightbox } from './ArtLightbox';
import { signatureSources, type SignatureMedia } from './signatureArt';

/** Still (the render) or In motion (the 30-second animation of the simulation). */
export type ArtMode = 'still' | 'motion';

/** Safari's element fullscreen for `<video>` (iOS has no Fullscreen API on other elements). */
interface WebkitVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}

/** The element in full screen, with Safari's prefixed property as a fallback. */
function fullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

const FULLSCREEN_CHANGE_EVENTS = ['fullscreenchange', 'webkitfullscreenchange'] as const;

export interface SignatureViewerProps {
  /** The token's published media; `null` until the indexer has its seed. */
  media: SignatureMedia | null;
  /** Alt text composed from the token's traits. */
  alt: string;
  /** The name, or "Cosmic Signature #000025": titles the viewer and names the animation. */
  subject: string;
  /** The formatted token number, shown on the unavailable plate. */
  tokenLabel: string;
  /** Caption of the unavailable state. */
  unavailableLabel: string;
  /** The plate's rendered width at each breakpoint, for the srcset choice. */
  sizes: string;
  /** Labelled previous and next links, placed at the end of the label row. */
  navigation?: ReactNode;
  className?: string;
  /** Classes for the plate itself (e.g. no radius where it bleeds to the screen edge). */
  plateClassName?: string;
  /** Classes for the label row under the plate. */
  controlsClassName?: string;
}

function prefersStillArt(reducedMotion: boolean): boolean {
  if (reducedMotion) return true;
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'reduced';
}

/**
 * SignatureViewer — the art on its plate with the label row beneath: Still /
 * In motion, play and pause, full screen, and the neighbouring Signatures.
 * The still is the default; the animation plays in the same plate only when
 * asked for (never on its own under reduced motion), pauses while scrolled
 * out of view or in a hidden tab, and falls back to the still if it cannot
 * load. Full screen opens the zoomable ArtLightbox for the still and the
 * browser's own full screen for the animation.
 */
export function SignatureViewer({
  media,
  alt,
  subject,
  tokenLabel,
  unavailableLabel,
  sizes,
  navigation,
  className,
  plateClassName,
  controlsClassName,
}: SignatureViewerProps) {
  const t = useTranslations('detail');
  const reducedMotion = usePrefersReducedMotion();
  const [mode, setMode] = useState<ArtMode>('still');
  const [artStatus, setArtStatus] = useState<ArtStatus>('loading');
  const [motionFailed, setMotionFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const videoRef = useRef<WebkitVideoElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const fullscreenButtonRef = useRef<HTMLButtonElement>(null);
  // Paused by the viewer (scrolled away, tab hidden), not by the reader.
  const autoPaused = useRef(false);

  const motionAvailable = Boolean(media) && !motionFailed;
  const showMotion = mode === 'motion' && motionAvailable;

  const selectMode = (next: ArtMode) => {
    setMode(next);
    if (next === 'still') setPlaying(false);
  };

  // Start the animation when the reader switches to it, unless they asked
  // the whole site to keep still: then it waits, paused, for Play.
  useEffect(() => {
    const video = videoRef.current;
    if (!showMotion || !video || prefersStillArt(reducedMotion)) return;
    void video.play()?.catch(() => {
      /* Refused autoplay leaves the poster and the Play button. */
    });
  }, [showMotion, reducedMotion]);

  // Only the art moves, and only while someone can see it.
  useEffect(() => {
    const video = videoRef.current;
    const plate = plateRef.current;
    if (!showMotion || !video || !plate) return;

    const pauseForViewer = () => {
      if (!video.paused) {
        autoPaused.current = true;
        video.pause();
      }
    };
    const resumeForViewer = () => {
      if (autoPaused.current) {
        autoPaused.current = false;
        void video.play()?.catch(() => {});
      }
    };
    const onVisibility = () =>
      document.visibilityState === 'hidden' ? pauseForViewer() : resumeForViewer();

    document.addEventListener('visibilitychange', onVisibility);
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(([entry]) =>
            entry?.isIntersecting ? resumeForViewer() : pauseForViewer(),
          );
    observer?.observe(plate);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
      autoPaused.current = false;
    };
  }, [showMotion]);

  // Full screen leaves the label row behind, so the animation gets the
  // browser's own controls (pause, scrub, exit) while it fills the screen,
  // and hands them back when it returns to the plate.
  useEffect(() => {
    const video = videoRef.current;
    if (!showMotion || !video) return;
    const syncControls = () => {
      video.controls = fullscreenElement() === video;
    };
    for (const type of FULLSCREEN_CHANGE_EVENTS) document.addEventListener(type, syncControls);
    return () => {
      for (const type of FULLSCREEN_CHANGE_EVENTS) {
        document.removeEventListener(type, syncControls);
      }
      video.controls = false;
    };
  }, [showMotion]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    autoPaused.current = false;
    if (video.paused) void video.play()?.catch(() => {});
    else video.pause();
  }, []);

  // With native controls showing, a click on the video already toggles it.
  const handleVideoClick = () => {
    if (!videoRef.current?.controls) togglePlayback();
  };

  const openFullscreen = () => {
    const video = videoRef.current;
    if (showMotion && video) {
      if (video.requestFullscreen) void video.requestFullscreen().catch(() => {});
      else video.webkitEnterFullscreen?.();
      return;
    }
    setLightboxOpen(true);
  };

  const handleMotionError = () => {
    setMotionFailed(true);
    setMode('still');
    setPlaying(false);
  };

  const canOpenFullscreen = showMotion || (media !== null && artStatus !== 'unavailable');

  return (
    <div className={cn('flex min-w-0 flex-col gap-3', className)} data-testid="signature-viewer">
      <div ref={plateRef} className="relative">
        {showMotion && media ? (
          <div className={cn(ART_PLATE_CLASS, 'w-full', plateClassName)}>
            {/* The click is the pointer shortcut for the Play / Pause button below. */}
            <video
              ref={videoRef}
              src={media.video}
              poster={media.webImage}
              muted
              loop
              playsInline
              preload="auto"
              aria-label={t('viewer.motionLabel', { subject })}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onError={handleMotionError}
              onClick={handleVideoClick}
              className="relative z-[1] cursor-pointer"
              data-testid="signature-motion"
            />
          </div>
        ) : (
          // The click is the pointer shortcut for the Full screen button below,
          // which keyboard and assistive-technology users reach instead.
          <div
            onClick={canOpenFullscreen ? openFullscreen : undefined}
            className={cn(canOpenFullscreen && 'cursor-zoom-in')}
          >
            <ArtFrame
              sources={signatureSources(media)}
              alt={alt}
              sizes={sizes}
              priority
              unavailableLabel={unavailableLabel}
              unavailableDetail={tokenLabel}
              onStatusChange={setArtStatus}
              className={plateClassName}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center gap-x-2 gap-y-3 max-sm:justify-between',
          controlsClassName,
        )}
      >
        <div className="flex items-center gap-2 max-sm:w-full">
          {media ? (
            <div
              role="group"
              aria-label={t('viewer.modeLabel')}
              className="inline-flex shrink-0 items-center rounded-control border border-rule bg-surface-sunken p-0.5"
            >
              <ModeOption
                selected={!showMotion}
                onSelect={() => selectMode('still')}
                icon={<ImageIcon aria-hidden />}
                label={t('viewer.still')}
              />
              <ModeOption
                selected={showMotion}
                disabled={!motionAvailable}
                onSelect={() => selectMode('motion')}
                icon={<Film aria-hidden />}
                label={t('viewer.motion')}
              />
            </div>
          ) : null}
          {showMotion ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={togglePlayback}
              aria-label={playing ? t('viewer.pause') : t('viewer.play')}
              className="text-muted-foreground max-sm:min-w-11"
              data-testid="signature-playback"
            >
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </Button>
          ) : null}
          {canOpenFullscreen ? (
            <Button
              ref={fullscreenButtonRef}
              type="button"
              variant="ghost"
              size="sm"
              onClick={openFullscreen}
              className="font-medium normal-case text-muted-foreground max-sm:ml-auto max-sm:min-w-11"
            >
              <Expand aria-hidden />
              <span className="max-sm:sr-only">{t('viewer.fullscreen')}</span>
            </Button>
          ) : null}
        </div>
        {navigation ? <div className="max-sm:w-full sm:ml-auto">{navigation}</div> : null}
        {motionFailed ? (
          <p role="status" className="w-full type-caption text-subtle">
            {t('viewer.motionError')}
          </p>
        ) : null}
      </div>

      {media ? (
        <ArtLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          sources={[media.webImage, media.sourceImage]}
          alt={alt}
          title={subject}
          unavailableLabel={unavailableLabel}
          returnFocusRef={fullscreenButtonRef}
        />
      ) : null}
    </div>
  );
}

interface ModeOptionProps {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
}

/** One segment of the Still / In motion control. */
function ModeOption({ selected, disabled = false, onSelect, icon, label }: ModeOptionProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'inline-flex h-11 items-center gap-1.5 rounded-[calc(var(--radius-control)-2px)] px-3 type-label transition-colors duration-[var(--duration-fast)] sm:h-8',
        '[&_svg]:size-4 [&_svg]:shrink-0 disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'bg-surface-raised text-foreground shadow-[inset_0_-2px_0_hsl(var(--primary))]'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
