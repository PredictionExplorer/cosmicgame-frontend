import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
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
import type { AnchorDistributionImprint } from '@/services/api';

const AnchorDistributionImprintsRow = ({ row }: { row: AnchorDistributionImprint }) => {
  const t = useTranslations('anchoring');
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('tables.randomWalkImprints.columns.datetime')}>
        <a
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tables.randomWalkImprints.columns.recipient')} align="center">
        <AddressLink address={row.WinnerAddr} url={`/user/${row.WinnerAddr}`} />
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tables.randomWalkImprints.columns.cycle')} align="center">
        <Link href={`/allocation/${row.RoundNum}`} className="text-inherit">
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell label={t('tables.randomWalkImprints.columns.tokenId')} align="center">
        <Link href={`/detail/${row.TokenId}`} className="text-inherit">
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const RwalkAnchorDistributionImprintsTable = ({
  list,
}: {
  list: AnchorDistributionImprint[];
}) => {
  const t = useTranslations('anchoring');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">{t('common.empty.allocations')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">
                {t('tables.randomWalkImprints.columns.datetime')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.randomWalkImprints.columns.recipient')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.randomWalkImprints.columns.cycle')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.randomWalkImprints.columns.tokenId')}
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>

          <TablePrimaryBody>
            {currentData.map((row) => (
              <AnchorDistributionImprintsRow key={row.EvtLogId} row={row} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
