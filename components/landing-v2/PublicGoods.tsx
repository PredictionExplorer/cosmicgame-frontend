import type { LandingContent } from '@/content/landing';

import { classifyHref } from '@/config/siteNav';
import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';

import { LandingSection, SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * Public Goods: the argument on the left, the one figure on the right with
 * its facts as spec rows, and the tax note as a footnote under it (legal
 * copy that should be read, not weighed like the pitch).
 */
export function PublicGoods({ publicGoods }: { publicGoods: LandingContent['publicGoods'] }) {
  const { card, cta } = publicGoods;
  return (
    <LandingSection labelledBy="landing-public-goods-heading">
      <div className={styles.twoUp}>
        <div>
          <SectionHeading
            eyebrow={publicGoods.eyebrow}
            heading={publicGoods.heading}
            headingId="landing-public-goods-heading"
          />
          <p className="type-body-lg mt-6 max-w-[var(--measure-lede)] text-muted-foreground">
            {publicGoods.body}
          </p>
          <SiteLink
            href={cta.href}
            kind={classifyHref(cta.href, 'landing')}
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-8 no-underline')}
            externalIconClassName="size-4"
          >
            {cta.label}
          </SiteLink>
        </div>

        <div className={styles.figurePanel}>
          <p className="type-label text-subtle">{card.label}</p>
          <p className="type-figure-display mt-3">{card.percentage}</p>
          <p className="type-body-md mt-3 text-muted-foreground">{card.description}</p>
          <dl className={styles.specRows}>
            {card.tableRows.map((row) => (
              <div key={row.label} className={styles.specRow}>
                <dt className="type-label text-subtle">{row.label}</dt>
                <dd className="type-body-sm text-right font-medium text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <p className="type-label text-muted-foreground">{publicGoods.disclaimerHeading}</p>
            <p className="type-caption mt-1 text-subtle">{publicGoods.disclaimer}</p>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
