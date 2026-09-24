import { PageShell } from '@/components/ui/page-shell';
import { SkeletonPageHeader } from '@/components/ui/skeleton';

import { AnchorActionSkeleton } from './AnchorActionSkeleton';

/**
 * An anchor action record while it renders on the server: the page's own
 * shell, header and record skeleton (the plate beside the spec rows), the
 * same shape the page shows while its read loads, so nothing moves between
 * the two or when the record arrives.
 */
export default function AnchorActionLoading() {
  return (
    <PageShell variant="data">
      <SkeletonPageHeader />
      <AnchorActionSkeleton />
    </PageShell>
  );
}
