'use client';

import { ArrowRight, SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * The not-found state of a contribution record: which number was asked for,
 * which records have a page, and the way back to the full list.
 */
export function MissingContribution({ id }: { id: number }) {
  const t = useTranslations('ethContribution.detail');
  return (
    <EmptyState
      variant="page"
      headingLevel={2}
      icon={<SearchX aria-hidden />}
      title={t('notFoundTitle', { id: String(id) })}
      description={t('notFoundDescription')}
      action={
        <Link
          href="/eth-contribution"
          className="link inline-flex min-h-11 items-center gap-1.5 type-body-sm sm:min-h-6"
        >
          {t('backToAll')}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      }
    />
  );
}
