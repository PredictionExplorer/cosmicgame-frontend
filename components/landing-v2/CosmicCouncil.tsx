import type { LandingContent } from '@/content/landing';

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
      <ol className={styles.rows}>
        {council.columns.map((column, index) => (
          <li key={column.title} className={styles.row}>
            <span className="type-mono pt-0.5 text-subtle">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <h3 className="type-title">{column.title}</h3>
              <p className="type-body-sm mt-1.5 text-muted-foreground">{column.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
