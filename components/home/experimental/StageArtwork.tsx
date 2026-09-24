'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { signatureMedia, signatureSources, useSignatureAlt } from '@/components/nft/signatureArt';
import { Button } from '@/components/ui/button';
import { ArtFrame, PendingPlate, WallLabel, type ArtStatus } from '@/components/ui/art-frame';
import { DateTime } from '@/components/ui/date-time';
import { cn } from '@/lib/utils';

import { ArtReel, type ReelToken } from './ArtReel';

/** The generation reel only runs where a 3456px 60fps clip is reasonable. */
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
  /** The token the rotation shows next; the reel pre-loads its clip. */
  nextToken?: ReelToken | null;
  /** More than one Signature exists, so the plate changes on its own. */
  rotates: boolean;
  /** The viewer paused the artwork (reel and rotation). */
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
  /** The current clip finished (after its fade): advance the token. */
  onReelEnded: () => void;
  /** Whether the reel drives the rotation; the parent stops its timer while it does. */
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
 * name, cycle and imprint date, and the one control the artwork needs.
 *
 * The still is always the plate's base layer: the server renders it, so it is
 * the page's first large paint, and nothing ever unmounts it. On wide screens
 * the generation clip (the seeded simulation drawing the Signature) is laid
 * over it and fades in only once it plays; the plate advances when a clip
 * ends. Elsewhere, and whenever the viewer prefers reduced motion, the still
 * is all there is. Pause holds whatever is showing — the clip on its frame,
 * the still in place — and is remembered in this browser. A token whose files
 * all fail ends in the designed unavailable plate, and the parent may skip to
 * the next one.
 */
export function StageArtwork({
  token,
  nextToken = null,
  rotates,
  paused,
  onPausedChange,
  onReelEnded,
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

  const reelActive =
    token != null &&
    isReelViewport &&
    !prefersStillArt(reducedMotion) &&
    failedClipSeed !== token.seed;

  // The server-picked first token paints at once; only a token the rotation
  // brings in later arrives with a fade ("adjust state when a prop changes").
  const [firstTokenId] = useState(() => token?.id ?? null);
  const [rotated, setRotated] = useState(false);
  if (!rotated && token != null && token.id !== firstTokenId) setRotated(true);

  useEffect(() => {
    onReelActiveChange(reelActive);
  }, [reelActive, onReelActiveChange]);

  const handleClipError = useCallback(() => {
    if (token) setFailedClipSeed(token.seed);
  }, [token]);

  // While the clip covers the still, a still that failed is no reason to skip
  // the token; if the clip gives up too, the failure is reported then.
  const tokenId = token?.id ?? null;
  const stillStatusRef = useRef<ArtStatus | null>(null);
  const handleStatus = useCallback(
    (status: ArtStatus) => {
      stillStatusRef.current = status;
      if (tokenId == null) return;
      if (status === 'unavailable' && reelActive) return;
      onArtStatus?.(tokenId, status);
    },
    [onArtStatus, tokenId, reelActive],
  );
  const wasReelActiveRef = useRef(reelActive);
  useEffect(() => {
    const clipGaveUp = wasReelActiveRef.current && !reelActive;
    wasReelActiveRef.current = reelActive;
    if (clipGaveUp && tokenId != null && stillStatusRef.current === 'unavailable') {
      onArtStatus?.(tokenId, 'unavailable');
    }
  }, [reelActive, tokenId, onArtStatus]);

  const media = signatureMedia(token?.seed);
  const tokenLabel = token ? formatId(token.id) : null;
  const name = token?.name?.trim();
  const title = !token
    ? t('hero.artUnavailable.eyebrow')
    : name
      ? t('deck.art.titleNamed', { name })
      : t('deck.art.title', { id: tokenLabel ?? '' });
  // The shared Signature alt: the name and number (traits when the token carries them).
  const alt = token && tokenLabel ? signatureAlt({ id: tokenLabel, name }) : '';
  const canPause = reelActive || rotates;

  return (
    <figure
      data-testid="home-art-hero"
      data-reel={reelActive ? 'active' : 'still'}
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
          {reelActive ? (
            // The clip layer covers the plate and keeps its print edge on top.
            <div className="pointer-events-none absolute inset-0 z-[3] overflow-hidden rounded-edge">
              <ArtReel
                current={token}
                next={nextToken}
                paused={paused}
                onEnded={onReelEnded}
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

      <figcaption className="mt-4 flex items-start justify-between gap-x-6 gap-y-3 max-sm:flex-col">
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
        </WallLabel>
        {/* The row wraps rather than widen a 320px page in long-label locales. */}
        <div className="-me-3 flex shrink-0 flex-wrap items-center gap-1 max-sm:-ms-3 max-sm:max-w-[calc(100%+1.5rem)]">
          {canPause && token ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onPausedChange(!paused)}
              data-testid="art-motion-toggle"
            >
              {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
              {/* Beside a narrow plate (lg) the icon carries it; the name stays. */}
              <span className="lg:max-xl:sr-only">
                {paused ? tDetail('viewer.play') : tDetail('viewer.pause')}
              </span>
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
