import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readCollection, readNamedNfts } from '../publicDataReads';
import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { QuerySeed, seedsDisabled } from '../QuerySeed';

import NamedNFTsPage from './NamedNFTsPage';

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
    t('namedNfts.title'),
    t('namedNfts.description'),
    undefined,
    '/named-nfts',
    { locale },
  );
}

export const revalidate = 300;

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // The named list carries names only; the collection list gives each plate its seed.
  const [collection, named] = await Promise.all([readCollection(), readNamedNfts()]);
  // The header's count, so the wall can tell a failed refresh from an empty
  // list. Off under the e2e harness, whose browser mocks own the list.
  const snapshotCount = seedsDisabled() ? null : (named.data?.length ?? null);
  return (
    <PageMessages namespaces={['detail', 'statistics', 'tables', 'traits']}>
      <PublicDataQuerySeed route="named-nfts">
        <QuerySeed seeds={[{ queryKey: ['cstList'], data: collection.data, at: collection.at }]}>
          <NamedNFTsPage
            seoSummary={<PublicDataRouteSeoSummary route="named-nfts" />}
            snapshotCount={snapshotCount}
          />
        </QuerySeed>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
