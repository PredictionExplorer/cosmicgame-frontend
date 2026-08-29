'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId, getAssetsUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import NFTImage from '@/components/nft/NFTImage';
import { Surface } from '@/components/ui/surface';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';

import { ArtReel, type ReelToken } from './ArtReel';

/**
 * Hero crop. The renders are ~3:2 with a roughly square orbit centred in a
 * wide black margin. The band is capped at 45rem (720px) tall: with the
 * 1.15× zoom a typical orbit nearly fills that height while its outermost
 * arcs keep a margin (1.3× felt too tight to Andrew; 1.4× clipped larger pieces);
 * the remaining black on the sides is the piece's own margin.
 */
export const HERO_ART_ZOOM = 1.15;

/** The generation reel only runs where a 3456px 60fps clip is reasonable. */
const REEL_MEDIA_QUERY = '(min-width: 1024px)';

interface DeckArtCardProps {
  /** Seed is `0x`-prefixed, matching the HomePage banner-token shape. */
  bannerToken: ReelToken | null;
  /** The token the rotation will show next; the hero pre-loads its clip. */
  nextBannerToken?: ReelToken | null;
  /**
   * `card` is the compact deck panel; `hero` stretches the artwork into a
   * full-width banner for the top of the page and plays each token's
   * generation clip instead of the still.
   */
  variant?: 'card' | 'hero';
  /** Hero only: the current clip finished (after its fade) — advance the token. */
  onReelEnded?: () => void;
  /**
   * Hero only: whether the reel is driving the rotation. While true the
   * parent should stop its interval timer so clips are never cut short.
   */
  onReelActiveChange?: (active: boolean) => void;
}

/**
 * The Deck's artwork panel: the protocol is an art performance first, so a
 * real imprinted Signature belongs in the first viewport, not below the fold.
 * Shows the same server-picked, client-rotated token as the story section —
 * one shared "featured artwork" concept across the page.
 */
export function DeckArtCard({
  bannerToken,
  nextBannerToken = null,
  variant = 'card',
  onReelEnded,
  onReelActiveChange,
}: DeckArtCardProps) {
  const t = useTranslations('home');
  const isHero = variant === 'hero';

  const prefersReducedMotion = usePrefersReducedMotion();
  const isReelViewport = useMediaQuery(REEL_MEDIA_QUERY);
  const [failedClipSeed, setFailedClipSeed] = useState<string | null>(null);
  const reelActive =
    isHero &&
    bannerToken != null &&
    onReelEnded != null &&
    isReelViewport &&
    !prefersReducedMotion &&
    failedClipSeed !== bannerToken.seed;

  useEffect(() => {
    onReelActiveChange?.(reelActive);
  }, [reelActive, onReelActiveChange]);

  const handleClipError = useCallback(() => {
    if (bannerToken) setFailedClipSeed(bannerToken.seed);
  }, [bannerToken]);

  const thumbSrc = bannerToken
    ? getAssetsUrl(`cosmicsignature/${bannerToken.seed}/thumb_card.webp`)
    : '';

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className="min-w-0 overflow-hidden"
    >
      <section
        aria-label={t('deck.art.sectionAria')}
        data-testid="deck-art-card"
        data-variant={variant}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t('deck.art.eyebrow')}
            </h2>
          </div>
          <Link
            href="/gallery"
            className={`inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary ${TOUCH_TARGET_TEXT_LINK_CLASS}`}
          >
            {t('deck.art.galleryCta')}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>

        {bannerToken ? (
          <Link
            // The still re-mounts per token for its fade-in; the reel must
            // NOT re-mount, or the pre-loaded next clip would be thrown away.
            key={reelActive ? 'reel' : bannerToken.id}
            href={`/detail/${bannerToken.id}`}
            className="group block animate-in fade-in duration-700"
            aria-label={t('deck.art.viewAria', { id: formatId(bannerToken.id) })}
            data-testid="deck-art-link"
          >
            <div
              className={
                isHero
                  ? 'relative aspect-[2/1] max-h-[45rem] w-full overflow-hidden bg-black'
                  : 'relative overflow-hidden bg-black/25'
              }
            >
              {/* The zoom sits on a wrapper so the reel's own opacity
                  transitions and the still's hover scale stay independent. */}
              <div
                className={isHero ? 'absolute inset-0' : undefined}
                style={isHero ? { transform: `scale(${HERO_ART_ZOOM})` } : undefined}
                data-testid={isHero ? 'deck-art-zoom' : undefined}
                data-overflow-audit={isHero ? 'ignore' : undefined}
              >
                {reelActive ? (
                  <ArtReel
                    current={bannerToken}
                    next={nextBannerToken}
                    poster={thumbSrc}
                    onEnded={onReelEnded}
                    onError={handleClipError}
                  />
                ) : (
                  <NFTImage
                    src={thumbSrc}
                    fallbackSrc={getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)}
                    terminalFallbackSrc={null}
                    alt={t('deck.art.alt', { id: formatId(bannerToken.id) })}
                    priority
                    sizes={
                      isHero
                        ? '100vw'
                        : '(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 380px'
                    }
                    className={
                      isHero
                        ? 'relative h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]'
                        : 'relative transition-transform duration-700 group-hover:scale-[1.03]'
                    }
                  />
                )}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3.5 pb-3 pt-10">
                <span className="inline-flex items-center rounded-full border border-white/[0.14] bg-white/[0.09] px-2.5 py-0.5 font-mono text-[11px] font-medium text-white/90 backdrop-blur-sm">
                  {formatId(bannerToken.id)}
                </span>
                <ArrowRight className="h-4 w-4 text-white/80 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ) : (
          <div
            data-testid="deck-art-placeholder"
            className="relative flex aspect-video items-center justify-center overflow-hidden bg-black/25"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgb(var(--aurora-cyan-rgb)/0.16),transparent_36%),radial-gradient(circle_at_75%_20%,rgb(var(--nebula-violet-rgb)/0.18),transparent_40%)]" />
            <p className="relative max-w-[16rem] px-4 text-center text-xs leading-relaxed text-muted-foreground">
              {t('hero.artUnavailable.body')}
            </p>
          </div>
        )}

        <p className="border-t border-white/[0.07] p-3.5 text-xs leading-relaxed text-muted-foreground">
          {t('deck.art.pairingNote')}
        </p>
      </section>
    </Surface>
  );
}
