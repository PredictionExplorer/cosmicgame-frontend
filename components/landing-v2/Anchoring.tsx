import { ArrowRight, Check } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { CollectionPlates } from './CollectionPlates';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/** How many anchored Signatures the section shows (the closing band leaves them out). */
export const ANCHORED_PLATE_COUNT = 3;

interface AnchoringProps {
  anchoring: LandingContent['anchoring'];
  showcase: LandingContent['art']['showcase'];
}

/**
 * Anchoring: Signatures anchored to the protocol right now beside the rule in
 * two sentences and four short facts, and the way to anchor in the app.
 */
export function Anchoring({ anchoring, showcase }: AnchoringProps) {
  const locale = useLocale();
  const { cta } = anchoring;
  return (
    <LandingSection labelledBy="landing-anchoring-heading">
      <div className={cn(styles.twoUp, styles.twoUpReversed)}>
        <CollectionPlates
          pick="anchored"
          count={ANCHORED_PLATE_COUNT}
          artworkAlt={showcase.artworkAlt}
          viewAriaLabel={showcase.viewAriaLabel}
          leadSizes="(min-width: 64rem) 36rem, 100vw"
          sizes="(min-width: 64rem) 18rem, 50vw"
          className={styles.anchoredPlates}
        />
        <div>
          <SectionHeading
            eyebrow={anchoring.eyebrow}
            heading={anchoring.heading}
            headingId="landing-anchoring-heading"
            description={anchoring.body}
          />
          <ul className={styles.checkList}>
            {anchoring.bullets.map((bullet) => (
              <li key={bullet} className={styles.checkItem}>
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-subtle" />
                <span className="type-body-md text-muted-foreground">{bullet}</span>
              </li>
            ))}
          </ul>
          <SiteLink
            href={localizeCrossHostHref(cta.href, locale)}
            kind={classifyHref(cta.href, 'landing')}
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-8 no-underline')}
          >
            {cta.label}
            <ArrowRight aria-hidden />
          </SiteLink>
        </div>
      </div>
    </LandingSection>
  );
}
