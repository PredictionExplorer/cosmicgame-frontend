import { ArrowRight } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { localizeCrossHostHref } from '@/lib/hostRouting';
import { SiteLink } from '@/components/layout/SiteLink';

import { CollectionPlates } from './CollectionPlates';
import { OpenAppLink } from './OpenAppLink';
import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

interface ClosingBandProps {
  closing: LandingContent['closing'];
  showcase: LandingContent['art']['showcase'];
}

/**
 * The page's last word: the newest Signatures and the way back into the app,
 * so a visitor who read to the end has a next step that is not the footer.
 */
export function ClosingBand({ closing, showcase }: ClosingBandProps) {
  const locale = useLocale();
  const gallery = closing.galleryCta;
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
          <OpenAppLink size="xl" variant="commit" />
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
        sizes="(min-width: 64rem) 25rem, 50vw"
        className={styles.recentPlates}
      />
    </LandingSection>
  );
}
