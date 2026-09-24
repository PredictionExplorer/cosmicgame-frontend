import { Fragment } from 'react';

import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { CITABLE_CLASS, LegalCallout, LegalClause, LegalList } from '@/components/legal/LegalProse';
import { RichText } from '@/components/legal/RichText';
import { cn } from '@/lib/utils';
import { formatCount, formatPercent } from '@/utils/format';

import { TERMS_ALLOCATION_ROWS, type TermsAllocationRow } from './termsAllocations';

export type TermsSectionId =
  | 'acceptance'
  | 'eligibility'
  | 'mechanics'
  | 'allocations'
  | 'risks'
  | 'prohibited';

export interface TermsClause {
  /** The clause's anchor inside its section: `/terms#<section>-<id>`. */
  readonly id: string;
  readonly subtitle?: string;
  /** Rich text: `<tag>…</tag>` links a `LEGAL_LINKS` entry. */
  readonly text: string;
}

export interface TermsSection {
  readonly id: TermsSectionId;
  readonly title: string;
  readonly content: readonly TermsClause[];
  /** A list after the clauses (the prohibited activities), one item per entry. */
  readonly bullets?: readonly string[];
}

export interface TermsCopy {
  readonly title: string;
  readonly subtitle: string;
  readonly sections: readonly TermsSection[];
  readonly additionalTitle: string;
  readonly additional: readonly Required<TermsClause>[];
  /** The warning a reader must not miss: shown above the first section. */
  readonly warning: {
    readonly title: string;
    readonly text: string;
  };
  readonly acknowledgment: {
    readonly title: string;
    readonly text: string;
  };
  /** The allocation tracks, each with its figures and its clause. */
  readonly allocationsTable: {
    readonly title: string;
    /** `{percent}` shared by `{count}` Recipients. */
    readonly sharedBy: string;
    /** `{count}` Recipients each receive `{amount}`. */
    readonly each: string;
  };
}

/** Clause ids of the allocation section that name a track (a row of the table). */
const TRACK_IDS: ReadonlySet<string> = new Set(TERMS_ALLOCATION_ROWS.map((row) => row.id));

/** The anchor of a clause, unique on the page. */
export function clauseAnchor(sectionId: string, clauseId: string): string {
  return `${sectionId}-${clauseId}`;
}

/**
 * The allocation tracks as one list, each track once: its name (the clause's
 * anchor, so the risk disclosures can cite it), its figures on one line
 * ("ETH 25% · CST 1,000 · NFT 1", from `protocolFacts`), and the sentence
 * that binds it. It replaces a table followed by the same eleven tracks
 * again as clauses, which stated every figure twice.
 */
