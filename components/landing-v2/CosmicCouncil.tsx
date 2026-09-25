import type { LandingContent } from '@/content/landing';

import { Steps } from '@/components/ui/steps';

import { SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * The Cosmic Council, beside Verifiability: one line on what holders do, and
 * the three rules that carry the numbers (threshold, weight, quorum).
 */
export function CosmicCouncil({ council }: { council: LandingContent['council'] }) {
  return (
    <section aria-labelledby="landing-council-heading" className="min-w-0">
      <SectionHeading
        size="compact"
        eyebrow={council.eyebrow}
        heading={council.heading}
        headingId="landing-council-heading"
        description={council.body}
      />
      <Steps
        framed
        className={styles.rows}
        items={council.columns.map((column) => ({
          id: column.id,
          title: column.title,
          body: <p>{column.body}</p>,
        }))}
      />
    </section>
  );
}
