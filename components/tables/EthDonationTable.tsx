import { useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link, useRouter } from '@/i18n/navigation';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

export interface EthDonation {
  EvtLogId: string | number;
  TxHash: string;
  TimeStamp: number;
  RecordType: number;
  CGRecordId: string | number;
  RoundNum: string | number;
  DonorAddr: string;
  AmountEth: number;
}

interface EthDonationRowProps {
  row: EthDonation;
  showType: boolean;
}

const EthDonationRow: FC<EthDonationRowProps> = ({ row, showType }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const clickable = row.RecordType > 0 || !showType;

  const handleRowClick = () => {
    if (clickable) {
      router.push(`/eth-contribution/detail/${row.CGRecordId}`);
    }
  };

  return (
    <TablePrimaryRow
      className={clickable ? 'cursor-pointer' : undefined}
      onClick={clickable ? handleRowClick : undefined}
    >
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      {showType && (
        <TablePrimaryCell align="center">
          {row.RecordType ? t('ethContribution.withInfo') : t('ethContribution.simple')}
        </TablePrimaryCell>
      )}
      <TablePrimaryCell align="center">
        <Link
          className="text-inherit"
          href={`/allocation/${row.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{row.AmountEth.toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface EthDonationTableProps {
  list: EthDonation[];
  showType?: boolean;
}

const EthDonationTable: FC<EthDonationTableProps> = ({ list, showType = true }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.contributions')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="20%" />
            {showType && <col width="20%" />}
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              {showType && <TablePrimaryHeadCell>{t('columns.type')}</TablePrimaryHeadCell>}
              <TablePrimaryHeadCell>{t('columns.round')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.contributor')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amountEth')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {visibleRows.map((row) => (
              <EthDonationRow key={row.EvtLogId} row={row} showType={showType} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default EthDonationTable;
