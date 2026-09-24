'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';

import { SectionShell, type SectionShellProps } from './SectionShell';

export interface StatsSectionProps extends Omit<SectionShellProps, 'busy'> {
  /** Query state behind the standard loading, error and empty treatments. */
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Replaces the content with an empty state (unless loading or failed). */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  /** Custom loading placeholder; defaults to ledger skeleton rows. */
  skeleton?: ReactNode;
  errorTitle?: string;
}

/**
 * StatsSection — a statistics page section (`SectionShell`) whose body
 * renders the shared loading, error and empty treatments, so every table and
 * chart on the statistics pages degrades the same way.
 */
export function StatsSection({
  isLoading = false,
  isError = false,
  onRetry,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  skeleton,
  errorTitle,
  children,
  ...shell
}: StatsSectionProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  const stateHeading = (shell.headingLevel ?? 2) + 1;

  let body: ReactNode = children;
  if (isLoading) {
    body = skeleton ?? <SkeletonTable rows={5} columns={3} />;
  } else if (isError) {
    body = (
      <ErrorState
        headingLevel={stateHeading as 3 | 4}
        title={
          errorTitle ??
          t('shared.sectionLoadErrorTitle', {
            title: getLocaleConfig(locale).lowercaseMidSentence
              ? shell.title.toLowerCase()
              : shell.title,
          })
        }
        message={t('shared.serviceError')}
        onRetry={onRetry}
      />
    );
  } else if (isEmpty) {
    body = (
      <EmptyState
        headingLevel={stateHeading as 3 | 4}
        title={emptyTitle ?? t('shared.noDataTitle')}
        description={emptyDescription}
        icon={emptyIcon}
      />
    );
  }

  return (
    <SectionShell {...shell} busy={isLoading}>
      {body}
    </SectionShell>
  );
}
