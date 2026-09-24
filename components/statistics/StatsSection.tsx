'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import { useTablePageSize } from '@/components/ui/data-table';

import { SectionShell, type SectionShellProps } from './SectionShell';

export interface StatsSectionProps extends Omit<SectionShellProps, 'busy' | 'toggleLabels'> {
  /** Query state behind the standard loading, error and empty treatments. */
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Replaces the content with an empty state (unless loading or failed). */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  /**
   * How many rows the page's own figures say this list holds (the header's
   * "Unique participants 37"). It sizes the loading skeleton to the table
   * that will replace it, and an empty list against a count above zero reads
   * as a list that did not come back, with a retry, never as "none yet".
   */
  expectedCount?: number | null;
  /**
   * Other figures prove the list has rows (NFTs have been imprinted, CST is
   * in supply) without saying how many: an empty answer is then a list that
   * did not come back, not an empty protocol.
   */
  knownNonEmpty?: boolean;
  /** Custom loading placeholder; defaults to ledger skeleton rows. */
  skeleton?: ReactNode;
  errorTitle?: string;
}

/** Skeleton rows for a table of `expected` rows: one page of it, or five while unknown. */
export function skeletonRowCount(expected: number | null | undefined, pageSize: number): number {
  if (expected === null || expected === undefined || !Number.isFinite(expected)) return 5;
  return Math.max(1, Math.min(pageSize, Math.floor(expected)));
}

/**
 * StatsSection — a statistics page section (`SectionShell`) whose body
 * renders the shared loading, error and empty treatments, so every table and
 * chart on the statistics pages degrades the same way. Empty lists use the
 * inline state: a section is a row of the page, not a page of its own.
 */
export function StatsSection({
  isLoading = false,
  isError = false,
  onRetry,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  expectedCount,
  knownNonEmpty = false,
  skeleton,
  errorTitle,
  children,
  ...shell
}: StatsSectionProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const pageSize = useTablePageSize();
  const stateHeading = ((shell.headingLevel ?? 2) + 1) as 3 | 4;
  const midSentenceTitle = getLocaleConfig(locale).lowercaseMidSentence
    ? shell.title.toLowerCase()
    : shell.title;

  let body: ReactNode = children;
  if (isLoading) {
    body = skeleton ?? (
      <SkeletonTable rows={skeletonRowCount(expectedCount, pageSize)} columns={3} />
    );
  } else if (isError) {
    body = (
      <ErrorState
        headingLevel={stateHeading}
        title={errorTitle ?? t('shared.sectionLoadErrorTitle', { title: midSentenceTitle })}
        message={t('shared.serviceError')}
        onRetry={onRetry}
      />
    );
  } else if (isEmpty && (knownNonEmpty || (expectedCount ?? 0) > 0)) {
    // The page counts rows this list did not return: say so and offer the read again.
    body = (
      <ErrorState
        variant="inline"
        headingLevel={stateHeading}
        title={t('shared.listMissingTitle')}
        message={t('shared.listMissingMessage')}
        onRetry={onRetry}
      />
    );
  } else if (isEmpty) {
    body = (
      <EmptyState
        variant="inline"
        headingLevel={stateHeading}
        title={emptyTitle ?? t('shared.noDataTitle')}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  return (
    <SectionShell
      {...shell}
      busy={isLoading}
      toggleLabels={{ show: t('shared.showSection'), hide: t('shared.hideSection') }}
    >
      {body}
    </SectionShell>
  );
}
