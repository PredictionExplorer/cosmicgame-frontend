import { NotFoundView } from '@/components/layout/NotFoundView';

/**
 * The landing 404: the same designed page as the app's, inside the landing
 * chrome. Like the app's, it exports no metadata: the page that calls
 * `notFound()` names the tab (see notFoundMetadata), with the locale from its
 * params rather than request headers, so the static Learn and Quiz routes
 * stay static when a slug is missing.
 */
export default function LandingNotFound() {
  return (
    <main id="main" tabIndex={-1} className="site-container relative">
      <NotFoundView host="landing" />
    </main>
  );
}
