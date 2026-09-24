'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import NFTImage from '@/components/nft/NFTImage';
import { useAttachedErc20Metadata } from '@/components/attachments/useAttachedErc20Metadata';
import { useAttachedNftMetadata } from '@/components/attachments/useAttachedNftMetadata';
import { PendingPlate } from '@/components/ui/art-frame';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { useFormat } from '@/hooks/useFormat';
import type { DonatedErc20ClaimAmountSource } from '@/utils/donatedErc20';
import { formatAddress, NBSP } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { getExplorerUrl } from '@/utils/urls';

import { tokenClaimKey } from './retrieval';

/** One attached NFT waiting for this wallet (unclaimed donated NFT). */
export interface AttachedNftRetrievalRow {
  Index: number;
  RoundNum: number;
  TokenAddr: string;
  NFTTokenId?: string | number;
  TokenId?: string | number;
  NFTTokenURI?: string;
  DonorAddr?: string;
  TimeStamp?: number;
  TxHash?: string;
}

/** One attached ERC-20 token waiting for this wallet (raw amounts for the retrieve call). */
export interface AttachedTokenRetrievalRow extends DonatedErc20ClaimAmountSource {
  RoundNum: number;
  TokenAddr: string;
  DonorAddr?: string;
  TimeStamp?: number;
  TxHash?: string;
  /** What is left to retrieve, in whole tokens (the indexer's `DonateClaimDiffEth`). */
  DonateClaimDiffEth?: string | number;
  AmountDonatedEth?: number;
  AmountClaimedEth?: number;
}

function nftTokenId(row: AttachedNftRetrievalRow): string {
  return String(row.NFTTokenId ?? row.TokenId ?? '');
}

/** The NFT itself: its image (or the neutral media well), its name and its collection. */
function AttachedNftIdentity({ row }: { row: AttachedNftRetrievalRow }) {
  const t = useTranslations('myPages');
  const tokenId = nftTokenId(row);
  const { data: metadata } = useAttachedNftMetadata(row.NFTTokenURI, {
    tokenAddr: row.TokenAddr,
    tokenId,
  });
  const name = metadata?.name?.trim() || t('attached.tokenNumber', { id: tokenId });

  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="w-16 shrink-0 overflow-hidden rounded-edge">
        {metadata?.image ? (
          <NFTImage
            src={metadata.image}
            fallbackSrc={metadata.imageFallback}
            alt=""
            sizes="64px"
            frame="media"
            density="compact"
          />
        ) : (
          <PendingPlate variant="media" density="compact" />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate type-body-sm font-medium text-foreground">{name}</span>
        <ExternalTableLink
          href={getExplorerUrl('address', row.TokenAddr)}
          className="type-mono text-subtle"
        >
          {formatAddress(row.TokenAddr)}
        </ExternalTableLink>
      </span>
    </span>
  );
}

/** The token's symbol (read from its contract) linked to the token on the explorer. */
function AttachedTokenIdentity({ address }: { address: string }) {
  const { data: metadata } = useAttachedErc20Metadata(address);
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate type-body-sm font-medium text-foreground">
        {metadata?.symbol ?? metadata?.name ?? formatAddress(address)}
      </span>
      <ExternalTableLink
        href={getExplorerUrl('address', address)}
        className="type-mono text-subtle"
      >
        {formatAddress(address)}
      </ExternalTableLink>
    </span>
  );
}

function TokenAmount({ row }: { row: AttachedTokenRetrievalRow }) {
  const format = useFormat();
  const { data: metadata } = useAttachedErc20Metadata(row.TokenAddr);
  const amount = toFiniteNumber(row.DonateClaimDiffEth);
  if (amount === null) return null;
  return (
    <span className="whitespace-nowrap tabular-nums">
      {format.number(amount, { maximumFractionDigits: 4 })}
      {metadata?.symbol ? (
        <>
          {NBSP}
          <span className="text-muted-foreground">{metadata.symbol}</span>
        </>
      ) : null}
    </span>
  );
}

interface RetrievalTableProps<T> {
  rows: readonly T[];
  ariaLabel: string;
  headingLevel?: 2 | 3 | 4;
}

/**
 * The NFTs attached to gestures that wait for this wallet: each one's image,
 * name and collection, the cycle, who attached it, and a quiet "Retrieve"
 * that shows its own pending state.
 */
