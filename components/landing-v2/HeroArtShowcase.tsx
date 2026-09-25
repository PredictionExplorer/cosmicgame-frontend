'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { LandingHeroArtContent } from '@/content/landing';

import { formatId } from '@/utils/format/ids';
import { classifyHref } from '@/config/siteNav';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import {
  ART_PLATE_CLASS,
  ArtImage,
  PendingPlate,
  WallLabelMeta,
  renditionSrcSet,
  useArtSourceChain,
} from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';

import { showcaseArtworks, showcaseSources, type ShowcaseArtwork } from './showcase-art';
import { useSignatureLabel } from './signatureLabel';
import { useArtMotionAllowed, useHydrated, useOnScreen } from './useArtMotion';
import { useLandingShowcaseTokens } from './useLandingShowcaseTokens';
import styles from './Landing.module.css';

/** How long each Signature holds the plate while the rotation runs. */
export const ROTATION_INTERVAL_MS = 8_000;

/**
 * The plate's rendered width: from 100rem the art column reaches into the
 * right gutter (Landing.module.css .heroGrid), seven of twelve columns from
 * 64rem, the full column below.
 */
const PLATE_SIZES =
  '(min-width: 130rem) 63.75rem, (min-width: 100rem) calc(46vw + 3.75rem), (min-width: 80rem) 46rem, (min-width: 64rem) 56vw, 100vw';

/** Loads an artwork's first source the way the plate will, so the swap never flashes. */
function preloadArtwork(artwork: ShowcaseArtwork): Promise<boolean> {
  const [first] = showcaseSources(artwork);
  if (!first) return Promise.resolve(false);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    if (typeof first === 'string') {
      image.src = first;
    } else {
      image.sizes = PLATE_SIZES;
      image.srcset = renditionSrcSet(first);
      image.src = first[0]?.src ?? '';
    }
  });
}

/**
 * One Signature on the plate. An entering layer stays transparent until its
 * image has loaded, then fades in over the layer beneath; `onEntered` fires
 * once it is fully opaque, so the layer beneath can go.
 */
function PlateLayer({
  artwork,
  alt,
  unavailableLabel,
  priority,
  entering,
  onEntered,
}: {
  artwork: ShowcaseArtwork;
  alt: string;
  unavailableLabel: string;
  priority: boolean;
  entering: boolean;
  onEntered?: () => void;
}) {
  const chain = useArtSourceChain(showcaseSources(artwork));
  const [faded, setFaded] = useState(!entering);
  const ready = chain.status !== 'loading';

  useEffect(() => {
    if (faded && ready) onEntered?.();
  }, [faded, ready, onEntered]);

  return (
    <div
      className={cn('absolute inset-0', entering && (ready ? styles.plateEnter : 'opacity-0'))}
      onAnimationEnd={() => setFaded(true)}
    >
      {chain.source === null ? (
        <PendingPlate label={unavailableLabel} detail={formatId(artwork.TokenId)} alt={alt} />
      ) : (
        <ArtImage
          source={chain.source}
          alt={alt}
          sizes={PLATE_SIZES}
          priority={priority}
          onError={chain.onError}
          onLoad={chain.onLoad}
          className="size-full object-contain"
        />
      )}
    </div>
  );
}

/**
 * The hero's exhibit: a Signature on its black plate at the native ratio,
 * with its wall label beneath. The bundled featured pieces paint first
 * (even offline); the collection joins once it answers. While motion is
 * allowed the plate crossfades to the next piece every eight seconds,
 * holding still while it is hovered, focused, off screen or paused, and
 * never under reduced motion or Save-Data, where the visitor steps through
 * the pieces alone. A piece is preloaded before it takes the plate, and one
 * that cannot load is skipped.
 */
