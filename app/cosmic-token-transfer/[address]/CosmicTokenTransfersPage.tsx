'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime, isWalletAddress } from '@/utils';

import { detailPanelClass } from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageShell } from '@/components/ui/page-shell';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useCTTransfers } from '@/hooks/useApiQuery';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import { cn } from '@/lib/utils';

interface TokenTransferRow {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  FromAddr?: string;
  ToAddr?: string;
  ValueEth?: number;
  ValueFloat?: number;
  TransferType?: number;
  [key: string]: unknown;
}

const CosmicTokenTransferRow = ({ row }: { row: TokenTransferRow }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow className={(row.TransferType ?? 0) > 0 ? 'bg-white/[0.06]' : ''}>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[length:inherit]"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {isWalletAddress(row.FromAddr ?? '') !== '' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  className="text-inherit text-[length:inherit] font-mono"
                  href={`/user/${row.FromAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isWalletAddress(row.FromAddr ?? '')}
                </a>
              </TooltipTrigger>
              <TooltipContent>{row.FromAddr ?? ''}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <AddressLink address={row.FromAddr ?? ''} url={`/user/${row.FromAddr}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {isWalletAddress(row.ToAddr ?? '') !== '' ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  className="text-inherit text-[length:inherit] font-mono"
                  href={`/user/${row.ToAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {isWalletAddress(row.ToAddr ?? '')}
                </a>
              </TooltipTrigger>
              <TooltipContent>{row.ToAddr ?? ''}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <AddressLink address={row.ToAddr ?? ''} url={`/user/${row.ToAddr}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{(row.ValueFloat ?? 0).toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CosmicTokenTransfersTable = ({ list }: { list: TokenTransferRow[] }) => {
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return (
      <div className="p-10 text-center text-sm font-medium text-muted-foreground">
        No transfers yet.
      </div>
    );
  }

  const currentPageData = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>From</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>To</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Value (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {currentPageData.map((row) => (
              <CosmicTokenTransferRow key={row.EvtLogId} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

const CosmicTokenTransfersPage = ({ address: rawAddress }: { address: string }) => {
  let address = rawAddress;

  if (isAddress(address.toLowerCase())) {
    address = getAddress(address.toLowerCase());
  } else {
    address = 'Invalid Address';
  }

  const { data: cosmicTokenTransfers = [], isLoading: loading } = useCTTransfers(address);

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Cosmic Signature Token Transfers"
          subtitle={address !== 'Invalid Address' ? address : undefined}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            ...(address !== 'Invalid Address'
              ? ([{ label: 'User', href: `/user/${address}` }] as const)
              : []),
            { label: 'CST transfers' },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <CosmicTokenTransfersTable list={(cosmicTokenTransfers ?? []) as TokenTransferRow[]} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CosmicTokenTransfersPage;
