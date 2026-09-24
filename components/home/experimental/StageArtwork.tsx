'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format/ids';
import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { signatureMedia, signatureSources } from '@/components/nft/signatureArt';
import { Button } from '@/components/ui/button';
import {
  ART_PLATE_CLASS,
  ArtFrame,
  PendingPlate,
  WallLabel,
  type ArtStatus,
} from '@/components/ui/art-frame';
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
 * name, token number and cycle, and the one control the artwork needs.
 *
 * On wide screens the plate plays each token's generation clip (the seeded
 * simulation drawing the Signature) and advances when it ends; elsewhere,
 * and whenever the viewer prefers reduced motion, it shows the still. Pause
 * holds whatever is showing — the clip on its frame, the still in place —
 * and is remembered in this browser. A token whose files all fail ends in
 * the designed unavailable plate, and the parent may skip to the next one.
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
  const reducedMotion = usePrefersReducedMotion();
  const isReelViewport = useMediaQuery(REEL_MEDIA_QUERY);
  const [failedClipSeed, setFailedClipSeed] = useState<string | null>(null);

  const reelActive =
    token != null &&
    isReelViewport &&
    !prefersStillArt(reducedMotion) &&
    failedClipSeed !== token.seed;

  useEffect(() => {
    onReelActiveChange(reelActive);
  }, [reelActive, onReelActiveChange]);

  const handleClipError = useCallback(() => {
    if (token) setFailedClipSeed(token.seed);
  }, [token]);

  const tokenId = token?.id ?? null;
  const handleStatus = useCallback(
    (status: ArtStatus) => {
      if (tokenId != null) onArtStatus?.(tokenId, status);
    },
    [onArtStatus, tokenId],
  );

  const media = signatureMedia(token?.seed);
  const tokenLabel = token ? formatId(token.id) : null;
  const name = token?.name?.trim();
  const title = !token
    ? t('hero.artUnavailable.eyebrow')
    : name
      ? t('deck.art.titleNamed', { name })
      : t('deck.art.title', { id: tokenLabel ?? '' });
  const alt = token ? t('deck.art.alt', { id: tokenLabel ?? '' }) : '';
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
          className="block rounded-edge"
        >
          {reelActive ? (
            <div className={cn(ART_PLATE_CLASS, 'aspect-art w-full')}>
              <ArtReel
                current={token}
                next={nextToken}
                poster={media.renditions[0]?.src ?? media.webImage}
                paused={paused}
                onEnded={onReelEnded}
                onError={handleClipError}
              />
            </div>
          ) : (
            // Keyed per token so each still arrives with a short fade.
            <div
              key={token.id}
              className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
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
          )}
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
                  <span key="id" className="type-mono text-muted-foreground">
                    {tokenLabel}
                  </span>,
                  token.cycle != null
                    ? t('hero.cycleNumber', { number: String(token.cycle) })
                    : null,
                ]
              : undefined
          }
          className="min-w-0 flex-1"
        >
          <p className="type-caption text-subtle">{t('deck.art.pairingNote')}</p>
        </WallLabel>
        <div className="-me-3 flex shrink-0 items-center gap-1 max-sm:-ms-3">
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
