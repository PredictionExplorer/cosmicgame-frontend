import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tbody, Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

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

export interface CSTAnchorDistributionByDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  DepositRoundNum: number;
  DepositId: number;
  DepositAmountEth: number;
  ClaimedAmountEth: number;
  YourClaimableAmountEth: number;
  FullyClaimed: boolean;
  NumStakedNFTs: number;
  NumTokensCollected: number;
  YourTokensStaked: number;
}

const CSTAnchorDistributionsByDepositRow = ({ row }: { row: CSTAnchorDistributionByDeposit }) => {
  const t = useTranslations('anchoring');
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow className="border-b-0">
      <TablePrimaryCell>
        <a
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          {convertTimestampToDateTime(row.TimeStamp, false, locale)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link href={`/allocation/${row.DepositRoundNum}`} className="text-inherit">
          {row.DepositRoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.DepositId}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.DepositAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.ClaimedAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.YourClaimableAmountEth.toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {row.FullyClaimed ? t('common.yes') : t('common.no')}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.NumTokensCollected}</TablePrimaryCell>
      <TablePrimaryCell align="center">{row.YourTokensStaked}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const CSTAnchorDistributionsByDepositTable = ({
  list,
}: {
  list: CSTAnchorDistributionByDeposit[];
}) => {
  const t = useTranslations('anchoring');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.distributions')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                {t('tables.distributionsByDeposit.columns.depositDatetime')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.depositCycle')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.depositId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.totalDepositAmount')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.totalRetrievedAmount')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.yourRetrievableAmount')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.fullyRetrieved')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.totalAnchoredNfts')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.totalRetrievedTokens')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.distributionsByDeposit.columns.yourAnchoredTokens')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <CSTAnchorDistributionsByDepositRow row={row} key={row.EvtLogId} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
