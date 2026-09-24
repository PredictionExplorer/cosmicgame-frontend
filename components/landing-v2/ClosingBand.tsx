import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { ANCHORED_PLATE_COUNT } from './Anchoring';
import { CollectionPlates } from './CollectionPlates';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/** The Anchoring strip above: the close shows new work, not those plates again. */
const ANCHORED_STRIP = { pick: 'anchored', count: ANCHORED_PLATE_COUNT } as const;

interface ClosingBandProps {
  closing: LandingContent['closing'];
  showcase: LandingContent['art']['showcase'];
}

/**
 * The page's last word: the newest Signatures and a next step that is not
 * the footer. Its commit action is to make a gesture, not "Open the app":
 * the sticky header already offers that one, right above this band.
 */
export function ClosingBand({ closing, showcase }: ClosingBandProps) {
  const locale = useLocale();
  const { gestureCta: gesture, galleryCta: gallery } = closing;
  return (
    <LandingSection labelledBy="landing-closing-heading" className={styles.closing}>
      <div className={styles.closingHead}>
        <SectionHeading
          eyebrow={closing.eyebrow}
          heading={closing.heading}
          headingId="landing-closing-heading"
          description={closing.body}
        />
        <div className={styles.sectionActions}>
          <SiteLink
            href={localizeCrossHostHref(gesture.href, locale)}
            kind={classifyHref(gesture.href, 'landing')}
            className={cn(buttonVariants({ variant: 'commit', size: 'xl' }), 'no-underline')}
          >
            {gesture.label}
            <ArrowRight aria-hidden />
          </SiteLink>
          <SiteLink
            href={localizeCrossHostHref(gallery.href, locale)}
            kind={classifyHref(gallery.href, 'landing')}
            className="link-quiet type-body-md inline-flex min-h-11 items-center gap-1.5 text-foreground"
          >
            {gallery.label}
            <ArrowRight aria-hidden className="size-4 text-subtle" />
          </SiteLink>
        </div>
      </div>
      <CollectionPlates
        pick="recent"
        count={6}
        artworkAlt={showcase.artworkAlt}
        viewAriaLabel={showcase.viewAriaLabel}
        excluding={ANCHORED_STRIP}
        sizes="(min-width: 80rem) 25rem, (min-width: 48rem) 30vw, 50vw"
        className={styles.recentPlates}
      />
    </LandingSection>
  );
}
