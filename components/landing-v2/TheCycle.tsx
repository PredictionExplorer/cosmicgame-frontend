import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * How a cycle works, in three numbered steps, then the way to take the first
 * one: a gesture in the app, or the full walkthrough. The Calibration Window
 * mechanics live in the FAQ and on How it works, not here.
 */
export function TheCycle({ cycle }: { cycle: LandingContent['cycle'] }) {
  const locale = useLocale();
  const gesture = cycle.gestureCta;
  const guide = cycle.guideCta;

  return (
    <LandingSection id="cycle" labelledBy="landing-cycle-heading">
      <SectionHeading
        eyebrow={cycle.eyebrow}
        heading={cycle.heading}
        headingId="landing-cycle-heading"
      />
      <ol className={styles.steps}>
        {cycle.steps.map((step) => (
          <li key={step.number} className={styles.step}>
            <span className={cn('type-figure-display text-subtle', styles.stepNumber)}>
              {step.number}
            </span>
            <h3 className="type-heading-1 mt-6">{step.title}</h3>
            <p className="type-body-md mt-3 max-w-[40ch] text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className={styles.sectionActions}>
        <SiteLink
          href={localizeCrossHostHref(gesture.href, locale)}
          kind={classifyHref(gesture.href, 'landing')}
          className={cn(buttonVariants({ variant: 'commit', size: 'lg' }), 'no-underline')}
        >
          {gesture.label}
          <ArrowRight aria-hidden />
        </SiteLink>
        <SiteLink
          href={localizeCrossHostHref(guide.href, locale)}
          kind={classifyHref(guide.href, 'landing')}
          className="link-quiet type-body-md inline-flex min-h-11 items-center gap-1.5 text-foreground"
        >
          {guide.label}
          <ArrowRight aria-hidden className="size-4 text-subtle" />
        </SiteLink>
      </div>
    </LandingSection>
  );
}
