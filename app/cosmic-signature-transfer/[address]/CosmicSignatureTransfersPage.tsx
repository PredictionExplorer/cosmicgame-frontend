'use client';

import { useState } from 'react';
import { Link, TableBody, Tooltip, Typography } from '@mui/material';
import { getAddress, isAddress } from 'viem';
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
import { getExplorerUrl, convertTimestampToDateTime, isWalletAddress } from '@/utils';
import { useCSTTransfers } from '@/hooks/useApiQuery';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import type { CSTTransferRecord } from '@/services/api/types';

interface TransferRow extends CSTTransferRecord {
  TransferType?: number;
  ValueEth?: number;
}

/* ------------------------------------------------------------------
  Sub-Component: CosmicSignatureTransferRow
  Renders a single row for a Cosmic Signature Token (CST) transfer.
------------------------------------------------------------------ */
const CosmicSignatureTransferRow = ({ row }: { row: TransferRow }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  const rowStyle = (row.TransferType ?? 0) > 0 ? { background: 'rgba(255, 255, 255, 0.06)' } : {};

  return (
    <TablePrimaryRow sx={rowStyle}>
      <TablePrimaryCell>
        <Link
          color="inherit"
          fontSize="inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {isWalletAddress(row.FromAddr ?? '') !== '' ? (
          <Tooltip title={row.FromAddr ?? ''}>
            <Link
              color="inherit"
              fontSize="inherit"
              fontFamily="monospace"
              href={`/user/${row.FromAddr}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {isWalletAddress(row.FromAddr ?? '')}
            </Link>
          </Tooltip>
        ) : (
          <AddressLink address={row.FromAddr ?? ''} url={`/user/${row.FromAddr}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {isWalletAddress(row.ToAddr ?? '') !== '' ? (
          <Tooltip title={row.ToAddr ?? ''}>
            <Link
              color="inherit"
              fontSize="inherit"
              fontFamily="monospace"
              href={`/user/${row.ToAddr}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {isWalletAddress(row.ToAddr ?? '')}
            </Link>
          </Tooltip>
        ) : (
          <AddressLink address={row.ToAddr ?? ''} url={`/user/${row.ToAddr}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          color="inherit"
          fontSize="inherit"
          href={`/detail/${row.TokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: CosmicTokenTransfersTable
  Displays a paginated table of CST transfers.
------------------------------------------------------------------ */
const CosmicTokenTransfersTable = ({ list }: { list: TransferRow[] }) => {
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <Typography variant="h6">No transfers yet.</Typography>;
  }

  const currentPageList = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>To</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <TableBody>
            {currentPageList.map((row) => (
              <CosmicSignatureTransferRow key={row.EvtLogId} row={row} />
            ))}
          </TableBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

/* ------------------------------------------------------------------
  Main Page Component: CosmicSignatureTransfersPage
------------------------------------------------------------------ */
const CosmicSignatureTransfersPage = ({ address: rawAddress }: { address: string }) => {
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  const { data: cosmicSignatureTransfers = [], isLoading: loading } = useCSTTransfers(address);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" textAlign="center" mb={4}>
        Cosmic Signature Transfers
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : (
        <CosmicTokenTransfersTable list={cosmicSignatureTransfers} />
      )}
    </MainWrapper>
  );
};

export default CosmicSignatureTransfersPage;
