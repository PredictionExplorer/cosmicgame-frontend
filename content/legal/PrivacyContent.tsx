import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import { LegalClause, LegalParagraph } from '@/components/legal/LegalProse';
import { RichText } from '@/components/legal/RichText';
import { SiteLink } from '@/components/layout/SiteLink';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  activePrivacyServices,
  activePrivacyStorage,
  type PrivacyServiceId,
  type PrivacyStorageEntry,
  type PrivacyStorageId,
} from './privacyInventory';

export type PrivacySectionId = 'collection' | 'use' | 'security' | 'sharing' | 'rights';

export interface PrivacyItem {
  /** The clause's anchor inside its section: `/privacy#<section>-<id>`. */
  readonly id: string;
  readonly subtitle: string;
  /** Rich text: `<tag>…</tag>` links a `LEGAL_LINKS` entry. */
  readonly text: string;
}

export interface PrivacySection {
  readonly id: PrivacySectionId;
  readonly title: string;
  readonly content: readonly PrivacyItem[];
}

export interface PrivacyCopy {
  readonly title: string;
  readonly subtitle: string;
  /**
   * Three plain sentences above the policy. The last says what the site
   * measures and reports, naming error reports.
   */
  readonly inShort: { readonly title: string; readonly points: readonly string[] };
  /**
   * The two sentences that name error reports, as a deployment without an
   * error-reporting service (no Sentry DSN) must say them: the last "In
   * short" point, and the `use` section's `improvement` clause. The policy
   * never names a processing activity its services table does not list.
   */
  readonly withoutErrorReports: { readonly inShortMeasure: string; readonly improvement: string };
  readonly introductionTitle: string;
  readonly introduction: readonly string[];
  readonly sections: readonly PrivacySection[];
  readonly services: {
    readonly heading: string;
    readonly intro: string;
    readonly columns: {
      readonly service: string;
      readonly purpose: string;
      readonly data: string;
      readonly policy: string;
    };
    readonly policyLink: string;
    /** For Cosmic Signature's own service: this policy covers it. */
    readonly ownPolicy: string;
    /** Read by screen readers where a service publishes no policy of its own. */
    readonly none: string;
    readonly items: Readonly<
      Record<PrivacyServiceId, { readonly purpose: string; readonly data: string }>
    >;
  };
  readonly storage: {
    readonly heading: string;
    readonly intro: string;
    readonly columns: {
      readonly name: string;
      readonly kind: string;
      readonly purpose: string;
      readonly lifetime: string;
    };
    readonly kinds: Readonly<Record<PrivacyStorageEntry['kind'], string>>;
    readonly lifetimes: Readonly<Record<PrivacyStorageEntry['lifetime'], string>>;
    readonly items: Readonly<Record<PrivacyStorageId, string>>;
  };
  readonly additionalTitle: string;
  readonly additional: readonly PrivacyItem[];
}

function Clauses({
  sectionId,
  items,
  locale,
  sectionLink,
}: {
  sectionId: string;
  items: readonly PrivacyItem[];
  locale: string;
  /** A clause heading link's name. */
  sectionLink: LegalDocumentLabels['sectionLink'];
}) {
  return items.map((item) => (
    <LegalClause
      key={item.id}
      id={`${sectionId}-${item.id}`}
      heading={item.subtitle}
      text={item.text}
      locale={locale}
      anchorLabel={item.subtitle ? sectionLink(item.subtitle) : undefined}
    />
  ));
}

/**
 * The copy this deployment may state: without an error-reporting service,
 * the sentences that name error reports give way to their variants.
 */
export function privacyCopyForDeployment(copy: PrivacyCopy, reportsErrors: boolean): PrivacyCopy {
  if (reportsErrors) return copy;
  const { inShortMeasure, improvement } = copy.withoutErrorReports;
  return {
    ...copy,
    inShort: { ...copy.inShort, points: [...copy.inShort.points.slice(0, -1), inShortMeasure] },
    sections: copy.sections.map((section) =>
      section.id === 'use'
        ? {
            ...section,
            content: section.content.map((item) =>
              item.id === 'improvement' ? { ...item, text: improvement } : item,
            ),
          }
        : section,
    ),
  };
}

/**
 * The services this deployment loads. On a phone each record opens on a
 * title line: the service's name, with its policy link at the same line's
 * end, then what it is for and what it receives.
 */
