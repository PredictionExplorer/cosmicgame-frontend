import { forwardRef } from 'react';
import { useTranslations } from 'next-intl';

import { GLOSSARY_TERM_IDS } from '@/lib/glossary';
import { cn } from '@/lib/utils';

import { categoryAnchor } from './CategoryNav';
import { FAQ_SCROLL_MARGIN_CLASS } from './scrollMargin';

/** The glossary's id in the FAQ contents. */
export const GLOSSARY_ENTRY_ID = 'glossary';

/**
 * The coined vocabulary, defined once (messages/<locale>/glossary.json): the
 * same definitions the dotted-underline terms in the answers open. Rendered
 * in full, so every definition is in the page's HTML and has its own anchor
 * (`#glossary-<id>`) to link to.
 */
export const FAQGlossary = forwardRef<HTMLElement>(function FAQGlossary(_props, ref) {
  const t = useTranslations('faq');
  const tGlossary = useTranslations('glossary');
  const headingId = 'faq-glossary-heading';

  return (
    <section
      ref={ref}
      id={categoryAnchor(GLOSSARY_ENTRY_ID)}
      aria-labelledby={headingId}
      className={FAQ_SCROLL_MARGIN_CLASS}
    >
      <header className="border-b border-rule pb-4">
        <h2 id={headingId} className="type-section">
          {t('glossary.title')}
        </h2>
        <p className="mt-1.5 type-body-sm text-muted-foreground">{t('glossary.description')}</p>
      </header>
      <dl className="grid gap-x-10 md:grid-cols-2">
        {GLOSSARY_TERM_IDS.map((id) => (
          <div
            key={id}
            id={`glossary-${id}`}
            className={cn(FAQ_SCROLL_MARGIN_CLASS, 'border-b border-rule-faint py-4')}
          >
            <dt className="type-title text-foreground">{tGlossary(`terms.${id}.term`)}</dt>
            <dd className="mt-1 type-body-sm text-muted-foreground">
              {tGlossary(`terms.${id}.short`)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
});
