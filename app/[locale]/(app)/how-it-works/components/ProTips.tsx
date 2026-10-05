import type { HowItWorksContent } from '@/content/how-it-works';

import { SectionHeader } from '@/components/ui/section-header';

import { FACT_LIST_CLASS, FACT_ROW_CLASS } from './factList';

/**
 * Good to know: the details that are easy to miss, on the same ruled
 * label-and-fact list as the costs (the name, then the plain fact).
 */
export function ProTips({ proTips }: { proTips: HowItWorksContent['proTips'] }) {
  return (
    <section aria-labelledby="tips-heading">
      <SectionHeader
        headingId="tips-heading"
        title={proTips.heading}
        description={proTips.subhead}
      />
      <dl className={FACT_LIST_CLASS}>
        {proTips.tips.map((tip) => (
          <div key={tip.title} className={FACT_ROW_CLASS}>
            <dt className="type-title text-foreground">{tip.title}</dt>
            <dd className="type-body-md text-muted-foreground">{tip.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
