import type { LandingContent } from '@/content/landing';

import { cn } from '@/lib/utils';

import { ArtAnimationPlate } from './ArtAnimationPlate';
import { ImprintedFigure } from './ImprintedFigure';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

interface TheArtProps {
  art: LandingContent['art'];
}

/**
 * The Art, right after the hero: a Signature and the animation of its
 * simulation on a plate that stays in view while the seven stages of the
 * pipeline scroll beside it, then the collection's figures in one strip.
 */
export function TheArt({ art }: TheArtProps) {
  const seed = art.stages[0];
  return (
    <LandingSection id="art" labelledBy="landing-art-heading">
      <SectionHeading
        eyebrow={art.eyebrow}
        heading={art.heading}
        headingId="landing-art-heading"
        description={art.description}
        layout="split"
      />

      <div className={styles.artLayout}>
        <div className={styles.artPlate}>
          <ArtAnimationPlate
            artworkAlt={art.showcase.artworkAlt}
            viewAriaLabel={art.showcase.viewAriaLabel}
            seedLabel={seed?.title ?? ''}
          />
        </div>
        <ol className={styles.stages}>
          {art.stages.map((stage) => (
            <li key={stage.number} className={styles.stage}>
              <span className="type-label pt-1 tabular-nums text-subtle">
                <span className="sr-only">{art.stageLabel} </span>
                {stage.number}
              </span>
              <div className="min-w-0">
                <h3 className="type-heading-3">{stage.title}</h3>
                <p className="type-body-sm mt-1.5 text-muted-foreground">{stage.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <dl className={styles.figureStrip}>
        {art.facts.map((fact) => (
          <div key={fact.id} className={styles.figure}>
            <dt className="type-label text-subtle">{fact.label}</dt>
            <dd className={cn('type-figure-md mt-2 sm:type-figure-lg', styles.figureValue)}>
              {fact.value ?? <ImprintedFigure />}
            </dd>
          </div>
        ))}
      </dl>
    </LandingSection>
  );
}
