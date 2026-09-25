import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';
import { Steps } from '@/components/ui/steps';

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
        {/* The same numbered sequence as The Art above: importance is spacing, not a second style. */}
        <Steps
          framed
          className={styles.steps}
          items={cycle.steps.map((step) => ({
            id: step.number,
            title: step.title,
            body: <p>{step.body}</p>,
          }))}
        />
        <div className={cn(styles.sectionActions, styles.cycleActions)}>
          <SiteLink
            href={localizeCrossHostHref(gesture.href, locale)}
            kind={classifyHref(gesture.href, 'landing')}
            className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'no-underline')}
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
