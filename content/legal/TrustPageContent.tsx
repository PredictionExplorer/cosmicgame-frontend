import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

/**
 * Shared renderer for the trust pages (/audits, /security, /risk-disclosures).
 *
 * The three pages share one anatomy — eyebrow, title, intro, then sections of
 * paragraphs, bullets, links, and notes — so the markup lives once here and
 * each page provides a `TrustPageCopy` object per locale.
 */

export interface TrustPageLink {
  /**
   * `app`: locale-aware in-app route. `landing`: cross-host path on the
   * marketing site (localized via `localeHref`). `external`: absolute URL
   * opened in a new tab.
   */
  readonly kind: 'app' | 'landing' | 'external';
  readonly href: string;
  readonly label: string;
}

export interface TrustPageSection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  /** A standalone link rendered in paragraph position (e.g. an audit report). */
  readonly linkParagraph?: TrustPageLink;
  /** Boxed footnote (e.g. a "Last reviewed" stamp). */
  readonly note?: string;
  readonly bullets?: readonly string[];
  readonly links?: readonly TrustPageLink[];
}

export interface TrustPageCopy {
  readonly eyebrow: string;
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly TrustPageSection[];
}

const LINK_CLASS = 'text-primary underline-offset-4 hover:underline';

function TrustLink({ link, locale }: { link: TrustPageLink; locale: string }) {
  if (link.kind === 'app') {
    return (
      <Link href={link.href} className={LINK_CLASS}>
        {link.label}
      </Link>
    );
  }
  if (link.kind === 'landing') {
    return (
      <a href={localeHref(LANDING_ORIGIN, link.href, locale)} className={LINK_CLASS}>
        {link.label}
      </a>
    );
  }
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {link.label}
    </a>
  );
}

export function TrustPageContent({ copy, locale }: { copy: TrustPageCopy; locale: string }) {
  return (
    <>
      <p className="type-eyebrow text-muted-foreground">{copy.eyebrow}</p>
      <h1 className="mt-4 type-display-md text-foreground">{copy.title}</h1>
      <p className="mt-6 type-body-lg text-muted-foreground">{copy.intro}</p>

      {copy.sections.map((section) => {
        const linksOnly =
          section.links && !section.paragraphs && !section.bullets && !section.linkParagraph;
        return (
          <section
            key={section.heading}
            className={linksOnly ? 'mt-12 space-y-4' : 'mt-12 space-y-5'}
          >
            <h2 className="text-2xl font-semibold">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="text-muted-foreground">
                {paragraph}
              </p>
            ))}
            {section.linkParagraph && (
              <p>
                <TrustLink link={section.linkParagraph} locale={locale} />
              </p>
            )}
            {section.note && (
              <p className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
                {section.note}
              </p>
            )}
            {section.bullets && (
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground [overflow-wrap:anywhere]">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
            {section.links && (
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <TrustLink link={link} locale={locale} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
