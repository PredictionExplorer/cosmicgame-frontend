import type { HowItWorksContent } from '@/content/how-it-works';

import { SectionHeader } from '@/components/ui/section-header';

/**
 * Good to know: the details that are easy to miss, as a two-column
 * definition list on the page's hairlines (the name, then the plain fact).
 */
export function ProTips({ proTips }: { proTips: HowItWorksContent['proTips'] }) {
  return (
    <section aria-labelledby="tips-heading">
      <SectionHeader
        headingId="tips-heading"
        title={proTips.heading}
        description={proTips.subhead}
      />
      <dl className="divide-y divide-rule-faint border-y border-rule">
        {proTips.tips.map((tip) => (
          <div
            key={tip.title}
            className="grid gap-1.5 py-4 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:gap-x-10 sm:py-5"
          >
            <dt className="type-title text-foreground">{tip.title}</dt>
            <dd className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
              {tip.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
