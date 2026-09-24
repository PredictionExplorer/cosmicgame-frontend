import { useTranslations } from 'next-intl';

import { PageShell } from '@/components/ui/page-shell';
import { SkeletonPageHeader } from '@/components/ui/skeleton';

import { FinalizedSignatureSkeleton } from './FinalizedSignatureSkeleton';

/**
 * A finalized cycle's record while the server renders it (the route reads its
 * query, so it renders on every request): the page's own shell, header and
 * record skeleton, the shape a participant who just finalized lands in. The
 * finalize flow's navigation shows this at once instead of waiting on the
 * current page.
 */
export default function AllocationFinalizedLoading() {
  const t = useTranslations('allocation');
  return (
    <PageShell variant="data" backdrop="signature">
      <SkeletonPageHeader />
      <FinalizedSignatureSkeleton label={t('finalized.loading.status')} />
    </PageShell>
  );
}
