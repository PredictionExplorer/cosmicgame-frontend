'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ART_PLATE_CLASS, ArtFrame, WallLabelMeta } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';

import { FEATURED_LANDING_ART } from './featured-art';
import {
  showcaseAnimation,
  showcaseSources,
  shortSeed,
  type ShowcaseArtwork,
} from './showcase-art';
import { useArtMotionAllowed, useOnScreen } from './useArtMotion';
import styles from './Landing.module.css';

/**
 * How long the animation may take to start before the plate keeps the still:
 * a refused autoplay, a stalled download or a decoder that never starts.
 */
export const ANIMATION_START_TIMEOUT_MS = 10_000;

/** Autoplay only where the plate is large; phones start the animation on request. */
const AUTOPLAY_QUERY = '(min-width: 48rem)';

const PLATE_SIZES = '(min-width: 80rem) 44rem, (min-width: 64rem) 56vw, 100vw';

type Choice = 'auto' | 'play' | 'pause';

interface ArtAnimationPlateProps {
  /** Template with `{tokenLabel}`: the still's alt text. */
  artworkAlt: string;
  /** Template with `{tokenLabel}`: the title link's accessible name. */
  viewAriaLabel: string;
  /** "Seed", the first stage's own name. */
  seedLabel: string;
  unavailableLabel: string;
}

/**
 * The Art section's plate: one Signature and the 30-second animation of its
 * simulation — the orbit drawing itself, which is what the stages beside it
 * describe. The still is the server render and stays underneath; the
 * animation fades in over it once it is actually playing, plays muted and
 * inline only while the plate is on screen, and falls back to the still if
 * it cannot start. It starts by itself only on wide screens with motion
 * allowed (never under reduced motion or Save-Data); everywhere a button
 * plays and pauses it.
 */
export function ArtAnimationPlate({
  artworkAlt,
  viewAriaLabel,
  seedLabel,
  unavailableLabel,
}: ArtAnimationPlateProps) {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const timerT = useTranslations('landing.timer');
  const artwork: ShowcaseArtwork = FEATURED_LANDING_ART[1];
  const tokenLabel = formatId(artwork.TokenId);

  const motionAllowed = useArtMotionAllowed();
  const wide = useMediaQuery(AUTOPLAY_QUERY);
  const plateRef = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(plateRef, '120px');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [choice, setChoice] = useState<Choice>('auto');
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const wantsMotion =
    !failed && (choice === 'play' || (choice === 'auto' && motionAllowed && wide));
  const shouldPlay = wantsMotion && onScreen;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    if (!shouldPlay) {
      video.pause();
      return undefined;
    }
    const startTimer = window.setTimeout(() => setFailed(true), ANIMATION_START_TIMEOUT_MS);
    const started = () => window.clearTimeout(startTimer);
    video.addEventListener('playing', started, { once: true });
    const result = video.play() as Promise<void> | undefined;
    result?.catch(() => setFailed(true));
    return () => {
      window.clearTimeout(startTimer);
      video.removeEventListener('playing', started);
    };
  }, [shouldPlay]);

  const animating = wantsMotion && playing;
  const detailHref = localizeCrossHostHref(`${APP_ORIGIN}/detail/${artwork.TokenId}`, locale);

  return (
    <figure className={styles.animationFigure}>
      <div ref={plateRef} className={cn(ART_PLATE_CLASS, 'w-full')}>
        <ArtFrame
          sources={showcaseSources(artwork)}
          alt={artworkAlt.replace('{tokenLabel}', tokenLabel)}
          sizes={PLATE_SIZES}
          unavailableLabel={unavailableLabel}
          unavailableDetail={tokenLabel}
          className="absolute inset-0 shadow-none after:hidden"
        />
        {wantsMotion ? (
          <video
            ref={videoRef}
            src={showcaseAnimation(artwork)}
            muted
            playsInline
            loop
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
            onPlaying={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            className={cn(
              'absolute inset-0 z-[1] size-full object-contain',
              styles.animation,
              animating && styles.animationVisible,
            )}
          />
        ) : null}
      </div>
      <figcaption className={styles.wallLabel}>
        <div className="min-w-0">
          <a
            href={detailHref}
            aria-label={viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
            className="link-quiet type-body-md inline-flex items-center gap-1.5 font-medium text-foreground"
          >
            Cosmic Signature
            <ArrowRight aria-hidden className="size-4 text-subtle" />
          </a>
          <WallLabelMeta
            items={[
              <span key="id" className="type-mono">
                {tokenLabel}
              </span>,
              timerT('cycle.numbered', { number: artwork.RoundNum ?? 0 }),
              <span key="seed" className="inline-flex items-baseline gap-1.5">
                {seedLabel}
                <span className="type-hash">{shortSeed(artwork.Seed)}</span>
              </span>,
            ]}
          />
        </div>
        {failed ? null : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={styles.wallControls}
            onClick={() => setChoice(wantsMotion ? 'pause' : 'play')}
            aria-label={wantsMotion ? t('pauseAnimation') : t('playAnimation')}
          >
            {wantsMotion ? <Pause aria-hidden /> : <Play aria-hidden />}
          </Button>
        )}
      </figcaption>
    </figure>
  );
}
