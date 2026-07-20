'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { CollapsibleSection } from '@/components/statistics/CollapsibleSection';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonTableRow } from '@/components/ui/skeleton';

export interface StatsSectionProps {
  title: string;
  tooltip?: string;
  icon?: ReactNode;
  description?: string;
  defaultOpen?: boolean;
  /** Defer mounting content until first expanded (see CollapsibleSection). */
  lazy?: boolean;
  /** Query state driving the standard loading/error/empty presentation. */
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** Rendered content is replaced by an empty state when true (and not loading/error). */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  /** Custom loading placeholder; defaults to shimmering table rows. */
  skeleton?: ReactNode;
  errorTitle?: string;
  className?: string;
  children: ReactNode;
}

function DefaultSkeleton() {
  return (
    <div data-testid="stats-section-skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  );
}

/**
 * Standard statistics section: a collapsible card whose body renders the
 * shared loading / error / empty treatments so every table and chart on the
 * statistics pages degrades the same way.
 */
export function StatsSection({
  title,
  tooltip,
  icon,
  description,
  defaultOpen = true,
  lazy = false,
  isLoading = false,
  isError = false,
  onRetry,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  skeleton,
  errorTitle,
  className,
  children,
}: StatsSectionProps) {
  const t = useTranslations('statistics');
  const locale = useLocale();
  let body: ReactNode = children;
  if (isLoading) {
    body = skeleton ?? <DefaultSkeleton />;
  } else if (isError) {
    body = (
      <ErrorState
        title={
          errorTitle ??
          t('shared.sectionLoadErrorTitle', {
            title: locale === 'zh' ? title : title.toLowerCase(),
          })
        }
        message={t('shared.serviceError')}
        onRetry={onRetry}
        className="py-10"
      />
    );
  } else if (isEmpty) {
    body = (
      <EmptyState
        title={emptyTitle ?? t('shared.noDataTitle')}
        description={emptyDescription}
        icon={emptyIcon}
        className="py-10"
      />
    );
  }

  return (
    <CollapsibleSection
      title={title}
      tooltip={tooltip}
      icon={icon}
      description={description}
      defaultOpen={defaultOpen}
      lazy={lazy}
      className={className}
    >
      {body}
    </CollapsibleSection>
  );
}
