import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, type FC } from 'react';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime, shortenHex } from '@/utils';
import { statisticsCopy } from '@/content/statistics-copy';

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

const responsiveHeaders = [
  {
    desktop: 'Anchor Datetime',
    mobile: 'Datetime',
    align: 'left' as const,
    tooltip: 'Timestamp when the anchor or release action was indexed.',
  },
  {
    desktop: 'Action Type',
    mobile: 'Type',
    tooltip: 'Whether this row anchored or released NFTs.',
  },
  {
    desktop: 'Token ID',
    mobile: 'Token',
    tooltip: 'Token involved in the anchor or release action.',
  },
  {
    desktop: 'Anchor-holder Address',
    mobile: 'Holder',
    tooltip: statisticsCopy.tables.anchorHolderAddress,
  },
  { desktop: 'Number of NFTs', mobile: 'NFTs', tooltip: 'Anchored NFT count after this action.' },
];

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
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/anchor-action/${IsRWLK ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell>{convertTimestampToDateTime(row.TimeStamp)}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 0 ? 'Anchor' : 'Release'}
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
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (!list || list.length === 0) {
    return <p className="text-muted-foreground">No actions yet.</p>;
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
