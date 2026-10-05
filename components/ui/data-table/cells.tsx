'use client';

import type { ComponentProps, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { getExplorerUrl } from '@/utils/urls';
import { Link } from '@/i18n/navigation';
import { TABLE_LINK_CLASS } from '@/components/ui/responsive-table';

/**
 * An internal link in a ledger cell (an address, a token, a cycle): a real
 * `Link` from `@/i18n/navigation`, so it keeps the locale, navigates in the
 * same tab with client routing, and supports Back and open-in-new-tab.
 */
export function TableLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn(TABLE_LINK_CLASS, className)} {...props} />;
}

interface TxProofLinkProps {
  /** Transaction hash. */
  hash: string;
  children: ReactNode;
  className?: string;
}

/**
 * A row's on-chain proof: its value (usually the date) linked to the
 * transaction on the block explorer, with the up-right arrow that marks a
 * link leaving the site and a spoken note that it opens a new tab.
 */
export function TxProofLink({ hash, children, className }: TxProofLinkProps) {
  const t = useTranslations('tables');
  return (
    <a
      href={getExplorerUrl('tx', hash)}
      target="_blank"
      rel="noopener noreferrer"
      // Inline, so it flows (and wraps) like the text around it.
      className={cn(TABLE_LINK_CLASS, 'whitespace-nowrap', className)}
    >
      {children}
      <ArrowUpRight aria-hidden className="ml-1 inline size-3.5 align-[-0.125em] text-subtle" />
      <span className="sr-only">{t('proof.transactionNewTab')}</span>
    </a>
  );
}

/**
 * A link leaving the site from a ledger cell (a metadata URL, a document):
 * a new tab, the up-right arrow, and a spoken note that it opens a new tab.
 */
export function ExternalTableLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useTranslations('tables');
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(TABLE_LINK_CLASS, className)}
    >
      {children}
      <ArrowUpRight aria-hidden className="ml-0.5 inline size-3.5 align-[-0.125em] text-subtle" />
      <span className="sr-only">{t('links.newTab')}</span>
    </a>
  );
}

const TAG_CLASS =
  'inline-flex max-w-full items-center whitespace-nowrap rounded-edge border px-1.5 type-caption font-medium leading-[1.125rem]';

/**
 * A short tag inside a ledger cell: a hairline outline and sentence-case
 * caption type, for a category ("CST", "Hidden") that is data, not status.
 */
export function TableTag({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  /** `neutral` for a category; `accent` for the reader's own row or an action it needs. */
  tone?: 'neutral' | 'accent';
  className?: string;
}) {
  return (
    <span
      className={cn(
        TAG_CLASS,
        tone === 'neutral' && 'border-rule text-muted-foreground',
        tone === 'accent' && 'border-primary/45 text-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Marks the connected wallet's row. The row keeps its ranked place; the tag
 * and the row's accent rule say whose it is.
 */
export function YouBadge({ className }: { className?: string }) {
  const t = useTranslations('tables');
  return (
    <TableTag tone="accent" className={cn('align-middle', className)}>
      {t('status.youBadge')}
    </TableTag>
  );
}
