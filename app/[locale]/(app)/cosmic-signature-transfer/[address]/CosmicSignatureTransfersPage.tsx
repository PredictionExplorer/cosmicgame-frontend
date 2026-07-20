'use client';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { getAddress, isAddress } from 'viem';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, convertTimestampToDateTime, getWalletKind } from '@/utils';

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
import { useCSTTransfers } from '@/hooks/useApiQuery';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import type { CSTTransferRecord } from '@/services/api/types';
import { cn } from '@/lib/utils';

interface TransferRow extends CSTTransferRecord {
  TransferType?: number;
  ValueEth?: number;
}

const CosmicSignatureTransferRow = ({ row }: { row: TransferRow }) => {
  const t = useTranslations('myPages');
  const locale = useLocale();
  const contractAddrs = useContractAddresses();
  if (!row) {
    return <TablePrimaryRow />;
  }
  const fromAddress = row.FromAddr ?? '';
  const toAddress = row.ToAddr ?? '';
  const fromWalletKind = getWalletKind(fromAddress, contractAddrs);
  const toWalletKind = getWalletKind(toAddress, contractAddrs);

  return (
    <TablePrimaryRow className={(row.TransferType ?? 0) > 0 ? 'bg-white/[0.06]' : ''}>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[length:inherit]"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(row.TimeStamp, false, locale)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {fromWalletKind ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="text-inherit text-[length:inherit] font-mono"
                href={`/user/${fromAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(`transferHistory.walletLabels.${fromWalletKind}`)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{fromAddress}</TooltipContent>
          </Tooltip>
        ) : (
          <AddressLink address={fromAddress} url={`/user/${fromAddress}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {toWalletKind ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                className="text-inherit text-[length:inherit] font-mono"
                href={`/user/${toAddress}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(`transferHistory.walletLabels.${toWalletKind}`)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{toAddress}</TooltipContent>
          </Tooltip>
        ) : (
          <AddressLink address={toAddress} url={`/user/${toAddress}`} />
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <a
          className="text-inherit text-[length:inherit]"
          href={`/detail/${row.TokenId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.TokenId}
        </a>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const CosmicSignatureTransfersTable = ({ list }: { list: TransferRow[] }) => {
  const t = useTranslations('myPages');
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return (
      <div className="p-10 text-center text-sm font-medium text-muted-foreground">
        {t('transferHistory.nft.empty')}
      </div>
    );
  }

  const currentPageList = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('shared.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('shared.from')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('shared.to')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('shared.tokenId')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentPageList.map((row) => (
              <CosmicSignatureTransferRow key={row.EvtLogId} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

const CosmicSignatureTransfersPage = ({ address: rawAddress }: { address: string }) => {
  const t = useTranslations('myPages');
  const address = isAddress(rawAddress.toLowerCase()) ? getAddress(rawAddress.toLowerCase()) : null;

  const { data: cosmicSignatureTransfers = [], isLoading: loading } = useCSTTransfers(address);

  return (
    <PageShell variant="data" backdrop="signature" className="max-sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title={t('transferHistory.nft.title')}
          subtitle={address ?? undefined}
          breadcrumbs={[
            { label: t('shared.home'), href: '/' },
            ...(address ? ([{ label: t('shared.user'), href: `/user/${address}` }] as const) : []),
            { label: t('transferHistory.breadcrumbs.nft') },
          ]}
          className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
          align="left"
        />

        {!address ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')} role="alert">
            <p className="font-semibold text-foreground">
              {t('transferHistory.nft.invalidAddress.title')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('transferHistory.nft.invalidAddress.description')}
            </p>
          </div>
        ) : loading ? (
          <div className={cn(detailPanelClass, 'p-10 text-center')}>
            <p className="text-sm font-medium text-muted-foreground">
              {t('transferHistory.loading')}
            </p>
          </div>
        ) : (
          <div className={cn(detailPanelClass, 'overflow-x-auto p-2 sm:p-4')}>
            <CosmicSignatureTransfersTable list={cosmicSignatureTransfers} />
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default CosmicSignatureTransfersPage;
