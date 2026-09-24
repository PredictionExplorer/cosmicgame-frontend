import type { HowItWorksContent } from '@/content/how-it-works';

import { SectionHeader } from '@/components/ui/section-header';

/** Tips and strategy: each tip's title and the reasoning behind it, as a quiet index. */
export function ProTips({ proTips }: { proTips: HowItWorksContent['proTips'] }) {
  return (
    <section aria-labelledby="tips-heading">
      <SectionHeader
        headingId="tips-heading"
        title={proTips.heading}
        description={proTips.subhead}
      />
      <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {proTips.tips.map((tip) => (
          <li key={tip.title} className="border-t border-rule pt-5">
            <h3 className="type-title text-foreground">{tip.title}</h3>
            <p className="mt-2 type-body-sm text-muted-foreground">{tip.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
