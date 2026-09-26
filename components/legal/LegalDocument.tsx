import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';
import {
  TRUST_DOCUMENT_DATES,
  trustDocumentSource,
  type TrustCenterPage,
} from '@/content/legal/trustCenter';
import type { LegalDocumentLabels } from '@/content/legal/labels';
import { frontendFileHistory } from '@/content/legal/links';

import { PageHeader } from '@/components/layout/PageHeader';
import { ReviewedStamp } from '@/components/layout/ReviewedStamp';
import { SiteLink } from '@/components/layout/SiteLink';
import { ReadingRail } from '@/components/reading/ContentsRail';
import { PageShell } from '@/components/ui/page-shell';
import { cn } from '@/lib/utils';

import { BackToContentsLink } from './BackToContentsLink';
import { HeadingAnchor, NUMBERED_SECTION_CLASS, SECTION_NUMBER_CLASS } from './LegalProse';

/** The H1's id: "Back to top" returns to the title, and the skip link keeps `#main`. */
const DOCUMENT_TITLE_ID = 'document-title';

/** The phone contents disclosure, which "Back to contents" opens. */
export const CONTENTS_ID = 'contents';

/** The sections, whose reading progress the rail's hairline follows. */
const DOCUMENT_BODY_ID = 'document-body';

export interface LegalDocumentSection {
  /** The anchor: stable across locales, so `/terms#allocations` works in every language. */
  id: string;
  heading: string;
  content: ReactNode;
}

export interface LegalDocumentProps {
  page: TrustCenterPage;
  title: string;
  intro: string;
  /** Evidence at a glance under the header, before the first section (audit figures, key points). */
  summary?: ReactNode;
  sections: readonly LegalDocumentSection[];
  /**
   * `compact`: a tighter rhythm for a document of short sections (the risk
   * disclosures), with no per-section way back to the contents on phones.
   */
  density?: 'default' | 'compact';
  /** A closing note after the sections, outside the contents. */
  closing?: ReactNode;
  /**
   * Number the sections and their clauses ("3.", "3.2"), in the headings and
   * the contents, so a reader can cite a clause: the legal instruments
   * (Terms, Privacy), not the explanatory pages.
   */
  numbered?: boolean;
  /** The Trust Center chrome, read on the server (`getLegalDocumentLabels`). */
  labels: LegalDocumentLabels;
}

/**
 * The Trust Center reading template shared by Security, Audits, Risk
 * disclosures, Terms and Privacy: the reading header (the Trust Center
 * eyebrow, the title, the lede, the document date and its revision history,
 * the five pages as tabs), then the document on one measure
 * (`--measure-document`), so every section rule, ledger, table, list and
 * callout ends on the same edge while paragraphs keep the prose measure
 * inside it. Every section is an anchor with its own link; the contents
 * follow the reader in the reading pages' one sticky rail from `lg`
 * (`ReadingRail`: the section being read, the progress hairline, the way
 * back to the top) and fold into an "On this page" disclosure on phones,
 * which each section's way back reopens.
 *
 * Renders on the server; only the rail's scroll tracking and the way back
 * to the contents run on the client.
 */
