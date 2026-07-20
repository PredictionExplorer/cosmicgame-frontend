import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
import type { UniqueEthDonor } from '@/services/api/types';

export type { UniqueEthDonor };

const UniqueEthDonorsRow = ({ row }: { row: UniqueEthDonor }) => {
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.CountDonations}</TablePrimaryCell>
      <TablePrimaryCell align="right">{row.TotalDonatedEth.toFixed(2)}</TablePrimaryCell>
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
            <Tr>
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
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((donor) => (
              <UniqueEthDonorsRow row={donor} key={donor.DonorAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </div>
  );
};
