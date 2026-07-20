import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
  locale: string;
}

const UniqueRecipientsRow = ({ recipient, locale }: UniqueRecipientsRowProps) => {
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
        {formatTableAmount(recipient.MaxWinAmountEth, locale)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {formatTableAmount(recipient.PrizesSum, locale)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueRecipientsTableProps {
  list: Recipient[];
}

export const UniqueRecipientsTable = ({ list }: UniqueRecipientsTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
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
                  tooltip={t('statisticsTooltips.recipientAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.allocationsReceived')}
                  tooltip={t('statisticsTooltips.allocationsReceived')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.maxAllocationEth')}
                  tooltip={t('statisticsTooltips.maxAllocationEth')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.allocationsSumEth')}
                  tooltip={t('statisticsTooltips.allocationsSumEth')}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <UniqueRecipientsRow
                recipient={recipient}
                locale={locale}
                key={recipient.WinnerAid}
              />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
