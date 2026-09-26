'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Clapperboard, ImageIcon, LoaderCircle, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { signatureMedia, signatureSources, useSignatureAlt } from '@/components/nft/signatureArt';
import { Button } from '@/components/ui/button';
import { ArtFrame, PendingPlate, WallLabel, type ArtStatus } from '@/components/ui/art-frame';
import { DateTime } from '@/components/ui/date-time';
import { useSignatureLabel } from '@/components/ui/signature-label';
import { cn } from '@/lib/utils';

import { ArtReel, type ReelToken } from './ArtReel';

/** The generation reel is offered only where a 3456px 60fps clip is reasonable. */
export const REEL_MEDIA_QUERY = '(min-width: 1024px)';

/** The featured token, with what its wall label needs. */
export interface StageToken extends ReelToken {
  /** The owner-given name, when the token has one. */
  name?: string | null;
  /** The cycle that imprinted it. */
  cycle?: number | null;
  /** When it was imprinted, in Unix seconds. */
  imprintedAt?: number | null;
}

interface StageArtworkProps {
  token: StageToken | null;
  /** More than one Signature exists, so the plate changes on its own. */
  rotates: boolean;
  /** The viewer paused the artwork (the rotation, and a drawing under way). */
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
  /** The viewer is watching a Signature take shape; the parent holds its rotation meanwhile. */
  onReelActiveChange: (active: boolean) => void;
  /**
   * The still of a token loaded, or every source of it failed (the parent may
   * then move on to the next token).
   */
  onArtStatus?: (tokenId: number, status: ArtStatus) => void;
  className?: string;
}

function prefersStillArt(reducedMotion: boolean): boolean {
  if (reducedMotion) return true;
  if (typeof document === 'undefined') return false;
  return document.documentElement.dataset.motion === 'reduced';
}

/**
 * The page's featured Signature, hung on its black plate at the native
 * 3456:2234 ratio with nothing on top of it, and its wall label beneath:
 * name, cycle and imprint date, and the controls the artwork needs.
 *
 * The finished still is the plate: the server renders it, so it is the
 * page's first large paint, and nothing unmounts or covers it unasked. On
 * wide screens the wall label offers "Watch it take shape": the generation
 * clip (the seeded simulation drawing the Signature from its first stroke)
 * loads then, fades in over the still once it plays, and fades back to the
 * finished still at its end. The rotation of stills holds while it plays.
 * Elsewhere, and whenever the viewer prefers reduced motion, the still is all
 * there is. Pause holds whatever moves (the rotation, a drawing on its frame)
 * and is remembered in this browser. A token whose files all fail ends in the
 * designed unavailable plate, and the parent may skip to the next one.
 */
