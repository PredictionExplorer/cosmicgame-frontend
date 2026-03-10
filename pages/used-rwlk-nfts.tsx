import React, { useState } from 'react';
import { Box, Link, TableBody, Typography } from '@mui/material';

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '../components/styled';
import { getExplorerUrl, convertTimestampToDateTime } from '../utils';
import { createOpenGraphProps } from '../utils/seo';
import { useUsedRWLKNFTs } from '../hooks/useApiQuery';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { Tr } from 'react-super-responsive-table';

import { CustomPagination } from '../components/common/CustomPagination';

import { GetServerSideProps } from 'next';

interface UsedRwlkNftRecord {
  RWalkTokenId: number;
  BidderAddr: string;
  RoundNum: number;
  TxHash: string;
  TimeStamp: number;
  [key: string]: unknown;
}

const UsedRwlkNftRow = ({ nft }: { nft: UsedRwlkNftRecord }) => {
  // If nft is null/undefined, render an empty row to avoid errors.
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* Datetime -> Arbiscan link */}
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      {/* Bidder Address -> User detail page */}
      <TablePrimaryCell align="center">
        <Link
          sx={{
            color: 'inherit',
            fontSize: 'inherit',
            fontFamily: 'monospace',
          }}
          href={`/user/${nft.BidderAddr}`}
        >
          {nft.BidderAddr}
        </Link>
      </TablePrimaryCell>

      {/* Round Number -> Prize detail page */}
      <TablePrimaryCell align="center">
        <Link sx={{ color: 'inherit', fontSize: 'inherit' }} href={`/prize/${nft.RoundNum}`}>
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      {/* RandomWalk Token ID */}
      <TablePrimaryCell align="center">{nft.RWalkTokenId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: UsedRwlkNftsTable
  A table wrapper that maps over a list of NFT objects and displays
  each in a UsedRwlkNftRow.
------------------------------------------------------------------ */
const UsedRwlkNftsTable = ({ list }: { list: UsedRwlkNftRecord[] }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bidder Address</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i: number) => (
            <UsedRwlkNftRow key={i} nft={nft} />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: UsedRwlkNfts
  - Fetches the list of used RandomWalk NFTs on mount.
  - Displays them in a paginated table.
  - Renders appropriate messages for loading or empty states.
------------------------------------------------------------------ */
const UsedRwlkNfts = () => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  const { data: list = [], isLoading: loading } = useUsedRWLKNFTs();

  // Rendering Logic:
  // 1) Display loading message if data is still being fetched.
  // 2) If no data exists, show "No NFTs yet."
  // 3) Otherwise, slice the list for the current page and pass it to the table.
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Used RandomWalk NFTs
      </Typography>

      <Box mt={6}>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : list.length > 0 ? (
          <>
            <UsedRwlkNftsTable
              list={list.slice((curPage - 1) * perPage, curPage * perPage) as UsedRwlkNftRecord[]}
            />
            {/* Pagination Controls */}
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <Typography variant="h6">No NFTs yet.</Typography>
        )}
      </Box>
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  getServerSideProps:
  Returns server-side rendered meta tags for SEO (title, description, 
  and Open Graph data). This ensures social media previews are set 
  up correctly.
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => ({
  props: createOpenGraphProps(
    'Used RandomWalk NFTs for Bid | Cosmic Signature',
    'Used RandomWalk NFTs for Bid',
  ),
});

export default UsedRwlkNfts;
