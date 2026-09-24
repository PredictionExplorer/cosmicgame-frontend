'use client';

import { useMemo, type ReactNode } from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCSTList, useNamedNFTs } from '@/hooks/useApiQuery';
import { useCollectionTraits } from '@/hooks/useNftTraits';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { SignatureWall, type SignatureWallItem } from '@/components/nft/SignatureWall';

export interface NamedNFTsPageProps {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
  /**
   * How many named NFTs the header's server snapshot counted (`null` when it
   * could not read them). An empty list under a non-zero snapshot is a read
   * that failed, not a collection without names.
   */
  snapshotCount?: number | null;
}

/**
 * Named Signatures, hung as art: each on its plate with its name as the wall
 * label's title. The named list carries names only; the seeds (and the
 * anchored state) come from the collection list, the captions from the trait
 * index, both shared with the gallery's cache. A failed read says so, with
 * Retry, rather than claiming nothing has been named.
 */
const NamedNFTsPage = ({ seoSummary, snapshotCount = null }: NamedNFTsPageProps) => {
  const t = useTranslations('statistics');
  const {
    data: named = [],
    isLoading: namedLoading,
    isError: namedError,
    refetch: refetchNamed,
  } = useNamedNFTs();
  const { data: collection, isLoading: collectionLoading } = useCSTList();
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
  } = useCollectionTraits();
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);

  const items = useMemo<SignatureWallItem[]>(() => {
    const byId = new Map((collection ?? []).map((token) => [token.TokenId, token]));
    return named.map((token) => {
      const record = byId.get(token.TokenId);
      return {
        tokenId: token.TokenId,
        name: token.TokenName ?? record?.TokenName ?? null,
        seed: record?.Seed ?? collectionTraits?.byId.get(token.TokenId)?.seed ?? null,
        anchored: Boolean(record?.Staked),
        imprintedAt: token.MintTimeStamp ?? record?.MintTimeStamp ?? record?.TimeStamp,
      };
    });
  }, [named, collection, collectionTraits]);

  // A plate needs its seed: wait for either source rather than flash the
  // "unavailable" state while they load.
  const loading = namedLoading || (collectionLoading && traitsLoading);
  // The header counted named NFTs a moment ago: an empty refresh failed.
  const failed = namedError || (!namedLoading && named.length === 0 && (snapshotCount ?? 0) > 0);

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('namedNfts.title')}
          subtitle={t('namedNfts.subtitle')}
        />
      )}

      {failed ? (
        <ErrorState
          title={t('namedNfts.loadErrorTitle')}
          message={t('namedNfts.loadErrorMessage')}
          headingLevel={2}
          onRetry={() => void refetchNamed()}
        />
      ) : !loading && items.length === 0 ? (
        <EmptyState
          icon={<Tag aria-hidden />}
          title={t('namedNfts.emptyTitle')}
          description={t('namedNfts.emptyDescription')}
          headingLevel={2}
          variant="page"
        />
      ) : (
        <>
          <SignatureWall
            items={items}
            collectionTraits={traitsForUi}
            loading={loading}
            ariaLabel={t('namedNfts.title')}
          />
          {loading ? null : (
            <p className="mt-10">
              <Link
                href="/gallery?show=named"
                className="group inline-flex min-h-11 items-center gap-2 type-body-sm font-medium text-foreground link-quiet"
              >
                {t('namedNfts.galleryLink')}
                <ArrowRight
                  aria-hidden
                  className="size-4 text-subtle transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5"
                />
              </Link>
            </p>
          )}
        </>
      )}
    </PageShell>
  );
};

export default NamedNFTsPage;
