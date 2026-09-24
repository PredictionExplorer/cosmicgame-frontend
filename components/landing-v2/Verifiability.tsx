import { ArrowRight, BadgeCheck, Copyleft, Repeat, type LucideIcon } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent } from '@/content/landing';

import { getSiteRoute, resolveRouteHref, type SiteRouteId } from '@/config/siteNav';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';

import { SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/** The three pillars in copy order: CC0, verification status, reproducible art. */
const PILLAR_ICONS: readonly LucideIcon[] = [Copyleft, BadgeCheck, Repeat];

/** Where each claim can be checked: the trust pages in the app. */
const EVIDENCE_ROUTES: readonly SiteRouteId[] = ['contracts', 'sourceCode', 'audits', 'security'];

/**
 * Verifiability, beside the Council: the three claims, then links to the
 * pages that prove them. This is where the trust claims live; the hero
 * makes none.
 */
export function Verifiability({
  verifiability,
}: {
  verifiability: LandingContent['verifiability'];
}) {
  const locale = useLocale();
  const copy = useSiteNavCopy();

  return (
    <section aria-labelledby="landing-verifiability-heading" className="min-w-0">
      <SectionHeading
        size="compact"
        eyebrow={verifiability.eyebrow}
        heading={verifiability.heading}
        headingId="landing-verifiability-heading"
        description={verifiability.body}
      />
      <ul className={styles.rows}>
        {verifiability.pillars.map((pillar, index) => {
          const Icon = PILLAR_ICONS[index] ?? BadgeCheck;
          return (
            <li key={pillar.title} className={styles.row}>
              <Icon aria-hidden className="mt-0.5 size-5 text-subtle" strokeWidth={1.5} />
              <div className="min-w-0">
                <h3 className="type-title">{pillar.title}</h3>
                <p className="type-body-sm mt-1.5 text-muted-foreground">{pillar.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
      <div className={styles.evidence}>
        <h3 className="type-label text-subtle" id="landing-evidence">
          {verifiability.evidenceLabel}
        </h3>
        <ul aria-labelledby="landing-evidence" className={styles.evidenceLinks}>
          {EVIDENCE_ROUTES.map((id) => {
            const target = resolveRouteHref(getSiteRoute(id), 'landing', locale);
            return (
              <li key={id}>
                <SiteLink
                  href={target.href}
                  kind={target.kind}
                  prefetch="intent"
                  className="link-quiet type-body-sm inline-flex min-h-11 items-center gap-1.5 text-foreground sm:min-h-8"
                >
                  {copy.routeLabel(id)}
                  <ArrowRight aria-hidden className="size-4 text-subtle" />
                </SiteLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
