// Server component on purpose: the recovery links render from the server,
// without client state.
import { NotFoundView } from '@/components/layout/NotFoundView';
import { PageShell } from '@/components/ui/page-shell';

/**
 * "Page not found · Cosmic Signature" and `noindex, follow` in the head of
 * every app 404, whichever segment called `notFound()`: the locale comes
 * from this segment's params, never from request headers.
 */
export { generateNotFoundMetadata as generateMetadata } from '@/components/layout/notFoundMetadata';

export default function NotFound() {
  return (
    <PageShell variant="data" backdrop="subtle">
      <NotFoundView host="app" />
    </PageShell>
  );
}
