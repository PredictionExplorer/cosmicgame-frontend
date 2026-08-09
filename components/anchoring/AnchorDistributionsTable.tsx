import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
import type { RewardsByToken } from '@/services/api';

interface AnchorDistribution extends RewardsByToken {
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
}

const AnchorDistributionsRow = ({ row, address }: { row: AnchorDistribution; address: string }) => {
  const t = useTranslations('anchoring');
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const distributionsHref = `/distributions-by-token/${address}/${row.TokenId}`;

  const handleRowClick = () => {
    router.push(distributionsHref);
  };

  return (
    <TablePrimaryRow onActivate={handleRowClick}>
      <TablePrimaryCell label={t('tables.tokenDistributions.columns.tokenId')} align="center">
        <Link
          href={distributionsHref}
          className={TABLE_ROW_LINK_CLASS}
          aria-label={t('distributionsByToken.title', { tokenId: row.TokenId })}
        >
          {row.TokenId}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('tables.tokenDistributions.columns.retrievedEth')} align="center">
        {(row.RewardCollectedEth ?? 0).toFixed(6)}
      </TablePrimaryCell>
      <TablePrimaryCell
        label={t('tables.tokenDistributions.columns.retrievableEth')}
        align="center"
      >
        {(row.RewardToCollectEth ?? 0).toFixed(6)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const AnchorDistributionsTable = ({
  list,
  address,
}: {
  list: AnchorDistribution[];
  address: string;
}) => {
  const t = useTranslations('anchoring');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (!list || list.length === 0) {
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
            <tr>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.tokenId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.retrievedEth')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.retrievableEth')}
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>

          <TablePrimaryBody>
            {currentData.map((row) => (
              <AnchorDistributionsRow key={row.TokenId} row={row} address={address} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
