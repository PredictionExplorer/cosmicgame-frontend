import type { ReactNode } from 'react';

import { PageHeader } from '@/components/layout/PageHeader';
import { ReviewedStamp } from '@/components/layout/ReviewedStamp';
import { Link } from '@/i18n/navigation';
import { LANDING_ORIGIN, localeHref } from '@/lib/hostRouting';

import { LegalSectionHeading } from './LegalSectionHeading';
import { TRUST_DOCUMENT_DATES, type TrustCenterPage } from './trustCenter';

/**
 * Shared renderer for the trust pages (/audits, /security, /risk-disclosures).
 *
 * The three pages share the Trust Center template with /terms and /privacy —
 * the reading header (Trust Center eyebrow, title, intro, document date,
 * tabs), then sections of paragraphs, bullets, links, and notes — so the
 * markup lives once here and each page provides a `TrustPageCopy` per locale.
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
  readonly title: string;
  readonly intro: string;
  readonly sections: readonly TrustPageSection[];
}

const LINK_CLASS = 'text-primary underline-offset-4 hover:underline';

/**
 * Copy text with `backticked` spans (a URL or an address to check character
 * by character) set as code, so the backticks never reach the reader.
 */
function CopyText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index} className="font-mono text-foreground">
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}

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

export function TrustPageContent({
  copy,
  locale,
  page,
  tabs,
}: {
  copy: TrustPageCopy;
  locale: string;
  /** Which Trust Center page this is: sets the document date, and Security is the hub. */
  page?: TrustCenterPage;
  /** The Trust Center tabs (`TrustCenterTabs`). */
  tabs?: ReactNode;
}) {
  const documentDate = page ? TRUST_DOCUMENT_DATES[page] : undefined;
  return (
    <>
      <PageHeader
        variant="reading"
        section="trust"
        sectionHub={page === 'security'}
        title={copy.title}
        subtitle={copy.intro}
        meta={
          documentDate ? (
            <ReviewedStamp date={documentDate.date} kind={documentDate.kind} />
          ) : undefined
        }
        tabs={tabs}
      />

      {copy.sections.map((section) => {
        const linksOnly =
          section.links && !section.paragraphs && !section.bullets && !section.linkParagraph;
        return (
          <section
            key={section.heading}
            className={linksOnly ? 'mt-12 space-y-4' : 'mt-12 space-y-5'}
          >
            <LegalSectionHeading>{section.heading}</LegalSectionHeading>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-8 text-muted-foreground">
                <CopyText text={paragraph} />
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
              <ul className="list-disc space-y-3 pl-5 leading-8 text-muted-foreground [overflow-wrap:anywhere]">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>
                    <CopyText text={bullet} />
                  </li>
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
