import { ArrowDown } from 'lucide-react';

import type { LandingContent } from '@/content/landing';

import { cn } from '@/lib/utils';
import { PhrasedText } from '@/components/ui/phrased-text';

import { EventHorizonCountdown } from './EventHorizonCountdown';
import { HeroArtShowcase } from './HeroArtShowcase';
import { OpenAppLink } from './OpenAppLink';
import { SectionLink } from './SectionLink';
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
  return (
    <section className={styles.hero} aria-labelledby="landing-headline">
      {/* The palette's atmosphere (::before) and a static starfield kept to the
          gutters: no canvas, no motion, nothing behind a line of text. */}
      <div className={cn('starfield', styles.starfield)} aria-hidden="true" />

      <div className="site-container">
        <div className={styles.heroGrid}>
          <p className={cn('type-eyebrow text-subtle', styles.heroEyebrow)}>{hero.eyebrow}</p>
          <h1 id="landing-headline" className={cn('type-display-xl', styles.headline)}>
            <PhrasedText>{hero.headlineLead}</PhrasedText>{' '}
            <span className={styles.headlineAccent}>
              <PhrasedText>{hero.headlineAccent}</PhrasedText>
            </span>
          </h1>
          <p className={cn('type-body-md text-muted-foreground sm:type-lede', styles.subhead)}>
            {hero.subhead}
          </p>
          <div className={styles.actions}>
            <OpenAppLink variant="commit" size="xl" />
            {/* A link that reads as one: it takes the view and focus to the cycle below. */}
            <SectionLink
              section={hero.secondaryCta.href.replace(/^#/, '')}
              className="link-quiet type-body-md inline-flex min-h-11 items-center gap-1.5 font-medium text-foreground"
            >
              {hero.secondaryCta.label}
              <ArrowDown aria-hidden className="size-4 text-subtle" />
            </SectionLink>
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