export function HeroArtShowcase({ art }: { art: LandingHeroArtContent }) {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const label = useSignatureLabel();
  const showcase = useLandingShowcaseTokens();
  const artworks = useMemo(() => showcaseArtworks(showcase.tokens), [showcase.tokens]);
  const motionAllowed = useArtMotionAllowed();
  const hydrated = useHydrated();
  const figureRef = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(figureRef);

  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const skipped = useRef(new Set<number>());

  const count = artworks.length;
  const current = artworks[index % count] ?? artworks[0]!;
  const tokenLabel = formatId(current.TokenId);
  const unavailableLabel = t('unavailable');
  const canRotate = motionAllowed && count > 1;
  const rotating = canRotate && !paused && !held && onScreen;

  const show = (nextIndex: number) => {
    const normalized = ((nextIndex % count) + count) % count;
    if (normalized === index % count) return;
    setPrevious(motionAllowed ? index % count : null);
    setIndex(normalized);
  };

  const step = (direction: 1 | -1) => {
    const nextIndex = (((index + direction) % count) + count) % count;
    show(nextIndex);
    const next = artworks[nextIndex]!;
    setAnnouncement(
      next.TokenName?.trim() ? `${label.text(next)} ${formatId(next.TokenId)}` : label.text(next),
    );
  };

  useEffect(() => {
    if (!rotating) return undefined;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      // Walk forward to the next piece that loads; give up after one lap.
      for (let offset = 1; offset < count; offset += 1) {
        const candidate = (index + offset) % count;
        if (skipped.current.has(candidate)) continue;
        const loaded = await preloadArtwork(artworks[candidate]!);
        if (cancelled) return;
        if (loaded) {
          setPrevious(index % count);
          setIndex(candidate);
          return;
        }
        skipped.current.add(candidate);
      }
    }, ROTATION_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [rotating, index, count, artworks]);

  const clearPrevious = useCallback(() => setPrevious(null), []);

  const releaseFocus = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHeld(false);
  };

  const detailHref = localizeCrossHostHref(`${APP_ORIGIN}/detail/${current.TokenId}`, locale);
  const galleryHref = localizeCrossHostHref(`${APP_ORIGIN}/gallery`, locale);
  const previousArtwork = previous === null ? null : artworks[previous];

  return (
    <figure
      ref={figureRef}
      className={styles.showcase}
      data-testid="hero-art-showcase"
      data-rotating={rotating ? 'true' : 'false'}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={releaseFocus}
    >
      <SiteLink
        href={detailHref}
        kind={classifyHref(detailHref, 'landing')}
        aria-label={art.viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
        data-testid="hero-art-link"
        className={cn(ART_PLATE_CLASS, 'block w-full')}
      >
        {previousArtwork ? (
          <PlateLayer
            key={`previous-${previousArtwork.TokenId}`}
            artwork={previousArtwork}
            alt=""
            unavailableLabel={unavailableLabel}
            priority={false}
            entering={false}
          />
        ) : null}
        <PlateLayer
          key={current.TokenId}
          artwork={current}
          alt={art.artworkAlt.replace('{tokenLabel}', tokenLabel)}
          unavailableLabel={unavailableLabel}
          priority={index === 0}
          entering={previousArtwork !== null}
          onEntered={clearPrevious}
        />
      </SiteLink>
      <figcaption className={styles.wallLabel}>
        <div className={styles.wallLabelText}>
          {/* The title opens the same page as the plate: one target for the
              pointer, one tab stop (the plate) for the keyboard. */}
          <SiteLink
            href={detailHref}
            kind={classifyHref(detailHref, 'landing')}
            tabIndex={-1}
            aria-hidden="true"
            className="link-quiet type-body-md font-medium text-foreground [overflow-wrap:anywhere]"
          >
            {label.title(current)}
          </SiteLink>
          <WallLabelMeta items={label.meta(current)} />
        </div>
        <div className={styles.wallControls}>
          <SiteLink
            href={galleryHref}
            kind={classifyHref(galleryHref, 'landing')}
            className="link-quiet type-body-sm hidden min-h-10 items-center gap-1.5 text-muted-foreground transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            {art.galleryCta}
            <ArrowRight aria-hidden className="size-4 text-subtle" />
          </SiteLink>
          {count > 1 ? (
            <div className={cn('flex items-center', styles.scriptedControl)}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => step(-1)}
                aria-label={t('previous')}
              >
                <ChevronLeft aria-hidden />
              </Button>
              {canRotate ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPaused((value) => !value)}
                  aria-label={paused ? t('resumeRotation') : t('pauseRotation')}
                >
                  {/* Solid glyphs: an outlined pause reads as "00" beside a token number. */}
                  {paused ? (
                    <Play aria-hidden fill="currentColor" strokeWidth={0} />
                  ) : (
                    <Pause aria-hidden fill="currentColor" strokeWidth={0} />
                  )}
                </Button>
              ) : !hydrated ? (
                // Holds the pause button's place until the page knows whether
                // the art may move, so Previous and Next never shift sideways.
                // Reduced motion never gets the button, so it never holds a place.
                <span aria-hidden className="size-11 shrink-0 motion-reduce:hidden sm:size-10" />
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => step(1)}
                aria-label={t('next')}
              >
                <ChevronRight aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
        <span className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </span>
      </figcaption>
    </figure>
  );
}
