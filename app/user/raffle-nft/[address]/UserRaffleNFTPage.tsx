'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import api from '@/services/api';
import { reportError } from '@/utils/errors';
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
        <Link href={`/prize/${RoundNum}`} className="font-mono text-inherit" target="_blank">
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

function useRaffleNFTWinnings(userAddress: string) {
  const [raffleNfts, setRaffleNfts] = useState<{
    data: RaffleNFTWinning[];
    loading: boolean;
  }>({
    data: [],
    loading: false,
  });

  const fetchRaffleNFTWinnings = async () => {
    setRaffleNfts((prev) => ({ ...prev, loading: true }));
    try {
      const response = await api.get_raffle_nft_winnings_by_user(userAddress);
      const sorted = (response as RaffleNFTWinning[]).sort(
        (a: RaffleNFTWinning, b: RaffleNFTWinning) => b.TimeStamp - a.TimeStamp,
      );
      setRaffleNfts({ data: sorted as RaffleNFTWinning[], loading: false });
    } catch (err) {
      reportError(err, 'fetch raffle NFT winnings');
      setRaffleNfts({ data: [], loading: false });
    }
  };

  return { raffleNfts, fetchRaffleNFTWinnings };
}

function UserRaffleNFTPage({ address: rawAddress }: { address: string }) {
  const [invalidAddress, setInvalidAddress] = useState(false);

  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const { raffleNfts, fetchRaffleNFTWinnings } = useRaffleNFTWinnings(validatedAddress);

  useEffect(() => {
    if (!validatedAddress || validatedAddress === 'Invalid Address') {
      setInvalidAddress(true);
    } else {
      fetchRaffleNFTWinnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validatedAddress]);

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
