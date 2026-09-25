'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Pause, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { classifyHref } from '@/config/siteNav';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { shortSeed } from '@/components/reading/signaturePlates';
import { ART_PLATE_CLASS, ArtFrame, WallLabelMeta } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';

import { FEATURED_LANDING_ART } from './featured-art';
import { showcaseAnimation, showcaseSources, type ShowcaseArtwork } from './showcase-art';
import { useSignatureLabel } from './signatureLabel';
import { useOnScreen } from './useArtMotion';
import styles from './Landing.module.css';

/**
 * How long the animation may take to start before the plate keeps the still:
 * a refused play, a stalled download or a decoder that never starts.
 */
export const ANIMATION_START_TIMEOUT_MS = 10_000;

/** The animation's length until the file reports its own (30 s at 60 fps). */
const ANIMATION_SECONDS = 30;

const PLATE_SIZES = '(min-width: 80rem) 44rem, (min-width: 64rem) 56vw, 100vw';

/**
 * `idle`: the still, nothing requested. `play` / `pause`: the visitor's
 * choice during a run. `ended`: the run finished and the still is back.
 */
type Intent = 'idle' | 'play' | 'pause' | 'ended';

/** `0:08`: minutes and zero-padded seconds, the way a player counts. */
function clockTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

interface ArtAnimationPlateProps {
  /** Template with `{tokenLabel}`: the still's alt text. */
  artworkAlt: string;
  /** Template with `{tokenLabel}`: the title link's accessible name. */
  viewAriaLabel: string;
  /** "Seed", the first stage's own name. */
  seedLabel: string;
}

/**
 * The Art section's plate: one Signature, and on request the 30-second
 * animation of its simulation — the orbit drawing itself, which is what the
 * stages beside it describe. The finished still is the resting state on
 * every screen: the animation opens on a nearly empty black frame, so it
 * never replaces the still by itself. "Play the animation" fetches the video
 * (about 3 MB, never requested before), fades it in over the still once it
 * is actually playing, and shows its progress as a hairline under the plate
 * with the elapsed time in the wall label. It plays once, pauses while the
 * plate is off screen, and crossfades back to the still when it ends; a
 * failed start keeps the still and withdraws the control.
 */
export function ArtAnimationPlate({
  artworkAlt,
  viewAriaLabel,
  seedLabel,
}: ArtAnimationPlateProps) {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const label = useSignatureLabel();
  const artwork: ShowcaseArtwork = FEATURED_LANDING_ART[1];
  const tokenLabel = formatId(artwork.TokenId);

  const plateRef = useRef<HTMLAnchorElement>(null);
  const onScreen = useOnScreen(plateRef);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [intent, setIntent] = useState<Intent>('idle');
  const [failed, setFailed] = useState(false);
  // True from the first frame of a run until it ends: the plate then shows
  // the video, playing or held on the visitor's pause.
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(ANIMATION_SECONDS);

  const mountVideo = !failed && intent !== 'idle';
  const shouldPlay = mountVideo && intent === 'play' && onScreen;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (!shouldPlay) {
      video.pause();
      return undefined;
    }
    const startTimer = window.setTimeout(() => setFailed(true), ANIMATION_START_TIMEOUT_MS);
    const playing = () => window.clearTimeout(startTimer);
    video.addEventListener('playing', playing, { once: true });
    const result = video.play() as Promise<void> | undefined;
    result?.catch(() => setFailed(true));
    return () => {
      window.clearTimeout(startTimer);
      video.removeEventListener('playing', playing);
    };
  }, [shouldPlay]);

  const play = () => {
    if (intent === 'ended' && videoRef.current) videoRef.current.currentTime = 0;
    if (intent === 'ended' || intent === 'idle') setElapsed(0);
    setIntent('play');
  };

  const showVideo = started && (intent === 'play' || intent === 'pause');
  const running = intent === 'play' || intent === 'pause';
  const detailHref = localizeCrossHostHref(`${APP_ORIGIN}/detail/${artwork.TokenId}`, locale);
  const progress = duration > 0 ? Math.min(1, elapsed / duration) : 0;

  return (
    <figure className={styles.animationFigure}>
      <div className={styles.animationStage}>
        {/* The plate and the title are one destination: the plate is the tab stop. */}
        <SiteLink
          ref={plateRef}
          href={detailHref}
          kind={classifyHref(detailHref, 'landing')}
          aria-label={viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
          className={cn(ART_PLATE_CLASS, 'block w-full')}
        >
          <ArtFrame
            sources={showcaseSources(artwork)}
            alt={artworkAlt.replace('{tokenLabel}', tokenLabel)}
            sizes={PLATE_SIZES}
            unavailableLabel={t('unavailable')}
            unavailableDetail={tokenLabel}
            className="absolute inset-0 shadow-none after:hidden"
          />
          {mountVideo ? (
            <video
              ref={videoRef}
              src={showcaseAnimation(artwork)}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onPlaying={() => setStarted(true)}
              onLoadedMetadata={(event) => {
                const seconds = event.currentTarget.duration;
                if (Number.isFinite(seconds) && seconds > 0) setDuration(seconds);
              }}
              onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
              onEnded={() => {
                setIntent('ended');
                setStarted(false);
                setElapsed(duration);
              }}
              onError={() => setFailed(true)}
              className={cn(
                'absolute inset-0 z-[1] size-full object-contain',
                styles.animation,
                showVideo && styles.animationVisible,
              )}
            />
          ) : null}
        </SiteLink>
        {running && started ? (
          <div
            aria-hidden="true"
            className={styles.animationProgress}
            style={{ '--progress': progress } as CSSProperties}
          />
        ) : null}
      </div>
      <figcaption className={styles.wallLabel}>
        <div className={styles.wallLabelText}>
          <SiteLink
            href={detailHref}
            kind={classifyHref(detailHref, 'landing')}
            tabIndex={-1}
            aria-hidden="true"
            className="link-quiet type-body-md font-medium text-foreground"
          >
            {label.title(artwork)}
          </SiteLink>
          <WallLabelMeta items={label.meta(artwork)} />
          {/* The seed on a line of its own: on a phone it never breaks the facts line. */}
          <p className="type-caption mt-0.5 flex items-baseline gap-1.5 text-subtle">
            {seedLabel}
            <span className="type-hash">{shortSeed(artwork.Seed)}</span>
          </p>
        </div>
        {failed ? null : (
          <div className={cn(styles.wallControls, styles.scriptedControl)}>
            {running && started ? (
              <span aria-hidden="true" className="type-caption tabular-nums text-subtle">
                {clockTime(elapsed)} / {clockTime(duration)}
              </span>
            ) : null}
            {running ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                loading={intent === 'play' && !started}
                onClick={() => (intent === 'play' ? setIntent('pause') : play())}
                aria-label={intent === 'play' ? t('pauseAnimation') : t('resumeAnimation')}
              >
                {intent === 'play' ? (
                  <Pause aria-hidden fill="currentColor" strokeWidth={0} />
                ) : (
                  <Play aria-hidden fill="currentColor" strokeWidth={0} />
                )}
              </Button>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={play}>
                <Play aria-hidden fill="currentColor" strokeWidth={0} />
                {intent === 'ended' ? t('replayAnimation') : t('playAnimation')}
              </Button>
            )}
          </div>
        )}
      </figcaption>
    </figure>
  );
}
