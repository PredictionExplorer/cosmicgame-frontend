'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useDonationsNFTList } from '@/hooks/useApiQuery';
import { AttachedAssetsIcon } from '@/lib/conceptIcons';
import { PageHeader } from '@/components/layout/PageHeader';
import AttachedNFT from '@/components/attachments/AttachedNFT';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { TablePagination } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 12;

/** Four across from `lg`, the width a square plate reads well at. */
const WALL_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12';

/**
 * The NFTs participants attached to their gestures, hung as works: each on a
 * square black plate, with its collection, the cycle it went to, when, and
 * who attached it. Newest first.
 *
 * `seoSummary` is the server-rendered page header, the page's only header.
 */
const NFTDonationsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');
  const { data, isLoading, isError, refetch } = useDonationsNFTList();
  const [page, setPage] = useState(1);
  const wallRef = useRef<HTMLDivElement>(null);
  const records = [...(data ?? [])].sort((a, b) => (b.TimeStamp ?? 0) - (a.TimeStamp ?? 0));
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const visible = records.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('attachedNfts.title')}
          subtitle={t('attachedNfts.subtitle')}
        />
      )}

      {isError ? (
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
            {visible.map((record) => (
              <li key={String(record.RecordId ?? `${record.TokenAddr}-${record.NFTTokenId}`)}>
                <AttachedNFT nft={record} showRecord />
              </li>
            ))}
          </ul>
          <TablePagination
            page={current}
            pageSize={PAGE_SIZE}
            total={records.length}
            onPageChange={(next) => {
              setPage(next);
              wallRef.current?.scrollIntoView?.({ block: 'start' });
            }}
            className="mt-10 border-t border-rule-faint pt-5 sm:pl-0"
          />
        </div>
      )}
    </PageShell>
  );
};

export default NFTDonationsPage;
