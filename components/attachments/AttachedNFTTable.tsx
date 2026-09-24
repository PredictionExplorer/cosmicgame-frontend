'use client';

import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils/urls';
import { formatAddress, formatCount } from '@/utils/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import NFTImage from '@/components/nft/NFTImage';

import {
  getAttachedNftTokenId,
  nameCarriesTokenId,
  resolveAttachedNftLink,
} from './attachedNftLinks';
import { useAttachedNftMetadata } from './useAttachedNftMetadata';

export interface NFTRecord {
  RecordId: string | number;
  TxHash: string;
  TimeStamp: number;
  DonorAddr: string;
  RoundNum: number;
  TokenAddr: string;
  TokenId?: string | number;
  NFTTokenId?: string | number;
  NFTTokenURI?: string;
  WinnerAddr?: string;
  Index: number;
}

interface DonatedNFTTableProps {
  list: NFTRecord[];
  /** Retrieves one NFT by its index; shows a Retrieve action on rows not yet retrieved. */
  handleClaim?: (tokenIndex: number) => void | Promise<void>;
  /** Indexes whose retrieval is in flight. */
  claimingTokens: number[];
  /** Table heading level when the table stands under a section heading. */
  headingLevel?: 2 | 3 | 4;
}

function useRecordMetadata(nft: NFTRecord) {
  return useAttachedNftMetadata(nft.NFTTokenURI, {
    tokenAddr: nft.TokenAddr,
    tokenId: nft.NFTTokenId ?? nft.TokenId,
  });
}

/**
 * The attached NFT's image on a small black plate: 64px in the table, 96px
 * beside the name in a phone record. A skeleton while its metadata loads; the
 * captioned unavailable state only once it has settled without an image.
 */
function AttachedNftThumb({ nft, className }: { nft: NFTRecord; className?: string }) {
  const t = useTranslations('tables');
  const { data: metadata, isLoading } = useRecordMetadata(nft);
  return (
    <div
      className={cn(
        'size-16 overflow-hidden rounded-edge bg-art-ground shadow-[var(--art-edge)]',
        className,
      )}
    >
      <NFTImage
        src={metadata?.image}
        fallbackSrc={metadata?.imageFallback}
        pending={isLoading}
        alt={t('attachedAssets.nft.imageAlt', { id: getAttachedNftTokenId(nft) ?? '' })}
        unavailableLabel={t('attachedAssets.nft.imageUnavailable')}
        density="compact"
        sizes="(max-width: 639px) 6rem, 64px"
        className="aspect-square h-full w-full bg-transparent object-contain"
      />
    </div>
  );
}

/**
 * The NFT's name (or number) linked to its page, with its number under a
 * name that does not already carry it. A phone record leads with the image
 * beside it.
 */
