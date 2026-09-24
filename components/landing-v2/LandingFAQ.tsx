import { ArrowRight, ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { getSiteRoute, resolveRouteHref } from '@/config/siteNav';
import { SiteLink } from '@/components/layout/SiteLink';
import { JsonLd, faqPageJsonLd, jsonLdInLanguage } from '@/utils/jsonLd';

import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * The landing FAQ: native disclosures, so every answer is in the server HTML
 * (for readers without JavaScript and for search), opens without hydration,
 * and one open answer closes the others where the browser supports `name`.
 * It opens with what a participant does and what the art is; the plain
 * denials follow.
 */
export function LandingFAQ({ faq }: { faq: LandingContent['faq'] }) {
  const locale = useLocale();
  const appFaq = resolveRouteHref(getSiteRoute('faq'), 'landing', locale);
  const items = faq.items.map((item) => ({ question: item.question, answer: item.answer }));

  return (
    <LandingSection id="faq" labelledBy="landing-faq-heading">
      <JsonLd data={faqPageJsonLd(items, jsonLdInLanguage(locale))} />
      <div className={styles.faqLayout}>
        <div className={styles.faqIntro}>
          <SectionHeading
            size="compact"
            eyebrow={faq.eyebrow}
            heading={faq.heading}
            headingId="landing-faq-heading"
          />
          <SiteLink
            href={appFaq.href}
            kind={appFaq.kind}
            prefetch="intent"
            className="link-quiet type-body-sm mt-6 inline-flex min-h-11 items-center gap-1.5 text-foreground sm:min-h-8"
          >
            {faq.moreLabel}
            <ArrowRight aria-hidden className="size-4 text-subtle" />
          </SiteLink>
        </div>
        <div className={styles.faqList}>
          {faq.items.map((item) => (
            <details key={item.question} name="landing-faq" className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <span className="type-heading-3">{item.question}</span>
                <ChevronDown aria-hidden className={styles.faqChevron} />
              </summary>
              <p className="type-prose pb-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
