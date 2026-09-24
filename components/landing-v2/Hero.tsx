import { ArrowDown, ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { EventHorizonCountdown } from './EventHorizonCountdown';
import { HeroArtShowcase } from './HeroArtShowcase';
import styles from './Landing.module.css';

/**
 * The landing hero: the headline beside a Signature on its black plate, the
 * loop in one sentence, one commit action and one quiet one, then the live
 * cycle clock. The source order is the reading order (headline, lede,
 * actions, then the exhibit), so keyboard and screen-reader users reach the
 * primary action before the exhibit's controls; on phones the grid draws the
 * plate directly under the headline, so the art is in the first screen. The
 * header belongs to the landing shell, and the trust evidence lives with
 * Verifiability, not here.
 *
 * A server component: only the exhibit and the clock hydrate.
 */
export function Hero({ hero }: { hero: LandingContent['hero'] }) {
  const locale = useLocale();
  const primaryHref = localizeCrossHostHref(hero.primaryCta.href, locale);

  return (
    <section className={styles.hero} aria-labelledby="landing-headline">
      {/* The palette's atmosphere (::before) and a static starfield kept to the
          gutters: no canvas, no motion, nothing behind a line of text. */}
      <div className={cn('starfield', styles.starfield)} aria-hidden="true" />

      <div className="site-container">
        <div className={styles.heroGrid}>
          <p className={cn('type-eyebrow text-subtle', styles.heroEyebrow)}>{hero.eyebrow}</p>
          <h1 id="landing-headline" className={cn('type-display-xl', styles.headline)}>
            {hero.headlineLead} <span className={styles.headlineAccent}>{hero.headlineAccent}</span>
          </h1>
          <p className={cn('type-body-md text-muted-foreground sm:type-lede', styles.subhead)}>
            {hero.subhead}
          </p>
          <div className={styles.actions}>
            {/* Same tab and a forward arrow: the app is Cosmic Signature too. */}
            <SiteLink
              href={primaryHref}
              kind={classifyHref(hero.primaryCta.href, 'landing')}
              className={cn(buttonVariants({ variant: 'commit', size: 'xl' }), 'no-underline')}
            >
              {hero.primaryCta.label}
              <ArrowRight aria-hidden />
            </SiteLink>
            {/* A link that reads as one: it scrolls to the cycle below. */}
            <SiteLink
              href={hero.secondaryCta.href}
              kind="internal"
              className="link-quiet type-body-md inline-flex min-h-11 items-center gap-1.5 font-medium text-foreground"
            >
              {hero.secondaryCta.label}
              <ArrowDown aria-hidden className="size-4 text-subtle" />
            </SiteLink>
          </div>
          <div className={styles.heroArt}>
            <HeroArtShowcase art={hero.art} />
          </div>
        </div>

        <div className={styles.clockBand}>
          <EventHorizonCountdown />
        </div>
      </div>
    </section>
  );
}
