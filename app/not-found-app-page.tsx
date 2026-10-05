'use client';

import Footer from '@/components/layout/Footer';
import { NotFoundView } from '@/components/layout/NotFoundView';
import { PageShell } from '@/components/ui/page-shell';

import { Providers } from './[locale]/(app)/providers';

/**
 * The global 404 on app.cosmicsignature.com: the app's providers, header and
 * footer around the designed not-found page. app/global-not-found.tsx loads
 * this module on demand (see app/not-found-shells.tsx); it renders on the
 * server all the same.
 */
export default function AppNotFoundPage() {
  return (
    <Providers footer={<Footer />}>
      <PageShell variant="data" backdrop="subtle">
        <NotFoundView host="app" />
      </PageShell>
    </Providers>
  );
}
