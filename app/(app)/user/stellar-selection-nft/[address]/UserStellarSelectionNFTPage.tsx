'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { useStellarSelectionNFTAllocationsByUser } from '@/hooks/useApiQuery';
import { CustomPagination } from '@/components/common/CustomPagination';
import { PageShell } from '@/components/ui/page-shell';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
          href={`/allocation/${RoundNum}`}
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

function NFTWinningsTable({ list }: { list: StellarSelectionNFTAllocation[] }) {
  const PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  if (!list.length) {
    return <p>No NFT allocations yet.</p>;
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
              <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is RandomWalk</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Is Anchor-holder</TablePrimaryHeadCell>
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

function UserStellarSelectionNFTPage({ address: rawAddress }: { address: string }) {
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
        <p className="text-lg font-semibold">Invalid Address</p>
      </PageShell>
    );
  }

  return (
    <PageShell variant="data" backdrop="signature">
      <div className="mb-8">
        <span className="mr-4 text-lg font-semibold text-primary">User</span>
        <span className="font-mono text-lg font-semibold">{validatedAddress}</span>
      </div>

      <div className="mt-8">
        <h4 className="mb-4 text-lg font-semibold leading-none">
          Stellar Selection NFTs allocated to this participant
        </h4>

        {stellarSelectionNfts.loading ? (
          <p className="text-lg font-semibold">Loading...</p>
        ) : (
          <NFTWinningsTable list={stellarSelectionNfts.data} />
        )}
      </div>
    </PageShell>
  );
}

export default UserStellarSelectionNFTPage;
