import { useState, useMemo } from 'react';
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
import type { Participant } from '@/services/api/types';

export type { Participant };

interface UniqueParticipantsRowProps {
  bidder?: Participant;
  locale: string;
}

const UniqueParticipantsRow = ({ bidder, locale }: UniqueParticipantsRowProps) => {
  if (!bidder) {
    return <TablePrimaryRow />;
  }

  const { BidderAddr, NumBids, MaxBidAmountEth } = bidder;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={BidderAddr} url={`/user/${BidderAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumBids}</TablePrimaryCell>
      <TablePrimaryCell align="right">
        {formatTableAmount(MaxBidAmountEth, locale)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueParticipantsTableProps {
  list: Participant[];
}

export const UniqueParticipantsTable = ({ list }: UniqueParticipantsTableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const perPage = 5;
  const [page, setPage] = useState(1);

  const paginatedList = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page],
  );

  if (list.length === 0) {
    return <p>{t('empty.participants')}</p>;
  }

  return (
    <div className="w-full">
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('columns.participantAddress')}
                  tooltip={t('statisticsTooltips.participantAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.numberOfGestures')}
                  tooltip={t('statisticsTooltips.numberOfGestures')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.maxGestureEth')}
                  tooltip={t('statisticsTooltips.maxGestureEth')}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedList.map((bidder) => (
              <UniqueParticipantsRow bidder={bidder} locale={locale} key={bidder.BidderAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </div>
  );
};