function ServicesTable({ copy, locale }: { copy: PrivacyCopy['services']; locale: string }) {
  const { columns } = copy;
  return (
    <Table labelledBy="services-heading">
      <TableHeader>
        <TableRow>
          <TableHead>{columns.service}</TableHead>
          <TableHead>{columns.purpose}</TableHead>
          <TableHead>{columns.data}</TableHead>
          <TableHead className="whitespace-nowrap">{columns.policy}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activePrivacyServices().map((service) => {
          let policy: ReactNode;
          if (service.policy) {
            // A span keeps the link out of the phone record's whole-value rule
            // (inline-block), which would drop the arrow onto its own line.
            policy = (
              <span className="inline-flex">
                <SiteLink
                  href={service.policy}
                  kind="external"
                  className="link inline-flex min-h-6 items-center gap-1 whitespace-nowrap"
                >
                  {copy.policyLink}
                </SiteLink>
              </span>
            );
          } else if (service.id === 'api') {
            policy = copy.ownPolicy;
          } else {
            policy = (
              <>
                <span aria-hidden className="text-subtle">
                  —
                </span>
                <span className="sr-only">{copy.none}</span>
              </>
            );
          }
          return (
            <TableRow key={service.id}>
              <TableCell
                label={columns.service}
                phone="title"
                className="font-medium text-foreground"
              >
                <span className="flex items-baseline justify-between gap-4">
                  <span>{service.name}</span>
                  {/* On a phone the policy closes the title line. */}
                  <span className="font-normal sm:hidden">{policy}</span>
                </span>
              </TableCell>
              <TableCell label={columns.purpose} stack>
                <RichText text={copy.items[service.id].purpose} locale={locale} />
              </TableCell>
              <TableCell label={columns.data} stack>
                <RichText text={copy.items[service.id].data} locale={locale} />
              </TableCell>
              <TableCell label={columns.policy} phone="omit">
                {policy}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

/**
 * The cookies and browser storage this deployment sets. On a phone each
 * record opens on the key itself, in mono, with its type and lifetime on one
 * line under it ("Cookie · 1 year"), then what it is for.
 */
function StorageTable({ copy }: { copy: PrivacyCopy['storage'] }) {
  const { columns } = copy;
  return (
    <Table labelledBy="storage-heading">
      <TableHeader>
        <TableRow>
          <TableHead>{columns.name}</TableHead>
          <TableHead>{columns.kind}</TableHead>
          <TableHead>{columns.purpose}</TableHead>
          <TableHead>{columns.lifetime}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activePrivacyStorage().map((entry) => (
          <TableRow key={entry.id}>
            <TableCell label={columns.name} phone="title">
              <span className="flex flex-col gap-0.5">
                {entry.names.map((name) => (
                  <code key={name} className="type-mono leading-6 text-foreground">
                    {name}
                  </code>
                ))}
                <span className="type-caption font-normal text-subtle sm:hidden">
                  {copy.kinds[entry.kind]}
                  <span aria-hidden> · </span>
                  <span className="sr-only">, </span>
                  {copy.lifetimes[entry.lifetime]}
                </span>
              </span>
            </TableCell>
            <TableCell label={columns.kind} phone="omit" className="whitespace-nowrap">
              {copy.kinds[entry.kind]}
            </TableCell>
            <TableCell label={columns.purpose} stack>
              {copy.items[entry.id]}
            </TableCell>
            <TableCell label={columns.lifetime} phone="omit">
              {copy.lifetimes[entry.lifetime]}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** The three sentences to read first, as a quiet checked list. */
function InShort({ copy, locale }: { copy: PrivacyCopy['inShort']; locale: string }) {
  return (
    <section
      aria-labelledby="privacy-in-short-title"
      className="border-s-2 border-primary py-1 ps-5"
    >
      <h2 id="privacy-in-short-title" className="type-title text-foreground">
        {copy.title}
      </h2>
      <ul className="mt-3 space-y-2.5">
        {copy.points.map((point) => (
          <li key={point} className="flex gap-3 type-prose text-muted-foreground">
            <Check aria-hidden className="mt-1.5 size-4 shrink-0 text-primary" />
            <span>
              <RichText text={point} locale={locale} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The privacy policy in the Trust Center template: what matters in three
 * sentences, then the policy, including the services this deployment loads
 * and the cookies and browser storage it sets, both listed from the same
 * configuration that turns them on (content/legal/privacyInventory). The
 * sentences about error reports follow that configuration too.
 */
export function PrivacyContent({
  copy: sourceCopy,
  locale,
  labels,
}: {
  copy: PrivacyCopy;
  locale: string;
  labels: LegalDocumentLabels;
}) {
  const copy = privacyCopyForDeployment(
    sourceCopy,
    activePrivacyServices().some((service) => service.id === 'sentry'),
  );
  const section = (id: PrivacySectionId) => {
    const found = copy.sections.find((candidate) => candidate.id === id);
    return found
      ? [
          {
            id,
            heading: found.title,
            content: (
              <Clauses
                sectionId={id}
                items={found.content}
                locale={locale}
                sectionLink={labels.sectionLink}
              />
            ),
          },
        ]
      : [];
  };

  return (
    <LegalDocument
      page="privacy"
      numbered
      labels={labels}
      title={copy.title}
      intro={copy.subtitle}
      summary={<InShort copy={copy.inShort} locale={locale} />}
      sections={[
        {
          id: 'introduction',
          heading: copy.introductionTitle,
          content: copy.introduction.map((paragraph) => (
            <LegalParagraph key={paragraph} text={paragraph} locale={locale} />
          )),
        },
        ...section('collection'),
        ...section('use'),
        {
          id: 'services',
          heading: copy.services.heading,
          content: (
            <>
              <LegalParagraph text={copy.services.intro} locale={locale} />
              <ServicesTable copy={copy.services} locale={locale} />
            </>
          ),
        },
        {
          id: 'storage',
          heading: copy.storage.heading,
          content: (
            <>
              <LegalParagraph text={copy.storage.intro} locale={locale} />
              <StorageTable copy={copy.storage} />
            </>
          ),
        },
        ...section('security'),
        ...section('sharing'),
        ...section('rights'),
        {
          id: 'additional',
          heading: copy.additionalTitle,
          content: (
            <Clauses
              sectionId="additional"
              items={copy.additional}
              locale={locale}
              sectionLink={labels.sectionLink}
            />
          ),
        },
      ]}
    />
  );
}
