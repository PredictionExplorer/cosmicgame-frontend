import { useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
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
import type { CharityWithdrawal } from '@/services/api/types';

export type { CharityWithdrawal };

interface WithdrawalRowProps {
  retrieval?: CharityWithdrawal;
}

const WithdrawalRow: FC<WithdrawalRowProps> = ({ retrieval }) => {
  const locale = useLocale();
  if (!retrieval) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', retrieval.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={retrieval.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={retrieval.DestinationAddr}
          url={`/user/${retrieval.DestinationAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{retrieval.AmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface CharityWithdrawalTableProps {
  list: CharityWithdrawal[];
}

const CharityWithdrawalTable: FC<CharityWithdrawalTableProps> = ({ list }) => {
  const t = useTranslations('tables');
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState<number>(1);

  if (list.length === 0) {
    return <p>{t('empty.retrievals')}</p>;
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.destinationAddress')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                {t('columns.retrievalAmountEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice(startIndex, endIndex).map((retrieval) => (
              <WithdrawalRow retrieval={retrieval} key={retrieval.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={ITEMS_PER_PAGE}
      />
    </>
  );
};

export default CharityWithdrawalTable;
