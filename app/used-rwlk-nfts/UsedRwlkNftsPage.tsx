'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import {
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
            <TablePrimaryHeadCell>Participant Address</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
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
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={<SectionEyebrow tone="nebula">Used RWLK · {list.length}</SectionEyebrow>}
        title="Used Random Walk NFTs"
        gradientTitle="signature"
        subtitle="Random Walk NFTs that have been anchored to gestures"
      />
      <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-3xl">
        RandomWalk NFT holders can attach their tokens to receive a 50% Gesture Cost reduction in
        Cosmic Signature. Once used, a RandomWalk NFT is recorded here. Each NFT can only be used
        once for this discount, making the timing of its use a strategic decision.
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
    </PageShell>
  );
};

export default UsedRwlkNftsPage;
