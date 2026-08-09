import { useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { UniqueEthDonor } from '@/services/api/types';

export type { UniqueEthDonor };

const UniqueEthDonorsRow = ({ row }: { row: UniqueEthDonor }) => {
  const t = useTranslations('tables');

  if (!row) {
    return <TablePrimaryRow />;
  }

  const totalDonated = row.TotalDonatedEth;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.contributorAddress')}>
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.numberOfContributions')} align="center">
        {row.CountDonations}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.totalContributedEth')} align="right">
        {typeof totalDonated === 'number' && Number.isFinite(totalDonated)
          ? totalDonated.toFixed(2)
          : '—'}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueEthDonorsTable = ({ list }: { list: UniqueEthDonor[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (!list || list.length === 0) {
    return <p>{t('empty.contributors')}</p>;
  }

  return (
    <div className="w-full">
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('columns.contributorAddress')}
                  tooltip={t('statisticsTooltips.contributorAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                <TableHeaderHelp
                  desktop={t('columns.numberOfContributions')}
                  tooltip={t('statisticsTooltips.numberOfContributions')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('columns.totalContributedEth')}
                  tooltip={t('statisticsTooltips.totalContributedEth')}
                />
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {list.slice((page - 1) * perPage, page * perPage).map((donor) => (
              <UniqueEthDonorsRow row={donor} key={donor.DonorAid} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </div>
  );
};
