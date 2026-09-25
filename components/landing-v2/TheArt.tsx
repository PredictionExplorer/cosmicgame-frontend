import type { LandingContent } from '@/content/landing';

import { cn } from '@/lib/utils';
import { Steps } from '@/components/ui/steps';

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
        <Steps
          className={styles.stages}
          stepLabel={(n) => `${art.stageLabel} ${n}`}
          items={art.stages.map((stage) => ({
            id: stage.number,
            title: stage.title,
            body: <p>{stage.body}</p>,
          }))}
        />
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
