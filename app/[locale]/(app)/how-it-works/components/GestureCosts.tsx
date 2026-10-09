import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';

import { FACT_LIST_CLASS, FACT_ROW_CLASS } from './factList';

/**
 * What a gesture costs, right after what it can lead to: the spend is not
 * returned, the ETH cost steps up, gas is separate. The same ruled
 * label-and-fact list as "Good to know", closed by a plain caution and the
 * risk disclosures.
 */
export function GestureCosts({ costs }: { costs: HowItWorksContent['costs'] }) {
  return (
    <section aria-labelledby="costs-heading" data-testid="gesture-costs">
      <SectionHeader headingId="costs-heading" title={costs.heading} description={costs.subhead} />
      <dl className={FACT_LIST_CLASS}>
        {costs.items.map((item) => (
          <div key={item.title} className={FACT_ROW_CLASS}>
            <dt className="type-title text-foreground">{item.title}</dt>
            <dd className="type-body-md text-muted-foreground">{item.body}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2 type-body-md text-foreground">
        <span>{costs.note}</span>
        <Link href={costs.riskLink.href} className="link inline-flex min-h-6 items-center gap-1.5">
          {costs.riskLink.label}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </p>
    </section>
  );
}
