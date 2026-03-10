'use client';

import { useState } from 'react';
import { Box, Link, TableBody, Typography } from '@mui/material';
import { Tr } from 'react-super-responsive-table';

import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { convertTimestampToDateTime } from '@/utils';
import { useNamedNFTs } from '@/hooks/useApiQuery';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';

interface NamedNFTRecord {
  MintTimeStamp: number;
  TokenId: number;
  TokenName: string;
  [key: string]: unknown;
}

const NamedNFTRow = ({ nft }: { nft: NamedNFTRecord }) => {
  // If there's no data for nft, return an empty row.
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      {/* NFT's minting datetime */}
      <TablePrimaryCell>{convertTimestampToDateTime(nft.MintTimeStamp)}</TablePrimaryCell>

      {/* Token ID, linking to a detail page */}
      <TablePrimaryCell align="center">
        <Link sx={{ color: 'inherit', fontSize: 'inherit' }} href={`/detail/${nft.TokenId}`}>
          {nft.TokenId}
        </Link>
      </TablePrimaryCell>

      {/* Token's custom name */}
      <TablePrimaryCell>{nft.TokenName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: NamedNFTsTable
  Receives a list of NFT objects and renders them in a styled table.
------------------------------------------------------------------ */
const NamedNFTsTable = ({ list }: { list: NamedNFTRecord[] }) => {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">DateTime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Id</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Token Name</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <TableBody>
          {list.map((nft, i: number) => (
            <NamedNFTRow key={i} nft={nft} />
          ))}
        </TableBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: NamedNFTsPage
  - Fetches named NFT data from an API on mount.
  - Displays them in a paginated table with 5 rows per page.
  - Shows loading and empty states.
------------------------------------------------------------------ */
const NamedNFTsPage = () => {
  const [curPage, setCurPage] = useState(1);
  const perPage = 5;
  const { data: list = [], isLoading: loading } = useNamedNFTs();

  // Rendering logic:
  //  - If we're loading, show loading text
  //  - If no NFTs, show a "No NFTs yet." message
  //  - Otherwise, slice the data for the current page and show the table + pagination
  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" gutterBottom textAlign="center">
        Named Cosmic Signature Tokens
      </Typography>

      <Box mt={6}>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : list.length > 0 ? (
          <>
            <NamedNFTsTable
              list={
                list.slice(
                  (curPage - 1) * perPage,
                  curPage * perPage,
                ) as unknown as NamedNFTRecord[]
              }
            />
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

export default NamedNFTsPage;
