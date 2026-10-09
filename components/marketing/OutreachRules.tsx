import { useTranslations } from 'next-intl';

import { SectionHeader } from '@/components/ui/section-header';

/** The rules, in reading order; the copy lives in `marketing.rules.<id>`. */
const RULES = ['review', 'discretion', 'excluded', 'disclose'] as const;

/**
 * What the outreach programme asks and promises before anyone takes part:
 * who can propose outreach, that allocations are at the team's discretion,
 * what does not count, and that contributors say they may receive CST when
 * they post. The invitation beside the ledgers links here. Server-safe.
 */
export function OutreachRules() {
  const t = useTranslations('marketing.rules');
  return (
    <section
      id="outreach-rules"
      aria-labelledby="outreach-rules-heading"
      className="scroll-mt-[var(--sticky-offset)]"
    >
      <SectionHeader headingId="outreach-rules-heading" title={t('title')} />
      <ul className="max-w-[var(--measure-prose)] list-disc space-y-2.5 ps-6 type-body-md text-muted-foreground marker:text-subtle">
        {RULES.map((id) => (
          <li key={id} className="ps-1">
            {t(id)}
          </li>
        ))}
      </ul>
    </section>
  );
}
