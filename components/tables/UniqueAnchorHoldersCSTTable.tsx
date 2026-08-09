import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { formatTableAmount, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { UniqueAnchorHolderCST } from '@/services/api/types';

export type { UniqueAnchorHolderCST };

const UniqueAnchorHoldersCSTRow = ({
  row,
  locale,
}: {
  row: UniqueAnchorHolderCST;
  locale: string;
}) => {
  const t = useTranslations('tables');

  if (!row) {
    return <TablePrimaryRow />;
  }

  const {
    StakerAddr = '',
    NumStakeActions = 0,
    NumUnstakeActions = 0,
    TotalTokensMinted = 0,
    TotalTokensStaked = 0,
    TotalRewardEth = 0,
    UnclaimedRewardEth = 0,
  } = row;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.holder')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${StakerAddr}`} className="text-inherit font-mono break-all">
              {shortenHex(StakerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{StakerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.anchors')} align="center">
        {NumStakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.releases')} align="center">
        {NumUnstakeActions}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.imprinted')} align="center">
        {TotalTokensMinted}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.anchored')} align="center">
        {TotalTokensStaked}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.distributed')} align="right">
        {formatTableAmount(TotalRewardEth, locale)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('uniqueAnchorHolders.unretrieved')} align="right">
        {formatTableAmount(UnclaimedRewardEth, locale)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const UniqueAnchorHoldersCSTTable = ({ list }: { list: UniqueAnchorHolderCST[] }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
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
      desktop: t('uniqueAnchorHolders.totalImprintedTokens'),
      mobile: t('uniqueAnchorHolders.imprinted'),
      tooltip: t('statisticsTooltips.totalImprintedTokens'),
    },
    {
      desktop: t('uniqueAnchorHolders.totalAnchoredTokens'),
      mobile: t('uniqueAnchorHolders.anchored'),
      tooltip: t('statisticsTooltips.totalAnchoredTokens'),
    },
    {
      desktop: t('uniqueAnchorHolders.totalDistributionEth'),
      mobile: t('uniqueAnchorHolders.distributed'),
      align: 'right' as const,
      tooltip: t('statisticsTooltips.totalDistributionEth'),
    },
    {
      desktop: t('uniqueAnchorHolders.unretrievedDistributionEth'),
      mobile: t('uniqueAnchorHolders.unretrieved'),
      align: 'right' as const,
      tooltip: t('statisticsTooltips.unretrievedDistributionEth'),
    },
  ];

  if (list.length === 0) {
    return <p>{t('empty.anchorHolders')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary className="sm:min-w-[860px] xl:min-w-0">
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
              <UniqueAnchorHoldersCSTRow row={row} locale={locale} key={row.StakerAid} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
