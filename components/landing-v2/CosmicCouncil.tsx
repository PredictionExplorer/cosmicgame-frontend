import type { ComponentType, SVGProps } from 'react';
import { Scale, ScrollText, UsersRound } from 'lucide-react';

import type { LandingContent, LandingCouncilColumnId } from '@/content/landing';

import { Steps } from '@/components/ui/steps';

import { SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * Each rule's glyph, by its structure id (content/landing/structure.ts). The
 * rules are not steps in an order, so they carry glyphs, as Verifiability's
 * claims beside them do, never numbers: one list idiom across the band.
 */
const RULE_ICONS: Readonly<Record<LandingCouncilColumnId, ComponentType<SVGProps<SVGSVGElement>>>> =
  {
    proposal: ScrollText,
    weight: Scale,
    quorum: UsersRound,
  };

const isRuleId = (id: string): id is LandingCouncilColumnId => id in RULE_ICONS;

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
        ordered={false}
        framed
        className={styles.rows}
        items={council.columns.map((column) => {
          const Icon = isRuleId(column.id) ? RULE_ICONS[column.id] : ScrollText;
          return {
            id: column.id,
            marker: <Icon aria-hidden className="size-5" strokeWidth={1.5} />,
            title: column.title,
            body: <p>{column.body}</p>,
          };
        })}
      />
    </section>
  );
}
