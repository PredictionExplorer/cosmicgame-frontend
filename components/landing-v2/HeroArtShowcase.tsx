'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import { formatId, getAssetsUrl } from '@/utils';
import type { LandingHeroArtContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import NFTImage from '@/components/nft/NFTImage';

import { useLandingShowcaseTokens } from './useLandingShowcaseTokens';

const ROTATION_MS = 14_000;

function FormingVisual({ art }: { art: LandingHeroArtContent }) {
  return (
    <div className="relative flex h-full min-h-[18rem] items-center justify-center overflow-hidden">
      <div className="absolute h-48 w-48 rounded-full border border-white/10" />
      <div className="absolute h-32 w-32 rounded-full border border-primary/20" />
      <div className="absolute h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_24px_rgb(var(--aurora-cyan-rgb)/0.8)]" />
      <div className="absolute h-px w-56 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <div className="relative z-[1] max-w-[16rem] px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
          {art.formingLabel}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{art.formingBody}</p>
      </div>
    </div>
  );
}

/**
 * The hero's living exhibit: a real imprinted Signature, rotating through the
 * newest tokens, framed beside the headline. Art is the protocol's whole
 * point, so a visitor's first screen shows the artwork itself — not only
 * copy about it. Falls back to a calm "forming" visual until (or unless)
 * the collection API responds; the landing itself stays fully static.
 */
export function HeroArtShowcase({ art }: { art: LandingHeroArtContent }) {
  const locale = useLocale();
  const tokens = useLandingShowcaseTokens();
  const rotationIndex = useRotatingIndex({
    count: tokens.length,
    intervalMs: ROTATION_MS,
    enabled: tokens.length > 1,
    randomStart: true,
  });
  const token = tokens[rotationIndex ?? 0] ?? null;
  const imageSrc = useMemo(() => {
    if (!token?.Seed) return null;
    return getAssetsUrl(`cosmicsignature/0x${token.Seed}.png`);
  }, [token]);
  const tokenLabel = token ? formatId(token.TokenId) : null;

  return (
    /* Transform-only entrance: nothing in the hero may mount at opacity 0 —
       an ancestor fade would gate the server-rendered HTML on hydration. */
    <motion.figure
      initial={{ y: 24 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      // Width-capped and end-aligned so the whole framed artwork (plus its
      // caption) stays above the fold beside the headline on desktop.
      className="relative m-0 w-full lg:max-w-[30rem] lg:justify-self-end"
      data-testid="hero-art-showcase"
    >
      <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.28em] text-white/55">
        <span className="h-1.5 w-1.5 rounded-full bg-[oklch(84.7%_0.149_213)] animate-signature-pulse" />
        {art.eyebrow}
      </p>

      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-black/40 shadow-[0_40px_140px_-60px_rgb(var(--aurora-cyan-rgb)/0.55)]">
        <div className="relative aspect-square">
          {token && imageSrc && tokenLabel ? (
            <Link
              key={token.TokenId}
              href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${token.TokenId}`, locale)}
              className="group block h-full animate-in fade-in duration-700"
              aria-label={art.viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
              data-testid="hero-art-link"
            >
              <NFTImage
                src={imageSrc}
                alt={art.artworkAlt.replace('{tokenLabel}', tokenLabel)}
                terminalFallbackSrc={null}
                unavailableLabel={art.formingLabel}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="h-full aspect-square object-cover transition-transform duration-700 group-hover:scale-[1.025]"
              />
            </Link>
          ) : (
            <FormingVisual art={art} />
          )}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(42% 42% at 50% 50%, transparent 0%, rgb(13 5 33 / 0.35) 88%)',
            }}
            aria-hidden
          />
        </div>

        {/* flex-wrap + no truncate: at 320px the caption and token id stack
            instead of ellipsizing (mobile overflow audit treats truncation
            as lost content). */}
        <figcaption className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 bg-black/50 px-4 py-3 text-xs backdrop-blur">
          <span className="min-w-0 break-words font-mono uppercase tracking-[0.18em] text-white/60">
            {art.caption}
          </span>
          <span className="shrink-0 font-mono text-white/90">{tokenLabel ?? '···'}</span>
        </figcaption>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
        <p className="text-white/65">{art.cstNote}</p>
        <Link
          href={localizeCrossHostHref(`${APP_ORIGIN}/gallery`, locale)}
          className="group inline-flex shrink-0 items-center gap-1.5 font-medium text-white/85 transition hover:text-white"
        >
          {art.galleryCta}
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </motion.figure>
  );
}
