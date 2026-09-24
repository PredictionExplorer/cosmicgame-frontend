import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';

/** Where outreach proposals go; shown in full so it can be read and copied. */
export const OUTREACH_EMAIL = 'marketing@cosmicsignature.com';

/**
 * The invitation to join the outreach programme: one quiet band with the
 * email as a mail link (a mail glyph, not an external-site arrow) and the
 * address itself as selectable text with a copy button, for people whose
 * device opens no mail app. Server-rendered but for the copy button.
 */
export function MarketingCTA() {
  const t = useTranslations('marketing.cta');

  return (
    <section
      id="outreach-cta"
      aria-labelledby="outreach-cta-heading"
      className="scroll-mt-[var(--sticky-offset)] rounded-surface bg-surface px-6 py-10 sm:px-10 sm:py-12 lg:px-6 lg:py-7"
    >
      <div className="max-w-[var(--measure-lede)]">
        <h2 id="outreach-cta-heading" className="type-section text-foreground">
          {t('title')}
        </h2>
        <p className="mt-3 type-body-md text-muted-foreground">{t('description')}</p>
        <p className="mt-2 type-body-sm text-subtle">{t('note')}</p>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6 lg:mt-6 lg:flex-col lg:items-start lg:gap-3">
        <a
          href={`mailto:${OUTREACH_EMAIL}`}
          // A long label (vi) wraps inside the button rather than past a 320px screen.
          className={cn(
            buttonVariants({ size: 'lg' }),
            'h-auto max-w-full self-start whitespace-normal py-2.5 text-start',
          )}
        >
          <Mail aria-hidden />
          {t('contact')}
        </a>
        <p className="flex min-w-0 items-center gap-2">
          <span className="select-all type-body-md text-foreground [overflow-wrap:anywhere]">
            {OUTREACH_EMAIL}
          </span>
          <CopyButton
            value={OUTREACH_EMAIL}
            label={t('copyEmail')}
            copiedLabel={t('emailCopied')}
          />
        </p>
      </div>
    </section>
  );
}
