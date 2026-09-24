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
 * one: a gesture in the app, or the full walkthrough. From 64rem the heading
 * and the actions hold the left five columns while the steps run down the
 * right seven; on phones the steps come between the heading and the actions.
 * The Calibration Window mechanics live in the FAQ and on How it works, not
 * here.
 */
export function TheCycle({ cycle }: { cycle: LandingContent['cycle'] }) {
  const locale = useLocale();
  const gesture = cycle.gestureCta;
  const guide = cycle.guideCta;

  return (
    <LandingSection id="cycle" labelledBy="landing-cycle-heading">
      <div className={styles.cycleLayout}>
        <SectionHeading
          eyebrow={cycle.eyebrow}
          heading={cycle.heading}
          headingId="landing-cycle-heading"
          className={styles.cycleIntro}
        />
        <ol className={styles.steps}>
          {cycle.steps.map((step) => (
            <li key={step.number} className={styles.step}>
              {/* Inter figures: Clash's round zeros read as the letter O. */}
              <span className={cn('type-figure-lg text-subtle', styles.stepNumber)}>
                {step.number}
              </span>
              <div className="min-w-0">
                <h3 className="type-heading-2">{step.title}</h3>
                <p className="type-body-md mt-2 max-w-[48ch] text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className={cn(styles.sectionActions, styles.cycleActions)}>
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
      </div>
    </LandingSection>
  );
}
