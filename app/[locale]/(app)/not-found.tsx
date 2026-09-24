// Server component on purpose: the recovery links render from the server,
// without client state.
//
// No metadata here: a not-found file takes none, and reading the locale for
// it would have to go through request headers, which turns a statically
// generated route that 404s into a runtime error. The page that calls
// `notFound()` names the tab instead (see notFoundMetadata).
import { NotFoundView } from '@/components/layout/NotFoundView';
import { PageShell } from '@/components/ui/page-shell';

export default function NotFound() {
  return (
    <PageShell variant="data" backdrop="subtle">
      <NotFoundView host="app" />
    </PageShell>
  );
}
