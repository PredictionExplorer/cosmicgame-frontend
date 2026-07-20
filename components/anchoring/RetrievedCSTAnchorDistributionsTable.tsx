import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

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
import type { CSTAnchorDistribution } from '@/services/api';

const CollectedRewardsRow = ({ row }: { row: CSTAnchorDistribution }) => {
  const locale = useLocale();

  if (!row) return null;

  const {
    DepositTimeStamp = 0,
    DepositId,
    RoundNum,
    TotalDepositAmountEth,
    YourCollectedAmountEth,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        {convertTimestampToDateTime(DepositTimeStamp, false, locale)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{DepositId}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/allocation/${RoundNum}`} className="text-inherit">
          {RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{(TotalDepositAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>

      <TablePrimaryCell align="center">{(YourCollectedAmountEth ?? 0).toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const RetrievedCSTAnchorDistributionsTable = ({
  list,
}: {
  list: CSTAnchorDistribution[];
}) => {
  const t = useTranslations('anchoring');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 5;

  if (!list || list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.distributions')}</p>;
  }

  const startIndex = (currentPage - 1) * PER_PAGE;
  const endIndex = currentPage * PER_PAGE;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
            <col width="20%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                {t('tables.retrievedDistributions.columns.depositDatetime')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.retrievedDistributions.columns.depositId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.retrievedDistributions.columns.cycle')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.retrievedDistributions.columns.depositAmountEth')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.retrievedDistributions.columns.retrievedAmountEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <CollectedRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};
