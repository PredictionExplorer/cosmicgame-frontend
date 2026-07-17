import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { statisticsCopy } from '@/content/statistics-copy';
import { formatTableAmount } from '@/utils';

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
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { Recipient } from '@/services/api/types';

export type { Recipient };

interface UniqueRecipientsRowProps {
  recipient?: Recipient;
}

const UniqueRecipientsRow = ({ recipient }: UniqueRecipientsRowProps) => {
  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={recipient.WinnerAddr} url={`/user/${recipient.WinnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.AllocationsCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {formatTableAmount(recipient.MaxWinAmountEth)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{formatTableAmount(recipient.PrizesSum)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueRecipientsTableProps {
  list: Recipient[];
}

export const UniqueRecipientsTable = ({ list }: UniqueRecipientsTableProps) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.recipients')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('columns.recipientAddress')}
                  tooltip={statisticsCopy.tables.recipientAddress}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.allocationsReceived')}
                  tooltip={statisticsCopy.tables.allocationsReceived}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.maxAllocationEth')}
                  tooltip={statisticsCopy.tables.maxAllocationEth}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.allocationsSumEth')}
                  tooltip={statisticsCopy.tables.allocationsSumEth}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <UniqueRecipientsRow recipient={recipient} key={recipient.WinnerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
