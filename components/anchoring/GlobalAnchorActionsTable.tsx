import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, type FC } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tbody, Tr } from 'react-super-responsive-table';

import { shortenHex } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';

interface RowData {
  EvtLogId: string | number;
  ActionId: string | number;
  TimeStamp: number;
  ActionType: number;
  TokenId: string | number;
  StakerAddr: string;
  NumStakedNFTs: number;
}

interface GlobalAnchorActionsRowProps {
  row: RowData;
  IsRWLK: boolean;
}

const GlobalAnchorActionsRow: FC<GlobalAnchorActionsRowProps> = ({ row, IsRWLK }) => {
  const t = useTranslations('anchoring');
  const locale = useLocale();
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/anchor-action/${IsRWLK ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell>
        <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 0 ? t('common.anchor') : t('common.release')}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRWLK ? (
          <a href={`https://randomwalknft.com/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </a>
        ) : (
          <Link href={`/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </Link>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={`/user/${row.StakerAddr}`}
              className="inline-block max-w-full break-all text-inherit font-mono"
            >
              {shortenHex(row.StakerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{row.StakerAddr}</p>
          </TooltipContent>
        </Tooltip>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface GlobalAnchorActionsTableProps {
  list: RowData[];
  IsRWLK: boolean;
}

export const GlobalAnchorActionsTable: FC<GlobalAnchorActionsTableProps> = ({ list, IsRWLK }) => {
  const t = useTranslations('anchoring');
  const perPage = 5;
  const [page, setPage] = useState(1);
  const responsiveHeaders = [
    {
      desktop: t('tables.globalAnchorActions.headers.anchorDatetime.desktop'),
      mobile: t('tables.globalAnchorActions.headers.anchorDatetime.mobile'),
      align: 'left' as const,
      tooltip: t('tables.globalAnchorActions.headers.anchorDatetime.tooltip'),
    },
    {
      desktop: t('tables.globalAnchorActions.headers.actionType.desktop'),
      mobile: t('tables.globalAnchorActions.headers.actionType.mobile'),
      tooltip: t('tables.globalAnchorActions.headers.actionType.tooltip'),
    },
    {
      desktop: t('tables.globalAnchorActions.headers.tokenId.desktop'),
      mobile: t('tables.globalAnchorActions.headers.tokenId.mobile'),
      tooltip: t('tables.globalAnchorActions.headers.tokenId.tooltip'),
    },
    {
      desktop: t('tables.globalAnchorActions.headers.holderAddress.desktop'),
      mobile: t('tables.globalAnchorActions.headers.holderAddress.mobile'),
      tooltip: t('tables.globalAnchorActions.headers.holderAddress.tooltip'),
    },
    {
      desktop: t('tables.globalAnchorActions.headers.nftCount.desktop'),
      mobile: t('tables.globalAnchorActions.headers.nftCount.mobile'),
      tooltip: t('tables.globalAnchorActions.headers.nftCount.tooltip'),
    },
  ];

  if (!list || list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.actions')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary className="sm:min-w-[720px] lg:min-w-0">
          <colgroup>
            <col width="25%" />
            <col width="15%" />
            <col width="15%" />
            <col width="25%" />
            <col width="15%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              {responsiveHeaders.map((header) => (
                <TablePrimaryHeadCell key={header.desktop} align={header.align}>
                  <TableHeaderHelp
                    desktop={header.desktop}
                    mobile={header.mobile}
                    tooltip={header.tooltip}
                  />
                </TablePrimaryHeadCell>
              ))}
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {visibleRows.map((row) => (
              <GlobalAnchorActionsRow key={row.EvtLogId} row={row} IsRWLK={IsRWLK} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
