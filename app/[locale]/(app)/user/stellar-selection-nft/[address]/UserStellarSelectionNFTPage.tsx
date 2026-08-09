'use client';

import { useMemo, useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { useStellarSelectionNFTAllocationsByUser } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';
import { PageShell } from '@/components/ui/page-shell';
import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';

interface StellarSelectionNFTAllocation {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  IsRWalk: boolean;
  IsStaker: boolean;
  TokenId: number;
}

function NFTWinningsRow({ row }: { row: StellarSelectionNFTAllocation }) {
  const t = useTranslations('tables');
  const locale = useLocale();
  if (!row) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, IsRWalk, IsStaker, TokenId } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('columns.cycle')} align="center">
        <Link
          href={`/allocation/${RoundNum}`}
          className="font-mono text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('statisticsColumns.isRandomWalk')} align="center">
        {IsRWalk ? t('status.yes') : t('status.no')}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('statisticsColumns.isAnchorHolder')} align="center">
        {IsStaker ? t('status.yes') : t('status.no')}
      </TablePrimaryCell>

      <TablePrimaryCell label={t('columns.tokenId')} align="center">
        <Link href={`/detail/${TokenId}`} className="font-mono text-inherit">
          {TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

function NFTWinningsTable({ list }: { list: StellarSelectionNFTAllocation[] }) {
  const t = useTranslations('tables');
  const tStatistics = useTranslations('statistics');
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!list.length) {
    return <p>{tStatistics('stellarSelectionNft.empty')}</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('statisticsColumns.isRandomWalk')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('statisticsColumns.isAnchorHolder')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.tokenId')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {currentItems.map((row) => (
              <NFTWinningsRow key={row.EvtLogId} row={row} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
}

function UserStellarSelectionNFTPage({ address: rawAddress }: { address: string }) {
  const t = useTranslations('statistics');
  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const invalidAddress = !validatedAddress || validatedAddress === 'Invalid Address';

  const { data: winningsRaw, isLoading } = useStellarSelectionNFTAllocationsByUser(
    invalidAddress ? null : validatedAddress,
  );

  const stellarSelectionNfts = useMemo(
    () => ({
      data: [...((winningsRaw as StellarSelectionNFTAllocation[] | undefined) ?? [])].sort(
        (a, b) => b.TimeStamp - a.TimeStamp,
      ),
      loading: isLoading,
    }),
    [winningsRaw, isLoading],
  );

  if (invalidAddress) {
    return (
      <PageShell variant="data" backdrop="signature">
        <p className="text-lg font-semibold">{t('stellarSelectionNft.invalidAddress')}</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mb-8">
        <span className="mr-4 text-lg font-semibold text-primary">
          {t('stellarSelectionNft.user')}
        </span>
        <span className="font-mono text-lg font-semibold">{validatedAddress}</span>
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold leading-none">
          {t('stellarSelectionNft.heading')}
        </h4>

        {stellarSelectionNfts.loading ? (
          <p className="text-lg font-semibold">{t('stellarSelectionNft.loading')}</p>
        ) : (
          <NFTWinningsTable list={stellarSelectionNfts.data} />
        )}
      </div>
    </PageShell>
  );
}

export default UserStellarSelectionNFTPage;
