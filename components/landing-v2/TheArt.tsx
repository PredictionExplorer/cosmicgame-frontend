'use client';

import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { formatId } from '@/utils/format';
import { getAssetsUrl, getThumbUrl } from '@/utils/urls';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import NFTImage from '@/components/nft/NFTImage';

import { SectionHeading } from './SectionHeading';
import { useLandingShowcaseTokens } from './useLandingShowcaseTokens';
import { FEATURED_LANDING_ART } from './featured-art';

export function TheArt({ art }: { art: LandingContent['art'] }) {
  const locale = useLocale();
  const tokens = useLandingShowcaseTokens();
  const showcaseToken = tokens[1] ?? tokens[0] ?? FEATURED_LANDING_ART[1];
  const featured = FEATURED_LANDING_ART.find((token) => token.TokenId === showcaseToken.TokenId);
  const showcaseImage = featured?.imageSrc ?? getThumbUrl(String(showcaseToken.Seed), 'card');
  const tokenLabel = formatId(showcaseToken.TokenId);

  return (
    <section
      id="art"
      className="relative overflow-hidden border-t border-border bg-card py-16 sm:py-24 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(60% 40% at 80% 20%, hsl(var(--secondary) / 0.1) 0%, transparent 60%), radial-gradient(50% 50% at 15% 85%, hsl(var(--primary) / 0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-12">
        <SectionHeading eyebrow={art.eyebrow} heading={art.heading} description={art.description} />

        <div className="mt-12 grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-20">
          <figure className="relative aspect-square max-w-xl overflow-hidden rounded-3xl border border-border bg-surface-deep">
            <Link
              key={showcaseToken.TokenId}
              href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${showcaseToken.TokenId}`, locale)}
              className="group block h-full focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-4"
              aria-label={art.showcase.viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
            >
              <NFTImage
                src={showcaseImage}
                fallbackSrc={
                  featured ? undefined : getAssetsUrl(`cosmicsignature/0x${showcaseToken.Seed}.png`)
                }
                alt={art.showcase.artworkAlt.replace('{tokenLabel}', tokenLabel)}
                terminalFallbackSrc={null}
                unavailableLabel={art.loading.label}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-full aspect-square object-contain transition-transform duration-700 group-hover:scale-[1.025]"
              />
            </Link>
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(40% 40% at 50% 50%, transparent 0%, hsl(var(--surface-deep) / 0.4) 85%)',
              }}
              aria-hidden
            />
            <figcaption className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 items-center justify-between rounded-xl border border-border bg-surface-deep/80 px-4 py-3 text-xs backdrop-blur">
              <span className="font-mono uppercase tracking-[0.2em] text-muted-foreground">
                {art.showcase.collectionLabel}
              </span>
              <span className="font-mono text-foreground/90">{tokenLabel}</span>
            </figcaption>
          </figure>

          <ol className="relative space-y-0">
            {art.stages.map((stage, idx) => (
              <motion.li
                key={stage.number}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.55, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex gap-5 border-l border-border pb-8 pl-6 last:border-l-transparent last:pb-0 first:pt-0"
              >
                <div className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border border-primary/20 bg-card">
                  <div className="h-full w-full rounded-full bg-linear-to-br from-primary to-secondary opacity-80" />
                </div>
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      {art.stageLabel} {stage.number}
                    </span>
                  </div>
                  <h3
                    className="mt-1 text-xl font-semibold text-foreground sm:text-2xl"
                    style={{ fontFamily: 'var(--font-family-display)' }}
                  >
                    {stage.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {stage.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {art.facts.map((fact) => (
            <div
              key={fact.label}
              className="relative rounded-2xl border border-border bg-foreground/[0.02] p-6 backdrop-blur"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {fact.label}
              </p>
              <p
                className="mt-3 text-3xl font-semibold text-foreground"
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
