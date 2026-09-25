// The app's 404 for a route segment that calls notFound() (an id that is
// not a token, a cycle that does not parse). An unknown URL never reaches
// it: app/global-not-found.tsx renders those on the server. A segment's
// notFound() in a dynamic render arrives as Next.js's bare error shell,
// which the client fills with this page once the bundle runs.
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
