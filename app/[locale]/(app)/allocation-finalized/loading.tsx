import { PageMessages } from '@/components/i18n/PageMessages';

import { FinalizedLoading } from './FinalizedLoading';

/**
 * A finalized cycle's record, or the index, while the server renders it: the
 * route reads its query, so it renders on every request, and the finalize
 * flow's navigation shows this at once instead of waiting on the current
 * page. It is the page's own header and the shape its data lands in
 * (`FinalizedLoading`), so nothing moves when the page arrives. The route is
 * rendered per request, never for the cache, so the boundary may read the
 * request's locale for the page's messages.
 */
export default function AllocationFinalizedLoading() {
  return (
    <PageMessages namespaces={['allocation', 'seo']}>
      <FinalizedLoading />
    </PageMessages>
  );
}
