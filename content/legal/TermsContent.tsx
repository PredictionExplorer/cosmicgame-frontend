import { Fragment } from 'react';

import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { LegalCallout, LegalClause, LegalList } from '@/components/legal/LegalProse';
import { RichText } from '@/components/legal/RichText';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  /** The allocation tracks at a glance, above the allocation clauses. */
  readonly allocationsTable: {
    readonly title: string;
    readonly track: string;
    /** Read by screen readers in an empty cell. */
    readonly none: string;
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

/** A unit and its figure in a phone summary line ("ETH 25%"); nothing when the track has none. */
function SummaryPart({ unit, value }: { unit: string; value: string | null }) {
  if (value === null) return null;
  return (
    <span className="whitespace-nowrap">
      <span className="text-subtle">{unit}</span> {value}
    </span>
  );
}

/**
 * The allocation tracks at a glance: a table from `sm`, and on phones one
 * line per track ("ETH 25% · CST 1,000 · NFT 1") instead of eleven
 * four-row records, since each track's clause follows with its rule.
 */
function AllocationsTable({
  copy,
  names,
  locale,
}: {
  copy: TermsCopy['allocationsTable'];
  names: ReadonlyMap<string, string>;
  locale: string;
}) {
  const none = (
    <>
      <span aria-hidden className="text-subtle">
        —
      </span>
      <span className="sr-only">{copy.none}</span>
    </>
  );
  const amountText = (value: number | undefined, row: TermsAllocationRow): string | null => {
    if (value === undefined) return null;
    const formatted = formatCount(value, locale);
    return row.each
      ? copy.each.replace('{count}', formatCount(row.each, locale)).replace('{amount}', formatted)
      : formatted;
  };
  const ethText = (row: TermsAllocationRow): string | null => {
    if (!row.eth) return null;
    const percent = `${row.eth.approximate ? '≈ ' : ''}${formatPercent(row.eth.percent, locale)}`;
    return row.eth.sharedBy
      ? copy.sharedBy
          .replace('{percent}', percent)
          .replace('{count}', formatCount(row.eth.sharedBy, locale))
      : percent;
  };
  const amount = (value: number | undefined, row: TermsAllocationRow) =>
    amountText(value, row) ?? none;
  const eth = (row: TermsAllocationRow) => ethText(row) ?? none;
  const trackLink = (row: TermsAllocationRow) => (
    <a href={`#${clauseAnchor('allocations', row.id)}`} className="link-quiet">
      {names.get(row.id) ?? row.id}
    </a>
  );

  return (
    <figure className="max-w-3xl">
      <figcaption id="allocations-table-title" className="type-title text-foreground">
        {copy.title}
      </figcaption>
      <Table labelledBy="allocations-table-title" containerClassName="mt-3 max-sm:hidden">
        <TableHeader>
          <TableRow>
            <TableHead>{copy.track}</TableHead>
            <TableHead align="end">ETH</TableHead>
            <TableHead align="end">CST</TableHead>
            <TableHead align="end">NFT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {TERMS_ALLOCATION_ROWS.map((row) => (
            <TableRow key={row.id}>
              <TableCell label={copy.track} className="text-foreground">
                {trackLink(row)}
              </TableCell>
              <TableCell label="ETH" align="end" numeric>
                {eth(row)}
              </TableCell>
              <TableCell label="CST" align="end" numeric>
                {amount(row.cst, row)}
              </TableCell>
              <TableCell label="NFT" align="end" numeric>
                {amount(row.nft, row)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <dl
        data-allocations-summary
        className="mt-3 divide-y divide-rule-faint border-y border-rule-faint sm:hidden"
      >
        {TERMS_ALLOCATION_ROWS.map((row) => {
          const parts = [
            { unit: 'ETH', value: ethText(row) },
            { unit: 'CST', value: amountText(row.cst, row) },
            { unit: 'NFT', value: amountText(row.nft, row) },
          ].filter((part) => part.value !== null);
          return (
            <div key={row.id} className="py-2.5">
              <dt className="type-body-sm text-foreground">{trackLink(row)}</dt>
              <dd className="mt-0.5 type-figure-sm text-muted-foreground">
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
                    <SummaryPart unit={part.unit} value={part.value} />
                  </Fragment>
                ))}
              </dd>
            </div>
          );
        })}
      </dl>
    </figure>
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

  // Allocations: the opening clause, the tracks at a glance, each track's
  // clause as a name-and-rule row, then the retrieval and no-guarantee clauses.
  const names = new Map(
    section.content.flatMap((item) => (item.subtitle ? [[item.id, item.subtitle] as const] : [])),
  );
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
      <AllocationsTable copy={copy.allocationsTable} names={names} locale={locale} />
      <dl className="max-w-3xl divide-y divide-rule-faint border-y border-rule-faint">
        {tracks.map((item) => (
          <div
            key={item.id}
            id={clauseAnchor(section.id, item.id)}
            className="grid gap-x-8 gap-y-1 py-4 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]"
          >
            <dt className="type-title text-foreground">{item.subtitle}</dt>
            <dd className="type-body-md text-muted-foreground">
              <RichText text={item.text} locale={locale} />
            </dd>
          </div>
        ))}
      </dl>
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
 * the risk disclosures can cite `/terms#allocations-retrieval`), the
 * allocation tracks at a glance, the prohibited activities as a real list,
 * and the acknowledgment last.
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
