import { cache, Suspense } from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { createPageMetadata } from '@/utils/seo';
import { PageMessages } from '@/components/i18n/PageMessages';

import { readNamedNfts } from '../publicDataReads';
import { PublicDataQuerySeed } from '../PublicDataQuerySeed';
import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { QuerySeed, seedsDisabled } from '../QuerySeed';

import NamedNFTsPage, { NamedNFTsRoute } from './NamedNFTsPage';
import { NAMED_WALL_QUERY_KEY, readNamedWall, type NamedSignature } from './namedWall';

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

/**
 * The named wall as the client reads it (each named token's record and
 * naming history), read once per render. Only the named tokens travel with
 * the page, never the whole collection. Skipped under the e2e harness,
 * whose browser mocks own the data.
 */
const readNamedWallSeed = cache(
  async (): Promise<{ data: NamedSignature[] | null; at: number }> => {
    if (seedsDisabled()) return { data: null, at: Date.now() };
    try {
      return { data: await readNamedWall(), at: Date.now() };
    } catch {
      return { data: null, at: Date.now() };
    }
  },
);

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [named, wall] = await Promise.all([readNamedNfts(), readNamedWallSeed()]);
  // The header's count, so the wall can tell a failed refresh from an empty
  // list. Off under the e2e harness, whose browser mocks own the list.
  const snapshotCount = seedsDisabled() ? null : (named.data?.length ?? null);
  const seoSummary = <PublicDataRouteSeoSummary route="named-nfts" />;
  return (
    <PageMessages namespaces={['detail', 'statistics', 'tables', 'traits']}>
      <PublicDataQuerySeed route="named-nfts">
        <QuerySeed seeds={[{ queryKey: [...NAMED_WALL_QUERY_KEY], data: wall.data, at: wall.at }]}>
          {/* The first page is the prerendered fallback of the URL-aware wall. */}
          <Suspense
            fallback={<NamedNFTsPage seoSummary={seoSummary} snapshotCount={snapshotCount} />}
          >
            <NamedNFTsRoute seoSummary={seoSummary} snapshotCount={snapshotCount} />
          </Suspense>
        </QuerySeed>
      </PublicDataQuerySeed>
    </PageMessages>
  );
}
