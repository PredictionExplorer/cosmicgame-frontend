import type { ReactNode } from 'react';
import { ArrowUp, ChevronDown, Link2 } from 'lucide-react';

import { TrustCenterTabs } from '@/content/legal/TrustCenterTabs';
import {
  TRUST_DOCUMENT_DATES,
  TRUST_DOCUMENT_SOURCES,
  type TrustCenterPage,
} from '@/content/legal/trustCenter';
import type { LegalDocumentLabels } from '@/content/legal/labels';
import { frontendFileHistory } from '@/content/legal/links';

import { PageHeader } from '@/components/layout/PageHeader';
import { ReviewedStamp } from '@/components/layout/ReviewedStamp';
import { SiteLink } from '@/components/layout/SiteLink';
import { PageShell } from '@/components/ui/page-shell';
import { cn } from '@/lib/utils';

import { LegalContentsRail } from './LegalContentsRail';

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
  /** The Trust Center chrome, read on the server (`getLegalDocumentLabels`). */
  labels: LegalDocumentLabels;
}

/**
 * The Trust Center reading template shared by Security, Audits, Risk
 * disclosures, Terms and Privacy: the reading header (the Trust Center
 * eyebrow, the title, the lede, the document date and its revision history,
 * the five pages as tabs), then the document. Every section is an anchor
 * with its own link; the contents follow the reader in a sticky rail from
 * `lg` and fold into an "On this page" disclosure on phones, where each
 * section ends with a way back to it.
 *
 * Renders on the server; only the rail's scroll tracking runs on the client.
 */
export function LegalDocument({
  page,
  title,
  intro,
  summary,
  sections,
  labels,
}: LegalDocumentProps) {
  const documentDate = TRUST_DOCUMENT_DATES[page];
  const source = TRUST_DOCUMENT_SOURCES[page];
  const items = sections.map(({ id, heading }) => ({ id, label: heading }));

  return (
    <PageShell variant="data">
      <div className="mx-auto w-full max-w-[68rem]">
        <PageHeader
          variant="reading"
          section="trust"
          sectionHub={page === 'security'}
          title={title}
          subtitle={intro}
          meta={
            <>
              <ReviewedStamp date={documentDate.date} kind={documentDate.kind} />
              <SiteLink
                href={frontendFileHistory(source)}
                kind="external"
                className="link-quiet inline-flex min-h-6 items-center gap-1 transition-colors duration-fast hover:text-foreground"
              >
                {labels.revisionHistory}
              </SiteLink>
            </>
          }
          tabs={<TrustCenterTabs current={page} labels={labels.tabs} />}
        />

        <div className="lg:grid lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] lg:gap-x-16">
          <LegalContentsRail items={items} title={labels.contents} backToTop={labels.backToTop} />

          <div className="min-w-0">
            {summary ? <div className="mb-10 sm:mb-14">{summary}</div> : null}

            <details
              id="contents"
              className="group mb-10 rounded-surface border border-rule lg:hidden"
            >
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 type-title text-foreground [&::-webkit-details-marker]:hidden">
                <span>
                  {labels.contents} <span className="type-label text-subtle">({items.length})</span>
                </span>
                <ChevronDown
                  aria-hidden
                  className="size-4 shrink-0 text-subtle transition-transform duration-fast group-open:rotate-180"
                />
              </summary>
              <ol className="border-t border-rule-faint px-4 py-2">
                {items.map(({ id, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="flex min-h-11 items-center type-body-sm text-muted-foreground transition-colors duration-fast hover:text-foreground"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ol>
            </details>

            {sections.map((section, index) => (
              <LegalSection
                key={section.id}
                id={section.id}
                heading={section.heading}
                first={index === 0 && !summary}
                anchorLabel={labels.sectionLink.replace('{section}', section.heading)}
                backLabel={labels.backToContents}
              >
                {section.content}
              </LegalSection>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function LegalSection({
  id,
  heading,
  first,
  anchorLabel,
  backLabel,
  children,
}: {
  id: string;
  heading: string;
  first: boolean;
  anchorLabel: string;
  backLabel: string;
  children: ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(!first && 'mt-12 border-t border-rule pt-10 sm:mt-14 sm:pt-12')}
    >
      {/* The anchor sits beside the heading, not inside it, so the heading's name is its text. */}
      <div className="group/anchor flex items-start gap-2">
        <h2 id={headingId} className="min-w-0 type-section text-foreground">
          {heading}
        </h2>
        <a
          href={`#${id}`}
          aria-label={anchorLabel}
          className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-control text-subtle opacity-0 transition-opacity duration-fast group-hover/anchor:opacity-100 hover:text-primary focus-visible:opacity-100 max-sm:hidden"
        >
          <Link2 aria-hidden className="size-4" />
        </a>
      </div>
      <div className="mt-5 space-y-5 sm:mt-6">{children}</div>
      <p className="mt-8 lg:hidden">
        <a
          href="#contents"
          className="inline-flex min-h-6 items-center gap-1.5 type-label text-subtle transition-colors duration-fast hover:text-foreground"
        >
          <ArrowUp aria-hidden className="size-3.5" />
          {backLabel}
        </a>
      </p>
    </section>
  );
}
