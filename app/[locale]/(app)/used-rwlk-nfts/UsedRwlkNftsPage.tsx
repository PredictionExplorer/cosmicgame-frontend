'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { SITE_ROUTE_ICONS } from '@/config/siteNavIcons';
import { randomWalkImageUrl, randomWalkTokenUrl } from '@/utils/urls';
import { formatCount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import type { UsedRWLKNFT } from '@/services/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { SiteLink } from '@/components/layout/SiteLink';
import { PagedWall, wallReadFailed } from '@/components/nft/PagedWall';
import { TitleWithArrow } from '@/components/nft/TitleWithArrow';
import { useWallPage } from '@/components/nft/useWallPage';
import { AddressChip } from '@/components/ui/address-chip';
import { ArtFrame } from '@/components/ui/art-frame';
import { TableLink } from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { PageShell } from '@/components/ui/page-shell';
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
  page,
  onPageChange,
}: UsedRwlkNftsPageProps) => {
  const t = useTranslations('statistics');
  const { data, isLoading, isError, refetch } = useUsedRWLKNFTs();
  const records = useMemo(() => newestFirst(toUsedRwlkNftRecords(data ?? [])), [data]);
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

      <PagedWall
        items={records}
        itemKey={(record) => `${record.TxHash ?? 'record'}-${record.RWalkTokenId}`}
        renderItem={(record, { eager }) => <UsedRandomWalkCard record={record} priority={eager} />}
        pageSize={PAGE_SIZE}
        page={page}
        onPageChange={onPageChange}
        gridClassName={cn(SIGNATURE_GRID_CLASS, COLUMNS_CLASS)}
        ariaLabel={t('usedRwlkNfts.title')}
        eagerCount={EAGER_CARDS}
        loading={isLoading}
        loadingState={<SignatureGridSkeleton count={8} className={COLUMNS_CLASS} />}
        error={
          wallReadFailed({ isError, data }, refreshFailed) ? (
            <ErrorState
              title={t('usedRwlkNfts.loadErrorTitle')}
              message={t('usedRwlkNfts.loadError')}
              headingLevel={2}
              onRetry={() => void refetch()}
            />
          ) : null
        }
        empty={
          <EmptyState
            icon={<UsedRwlkIcon aria-hidden />}
            title={t('usedRwlkNfts.emptyTitle')}
            description={t('usedRwlkNfts.emptyDescription')}
            headingLevel={2}
            variant="page"
          />
        }
      />
    </PageShell>
  );
};

/**
 * One used Random Walk NFT: the plate and its title ("Random Walk #004079",
 * the project's own name for it, so the number never reads as a Cosmic
 * Signature's) link to the token on the Random Walk site in a new tab; the
 * caption names the cycle (linked to its allocation), when the gesture landed
 * and the participant, as the attached NFTs' labels do.
 */
function UsedRandomWalkCard({
  record,
  priority,
}: {
  record: UsedRwlkNftRecord;
  priority: boolean;
}) {
  const t = useTranslations('statistics');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  // "004079": the project's own names pad the number to six digits.
  const number = formatId(record.RWalkTokenId).slice(1);

  return (
    <article className="min-w-0" data-testid="used-rwlk-nft">
      <SiteLink
        kind="external"
        href={randomWalkTokenUrl(record.RWalkTokenId)}
        externalIcon={false}
        className="group block rounded-edge"
      >
        <ArtFrame
          sources={[
            randomWalkImageUrl(record.RWalkTokenId),
            randomWalkImageUrl(record.RWalkTokenId, 'black.png'),
          ]}
          alt={t('usedRwlkNfts.artAlt', { id: number })}
          sizes={SIZES}
          priority={priority}
          unavailableLabel={tDetail('image.artworkUnavailable')}
          unavailableDetail={`#${number}`}
          className="group-hover:after:shadow-[var(--art-edge-active)]"
        />
        {/* The plate's alt text already names the token. */}
        {/* The title as the attached NFTs' labels set theirs. */}
        <p
          aria-hidden
          className="mt-3 line-clamp-2 type-body-sm font-medium text-foreground decoration-rule underline-offset-4 group-hover:underline"
        >
          <TitleWithArrow text={t('usedRwlkNfts.card.title', { id: number })} />
        </p>
      </SiteLink>
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
