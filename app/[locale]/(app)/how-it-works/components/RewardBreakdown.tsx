import { ImageIcon, type LucideIcon } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { CstTokenIcon, SignatureAllocationIcon, StellarSelectionIcon } from '@/lib/conceptIcons';
import { ExplainedTerm } from '@/components/ui/explain-popover';
import { SectionHeader } from '@/components/ui/section-header';

/** One concept icon per item, in the content's order. */
const ICONS: readonly [LucideIcon, LucideIcon, LucideIcon, LucideIcon] = [
  CstTokenIcon,
  StellarSelectionIcon,
  ImageIcon,
  SignatureAllocationIcon,
];

/**
 * What one gesture can lead to: four outcomes on the page's hairline, each
 * with its concept icon, a title that explains itself on tap, and one
 * sentence. No tiles: the drawing above carries the colour.
 */
export function RewardBreakdown({
  rewardBreakdown,
}: {
  rewardBreakdown: HowItWorksContent['rewardBreakdown'];
}) {
  return (
    <section aria-labelledby="rewards-heading">
      <SectionHeader
        headingId="rewards-heading"
        title={rewardBreakdown.heading}
        description={rewardBreakdown.subhead}
      />
      <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {rewardBreakdown.items.map((item, index) => {
          const Icon = ICONS[index] ?? ImageIcon;
          return (
            <li key={item.title} className="border-t border-rule pt-5">
              <Icon aria-hidden className="size-5 text-primary" strokeWidth={1.75} />
              <h3 className="mt-4 type-title text-foreground">
                <ExplainedTerm definition={item.tooltip}>{item.title}</ExplainedTerm>
              </h3>
              <p className="mt-2 type-body-sm text-muted-foreground">{item.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
