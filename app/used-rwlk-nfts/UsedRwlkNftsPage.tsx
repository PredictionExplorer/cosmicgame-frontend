'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { PageHeader } from '@/components/layout/PageHeader';
import {
  MainWrapper,
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useUsedRWLKNFTs } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';

interface UsedRwlkNftRecord {
  RWalkTokenId: number;
  BidderAddr: string;
  RoundNum: number;
  TxHash: string;
  TimeStamp: number;
  [key: string]: unknown;
}

const UsedRwlkNftRow = ({ nft }: { nft: UsedRwlkNftRecord }) => {
  if (!nft) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', nft.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(nft.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/user/${nft.BidderAddr}`} className="font-mono text-inherit">
          {nft.BidderAddr}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/allocation/${nft.RoundNum}`} className="text-inherit">
          {nft.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{nft.RWalkTokenId}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

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
        <tbody>
          {list.map((nft, i: number) => (
            <UsedRwlkNftRow key={i} nft={nft} />
          ))}
        </tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const UsedRwlkNftsPage = () => {
  const perPage = 5;
  const [curPage, setCurPage] = useState(1);
  const { data: list = [], isLoading: loading } = useUsedRWLKNFTs();

  return (
    <MainWrapper>
      <PageHeader
        title="Used Random Walk NFTs"
        subtitle="Random Walk NFTs that have been used for bidding"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        RandomWalk NFT holders can use their tokens for a 50% bid discount in the Cosmic Signature
        game. Once used, a RandomWalk NFT is recorded here. Each NFT can only be used once per
        wallet, making the timing of its use a strategic decision.
      </p>

      <div className="mt-12">
        {loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : list.length > 0 ? (
          <>
            <UsedRwlkNftsTable
              list={list.slice((curPage - 1) * perPage, curPage * perPage) as UsedRwlkNftRecord[]}
            />
            <CustomPagination
              page={curPage}
              setPage={setCurPage}
              totalLength={list.length}
              perPage={perPage}
            />
          </>
        ) : (
          <p className="text-lg font-semibold">No NFTs yet.</p>
        )}
      </div>
    </MainWrapper>
  );
};

export default UsedRwlkNftsPage;