function AllocationTracks({
  copy,
  tracks,
  locale,
}: {
  copy: TermsCopy['allocationsTable'];
  tracks: readonly TermsClause[];
  locale: string;
}) {
  const amountText = (value: number | undefined, row: TermsAllocationRow): string | null => {
    if (value === undefined) return null;
    const formatted = formatCount(value, locale);
    return row.each
      ? copy.each.replace('{count}', formatCount(row.each, locale)).replace('{amount}', formatted)
      : formatted;
  };
  const ethText = (row: TermsAllocationRow): string | null => {
    if (!row.eth) return null;
    const percent = `${row.eth.approximate ? '≈ ' : ''}${formatPercent(row.eth.percent, locale)}`;
    return row.eth.sharedBy
      ? copy.sharedBy
          .replace('{percent}', percent)
          .replace('{count}', formatCount(row.eth.sharedBy, locale))
      : percent;
  };
  const clauses = new Map(tracks.map((track) => [track.id, track]));

  return (
    <div>
      <h3 id="allocations-tracks-title" className="type-title text-foreground">
        {copy.title}
      </h3>
      <dl
        aria-labelledby="allocations-tracks-title"
        data-allocation-tracks
        className="mt-3 divide-y divide-rule-faint border-y border-rule-faint"
      >
        {TERMS_ALLOCATION_ROWS.map((row) => {
          const clause = clauses.get(row.id);
          if (!clause) return null;
          // A track without a figure in a unit says nothing for it, rather than a dash.
          const parts = [
            { unit: 'ETH', value: ethText(row) },
            { unit: 'CST', value: amountText(row.cst, row) },
            { unit: 'NFT', value: amountText(row.nft, row) },
          ].filter((part): part is { unit: string; value: string } => part.value !== null);
          return (
            <div
              key={row.id}
              id={clauseAnchor('allocations', row.id)}
              className={cn(
                'grid gap-x-8 gap-y-1.5 py-4 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]',
                CITABLE_CLASS,
              )}
            >
              <dt>
                <span className="block type-title text-foreground">{clause.subtitle}</span>
                <span
                  data-track-figures
                  className="mt-1 block type-figure-sm text-muted-foreground"
                >
                  {parts.map((part, index) => (
                    <Fragment key={part.unit}>
                      {index > 0 ? (
                        <>
                          {' '}
                          <span aria-hidden className="text-subtle">
                            ·
                          </span>{' '}
                        </>
                      ) : null}
                      <span className="whitespace-nowrap">
                        <span className="text-subtle">{part.unit}</span> {part.value}
                      </span>
                    </Fragment>
                  ))}
                </span>
              </dt>
              <dd className="type-prose text-muted-foreground">
                <RichText text={clause.text} locale={locale} />
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function TermsSectionBody({
  section,
  copy,
  locale,
}: {
  section: TermsSection;
  copy: TermsCopy;
  locale: string;
}) {
  if (section.id !== 'allocations') {
    return (
      <>
        {section.content.map((item) => (
          <LegalClause
            key={item.id}
            id={clauseAnchor(section.id, item.id)}
            heading={item.subtitle}
            text={item.text}
            locale={locale}
          />
        ))}
        {section.bullets ? <LegalList items={section.bullets} locale={locale} /> : null}
      </>
    );
  }

  // Allocations: the opening clause, the tracks (each once, with its figures
  // and its rule), then the retrieval and no-guarantee clauses.
  const tracks = section.content.filter((item) => TRACK_IDS.has(item.id));
  const [opening, ...rest] = section.content.filter((item) => !TRACK_IDS.has(item.id));
  return (
    <>
      {opening ? (
        <LegalClause
          id={clauseAnchor(section.id, opening.id)}
          heading={opening.subtitle}
          text={opening.text}
          locale={locale}
        />
      ) : null}
      <AllocationTracks copy={copy.allocationsTable} tracks={tracks} locale={locale} />
      {rest.map((item) => (
        <LegalClause
          key={item.id}
          id={clauseAnchor(section.id, item.id)}
          heading={item.subtitle}
          text={item.text}
          locale={locale}
        />
      ))}
    </>
  );
}

/**
 * The Terms of Service in the Trust Center template: the warning first, then
 * each section with its clauses (every clause is an anchor, so support and
 * the risk disclosures can cite `/terms#allocations-retrieval`, and a cited
 * clause is marked), the allocation tracks as one list with their figures,
 * the prohibited activities as a real list, and the acknowledgment last.
 */
export function TermsContent({
  copy,
  locale,
  labels,
}: {
  copy: TermsCopy;
  locale: string;
  labels: LegalDocumentLabels;
}) {
  return (
    <LegalDocument
      page="terms"
      labels={labels}
      title={copy.title}
      intro={copy.subtitle}
      summary={
        <LegalCallout
          tone="attention"
          title={copy.warning.title}
          text={copy.warning.text}
          locale={locale}
        />
      }
      sections={[
        ...copy.sections.map((section) => ({
          id: section.id,
          heading: section.title,
          content: <TermsSectionBody section={section} copy={copy} locale={locale} />,
        })),
        {
          id: 'additional',
          heading: copy.additionalTitle,
          content: (
            <>
              {copy.additional.map((item) => (
                <LegalClause
                  key={item.id}
                  id={clauseAnchor('additional', item.id)}
                  heading={item.subtitle}
                  text={item.text}
                  locale={locale}
                />
              ))}
              <LegalCallout
                title={copy.acknowledgment.title}
                text={copy.acknowledgment.text}
                locale={locale}
                className="mt-10"
              />
            </>
          ),
        },
      ]}
    />
  );
}
