import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tbody, Tr } from 'react-super-responsive-table';

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
import type { RewardsByToken } from '@/services/api';

interface AnchorDistribution extends RewardsByToken {
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
}

const AnchorDistributionsRow = ({ row, address }: { row: AnchorDistribution; address: string }) => {
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/distributions-by-token/${address}/${row.TokenId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell align="center">{row.TokenId}</TablePrimaryCell>
      <TablePrimaryCell align="center">{(row.RewardCollectedEth ?? 0).toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{(row.RewardToCollectEth ?? 0).toFixed(6)}</TablePrimaryCell>
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
            <Tr>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.tokenId')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.retrievedEth')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell>
                {t('tables.tokenDistributions.columns.retrievableEth')}
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <AnchorDistributionsRow key={row.TokenId} row={row} address={address} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
