import { ArrowUpRight } from 'lucide-react';

import type { LegalDocumentLabels } from '@/content/legal/labels';

import { LegalDocument } from '@/components/legal/LegalDocument';
import {
  LegalList,
  LegalParagraph,
  LegalResourceList,
  type LegalResource,
} from '@/components/legal/LegalProse';
import { SiteLink } from '@/components/layout/SiteLink';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCount, toIntlLocale } from '@/utils/format';

import { AUDIT_FINDINGS_TOTAL, AUDIT_SEVERITIES, HACKEN_AUDIT, type AuditSeverity } from './audit';
import { LEGAL_LINKS } from './links';

export interface AuditsCopy {
  readonly title: string;
  readonly intro: string;
  readonly summary: {
    /** The summary's heading (an eyebrow). */
    readonly label: string;
    readonly auditor: string;
    readonly published: string;
    readonly findings: string;
    readonly criticalOrHigh: string;
    readonly invariants: string;
    /** `{held}` and `{tested}` are formatted counts. */
    readonly invariantsValue: string;
    readonly runs: string;
    readonly severity: string;
    readonly severities: Readonly<Record<AuditSeverity, string>>;
    readonly reportCta: string;
    readonly repositoryCta: string;
  };
  readonly audit: { readonly heading: string; readonly paragraphs: readonly string[] };
  readonly analysis: {
    readonly heading: string;
    readonly paragraphs: readonly string[];
    readonly resources: readonly LegalResource[];
  };
  readonly checklist: {
    readonly heading: string;
    readonly intro: string;
    /** Numbered steps; rich text with links to the evidence. */
    readonly steps: readonly string[];
  };
}

/** One colour per severity with findings, from the data series (never a status colour). */
const SEVERITY_FILL: Record<AuditSeverity, string> = {
  critical: 'bg-data-6',
  high: 'bg-data-4',
  medium: 'bg-data-3',
  low: 'bg-data-2',
  informational: 'bg-data-8',
};

/** "January 2026", in the locale's calendar words. */
function formatReportMonth(month: string, locale: string): string {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${month}-01T00:00:00Z`));
}

/**
 * The audit at a glance: who audited and when, four figures, the findings
 * by severity as one proportional bar with a readable legend, and the two
 * sources (the report and the audited code).
 */
function AuditSummary({ copy, locale }: { copy: AuditsCopy['summary']; locale: string }) {
  const { findings, invariants } = HACKEN_AUDIT;
  const count = (value: number) => formatCount(value, locale);
  const figures = [
    { id: 'findings', label: copy.findings, value: count(AUDIT_FINDINGS_TOTAL) },
    {
      id: 'critical-high',
      label: copy.criticalOrHigh,
      value: count(findings.critical + findings.high),
    },
    {
      id: 'invariants',
      label: copy.invariants,
      value: copy.invariantsValue
        .replace('{held}', count(invariants.held))
        .replace('{tested}', count(invariants.tested)),
    },
    { id: 'runs', label: copy.runs, value: count(invariants.runs) },
  ];

  return (
    <section
      aria-labelledby="audit-summary-title"
      className="rounded-surface border border-rule bg-surface p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="audit-summary-title" className="type-eyebrow text-subtle">
          {copy.label}
        </h2>
        <p className="type-label text-muted-foreground">
          <span className="text-subtle">{copy.auditor}</span>{' '}
          <span className="text-foreground">{HACKEN_AUDIT.auditor}</span>
          <span aria-hidden className="mx-2 text-subtle">
            ·
          </span>
          <span className="text-subtle">{copy.published}</span>{' '}
          <time dateTime={HACKEN_AUDIT.reportPublished} className="text-foreground">
            {formatReportMonth(HACKEN_AUDIT.reportPublished, locale)}
          </time>
        </p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-rule">
        {figures.map((figure) => (
          <div key={figure.id} data-figure={figure.id} className="min-w-0 sm:px-6 sm:first:ps-0">
            <dt className="type-label text-subtle">{figure.label}</dt>
            <dd className="mt-1.5 type-figure-lg text-foreground">{figure.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-7 border-t border-rule-faint pt-5">
        <h3 className="type-label text-subtle">{copy.severity}</h3>
        {/* The legend below carries every count; the bar only draws the proportions. */}
        <div aria-hidden className="mt-3 flex h-2 w-full gap-0.5">
          {AUDIT_SEVERITIES.filter((severity) => findings[severity] > 0).map((severity) => (
            <span
              key={severity}
              data-severity={severity}
              className={cn(
                'h-full first:rounded-s-pill last:rounded-e-pill',
                SEVERITY_FILL[severity],
              )}
              style={{ width: `${(findings[severity] / AUDIT_FINDINGS_TOTAL) * 100}%` }}
            />
          ))}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 type-label">
          {AUDIT_SEVERITIES.map((severity) => (
            <li key={severity} className="inline-flex items-center gap-2">
              <span
                aria-hidden
                className={cn(
                  'size-2 rounded-full',
                  findings[severity] > 0 ? SEVERITY_FILL[severity] : 'border border-input',
                )}
              />
              <span className="text-muted-foreground">{copy.severities[severity]}</span>
              <span className="type-figure-sm text-foreground">{count(findings[severity])}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-7 flex flex-wrap gap-3">
        <SiteLink
          href={HACKEN_AUDIT.reportUrl}
          kind="external"
          externalIcon={false}
          className={buttonVariants({ variant: 'default' })}
        >
          {copy.reportCta}
          <ArrowUpRight aria-hidden className="size-4" />
        </SiteLink>
        <SiteLink
          href={LEGAL_LINKS.contractsRepository.href}
          kind="external"
          externalIcon={false}
          className={buttonVariants({ variant: 'outline' })}
        >
          {copy.repositoryCta}
          <ArrowUpRight aria-hidden className="size-4" />
        </SiteLink>
      </div>
    </section>
  );
}

/**
 * /audits: the audit at a glance, then the audit in prose, the formal
 * verification and analysis the repository carries, and a numbered
 * checklist whose every step links its evidence.
 */
export function AuditsContent({
  copy,
  locale,
  labels,
}: {
  copy: AuditsCopy;
  locale: string;
  labels: LegalDocumentLabels;
}) {
  return (
    <LegalDocument
      page="audits"
      labels={labels}
      title={copy.title}
      intro={copy.intro}
      summary={<AuditSummary copy={copy.summary} locale={locale} />}
      sections={[
        {
          id: 'hacken',
          heading: copy.audit.heading,
          content: copy.audit.paragraphs.map((paragraph) => (
            <LegalParagraph key={paragraph} text={paragraph} locale={locale} />
          )),
        },
        {
          id: 'analysis',
          heading: copy.analysis.heading,
          content: (
            <>
              {copy.analysis.paragraphs.map((paragraph) => (
                <LegalParagraph key={paragraph} text={paragraph} locale={locale} />
              ))}
              <LegalResourceList resources={copy.analysis.resources} locale={locale} />
            </>
          ),
        },
        {
          id: 'checklist',
          heading: copy.checklist.heading,
          content: (
            <>
              <LegalParagraph text={copy.checklist.intro} locale={locale} />
              <LegalList items={copy.checklist.steps} locale={locale} ordered />
            </>
          ),
        },
      ]}
    />
  );
}
