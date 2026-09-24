import { ArrowRight } from 'lucide-react';

import type { HowItWorksContent } from '@/content/how-it-works';

import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';

/**
 * What a gesture costs, right after what it can lead to: the spend is not
 * returned, the ETH cost steps up, gas is separate. One quiet panel of
 * label-and-fact rows, closed by a plain caution and the risk disclosures.
 */
export function GestureCosts({ costs }: { costs: HowItWorksContent['costs'] }) {
  return (
    <section aria-labelledby="costs-heading" data-testid="gesture-costs">
      <SectionHeader headingId="costs-heading" title={costs.heading} description={costs.subhead} />
      <div className="rounded-surface bg-surface px-5 py-2 sm:px-8 sm:py-3">
        <dl className="divide-y divide-rule-faint">
          {costs.items.map((item) => (
            <div
              key={item.title}
              className="grid gap-1.5 py-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-x-10 sm:py-5"
            >
              <dt className="type-title text-foreground">{item.title}</dt>
              <dd className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
                {item.body}
              </dd>
            </div>
          ))}
        </dl>
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-t border-rule py-4 type-body-sm text-foreground sm:py-5">
          <span>{costs.note}</span>
          <Link
            href={costs.riskLink.href}
            className="link inline-flex min-h-6 items-center gap-1.5"
          >
            {costs.riskLink.label}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </p>
      </div>
    </section>
  );
}
