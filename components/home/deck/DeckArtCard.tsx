'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId, getAssetsUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import NFTImage from '@/components/nft/NFTImage';
import { Surface } from '@/components/ui/surface';

interface DeckArtCardProps {
  /** Seed is `0x`-prefixed, matching the HomePage banner-token shape. */
  bannerToken: { seed: string; id: number } | null;
}

/**
 * The Deck's artwork panel: the protocol is an art performance first, so a
 * real imprinted Signature belongs in the first viewport, not below the fold.
 * Shows the same server-picked, client-rotated token as the story section —
 * one shared "featured artwork" concept across the page.
 */
export function DeckArtCard({ bannerToken }: DeckArtCardProps) {
  const t = useTranslations('home');

  return (
    <Surface
      asChild
      variant="glass-bordered"
      radius="xl"
      padding="none"
      className="min-w-0 overflow-hidden"
    >
      <section aria-label={t('deck.art.sectionAria')} data-testid="deck-art-card">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.07] p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <h2 className="font-display text-lg font-bold tracking-tight">
              {t('deck.art.eyebrow')}
            </h2>
          </div>
          <Link
            href="/gallery"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            {t('deck.art.galleryCta')}
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>

        {bannerToken ? (
          <Link
            key={bannerToken.id}
            href={`/detail/${bannerToken.id}`}
            className="group block animate-in fade-in duration-700"
            aria-label={t('deck.art.viewAria', { id: formatId(bannerToken.id) })}
            data-testid="deck-art-link"
          >
            <div className="relative overflow-hidden bg-black/25">
              <NFTImage
                src={getAssetsUrl(`cosmicsignature/${bannerToken.seed}/thumb_card.webp`)}
                fallbackSrc={getAssetsUrl(`cosmicsignature/${bannerToken.seed}.png`)}
                terminalFallbackSrc={null}
                alt={t('deck.art.alt', { id: formatId(bannerToken.id) })}
                priority
                sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 50vw, 380px"
                className="relative transition-transform duration-700 group-hover:scale-[1.03]"
              />
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
