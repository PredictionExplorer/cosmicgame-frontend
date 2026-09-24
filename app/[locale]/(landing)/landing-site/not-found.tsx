import { NotFoundView } from '@/components/layout/NotFoundView';

/**
 * The landing 404's head: its own title and `noindex, follow`, with the
 * locale from this segment's params rather than request headers, so the
 * static Learn and Quiz routes stay static when a slug is missing.
 */
export { generateNotFoundMetadata as generateMetadata } from '@/components/layout/notFoundMetadata';

/** The landing 404: the same designed page as the app's, inside the landing chrome. */
export default function LandingNotFound() {
  return (
    <main id="main" tabIndex={-1} className="site-container relative">
      <NotFoundView host="landing" />
    </main>
  );
}
