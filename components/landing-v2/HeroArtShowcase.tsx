'use client';

import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { LandingHeroArtContent } from '@/content/landing';

import { formatId } from '@/utils/format';
import { getAssetsUrl, getThumbUrl } from '@/utils/urls';
import { Link } from '@/i18n/navigation';
import { APP_ORIGIN, localizeCrossHostHref } from '@/lib/hostRouting';
import NFTImage from '@/components/nft/NFTImage';

import { FEATURED_LANDING_ART } from './featured-art';
import { useLandingShowcaseTokens } from './useLandingShowcaseTokens';
import styles from './Landing.module.css';

/** Real, locally bundled Signatures keep the first paint complete, even offline.
 * Visitors control the exhibit: no automatic image swaps or moving link targets. */
export function HeroArtShowcase({ art }: { art: LandingHeroArtContent }) {
  const locale = useLocale();
  const t = useTranslations('landing.artwork');
  const liveTokens = useLandingShowcaseTokens();
  const [index, setIndex] = useState(0);
  const tokens = [
    ...FEATURED_LANDING_ART,
    ...liveTokens.filter(
      (token) => !FEATURED_LANDING_ART.some((artwork) => artwork.TokenId === token.TokenId),
    ),
  ];
  const token = tokens[index % tokens.length] ?? FEATURED_LANDING_ART[0];
  const tokenLabel = formatId(token.TokenId);
  const featured = FEATURED_LANDING_ART.find((artwork) => artwork.TokenId === token.TokenId);
  const imageSrc = featured?.imageSrc ?? getThumbUrl(String(token.Seed), 'card');

  return (
    <div className={styles.artShowcase} data-testid="hero-art-showcase">
      <div className={styles.artEyebrow}>
        <span>{art.eyebrow}</span>
        <ArrowUpRight size={16} strokeWidth={1.25} aria-hidden="true" />
      </div>
      <figure className={styles.artFrame}>
        <div className={styles.artImage}>
          <Link
            href={localizeCrossHostHref(`${APP_ORIGIN}/detail/${token.TokenId}`, locale)}
            aria-label={art.viewAriaLabel.replace('{tokenLabel}', tokenLabel)}
            data-testid="hero-art-link"
          >
            <NFTImage
              src={imageSrc}
              fallbackSrc={
                featured ? undefined : getAssetsUrl(`cosmicsignature/0x${token.Seed}.png`)
              }
              alt={art.artworkAlt.replace('{tokenLabel}', tokenLabel)}
              terminalFallbackSrc={null}
              unavailableLabel={art.formingLabel}
              loading="eager"
              sizes="(max-width: 767px) calc(100vw - 56px), (max-width: 1440px) 44vw, 600px"
              className="h-full aspect-square object-contain"
            />
          </Link>
        </div>
        <figcaption className={styles.artCaption}>
          <span>{art.caption}</span>
          <div className={styles.artControls}>
            <span aria-live="polite" aria-atomic="true">
              {tokenLabel}
            </span>
            <button
              type="button"
              onClick={() => setIndex((index + tokens.length - 1) % tokens.length)}
              aria-label={t('previous')}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((index + 1) % tokens.length)}
              aria-label={t('next')}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </figcaption>
      </figure>
      <div className={styles.artNotes}>
        <p>{art.cstNote}</p>
        <Link href={localizeCrossHostHref(`${APP_ORIGIN}/gallery`, locale)}>
          {art.galleryCta}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
