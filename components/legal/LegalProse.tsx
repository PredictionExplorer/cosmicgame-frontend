import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight, ArrowUpRight, Info, type LucideIcon } from 'lucide-react';

import type { LegalLinkId } from '@/content/legal/links';
import { LEGAL_LINKS } from '@/content/legal/links';

import { cn } from '@/lib/utils';

import { LegalLink, RichText } from './RichText';

/*
 * The reading blocks of the Trust Center documents. All server-safe; body
 * copy is `type-prose` (17px, 66ch, 1.65; CJK and Cyrillic tuned by the
 * utility) in the muted tier, headings and emphasis in foreground, and every
 * piece of copy goes through `RichText`, so its tags become links.
 */

const PARAGRAPH_SIZES = {
  /** Body copy: 17px at the prose measure. */
  prose: 'type-prose text-muted-foreground',
  /** A source line or footnote under a block: 14px, subtle. */
  note: 'max-w-[var(--measure-prose)] type-body-sm text-subtle',
} as const;

/** A paragraph of legal copy. */
export function LegalParagraph({
  text,
  locale,
  size = 'prose',
  className,
}: {
  text: string;
  locale: string;
  size?: keyof typeof PARAGRAPH_SIZES;
  className?: string;
}) {
  return (
    <p className={cn(PARAGRAPH_SIZES[size], className)}>
      <RichText text={text} locale={locale} />
    </p>
  );
}

/**
 * A clause: an H3 (with its own anchor, `<section>-<clause>`) over its text.
 * Clauses of one section are separated by space, not boxes.
 */
export function LegalClause({
  id,
  heading,
  text,
  locale,
  children,
}: {
  id?: string;
  heading?: string;
  text?: string;
  locale: string;
  children?: ReactNode;
}) {
  return (
    <div id={id} className="space-y-2 pt-1">
      {heading ? <h3 className="type-heading-3 text-foreground">{heading}</h3> : null}
      {text ? <LegalParagraph text={text} locale={locale} /> : null}
      {children}
    </div>
  );
}

/** A real list (bulleted, or numbered steps), never typed bullet glyphs. */
export function LegalList({
  items,
  locale,
  ordered = false,
  className,
}: {
  items: readonly string[];
  locale: string;
  ordered?: boolean;
  className?: string;
}) {
  const List = ordered ? 'ol' : 'ul';
  return (
    <List
      className={cn(
        'type-prose space-y-2.5 ps-6 text-muted-foreground marker:text-subtle',
        ordered ? 'list-decimal marker:tabular-nums' : 'list-disc',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item} className="ps-1">
          <RichText text={item} locale={locale} />
        </li>
      ))}
    </List>
  );
}

const CALLOUT_TONES = {
  note: { icon: Info, rule: 'border-primary', iconClass: 'text-primary' },
  attention: { icon: AlertTriangle, rule: 'border-attention', iconClass: 'text-attention' },
} satisfies Record<string, { icon: LucideIcon; rule: string; iconClass: string }>;

/**
 * A callout: a 2px rule on the inline start, the title as a label with its
 * icon, and the text below at the full width of the column. `attention`
 * carries the one warning a document must not let a reader miss.
 */
export function LegalCallout({
  tone = 'note',
  title,
  text,
  locale,
  as: Element = 'aside',
  className,
}: {
  tone?: keyof typeof CALLOUT_TONES;
  title: string;
  text: string;
  locale: string;
  as?: 'aside' | 'div';
  className?: string;
}) {
  const { icon: Icon, rule, iconClass } = CALLOUT_TONES[tone];
  return (
    <Element className={cn('max-w-[var(--measure-prose)] border-s-2 py-1 ps-5', rule, className)}>
      <p className="flex items-center gap-2 type-title text-foreground">
        <Icon aria-hidden className={cn('size-4 shrink-0', iconClass)} />
        {title}
      </p>
      <p className="mt-2 type-prose text-muted-foreground">
        <RichText text={text} locale={locale} />
      </p>
    </Element>
  );
}

export interface LegalLedgerRow {
  key: string;
  term: ReactNode;
  detail: ReactNode;
}

/**
 * A spec-sheet ledger under a small heading: the term on the left, its
 * detail on the right (stacked on phones), rows between hairlines. For
 * values a reader checks, such as addresses and handles.
 */
export function LegalLedger({
  heading,
  rows,
  className,
}: {
  heading?: string;
  rows: readonly LegalLedgerRow[];
  className?: string;
}) {
  return (
    <div className={className}>
      {heading ? <h3 className="type-title text-foreground">{heading}</h3> : null}
      <dl
        className={cn(
          'divide-y divide-rule-faint border-y border-rule-faint',
          heading ? 'mt-3' : undefined,
        )}
      >
        {rows.map(({ key, term, detail }) => (
          <div
            key={key}
            className="grid gap-x-8 gap-y-1.5 py-3.5 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] sm:items-baseline"
          >
            <dt className="min-w-0 type-body-sm font-medium text-foreground">{term}</dt>
            <dd className="min-w-0 type-body-sm text-muted-foreground">{detail}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export interface LegalResource {
  /** A `LEGAL_LINKS` entry. */
  link: LegalLinkId;
  label: string;
  /** One line on what the reader will find there. */
  description?: string;
}

/**
 * Where to verify a claim: one row per resource between hairlines, an
 * arrow saying whether it stays on this site (→) or opens a source (↗).
 */
export function LegalResourceList({
  resources,
  locale,
}: {
  resources: readonly LegalResource[];
  locale: string;
}) {
  return (
    <ul className="max-w-[var(--measure-prose)] divide-y divide-rule-faint border-y border-rule-faint">
      {resources.map(({ link, label, description }) => {
        const external = LEGAL_LINKS[link].kind === 'external';
        const Arrow = external ? ArrowUpRight : ArrowRight;
        return (
          <li key={`${link}-${label}`} className="py-3.5">
            <LegalLink
              id={link}
              locale={locale}
              externalIcon={false}
              className="group inline-flex min-h-6 items-center gap-1.5 type-title text-foreground transition-colors duration-[var(--duration-fast)] hover:text-primary"
            >
              {label}
              <Arrow
                aria-hidden
                className="size-4 shrink-0 text-subtle transition-colors duration-[var(--duration-fast)] group-hover:text-primary"
              />
            </LegalLink>
            {description ? (
              <p className="mt-1 type-body-sm text-muted-foreground">{description}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
