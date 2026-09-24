import { ShieldCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { CstTokenIcon, OutreachReserveIcon } from '@/lib/conceptIcons';
import { SectionHeader } from '@/components/ui/section-header';

const STEPS = [
  { id: 'promote', Icon: OutreachReserveIcon },
  { id: 'verify', Icon: ShieldCheck },
  { id: 'receive', Icon: CstTokenIcon },
] as const;

/**
 * How outreach allocations work, in three steps between hairlines: a number,
 * a glyph, the step and what it involves, in full (the detail that used to
 * hide behind an info button under each step is part of the text). Three
 * columns across a tablet; one column in the page's side column from `lg`.
 * Server-safe: no motion, no client code.
 */
export function HowItWorks() {
  const t = useTranslations('marketing.howItWorks');
  // Two sentences run on with a space, except in scripts written without one.
  const joiner = getLocaleConfig(useLocale()).wordSpacing ? ' ' : '';

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-[var(--sticky-offset)]"
    >
      <SectionHeader
        headingId="how-it-works-heading"
        title={t('title')}
        description={t('description')}
      />
      <ol className="grid list-none divide-y divide-rule-faint border-y border-rule-faint ps-0 md:grid-cols-3 md:divide-x md:divide-y-0 lg:grid-cols-1 lg:divide-x-0 lg:divide-y">
        {STEPS.map(({ id, Icon }, index) => (
          <li
            key={id}
            className="flex flex-col gap-3 py-6 md:px-6 md:py-8 md:first:ps-0 md:last:pe-0 lg:gap-2 lg:px-0 lg:py-5"
          >
            <div className="flex items-center gap-3">
              <span className="type-figure-sm text-subtle" aria-hidden>
                {String(index + 1).padStart(2, '0')}
              </span>
              <Icon aria-hidden className="size-5 text-primary" />
            </div>
            <h3 className="type-heading-3 text-foreground">{t(`steps.${id}.title`)}</h3>
            <p className="type-body-sm text-muted-foreground">
              {t(`steps.${id}.description`)}
              {joiner}
              {t(`steps.${id}.detail`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
