import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

import { useRouter } from '@/i18n/navigation';
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
import type { AnchorAction } from '@/services/api';

const AnchorActionsRow = ({ row, IsRwalk }: { row: AnchorAction; IsRwalk: boolean }) => {
  const t = useTranslations('anchoring');
  const locale = useLocale();
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/anchor-action/${IsRwalk ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell>
        {convertTimestampToDateTime(row.TimeStamp, false, locale)}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 1 ? t('common.release') : t('common.anchor')}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRwalk ? (
          <a href={`https://randomwalknft.com/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </a>
        ) : (
          <Link href={`/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </Link>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const AnchorActionsTable = ({ list, IsRwalk }: { list: AnchorAction[]; IsRwalk: boolean }) => {
  const t = useTranslations('anchoring');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.actions')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                {t('tables.anchorActions.columns.datetime')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('tables.anchorActions.columns.type')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.anchorActions.columns.tokenId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.anchorActions.columns.nftCount')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <AnchorActionsRow key={row.EvtLogId} row={row} IsRwalk={IsRwalk} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default AnchorActionsTable;
