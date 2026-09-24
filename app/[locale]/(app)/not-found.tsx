// Server component on purpose: the 404 page must arrive as crawler-visible
// HTML (branded copy + recovery links), not hydrate client-side.
import type { Metadata } from 'next';

import { NotFoundView } from '@/components/layout/NotFoundView';
import { notFoundMetadata } from '@/components/layout/notFoundMetadata';
import { PageShell } from '@/components/ui/page-shell';

/** "Page not found · Cosmic Signature" in the tab instead of the site default. */
export function generateMetadata(): Promise<Metadata> {
  return notFoundMetadata();
}

export default function NotFound() {
  return (
    <PageShell variant="data" backdrop="subtle">
      <NotFoundView host="app" />
    </PageShell>
  );
}
