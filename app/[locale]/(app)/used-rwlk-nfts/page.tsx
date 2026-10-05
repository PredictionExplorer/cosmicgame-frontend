import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readUsedRwlkNfts } from '../publicDataReads';
import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { seedsDisabled } from '../QuerySeed';

import UsedRwlkNftsPage, { UsedRwlkNftsRoute } from './UsedRwlkNftsPage';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return createPageMetadata(
    parent,
    t('usedRwlkNfts.title'),
    t('usedRwlkNfts.description'),
    undefined,
    '/used-rwlk-nfts',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The header's count, so the wall can tell a failed refresh from an empty
  // record. Off under the e2e harness, whose browser mocks own the list.
  const snapshot = await readUsedRwlkNfts();
  const snapshotCount = seedsDisabled() ? null : (snapshot.data?.length ?? null);
  const seoSummary = <PublicDataRouteSeoSummary route="used-rwlk-nfts" />;
  return (
    <PageMessages namespaces={['detail', 'statistics', 'tables']}>
      <PublicDataQuerySeed route="used-rwlk-nfts">
        {/* The first page is the prerendered fallback of the URL-aware wall. */}
        <Suspense
          fallback={<UsedRwlkNftsPage seoSummary={seoSummary} snapshotCount={snapshotCount} />}
        >
          <UsedRwlkNftsRoute seoSummary={seoSummary} snapshotCount={snapshotCount} />
        </Suspense>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
