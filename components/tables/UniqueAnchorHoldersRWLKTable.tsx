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
import type { UniqueAnchorHolderRWLK } from '@/services/api/types';

export type { UniqueAnchorHolderRWLK };

const UniqueAnchorHoldersRWLKRow = ({ row }: { row: UniqueAnchorHolderRWLK }) => {
  const t = useTranslations('tables');

  if (!row) {
    return <TablePrimaryRow />;
  }

  const {
    StakerAddr = '',
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensStaked = 0,
    TotalTokensMinted = 0,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.holder')}>
        <AddressLink address={StakerAddr} url={`/user/${StakerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.anchors')} align="center">
        {NumStakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.releases')} align="center">
        {NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.anchored')} align="center">
        {TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.imprinted')} align="center">
        {TotalTokensMinted}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueAnchorHoldersRWLKTable = ({ list }: { list: UniqueAnchorHolderRWLK[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);
  const responsiveHeaders = [
    {
      desktop: t('columns.anchorHolderAddress'),
      mobile: t('columns.holder'),
      align: 'left' as const,
      tooltip: t('statisticsTooltips.anchorHolderAddress'),
    },
    {
      desktop: t('uniqueAnchorHolders.numAnchorActions'),
      mobile: t('uniqueAnchorHolders.anchors'),
      tooltip: t('statisticsTooltips.numAnchorActions'),
    },
    {
      desktop: t('uniqueAnchorHolders.numReleaseActions'),
      mobile: t('uniqueAnchorHolders.releases'),
      tooltip: t('statisticsTooltips.numReleaseActions'),
    },
    {
      desktop: t('uniqueAnchorHolders.totalAnchoredTokens'),
      mobile: t('uniqueAnchorHolders.anchored'),
      tooltip: t('statisticsTooltips.totalAnchoredTokens'),
    },
    {
      desktop: t('uniqueAnchorHolders.totalImprintedTokens'),
      mobile: t('uniqueAnchorHolders.imprinted'),
      tooltip: t('statisticsTooltips.totalImprintedTokens'),
    },
  ];

  if (list.length === 0) {
    return <p>{t('empty.anchorHolders')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary className="sm:min-w-[720px] xl:min-w-0">
          <TablePrimaryHead>
            <tr>
              {responsiveHeaders.map((header) => (
                <TablePrimaryHeadCell key={header.desktop} align={header.align}>
                  <TableHeaderHelp
                    desktop={header.desktop}
                    mobile={header.mobile}
                    tooltip={header.tooltip}
                  />
                </TablePrimaryHeadCell>
              ))}
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <UniqueAnchorHoldersRWLKRow row={row} key={row.StakerAid} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
