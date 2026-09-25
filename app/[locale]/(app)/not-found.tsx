// The app's 404 for a route segment that calls notFound() once it has read
// its data (a token the API has no record of). A segment's notFound()
// arrives as Next.js's bare error shell, which the client fills with this
// page once the bundle runs, so everything that can be answered before
// routing is: app/global-not-found.tsx renders unknown URLs, and ids a page
// would turn away (/detail/abc, lib/paramRoutes.ts), on the server.
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
