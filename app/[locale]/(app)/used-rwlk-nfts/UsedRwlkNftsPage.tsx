'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { getRWLKImageUrl } from '@/utils/urls';
import { formatCount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import type { UsedRWLKNFT } from '@/services/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { useWallPage } from '@/components/nft/useWallPage';
import { AddressChip } from '@/components/ui/address-chip';
import { ArtFrame } from '@/components/ui/art-frame';
import { TableLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
import { TablePagination } from '@/components/ui/pagination';
import { SIGNATURE_GRID_CLASS, SignatureGridSkeleton } from '@/components/nft/SignatureGrid';
import { cn } from '@/lib/utils';

/** One RandomWalk NFT a gesture used. */
export interface UsedRwlkNftRecord {
  RWalkTokenId: number;
  BidderAddr: string;
  RoundNum: number;
  /** The gesture's transaction, when the indexer reports it. */
  TxHash: string | null;
  /** When the gesture landed (unix seconds), when reported. */
  TimeStamp: number | null;
}

/** Reads the indexer's loosely typed rows into records. */
export function toUsedRwlkNftRecords(rows: readonly UsedRWLKNFT[]): UsedRwlkNftRecord[] {
  return rows.map((row) => ({
    RWalkTokenId: row.RWalkTokenId,
    BidderAddr: row.BidderAddr,
    RoundNum: row.RoundNum,
    TxHash: typeof row.TxHash === 'string' && row.TxHash ? row.TxHash : null,
    TimeStamp: toFiniteNumber(row.TimeStamp),
  }));
}

/** Newest use first; records without a time keep their order at the end. */
export function newestFirst(records: readonly UsedRwlkNftRecord[]): UsedRwlkNftRecord[] {
  return [...records].sort((a, b) => (b.TimeStamp ?? -1) - (a.TimeStamp ?? -1));
}

/** The RandomWalk project's page for one token. */
function randomWalkHref(tokenId: number): string {
  return `https://www.randomwalknft.com/detail/${tokenId}`;
}

/** The token's black-ground thumbnail (files are named by the zero-padded id). */
function randomWalkThumb(tokenId: number): string {
  return getRWLKImageUrl(String(tokenId).padStart(6, '0'), 'black_thumb.jpg');
}

const PAGE_SIZE = 12;

/** The page's own glyph, as in the navigation. */
const UsedRwlkIcon = SITE_ROUTE_ICONS.usedRwlkNfts;

/** Three across from `md`, four from `xl`: a RandomWalk render reads well at about 300px. */
const COLUMNS_CLASS = 'md:grid-cols-3 xl:grid-cols-4';
const SIZES = '(min-width: 1280px) 19rem, (min-width: 768px) 33vw, 50vw';

/** Plates in the first viewport, which load eagerly. */
const EAGER_CARDS = 4;

export interface UsedRwlkNftsPageProps {
  /** The server-rendered page header, the page's only header. */
  seoSummary?: ReactNode;
  /**
   * How many uses the header's server snapshot counted (`null` when it could
   * not read them). An empty list under a non-zero snapshot is a read that
   * failed, not an empty record.
   */
  snapshotCount?: number | null;
  /** The page in the URL (`UsedRwlkNftsRoute`); without it the page is local. */
  page?: number;
  onPageChange?: (page: number) => void;
}

/**
 * The RandomWalk NFTs gestures have used, hung as works: each on its black
 * plate (RandomWalk renders share the Signatures' ratio and black ground),
 * linked to its page on the RandomWalk site, with the cycle, when, and the
 * participant whose gesture used it. Newest first, twelve a page.
 */
const UsedRwlkNftsPage = ({
  seoSummary,
  snapshotCount = null,
  page: controlledPage,
  onPageChange,
}: UsedRwlkNftsPageProps) => {
  const t = useTranslations('statistics');
  const { data, isLoading, isError, refetch } = useUsedRWLKNFTs();
  const records = useMemo(() => newestFirst(toUsedRwlkNftRecords(data ?? [])), [data]);
  const [localPage, setLocalPage] = useState(1);
  const wallRef = useRef<HTMLDivElement>(null);
  const pageCount = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const current = Math.min(controlledPage ?? localPage, pageCount);
  const visible = records.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  // The header counted uses a moment ago: an empty refresh failed.
  const refreshFailed = !isLoading && records.length === 0 && (snapshotCount ?? 0) > 0;

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('usedRwlkNfts.title')}
          subtitle={t('usedRwlkNfts.subtitle')}
        />
      )}

      {isError || refreshFailed ? (
        <ErrorState
          title={t('usedRwlkNfts.loadErrorTitle')}
          message={t('usedRwlkNfts.loadError')}
          headingLevel={2}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <SignatureGridSkeleton count={8} className={COLUMNS_CLASS} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<UsedRwlkIcon aria-hidden />}
          title={t('usedRwlkNfts.emptyTitle')}
          description={t('usedRwlkNfts.emptyDescription')}
          headingLevel={2}
          variant="page"
        />
      ) : (
        <div ref={wallRef} className="scroll-mt-[var(--sticky-offset)]">
          <ul
            className={cn(SIGNATURE_GRID_CLASS, COLUMNS_CLASS)}
            aria-label={t('usedRwlkNfts.title')}
          >
            {visible.map((record, index) => (
              <li key={`${record.TxHash ?? 'record'}-${record.RWalkTokenId}`} className="min-w-0">
                <UsedRandomWalkCard
                  record={record}
                  priority={current === 1 && index < EAGER_CARDS}
                />
              </li>
            ))}
          </ul>
          <TablePagination
            page={current}
            pageSize={PAGE_SIZE}
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
 * One used RandomWalk NFT: the plate and its number link to the token on the
 * RandomWalk site (a new tab); the caption names the cycle (linked to its
 * allocation), when the gesture landed and the participant, as the attached
 * NFTs' labels do.
 */
function UsedRandomWalkCard({
  record,
  priority,
}: {
  record: UsedRwlkNftRecord;
  priority: boolean;
}) {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const id = formatId(record.RWalkTokenId);

  return (
    <article className="min-w-0" data-testid="used-rwlk-nft">
      <a
        href={randomWalkHref(record.RWalkTokenId)}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-edge"
      >
        <ArtFrame
          sources={[randomWalkThumb(record.RWalkTokenId)]}
          alt={t('usedRwlkNfts.artAlt', { id })}
          sizes={SIZES}
          priority={priority}
          unavailableLabel={tDetail('image.artworkUnavailable')}
          unavailableDetail={id}
          className="group-hover:after:shadow-[var(--art-edge-active)]"
        />
        {/* The plate's alt text already names the token. */}
        <p
          aria-hidden
          className="mt-3 flex items-center gap-1 type-body-md font-medium tabular-nums text-foreground"
        >
          <span className="decoration-rule underline-offset-4 group-hover:underline">{id}</span>
          <ArrowUpRight className="size-3.5 shrink-0 text-subtle" />
        </p>
        <span className="sr-only">{tTables('links.newTab')}</span>
      </a>
      {/* The space before each dot does not break, so a wrapped line ends with the dot. */}
      <p className="mt-1.5 type-caption text-subtle">
        <TableLink href={`/allocation/${record.RoundNum}`}>
          {t('usedRwlkNfts.card.cycle', { cycle: formatCount(record.RoundNum, locale) })}
        </TableLink>
        {record.TimeStamp === null ? null : (
          <>
            {'\u00a0· '}
            <DateTime timestamp={record.TimeStamp} />
          </>
        )}
      </p>
      {/* The address never breaks: in a narrow column it takes its own line. */}
      <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 type-caption text-subtle">
        <span className="shrink-0">{t('usedRwlkNfts.card.usedBy')}</span>
        <AddressChip
          address={record.BidderAddr}
          variant="plain"
          showCopy={false}
          className="min-w-0"
        />
      </p>
    </article>
  );
}

/**
 * The page with its page number in the URL (`?page=2`), so Back from a cycle
 * or a participant returns to the same plates. The route renders it under
 * Suspense with the first page as the prerendered fallback.
 */
export function UsedRwlkNftsRoute(props: Omit<UsedRwlkNftsPageProps, 'page' | 'onPageChange'>) {
  const { page, setPage } = useWallPage();
  return <UsedRwlkNftsPage {...props} page={page} onPageChange={setPage} />;
}

export default UsedRwlkNftsPage;