export function AttachedNftRetrievalTable({
  rows,
  ariaLabel,
  headingLevel,
  onRetrieve,
  retrieving,
}: RetrievalTableProps<AttachedNftRetrievalRow> & {
  onRetrieve: (index: number) => void;
  /** PrizesWallet indexes being retrieved. */
  retrieving: readonly number[];
}) {
  const t = useTranslations('myPages');
  const columns = useMemo<DataTableColumn<AttachedNftRetrievalRow>[]>(
    () => [
      {
        id: 'nft',
        header: t('attached.columns.nft'),
        value: (row) => nftTokenId(row),
        cell: (row) => <AttachedNftIdentity row={row} />,
        stack: true,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('attached.columns.cycle'),
        value: (row) => row.RoundNum,
        cell: (row) => (
          <TableLink href={`/allocation/${row.RoundNum}`}>
            {t('ethAllocations.cycle', { cycle: row.RoundNum })}
          </TableLink>
        ),
        nowrap: true,
      },
      {
        id: 'contributor',
        kind: 'address',
        header: t('attached.columns.contributor'),
        value: (row) => row.DonorAddr ?? null,
        priority: 'secondary',
      },
      {
        id: 'attached',
        kind: 'datetime',
        header: t('attached.columns.attached'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        priority: 'secondary',
      },
      {
        id: 'action',
        header: <span className="sr-only">{t('attached.columns.action')}</span>,
        // The button names itself; a phone record needs no label beside it.
        label: '',
        align: 'end',
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            loading={retrieving.includes(row.Index)}
            onClick={() => onRetrieve(row.Index)}
            aria-label={t('attached.retrieveItem', {
              item: t('attached.tokenNumber', { id: nftTokenId(row) }),
            })}
          >
            {t('attached.retrieve')}
          </Button>
        ),
      },
    ],
    [onRetrieve, retrieving, t],
  );
  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={ariaLabel}
      headingLevel={headingLevel}
      getRowKey={(row) => row.Index}
    />
  );
}

/**
 * The ERC-20 tokens attached to gestures that wait for this wallet: the
 * token, the cycle, the amount left to retrieve and a quiet "Retrieve".
 */
export function AttachedTokenRetrievalTable({
  rows,
  ariaLabel,
  headingLevel,
  onRetrieve,
  retrieving,
}: RetrievalTableProps<AttachedTokenRetrievalRow> & {
  onRetrieve: (row: AttachedTokenRetrievalRow) => void;
  /** `tokenClaimKey`s of the tokens being retrieved. */
  retrieving: readonly string[];
}) {
  const t = useTranslations('myPages');
  const columns = useMemo<DataTableColumn<AttachedTokenRetrievalRow>[]>(
    () => [
      {
        id: 'token',
        header: t('attached.columns.token'),
        value: (row) => row.TokenAddr,
        cell: (row) => <AttachedTokenIdentity address={row.TokenAddr} />,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('attached.columns.cycle'),
        value: (row) => row.RoundNum,
        cell: (row) => (
          <TableLink href={`/allocation/${row.RoundNum}`}>
            {t('ethAllocations.cycle', { cycle: row.RoundNum })}
          </TableLink>
        ),
        nowrap: true,
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('attached.columns.amount'),
        value: (row) => toFiniteNumber(row.DonateClaimDiffEth),
        cell: (row) => <TokenAmount row={row} />,
      },
      {
        id: 'action',
        header: <span className="sr-only">{t('attached.columns.action')}</span>,
        // The button names itself; a phone record needs no label beside it.
        label: '',
        align: 'end',
        cell: (row) => (
          <Button
            variant="outline"
            size="sm"
            loading={retrieving.includes(tokenClaimKey(row.RoundNum, row.TokenAddr))}
            onClick={() => onRetrieve(row)}
            aria-label={t('attached.retrieveItem', { item: formatAddress(row.TokenAddr) })}
          >
            {t('attached.retrieve')}
          </Button>
        ),
      },
    ],
    [onRetrieve, retrieving, t],
  );
  return (
    <DataTable
      data={rows}
      columns={columns}
      ariaLabel={ariaLabel}
      headingLevel={headingLevel}
      getRowKey={(row) => tokenClaimKey(row.RoundNum, row.TokenAddr)}
    />
  );
}
