import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, shortenHex } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { ZERO_ADDRESS } from '@/config/misc';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { CSTTransferRecord } from '@/services/api';

function addrEq(a: string | undefined, b: string): boolean {
  return !!a && !!b && a.toLowerCase() === b.toLowerCase();
}

const TransferHistoryRow = ({ record }: { record: CSTTransferRecord }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const { stakingCst, stakingRwalk } = useContractAddresses();
  if (!record || record.FromAddr === ZERO_ADDRESS) {
    return null;
  }

  const { TxHash, TimeStamp, FromAddr, ToAddr } = record;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.dateTimeCompact')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.from')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${FromAddr}`} className="text-inherit font-mono break-all">
              {addrEq(FromAddr, stakingCst)
                ? t('transferHistory.signatureAnchoringWallet')
                : addrEq(FromAddr, stakingRwalk)
                  ? t('transferHistory.randomWalkAnchoringWallet')
                  : shortenHex(FromAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{FromAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.to')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${ToAddr}`} className="text-inherit font-mono break-all">
              {addrEq(ToAddr, stakingCst)
                ? t('transferHistory.signatureAnchoringWallet')
                : addrEq(ToAddr, stakingRwalk)
                  ? t('transferHistory.randomWalkAnchoringWallet')
                  : shortenHex(ToAddr ?? '', 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{ToAddr ?? ''}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const TransferHistoryTable = ({ list }: { list: CSTTransferRecord[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">
                {t('columns.dateTimeCompact')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.from')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.to')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {list.slice((page - 1) * perPage, page * perPage).map((record) => (
              <TransferHistoryRow record={record} key={record.EvtLogId} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
