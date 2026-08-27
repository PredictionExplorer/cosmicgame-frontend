'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

import { formatId, getAssetsUrl } from '@/utils';
import type { LandingContent } from '@/content/landing';

import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import { useRotatingIndex } from '@/hooks/useRotatingIndex';
import NFTImage from '@/components/nft/NFTImage';

import { SectionHeading } from './SectionHeading';
import { useLandingShowcaseTokens } from './useLandingShowcaseTokens';

const ROTATION_MS = 18_000;

function GenerativeProcessVisual({ loading }: { loading: LandingContent['art']['loading'] }) {
  return (
    <div className="relative flex h-full min-h-[24rem] items-center justify-center overflow-hidden">
      <div className="absolute h-64 w-64 rounded-full border border-white/10" />
      <div className="absolute h-44 w-44 rounded-full border border-primary/20" />
      <div className="absolute h-24 w-24 rounded-full border border-[rgb(var(--nebula-violet-rgb)/0.35)]" />
      <div className="absolute h-3 w-3 rounded-full bg-primary shadow-[0_0_28px_rgb(var(--aurora-cyan-rgb)/0.8)]" />
      <div className="absolute h-px w-72 rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="absolute h-px w-56 -rotate-[32deg] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative z-[1] max-w-xs px-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
          {loading.label}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">{loading.description}</p>
      </div>
    </div>
  );
}

export function TheArt({ art }: { art: LandingContent['art'] }) {
  const locale = useLocale();
  const tokens = useLandingShowcaseTokens();
  const rotationIndex = useRotatingIndex({
    count: tokens.length,
    intervalMs: ROTATION_MS,
    enabled: tokens.length > 1,
    randomStart: true,
  });
  const showcaseToken = tokens[rotationIndex ?? 0] ?? null;
  const showcaseImage = useMemo(() => {
    if (!showcaseToken?.Seed) return null;
    return getAssetsUrl(`cosmicsignature/0x${showcaseToken.Seed}.png`);
  }, [showcaseToken]);
  const tokenLabel = showcaseToken ? formatId(showcaseToken.TokenId) : null;

  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#0D0521] py-28 sm:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 40% at 80% 20%, rgb(var(--nebula-violet-rgb) / 0.15) 0%, transparent 60%), radial-gradient(50% 50% at 15% 85%, rgb(var(--aurora-cyan-rgb) / 0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <SectionHeading eyebrow={art.eyebrow} heading={art.heading} description={art.description} />

        <div className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div className="relative aspect-square max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-black/40">
            {showcaseToken && showcaseImage && tokenLabel ? (
              <Link
                key={showcaseToken.TokenId}
                href={localizeCrossHostHref(
                  `${APP_ORIGIN}/detail/${showcaseToken.TokenId}`,
                  locale,
                )}
                className="group block h-full animate-in fade-in duration-700"
                aria-label={art.showcase.viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
              >
                <NFTImage
                  src={showcaseImage}
                  alt={art.showcase.artworkAlt.replace('{tokenLabel}', tokenLabel)}
                  terminalFallbackSrc={null}
                  unavailableLabel={art.loading.label}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full aspect-square object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                />
              </Link>
            ) : (
              <GenerativeProcessVisual loading={art.loading} />
            )}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(40% 40% at 50% 50%, transparent 0%, rgb(13 5 33 / 0.4) 85%)',
              }}
              aria-hidden
            />
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs backdrop-blur">
              <span className="font-mono uppercase tracking-[0.2em] text-white/60">
                {tokenLabel ? art.showcase.liveLabel : art.showcase.signalLabel}
              </span>
              <span className="font-mono text-white/90">
                {tokenLabel ?? art.showcase.awaitingMetadataLabel}
              </span>
            </div>
          </div>

          <ol className="relative space-y-0">
            {art.stages.map((stage, idx) => (
              <motion.li
                key={stage.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-5 border-l border-white/10 pb-8 pl-6 last:border-l-transparent last:pb-0 first:pt-0"
              >
                <div className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border border-white/20 bg-[#0D0521]">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-[oklch(84.7%_0.149_213)] to-[oklch(50.4%_0.247_296)] opacity-80" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                      {art.stageLabel} {stage.number}
                    </span>
                  </div>
                  <h3
                    className="mt-1 text-xl font-semibold text-white sm:text-2xl"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70 sm:text-base">
                    {stage.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {art.facts.map((fact) => (
            <div
              key={fact.label}
              className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/50">
                {fact.label}
              </p>
              <p
                className="mt-3 text-3xl font-semibold text-white"
                style={{ fontFamily: 'var(--font-family-display)' }}
              >
                {fact.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
