import { useState, type FC } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link, useRouter } from '@/i18n/navigation';
import { TABLE_ROW_LINK_CLASS } from '@/components/ui/responsive-table';
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

export interface EthDonation {
  EvtLogId: string | number;
  TxHash: string;
  TimeStamp: number;
  RecordType: number;
  CGRecordId: string | number;
  RoundNum: string | number;
  DonorAddr: string;
  AmountEth: number;
}

interface EthDonationRowProps {
  row: EthDonation;
  showType: boolean;
}

const EthDonationRow: FC<EthDonationRowProps> = ({ row, showType }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  // `clickable` is exactly "this record has a detail page": rows of type 0 are
  // bare transfers with nothing to show, and pages that hide the type column
  // only ever list records that do have one.
  const clickable = row.RecordType > 0 || !showType;
  const detailHref = `/eth-contribution/detail/${row.CGRecordId}`;

  const handleRowClick = () => {
    router.push(detailHref);
  };

  return (
    <TablePrimaryRow onActivate={clickable ? handleRowClick : undefined}>
      <TablePrimaryCell label={t('columns.datetime')}>
        {/*
         * The datetime is the row's keyboard entry point, so it has to lead
         * where a row click leads. Nesting it inside the explorer link instead
         * would recreate the `nested-interactive` violation this replaced; the
         * detail page carries the same explorer link on its own datetime, so
         * the transaction stays one click away.
         */}
        {clickable ? (
          <Link
            href={detailHref}
            className={TABLE_ROW_LINK_CLASS}
            aria-label={t('ethContribution.viewContribution', { id: row.CGRecordId })}
          >
            <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
          </Link>
        ) : (
          <a
            className="text-inherit"
            href={getExplorerUrl('tx', row.TxHash)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
          </a>
        )}
      </TablePrimaryCell>
      {showType && (
        <TablePrimaryCell label={t('columns.type')} align="center">
          {row.RecordType ? t('ethContribution.withInfo') : t('ethContribution.simple')}
        </TablePrimaryCell>
      )}
      <TablePrimaryCell label={t('columns.round')} align="center">
        <Link
          className="text-inherit"
          href={`/allocation/${row.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.contributor')} align="center">
        <AddressLink address={row.DonorAddr} url={`/user/${row.DonorAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.amountEth')} align="right">
        {row.AmountEth.toFixed(2)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface EthDonationTableProps {
  list: EthDonation[];
  showType?: boolean;
}

const EthDonationTable: FC<EthDonationTableProps> = ({ list, showType = true }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.contributions')}</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              {showType && <TablePrimaryHeadCell>{t('columns.type')}</TablePrimaryHeadCell>}
              <TablePrimaryHeadCell>{t('columns.round')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.contributor')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amountEth')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {visibleRows.map((row) => (
              <EthDonationRow key={row.EvtLogId} row={row} showType={showType} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default EthDonationTable;
