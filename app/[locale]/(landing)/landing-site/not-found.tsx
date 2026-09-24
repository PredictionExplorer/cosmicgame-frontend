import type { Metadata } from 'next';

import { NotFoundView } from '@/components/layout/NotFoundView';
import { notFoundMetadata } from '@/components/layout/notFoundMetadata';

/** The same tab title as the app's 404. */
export function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata();
}

/** The landing 404: the same designed page as the app's, inside the landing chrome. */
export default function LandingNotFound() {
  return (
    <main id="main" tabIndex={-1} className="site-container relative">
      <NotFoundView host="landing" />
    </main>
  );
}
