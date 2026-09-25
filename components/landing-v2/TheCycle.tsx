import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { CycleDiagram } from './CycleDiagram';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * How a cycle works, drawn and then told: the cycle's time line (gestures
 * pushing the finalization time out, the clock reaching zero, the reserve
 * fanning into the tracks of the next section), captioned by three numbered
 * steps, one under each zone of the drawing, and the way to take the first
 * one: a gesture in the app, or the full walkthrough. From 64rem the actions
 * sit beside the heading; on phones they close the section. The Calibration
 * Window mechanics live in the FAQ and on How it works, not here.
 */
export function TheCycle({
  cycle,
  tracks,
}: {
  cycle: LandingContent['cycle'];
  /** The ETH tracks the drawing's fan ends in (`content.tracks.eth`). */
  tracks: LandingContent['tracks']['eth'];
}) {
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
        <CycleDiagram tracks={tracks} />
        {/* The steps caption the drawing's three zones, set as every numbered
            sequence is (Steps): the index in the label face, the title at
            type-heading-3, the body at type-body-sm. */}
        <ol className={styles.steps}>
          {cycle.steps.map((step) => (
            <li key={step.number} className={styles.step}>
              <span aria-hidden className="type-label pt-1 tabular-nums text-subtle">
                {step.number}
              </span>
              <div className="min-w-0">
                <h3 className="type-heading-3">{step.title}</h3>
                <p className="type-body-sm mt-1.5 max-w-[48ch] text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
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
