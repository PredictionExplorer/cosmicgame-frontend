import type { Metadata, ResolvingMetadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readAttachedNfts } from '../publicDataReads';
import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { seedsDisabled } from '../QuerySeed';

import { AttachedNftMetadataSeed } from './AttachedNftMetadataSeed';
import NFTDonationsPage, { NFTDonationsRoute } from './NFTDonationsPage';

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
    t('nftDonations.title'),
    t('nftDonations.description'),
    undefined,
    '/attached-nfts',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The header's count, so the wall can tell a failed refresh from an empty
  // collection. Off under the e2e harness, whose browser mocks own the list.
  const snapshot = await readAttachedNfts();
  const snapshotCount = seedsDisabled() ? null : (snapshot.data?.length ?? null);
  const seoSummary = <PublicDataRouteSeoSummary route="attached-nfts" />;

  return (
    <PageMessages namespaces={['detail', 'statistics', 'tables']}>
      <PublicDataQuerySeed route="attached-nfts">
        <AttachedNftMetadataSeed>
          {/*
           * The wall reads its page from the URL, which renders it on the
           * client in the prerendered page; the fallback is the first page,
           * so the static HTML already holds the plates.
           */}
          <Suspense
            fallback={<NFTDonationsPage seoSummary={seoSummary} snapshotCount={snapshotCount} />}
          >
            <NFTDonationsRoute seoSummary={seoSummary} snapshotCount={snapshotCount} />
          </Suspense>
        </AttachedNftMetadataSeed>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
