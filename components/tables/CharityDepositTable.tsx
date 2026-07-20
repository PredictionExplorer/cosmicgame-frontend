import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link } from '@/i18n/navigation';
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

export interface PublicGoodsContributionEntry {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
}

interface ContributionRowProps {
  entry: PublicGoodsContributionEntry;
}

interface CharityDepositTableProps {
  list: PublicGoodsContributionEntry[];
}

const ContributionRow = ({ entry }: ContributionRowProps) => {
  const locale = useLocale();
  if (!entry) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', entry.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={entry.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {entry.RoundNum < 0 ? (
          ' '
        ) : (
          <Link
            className="text-inherit"
            href={`/allocation/${entry.RoundNum}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {entry.RoundNum}
          </Link>
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={entry.DonorAddr} url={`/user/${entry.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{entry.AmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CharityDepositTable = ({ list }: CharityDepositTableProps) => {
  const t = useTranslations('tables');
  const perPage = 10;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.contributions')}</p>;
  }

  const currentData = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.cycleNumber')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.contributorAddress')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('columns.contributionAmountEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentData.map((entry) => (
              <ContributionRow entry={entry} key={entry.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
