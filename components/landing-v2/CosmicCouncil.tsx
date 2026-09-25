import type { LandingContent } from '@/content/landing';

import { NumberedRows } from './NumberedRows';
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
      <NumberedRows
        className={styles.rows}
        rows={council.columns.map((column, index) => ({
          key: column.id,
          marker: String(index + 1).padStart(2, '0'),
          title: column.title,
          body: column.body,
        }))}
      />
    </section>
  );
}