function AttachedNftToken({ nft }: { nft: NFTRecord }) {
  const t = useTranslations('tables');
  const { data: metadata } = useRecordMetadata(nft);
  const tokenId = getAttachedNftTokenId(nft);
  const number = tokenId ? `#${tokenId}` : t('attachedAssets.nft.unknownToken');
  const name = typeof metadata?.name === 'string' ? metadata.name.trim() : '';
  const link = resolveAttachedNftLink({ nft, metadata });
  const title = name || number;
  return (
    <span className="flex min-w-0 items-center gap-3">
      <AttachedNftThumb nft={nft} className="size-24 shrink-0 sm:hidden" />
      <span className="flex min-w-0 flex-col">
        {link.href ? (
          <ExternalTableLink href={link.href} className="font-medium text-foreground">
            {title}
          </ExternalTableLink>
        ) : (
          <span className="font-medium text-foreground">{title}</span>
        )}
        {name && !nameCarriesTokenId(name, tokenId) ? (
          <span className="tabular-nums text-subtle">{number}</span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * The NFTs attached to gestures, as a ledger: each piece's image, name and
 * collection, who attached it, the cycle and the proof. With `handleClaim`
 * (the Recipient's own allocations) a row not yet retrieved offers Retrieve.
 */
const DonatedNFTTable = ({
  list,
  handleClaim,
  claimingTokens,
  headingLevel,
}: DonatedNFTTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();

  const columns: DataTableColumn<NFTRecord>[] = [
    {
      // A phone record draws the picture beside the name (the token cell).
      id: 'image',
      header: <span className="sr-only">{t('attachedAssets.nft.columns.tokenImage')}</span>,
      label: '',
      priority: 'secondary',
      value: (row) => getAttachedNftTokenId(row),
      width: '5.5rem',
      cell: (row) => <AttachedNftThumb nft={row} />,
    },
    {
      // A phone record leads with the picture and the name, unlabelled.
      id: 'token',
      header: t('attachedAssets.nft.columns.tokenId'),
      label: '',
      stack: true,
      value: (row) => getAttachedNftTokenId(row),
      cell: (row) => <AttachedNftToken nft={row} />,
    },
    {
      id: 'contract',
      header: t('attachedAssets.nft.columns.tokenAddress'),
      value: (row) => row.TokenAddr,
      nowrap: true,
      priority: 'secondary',
      cell: (row) =>
        row.TokenAddr ? (
          <ExternalTableLink href={getExplorerUrl('address', row.TokenAddr)} className="type-mono">
            {formatAddress(row.TokenAddr)}
          </ExternalTableLink>
        ) : null,
    },
    {
      id: 'contributor',
      header: t('attachedAssets.nft.columns.contributorAddress'),
      kind: 'address',
      value: (row) => row.DonorAddr,
      priority: 'secondary',
    },
    {
      id: 'cycle',
      header: t('attachedAssets.nft.columns.round'),
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
      header: t('attachedAssets.nft.columns.datetime'),
      kind: 'datetime',
      value: (row) => row.TimeStamp,
      txHash: (row) => row.TxHash,
    },
  ];

  if (handleClaim) {
    columns.push({
      id: 'retrieve',
      header: <span className="sr-only">{t('attachedAssets.aria.actions')}</span>,
      label: '',
      align: 'end',
      cell: (row) =>
        row.WinnerAddr ? null : (
          <Button
            variant="outline"
            size="sm"
            loading={claimingTokens.includes(row.Index)}
            onClick={() => void handleClaim(row.Index)}
            data-testid="Claim Button"
          >
            {t('attachedAssets.actions.claim')}
          </Button>
        ),
    });
  }

  return (
    <>
      <div className="print:hidden">
        <DataTable
          data={list}
          columns={columns}
          ariaLabel={t('attachedAssets.nft.ariaLabel')}
          getRowKey={(row) => String(row.RecordId)}
          emptyTitle={t('attachedAssets.nft.empty')}
          headingLevel={headingLevel}
        />
      </div>
      <AttachedNFTPrintFallback list={list} />
    </>
  );
};

/** Plain table for Save as PDF (Skia often drops responsive-table output). */
function AttachedNFTPrintFallback({ list }: { list: NFTRecord[] }) {
  const t = useTranslations('tables');

  return (
    <div
      aria-hidden="true"
      className="hidden rounded-control border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-attached-nft-print
    >
      <table className="w-full border-collapse border border-foreground/25 type-caption">
        <thead>
          <tr>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.nft.columns.datetime')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.nft.columns.contributorAddress')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.nft.columns.round')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.nft.columns.tokenAddress')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.nft.columns.tokenId')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.nft.columns.tokenUri')}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((nft) => (
            <tr key={String(nft.RecordId)}>
              <td className="border border-foreground/15 p-2">
                <DateTime timestamp={nft.TimeStamp} variant="full" />
              </td>
              <td className="border border-foreground/15 p-2 font-mono break-all">
                {nft.DonorAddr}
              </td>
              <td className="border border-foreground/15 p-2 text-center">{nft.RoundNum}</td>
              <td className="border border-foreground/15 p-2 font-mono break-all">
                {nft.TokenAddr}
              </td>
              <td className="border border-foreground/15 p-2 text-center">
                {getAttachedNftTokenId(nft) ?? '—'}
              </td>
              <td className="border border-foreground/15 p-2 break-all">
                {nft.NFTTokenURI ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonatedNFTTable;