export function StageArtwork({
  token,
  rotates,
  paused,
  onPausedChange,
  onReelActiveChange,
  onArtStatus,
  className,
}: StageArtworkProps) {
  const t = useTranslations('home');
  const tDetail = useTranslations('detail');
  const signatureAlt = useSignatureAlt();
  const reducedMotion = usePrefersReducedMotion();
  const isReelViewport = useMediaQuery(REEL_MEDIA_QUERY);
  const [failedClipSeed, setFailedClipSeed] = useState<string | null>(null);
  // The token the viewer asked to watch, and the one whose clip plays. Keyed
  // by seed, so a token change ends a drawing without an effect.
  const [watchSeed, setWatchSeed] = useState<string | null>(null);
  const [playingSeed, setPlayingSeed] = useState<string | null>(null);

  const canDraw =
    token != null &&
    isReelViewport &&
    !prefersStillArt(reducedMotion) &&
    failedClipSeed !== token.seed;
  const drawing = canDraw && watchSeed === token.seed;
  const clipLoading = drawing && playingSeed !== token.seed;
  const clipFailed = token != null && isReelViewport && failedClipSeed === token.seed;

  // The server-picked first token paints at once; only a token the rotation
  // brings in later arrives with a fade ("adjust state when a prop changes").
  const [firstTokenId] = useState(() => token?.id ?? null);
  const [rotated, setRotated] = useState(false);
  if (!rotated && token != null && token.id !== firstTokenId) setRotated(true);

  useEffect(() => {
    onReelActiveChange(drawing);
  }, [drawing, onReelActiveChange]);

  const tokenSeed = token?.seed ?? null;
  const toggleDrawing = useCallback(() => {
    if (!tokenSeed) return;
    if (drawing) {
      setWatchSeed(null);
      return;
    }
    setWatchSeed(tokenSeed);
    setPlayingSeed(null);
    // Asking to watch is asking for motion: a paused plate plays again.
    if (paused) onPausedChange(false);
  }, [drawing, onPausedChange, paused, tokenSeed]);

  const handleClipPlaying = useCallback(() => setPlayingSeed(tokenSeed), [tokenSeed]);
  const handleClipEnded = useCallback(() => setWatchSeed(null), []);
  const handleClipError = useCallback(() => {
    if (tokenSeed) setFailedClipSeed(tokenSeed);
  }, [tokenSeed]);

  // While the clip covers the still, a still that failed is no reason to skip
  // the token; if the clip ends or gives up, the failure is reported then.
  const tokenId = token?.id ?? null;
  const stillStatusRef = useRef<ArtStatus | null>(null);
  const handleStatus = useCallback(
    (status: ArtStatus) => {
      stillStatusRef.current = status;
      if (tokenId == null) return;
      if (status === 'unavailable' && drawing) return;
      onArtStatus?.(tokenId, status);
    },
    [onArtStatus, tokenId, drawing],
  );
  const wasDrawingRef = useRef(drawing);
  useEffect(() => {
    const drawingStopped = wasDrawingRef.current && !drawing;
    wasDrawingRef.current = drawing;
    if (drawingStopped && tokenId != null && stillStatusRef.current === 'unavailable') {
      onArtStatus?.(tokenId, 'unavailable');
    }
  }, [drawing, tokenId, onArtStatus]);

  const media = signatureMedia(token?.seed);
  const tokenLabel = token ? formatId(token.id) : null;
  const name = token?.name?.trim();
  const signatureLabel = useSignatureLabel();
  // The one wall-label rule: the name, or "Signature #000011" with the number in mono.
  const title = !token
    ? t('hero.artUnavailable.eyebrow')
    : signatureLabel.title({ tokenId: token.id, name });
  // The shared Signature alt: the name and number (traits when the token carries them).
  const alt = token && tokenLabel ? signatureAlt({ id: tokenLabel, name }) : '';
  const canPause = drawing || rotates;

  let drawingIcon = <Clapperboard aria-hidden />;
  if (clipLoading) {
    drawingIcon = <LoaderCircle aria-hidden className="animate-spin" />;
  } else if (drawing) {
    drawingIcon = <ImageIcon aria-hidden />;
  }

  return (
    <figure
      data-testid="home-art-hero"
      data-reel={drawing ? 'drawing' : canDraw ? 'available' : 'still'}
      className={cn('min-w-0', className)}
    >
      {token && media ? (
        <Link
          href={`/detail/${token.id}`}
          aria-label={t('deck.art.viewAria', { id: tokenLabel ?? '' })}
          data-testid="deck-art-link"
          className="group/plate relative block rounded-edge"
        >
          {/* Keyed per token, so a new still replaces the last one whole. */}
          <div
            key={token.id}
            className={cn(
              rotated && 'motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700',
            )}
          >
            <ArtFrame
              sources={signatureSources(media)}
              alt={alt}
              sizes="(min-width: 1280px) 750px, (min-width: 1024px) 58vw, 100vw"
              priority
              unavailableLabel={tDetail('image.artworkUnavailable')}
              unavailableDetail={tokenLabel}
              onStatusChange={handleStatus}
            />
          </div>
          {drawing ? (
            // The clip layer covers the plate and keeps its print edge on top.
            <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-edge">
              <ArtReel
                key={token.seed}
                token={token}
                paused={paused}
                onPlaying={handleClipPlaying}
                onEnded={handleClipEnded}
                onError={handleClipError}
              />
              <span
                aria-hidden
                className="absolute inset-0 rounded-[inherit] shadow-[var(--art-edge)] transition-shadow duration-[var(--duration-fast)] group-hover/plate:shadow-[var(--art-edge-active)] group-focus-visible/plate:shadow-[var(--art-edge-active)]"
              />
            </div>
          ) : null}
        </Link>
      ) : (
        <PendingPlate label={t('hero.artUnavailable.body')} className="px-6" />
      )}

      {/* The controls sit beside the label under a full-width plate, and
          under it beside the monument (from 1024px), where the plate's
          column is too narrow for both. */}
      <figcaption className="mt-4 flex items-start justify-between gap-x-6 gap-y-3 max-sm:flex-col lg:flex-col lg:gap-y-2">
        <WallLabel
          title={title}
          meta={
            token
              ? [
                  // The number leads only when a name took the title line.
                  name ? (
                    <span key="id" className="type-mono text-muted-foreground">
                      {tokenLabel}
                    </span>
                  ) : null,
                  token.cycle != null
                    ? t('latestSignature.imprintedIn', { number: String(token.cycle) })
                    : null,
                  token.imprintedAt ? (
                    <DateTime key="at" timestamp={token.imprintedAt} variant="relative" />
                  ) : null,
                ]
              : undefined
          }
          className="min-w-0 flex-1"
        >
          <p className="type-caption text-subtle">{t('deck.art.pairingNote')}</p>
          {clipFailed ? (
            <p role="status" data-testid="art-reel-error" className="mt-1 type-caption text-subtle">
              {tDetail('viewer.motionError')}
            </p>
          ) : null}
        </WallLabel>
        {/* The row wraps rather than widen a 320px page in long-label
            locales; a ghost button's text lines up with the label's. */}
        <div className="-me-3 flex shrink-0 flex-wrap items-center gap-1 max-sm:-ms-3 max-sm:max-w-[calc(100%+1.5rem)] lg:-ms-3 lg:me-0 lg:max-w-[calc(100%+0.75rem)]">
          {canDraw ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={toggleDrawing}
              aria-busy={clipLoading || undefined}
              data-testid="art-reel-toggle"
            >
              {drawingIcon}
              {drawing ? t('deck.art.showFinished') : t('deck.art.watchDrawing')}
            </Button>
          ) : null}
          {canPause && token ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPausedChange(!paused)}
              data-testid="art-motion-toggle"
            >
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
              {paused ? tDetail('viewer.play') : tDetail('viewer.pause')}
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="sm">
            <Link href="/gallery">
              {t('deck.art.galleryCta')}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </figcaption>
    </figure>
  );
}
