'use client';

import { useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Tag } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { useCollectionTraits } from '@/hooks/useNftTraits';
import { Link } from '@/i18n/navigation';
import { PageHeader } from '@/components/layout/PageHeader';
import { wallReadFailed } from '@/components/nft/PagedWall';
import { SignatureWall, type SignatureWallItem } from '@/components/nft/SignatureWall';
import { useWallPage } from '@/components/nft/useWallPage';
import { AddressChip } from '@/components/ui/address-chip';
import { TxProofLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';

import { NAMED_WALL_QUERY_KEY, readNamedWall, type NamedSignature } from './namedWall';

/** The named Signatures with their naming records (seeded by the server). */
export function useNamedWall() {
  return useQuery<NamedSignature[]>({
    queryKey: NAMED_WALL_QUERY_KEY,
    queryFn: ({ signal }) => readNamedWall({ signal }),
    staleTime: 30_000,
  });
}

export interface NamedNFTsPageProps {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
  /**
   * How many named NFTs the header's server snapshot counted (`null` when it
   * could not read them). An empty list under a non-zero snapshot is a read
   * that failed, not a collection without names.
   */
  snapshotCount?: number | null;
  /** The page in the URL (`NamedNFTsRoute`); without it the page is local. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/**
 * Who named a Signature and when: the date links to the naming transaction,
 * the address to its owner's page. Outside the card's link, so neither is a
 * link inside a link.
 */
function NamingRecord({ row }: { row: NamedSignature }) {
  const t = useTranslations('statistics');
  if (row.namedAt === null) return null;
  const date = <DateTime timestamp={row.namedAt} />;
  return (
    <div className="mt-1.5 space-y-1 type-caption text-subtle">
      <p className="flex min-w-0 flex-wrap items-center gap-x-1.5">
        <span className="shrink-0">{t('namedNfts.card.namedOn')}</span>
        {row.namedTx ? <TxProofLink hash={row.namedTx}>{date}</TxProofLink> : date}
      </p>
      {row.namedBy ? (
        // The address never breaks: in a narrow column it takes its own line.
        <p className="flex min-w-0 flex-wrap items-center gap-x-1.5">
          <span className="shrink-0">{t('namedNfts.card.namedBy')}</span>
          <AddressChip address={row.namedBy} variant="plain" showCopy={false} className="min-w-0" />
        </p>
      ) : null}
    </div>
  );
}

/**
 * Named Signatures, hung as art: each on its plate with its name as the wall
 * label's title and the record of its naming (when, by whom, the proof)
 * under it, the most recently named first. Only the named tokens are read
 * (`readNamedWall`); a plate whose record could not be read takes its seed
 * from the trait index. A failed read says so, with Retry, rather than
 * claiming nothing has been named; a failed refresh keeps the wall.
 */
const NamedNFTsPage = ({
  seoSummary,
  snapshotCount = null,
  page,
  onPageChange,
}: NamedNFTsPageProps) => {
  const t = useTranslations('statistics');
  const { data, isLoading, isError, refetch } = useNamedWall();
  const {
    traits: collectionTraits,
    isLoading: traitsLoading,
    isError: traitsError,
  } = useCollectionTraits();
  const traitsForUi = traitsError ? null : traitsLoading ? undefined : (collectionTraits ?? null);

  const items = useMemo<SignatureWallItem[]>(
    () =>
      (data ?? []).map((row) => ({
        tokenId: row.tokenId,
        name: row.name || null,
        seed: row.seed ?? collectionTraits?.byId.get(row.tokenId)?.seed ?? null,
        anchored: row.anchored,
        imprintedAt: row.imprintedAt,
        after: <NamingRecord row={row} />,
      })),
    [data, collectionTraits],
  );

  // A plate needs its seed: when a record could not give one, wait for the
  // trait index rather than flash the "unavailable" state.
  const loading = isLoading || (traitsLoading && items.some((item) => item.seed === null));
  // The header counted named NFTs a moment ago: an empty refresh failed.
  const refreshFailed = !isLoading && (data ?? []).length === 0 && (snapshotCount ?? 0) > 0;

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('namedNfts.title')}
          subtitle={t('namedNfts.subtitle')}
        />
      )}

      <SignatureWall
        items={items}
        collectionTraits={traitsForUi}
        loading={loading}
        page={page}
        onPageChange={onPageChange}
        ariaLabel={t('namedNfts.title')}
        error={
          wallReadFailed({ isError, data }, refreshFailed) ? (
            <ErrorState
              title={t('namedNfts.loadErrorTitle')}
              message={t('namedNfts.loadErrorMessage')}
              headingLevel={2}
              onRetry={() => void refetch()}
            />
          ) : null
        }
        empty={
          <EmptyState
            icon={<Tag aria-hidden />}
            title={t('namedNfts.emptyTitle')}
            description={t('namedNfts.emptyDescription')}
            headingLevel={2}
            variant="page"
          />
        }
      />
      {items.length > 0 && !loading ? (
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
      ) : null}
    </PageShell>
  );
};

/**
 * The page with its page number in the URL (`?page=2`), so Back from a
 * Signature returns to the same plates, as on the other walls. The route
 * renders it under Suspense with the first page as the prerendered fallback.
 */
export function NamedNFTsRoute(props: Omit<NamedNFTsPageProps, 'page' | 'onPageChange'>) {
  const { page, setPage } = useWallPage();
  return <NamedNFTsPage {...props} page={page} onPageChange={setPage} />;
}

export default NamedNFTsPage;
