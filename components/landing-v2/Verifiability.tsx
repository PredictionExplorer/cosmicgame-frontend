import type { ComponentType, SVGProps } from 'react';
import { ArrowRight, BadgeCheck, Repeat } from 'lucide-react';
import { useLocale } from 'next-intl';

import type { LandingContent, LandingPillarId } from '@/content/landing';

import { getSiteRoute, resolveRouteHref, type SiteRouteId } from '@/config/siteNav';
import { SiteLink } from '@/components/layout/SiteLink';
import { useSiteNavCopy } from '@/components/layout/siteNavCopy';
import { Steps } from '@/components/ui/steps';

import { SectionHeading } from './SectionHeading';
import styles from './Landing.module.css';

/**
 * The public-domain mark: a slashed zero in a circle, drawn like a lucide
 * glyph (24px box, currentColor stroke). Lucide has no CC0 mark, and its
 * Copyleft glyph stands for the opposite idea (share-alike, rights kept).
 */
function PublicDomainMark({ strokeWidth = 2, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <ellipse cx="12" cy="12" rx="3.5" ry="5.5" />
      <path d="M14.5 7.5 9.5 16.5" />
    </svg>
  );
}

/** Each pillar's glyph, by its structure id (content/landing/structure.ts). */
const PILLAR_ICONS: Readonly<Record<LandingPillarId, ComponentType<SVGProps<SVGSVGElement>>>> = {
  cc0: PublicDomainMark,
  verification: BadgeCheck,
  reproducible: Repeat,
};

const isPillarId = (id: string): id is LandingPillarId => id in PILLAR_ICONS;

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
      {/* The same rows as the Council's rules beside it, a glyph for each
          claim in place of a number. */}
      <Steps
        ordered={false}
        framed
        className={styles.rows}
        items={verifiability.pillars.map((pillar) => {
          const Icon = isPillarId(pillar.id) ? PILLAR_ICONS[pillar.id] : BadgeCheck;
          return {
            id: pillar.id,
            marker: <Icon aria-hidden className="size-5" strokeWidth={1.5} />,
            title: pillar.title,
            body: <p>{pillar.body}</p>,
          };
        })}
      />
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
