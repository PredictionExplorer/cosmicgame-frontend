'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { AttachedAssetsIcon } from '@/lib/conceptIcons';
import { PageHeader } from '@/components/layout/PageHeader';
import AttachedNFT from '@/components/attachments/AttachedNFT';
import { useWallPage } from '@/components/nft/useWallPage';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { TablePagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

import { ATTACHED_WALL_EAGER, ATTACHED_WALL_PAGE_SIZE, newestAttachedFirst } from './attachedWall';

/** Four across from `lg`, the width a square plate reads well at. */
const WALL_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12';

export interface NFTDonationsPageProps {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
  /**
   * How many records the header's server snapshot counted (`null` when it
   * could not read them). An empty list under a non-zero snapshot is a read
   * that failed, not an empty collection.
   */
  snapshotCount?: number | null;
  /** The page in the URL (`NFTDonationsRoute`); without it the page is local. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/**
 * The NFTs participants attached to their gestures, hung as works: each on a
 * square black plate, with its collection, the cycle it went to, when, and
 * who attached it. Newest first.
 */
const NFTDonationsPage = ({
  seoSummary,
  snapshotCount = null,
  page: controlledPage,
  onPageChange,
}: NFTDonationsPageProps) => {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');
  const { data, isLoading, isError, refetch } = useDonationsNFTList();
  const [localPage, setLocalPage] = useState(1);
  const wallRef = useRef<HTMLDivElement>(null);
  const records = newestAttachedFirst(data ?? []);
  const pageCount = Math.max(1, Math.ceil(records.length / ATTACHED_WALL_PAGE_SIZE));
  const current = Math.min(controlledPage ?? localPage, pageCount);
  const visible = records.slice(
    (current - 1) * ATTACHED_WALL_PAGE_SIZE,
    current * ATTACHED_WALL_PAGE_SIZE,
  );
  // The header counted records a moment ago: an empty refresh failed.
  const refreshFailed = !isLoading && records.length === 0 && (snapshotCount ?? 0) > 0;

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('attachedNfts.title')}
          subtitle={t('attachedNfts.subtitle')}
        />
      )}

      {isError || refreshFailed ? (
        <ErrorState
          title={t('attachedNfts.loadErrorTitle')}
          message={t('attachedNfts.loadErrorMessage')}
          headingLevel={2}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <div role="status" aria-label={tTables('skeleton.loadingNft')} className={WALL_CLASS}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} aria-hidden>
              <Skeleton className="aspect-square w-full rounded-edge" />
              <Skeleton className="mt-3 h-3.5 w-2/3" />
              <Skeleton shine={false} className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<AttachedAssetsIcon aria-hidden />}
          title={t('attachedNfts.emptyTitle')}
          description={t('attachedNfts.emptyDescription')}
          headingLevel={2}
          variant="page"
        />
      ) : (
        <div ref={wallRef} className="scroll-mt-[var(--sticky-offset)]">
          <ul className={WALL_CLASS} aria-label={t('attachedNfts.title')}>
            {visible.map((record, index) => (
              <li key={String(record.RecordId ?? `${record.TokenAddr}-${record.NFTTokenId}`)}>
                <AttachedNFT
                  nft={record}
                  showRecord
                  priority={current === 1 && index < ATTACHED_WALL_EAGER}
                />
              </li>
            ))}
          </ul>
          <TablePagination
            page={current}
            pageSize={ATTACHED_WALL_PAGE_SIZE}
            total={records.length}
            onPageChange={(next) => {
              if (onPageChange) onPageChange(next);
              else setLocalPage(next);
              wallRef.current?.scrollIntoView?.({ block: 'start' });
            }}
            className="mt-10 border-t border-rule-faint pt-5 sm:pl-0"
          />
        </div>
      )}
    </PageShell>
  );
};

/**
 * The page with its page number in the URL (`?page=2`), so Back from a
 * cycle or a participant returns to the same plates. The route renders it
 * under Suspense with the first page as the prerendered fallback.
 */
export function NFTDonationsRoute(props: Omit<NFTDonationsPageProps, 'page' | 'onPageChange'>) {
  const { page, setPage } = useWallPage();
  return <NFTDonationsPage {...props} page={page} onPageChange={setPage} />;
}

export default NFTDonationsPage;
