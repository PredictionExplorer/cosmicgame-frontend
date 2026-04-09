'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { useRaffleNFTWinningsByUser } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

interface RaffleNFTWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  IsRWalk: boolean;
  IsStaker: boolean;
  TokenId: number;
}

function NFTWinningsRow({ row }: { row: RaffleNFTWinning }) {
  if (!row) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, IsRWalk, IsStaker, TokenId } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          className="font-mono text-inherit"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{IsRWalk ? 'Yes' : 'No'}</TablePrimaryCell>
      <TablePrimaryCell align="center">{IsStaker ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/detail/${TokenId}`} className="font-mono text-inherit">
          {TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

function NFTWinningsTable({ list }: { list: RaffleNFTWinning[] }) {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!list.length) {
    return <p>No NFT winnings yet.</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentItems = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is RandomWalk</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Staker</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentItems.map((row) => (
              <NFTWinningsRow key={row.EvtLogId} row={row} />
            ))}
          </tbody>
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

function UserRaffleNFTPage({ address: rawAddress }: { address: string }) {
  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const invalidAddress = !validatedAddress || validatedAddress === 'Invalid Address';

  const { data: winningsRaw, isLoading } = useRaffleNFTWinningsByUser(
    invalidAddress ? null : validatedAddress,
  );

  const raffleNfts = useMemo(
    () => ({
      data: [...((winningsRaw as RaffleNFTWinning[] | undefined) ?? [])].sort(
        (a, b) => b.TimeStamp - a.TimeStamp,
      ),
      loading: isLoading,
    }),
    [winningsRaw, isLoading],
  );

  if (invalidAddress) {
    return (
      <MainWrapper>
        <p className="text-lg font-semibold">Invalid Address</p>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div className="mb-8">
        <span className="mr-4 text-lg font-semibold text-primary">User</span>
        <span className="font-mono text-lg font-semibold">{validatedAddress}</span>
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold leading-none">Raffle NFTs User Won</h4>

        {raffleNfts.loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <NFTWinningsTable list={raffleNfts.data} />
        )}
      </div>
    </MainWrapper>
  );
}

export default UserRaffleNFTPage;
