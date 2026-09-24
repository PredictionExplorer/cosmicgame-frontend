'use client';

import { useMemo, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getRWLKImageUrl } from '@/utils/urls';
import { formatCount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import type { UsedRWLKNFT } from '@/services/api/types';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArtFrame } from '@/components/ui/art-frame';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { PageShell } from '@/components/ui/page-shell';

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

/** Reads the indexer's loosely typed rows into ledger rows. */
export function toUsedRwlkNftRecords(rows: readonly UsedRWLKNFT[]): UsedRwlkNftRecord[] {
  return rows.map((row) => ({
    RWalkTokenId: row.RWalkTokenId,
    BidderAddr: row.BidderAddr,
    RoundNum: row.RoundNum,
    TxHash: typeof row.TxHash === 'string' && row.TxHash ? row.TxHash : null,
    TimeStamp: toFiniteNumber(row.TimeStamp),
  }));
}

/** The RandomWalk project's page for one token. */
function randomWalkHref(tokenId: number): string {
  return `https://www.randomwalknft.com/detail/${tokenId}`;
}

/** The token's black-ground thumbnail (files are named by the zero-padded id). */
function randomWalkThumb(tokenId: number): string {
  return getRWLKImageUrl(String(tokenId).padStart(6, '0'), 'black_thumb.jpg');
}

/**
 * The used RandomWalk NFTs as a ledger with their art: each row shows the
 * piece on a black plate (RandomWalk renders share the Signatures' ratio and
 * black ground), links to it on the RandomWalk site, and names the
 * participant, the cycle and the gesture that used it.
 *
 * `seoSummary` is the server-rendered page header, the page's only header.
 */
const UsedRwlkNftsPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('statistics');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useUsedRWLKNFTs();
  const rows = useMemo(() => toUsedRwlkNftRecords(data ?? []), [data]);

  const columns: DataTableColumn<UsedRwlkNftRecord>[] = [
    {
      // On a phone the picture leads its record, full width and unlabelled.
      id: 'artwork',
      header: <span className="sr-only">{t('usedRwlkNfts.columns.artwork')}</span>,
      label: '',
      stack: true,
      value: (row) => row.RWalkTokenId,
      width: '7.5rem',
      cell: (row) => (
        <ArtFrame
          sources={[randomWalkThumb(row.RWalkTokenId)]}
          alt={t('usedRwlkNfts.artAlt', { id: formatId(row.RWalkTokenId) })}
          sizes="(max-width: 639px) 15rem, 96px"
          density="compact"
          unavailableLabel={tDetail('image.artworkUnavailable')}
          className="w-24 max-sm:w-full max-sm:max-w-60"
        />
      ),
    },
    {
      id: 'token',
      header: t('usedRwlkNfts.columns.token'),
      value: (row) => row.RWalkTokenId,
      nowrap: true,
      cell: (row) => (
        <ExternalTableLink href={randomWalkHref(row.RWalkTokenId)} className="type-mono">
          {formatId(row.RWalkTokenId)}
        </ExternalTableLink>
      ),
    },
    {
      id: 'participant',
      header: t('usedRwlkNfts.columns.participant'),
      kind: 'address',
      value: (row) => row.BidderAddr,
    },
    {
      id: 'cycle',
      header: t('usedRwlkNfts.columns.cycle'),
      kind: 'count',
      value: (row) => row.RoundNum,
      cell: (row) => (
        <TableLink href={`/allocation/${row.RoundNum}`}>
          {formatCount(row.RoundNum, locale)}
        </TableLink>
      ),
    },
    {
      id: 'date',
      header: t('usedRwlkNfts.columns.date'),
      kind: 'datetime',
      value: (row) => row.TimeStamp,
      txHash: (row) => row.TxHash,
    },
  ];

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary ?? (
        <PageHeader
          section="collection"
          title={t('usedRwlkNfts.title')}
          subtitle={t('usedRwlkNfts.subtitle')}
        />
      )}

      <DataTable
        data={rows}
        columns={columns}
        ariaLabel={t('usedRwlkNfts.title')}
        getRowKey={(row) => `${row.TxHash}-${row.RWalkTokenId}`}
        initialSort={{ id: 'date', direction: 'desc' }}
        loading={isLoading}
        error={isError ? t('usedRwlkNfts.loadError') : undefined}
        onRetry={() => void refetch()}
        emptyTitle={t('usedRwlkNfts.emptyTitle')}
        emptyDescription={t('usedRwlkNfts.emptyDescription')}
        headingLevel={2}
      />
    </PageShell>
  );
};

export default UsedRwlkNftsPage;
