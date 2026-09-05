import { ArrowUpRight, Fingerprint, Orbit, Sparkles } from 'lucide-react';

import type { LandingContent } from '@/content/landing';

import { SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

const STAGE_ICONS = [Orbit, Fingerprint, Sparkles, ArrowUpRight];

export function TheCycle({ cycle }: { cycle: LandingContent['cycle'] }) {
  return (
    <section id="cycle" className={styles.section}>
      <div className={styles.sectionInner}>
        <SectionHeading
          eyebrow={cycle.eyebrow}
          heading={cycle.heading}
          description={cycle.description}
        />
        <ol className={styles.cycleGrid}>
          {cycle.stages.map((stage, index) => {
            const Icon = STAGE_ICONS[index];
            return (
              <li key={stage.number} className={styles.cycleStage}>
                <div className={styles.stageTop}>
                  <span>{stage.number}</span>
                  {Icon && <Icon size={22} strokeWidth={1.25} aria-hidden="true" />}
                </div>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