export function LegalDocument({
  page,
  title,
  intro,
  summary,
  sections,
  density = 'default',
  closing,
  numbered = false,
  labels,
}: LegalDocumentProps) {
  const locale = useLocale();
  const documentDate = TRUST_DOCUMENT_DATES[page];
  const items = sections.map(({ id, heading }, index) => ({
    id,
    label: heading,
    number: numbered ? `${index + 1}.` : undefined,
  }));

  return (
    <PageShell variant="data">
      {/* The site's one content edge: the header, rail and prose align with the site header. */}
      <PageHeader
        variant="reading"
        section="trust"
        sectionHub={page === 'security'}
        title={title}
        titleId={DOCUMENT_TITLE_ID}
        subtitle={intro}
        meta={
          <>
            <ReviewedStamp date={documentDate.date} kind={documentDate.kind} />
            {/* This locale's copy file: its commits are this document's history. */}
            <SiteLink
              href={frontendFileHistory(trustDocumentSource(page, locale))}
              kind="external"
              className="link-quiet inline-flex min-h-6 items-center gap-1 transition-colors duration-[var(--duration-fast)] hover:text-foreground"
            >
              {labels.revisionHistory}
            </SiteLink>
          </>
        }
        tabs={<TrustCenterTabs current={page} labels={labels.tabs} />}
      />

      <div className="reading-grid">
        {/* The grid cell runs the document's height, so the rail can stick inside it. */}
        <div>
          <ReadingRail
            entries={items}
            copy={{ railLabel: labels.contents, backToTopLabel: labels.backToTop }}
            articleId={DOCUMENT_BODY_ID}
            topId={DOCUMENT_TITLE_ID}
          />
        </div>

        <div className="min-w-0 max-w-[var(--measure-document)]">
          {summary ? <div className="mb-10 sm:mb-14">{summary}</div> : null}

          <details
            id={CONTENTS_ID}
            className="group mb-10 scroll-mt-6 rounded-surface border border-rule lg:hidden"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 type-title text-foreground [&::-webkit-details-marker]:hidden">
              <span>
                {labels.contents} <span className="type-label text-subtle">({items.length})</span>
              </span>
              <ChevronDown
                aria-hidden
                className="size-4 shrink-0 text-subtle transition-transform duration-[var(--duration-fast)] group-open:rotate-180"
              />
            </summary>
            <ol className="border-t border-rule-faint px-4 py-2">
              {items.map(({ id, label, number }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="flex min-h-11 items-baseline gap-2 py-3 type-body-sm text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground"
                  >
                    {/* The space keeps "3. Allocations" one phrase for assistive tech; the gap draws it. */}
                    {number ? (
                      <span className="shrink-0 tabular-nums text-subtle">{`${number} `}</span>
                    ) : null}
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div
            id={DOCUMENT_BODY_ID}
            data-numbered={numbered ? 'true' : undefined}
            className={cn('group/legal', numbered && '[counter-reset:legal-section]')}
          >
            {sections.map((section, index) => (
              <LegalSection
                key={section.id}
                id={section.id}
                heading={section.heading}
                first={index === 0 && !summary}
                density={density}
                anchorLabel={labels.sectionLink(section.heading)}
                backLabel={density === 'compact' ? null : labels.backToContents}
                numbered={numbered}
              >
                {section.content}
              </LegalSection>
            ))}
          </div>

          {closing ? <div className="mt-12 sm:mt-14">{closing}</div> : null}
        </div>
      </div>
    </PageShell>
  );
}

function LegalSection({
  id,
  heading,
  first,
  density,
  anchorLabel,
  backLabel,
  numbered,
  children,
}: {
  id: string;
  heading: string;
  first: boolean;
  density: 'default' | 'compact';
  anchorLabel: string;
  /** The phone way back to the contents; `null` in a document of short sections. */
  backLabel: string | null;
  /** Counts this section, and its heading shows the number. */
  numbered: boolean;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-6',
        numbered && NUMBERED_SECTION_CLASS,
        !first &&
          (density === 'compact'
            ? 'mt-10 border-t border-rule pt-8'
            : 'mt-12 border-t border-rule pt-10 sm:mt-14 sm:pt-12'),
      )}
    >
      {/* The anchor sits beside the heading, not inside it, so the heading's name is its text. */}
      <div className="group/anchor flex items-start gap-2">
        <h2
          id={headingId}
          className={cn('min-w-0 type-section text-foreground', numbered && SECTION_NUMBER_CLASS)}
        >
          {heading}
        </h2>
        <HeadingAnchor href={`#${id}`} label={anchorLabel} className="mt-0.5" />
      </div>
      <div className={cn('space-y-5', density === 'compact' ? 'mt-4' : 'mt-5 sm:mt-6')}>
        {children}
      </div>
      {backLabel ? (
        <p className="mt-8 lg:hidden">
          <BackToContentsLink targetId={CONTENTS_ID} label={backLabel} />
        </p>
      ) : null}
    </section>
  );
}
