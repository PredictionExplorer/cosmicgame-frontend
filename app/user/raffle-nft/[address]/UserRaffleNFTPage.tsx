'use client';

import { useEffect, useState } from 'react';
import { Box, Link, TableBody, Typography } from '@mui/material';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import api from '@/services/api';
import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';
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

/* ------------------------------------------------------------------
  Types
------------------------------------------------------------------ */
interface RaffleNFTWinning {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  IsRWalk: boolean;
  IsStaker: boolean;
  TokenId: number;
}

/* ------------------------------------------------------------------
  Sub-Component: NFTWinningsRow
  Renders a single row in the table for Raffle NFT winnings.
------------------------------------------------------------------ */
function NFTWinningsRow({ row }: { row: RaffleNFTWinning }) {
  if (!row) return <TablePrimaryRow />;

  const { TxHash, TimeStamp, RoundNum, IsRWalk, IsStaker, TokenId } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/prize/${RoundNum}`}
          style={{
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'monospace',
          }}
          target="_blank"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{IsRWalk ? 'Yes' : 'No'}</TablePrimaryCell>
      <TablePrimaryCell align="center">{IsStaker ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/detail/${TokenId}`}
          style={{
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'monospace',
          }}
        >
          {TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/* ------------------------------------------------------------------
  Sub-Component: NFTWinningsTable
  Renders the entire table of Raffle NFT winnings, with pagination.
------------------------------------------------------------------ */
function NFTWinningsTable({ list }: { list: RaffleNFTWinning[] }) {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!list.length) {
    return <Typography>No NFT winnings yet.</Typography>;
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
          <TableBody>
            {currentItems.map((row) => (
              <NFTWinningsRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
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

/* ------------------------------------------------------------------
  Custom Hook: useRaffleNFTWinnings
  Fetches and sorts the user's raffle NFT winnings.
------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------
  Main Component: UserRaffleNFTPage
------------------------------------------------------------------ */
function UserRaffleNFTPage({ address: rawAddress }: { address: string }) {
  const [invalidAddress, setInvalidAddress] = useState(false);

  // Validate and normalize address
  const validatedAddress =
    rawAddress && isAddress(rawAddress.toLowerCase())
      ? getAddress(rawAddress.toLowerCase())
      : 'Invalid Address';

  const { raffleNfts, fetchRaffleNFTWinnings } = useRaffleNFTWinnings(validatedAddress);

  // On mount / address changes
  useEffect(() => {
    if (!validatedAddress || validatedAddress === 'Invalid Address') {
      setInvalidAddress(true);
    } else {
      fetchRaffleNFTWinnings();
    }
  }, [validatedAddress]);

  if (invalidAddress) {
    return (
      <MainWrapper>
        <Typography variant="h6">Invalid Address</Typography>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <Box mb={4}>
        <Typography variant="h6" color="primary" component="span" mr={2}>
          User
        </Typography>
        <Typography variant="h6" component="span" fontFamily="monospace">
          {validatedAddress}
        </Typography>
      </Box>

      <Box mt={4}>
        <Typography variant="h6" lineHeight={1} mb={2}>
          Raffle NFTs User Won
        </Typography>

        {raffleNfts.loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <NFTWinningsTable list={raffleNfts.data} />
        )}
      </Box>
    </MainWrapper>
  );
}

export default UserRaffleNFTPage;
