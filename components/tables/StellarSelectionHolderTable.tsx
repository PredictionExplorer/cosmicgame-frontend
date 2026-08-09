import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { GestureInfo } from '@/services/api';
import {
  TablePrimaryContainer,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import { useActiveWeb3React } from '@/hooks/web3';

interface HolderRowProps {
  holder: {
    userAddr: string;
    count: number;
    ethProbability: number;
    NFTProbability: number;
  } | null;
}

const HolderRow = ({ holder }: HolderRowProps) => {
  const t = useTranslations('tables');
  const { account } = useActiveWeb3React();

  if (!holder) {
    return <TablePrimaryRow />;
  }

  const isCurrentUser = holder && account === holder.userAddr;

  return (
    <TablePrimaryRow className={isCurrentUser ? 'bg-white/[0.06]' : undefined}>
      <TablePrimaryCell label={t('columns.holder')} align="left">
        <AddressLink address={holder?.userAddr ?? ''} url={`/user/${holder?.userAddr ?? ''}`} />
        &nbsp;
        {isCurrentUser && t('status.you')}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.numberOfStellarEntries')} align="center">
        {holder?.count ?? 0}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.ethSelectionProbability')} align="center">
        {((holder?.ethProbability ?? 0) * 100).toFixed(2)}%
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.nftSelectionProbability')} align="center">
        {((holder?.NFTProbability ?? 0) * 100).toFixed(2)}%
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface StellarSelectionHolderTableProps {
  list: GestureInfo[];
  numRaffleEthWinner?: number;
  numRaffleNFTWinner?: number;
}

const StellarSelectionHolderTable = ({
  list,
  numRaffleEthWinner,
  numRaffleNFTWinner,
}: StellarSelectionHolderTableProps) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [holderList, setHolderList] = useState<
    | {
        userAddr: string;
        count: number;
        ethProbability: number;
        NFTProbability: number;
      }[]
    | null
  >(null);

  const { account } = useActiveWeb3React();

  useEffect(() => {
    const groupAndCountByParticipantAddr = () => {
      const result: { [key: string]: number } = {};

      list.forEach((event: GestureInfo) => {
        const addr = event.BidderAddr;
        if (result[addr]) {
          result[addr]++;
        } else {
          result[addr] = 1;
        }
      });

      const sortedResults = Object.entries(result)
        .map(([bidderAddr, count]) => ({
          userAddr: bidderAddr,
          count,
          ethProbability:
            1 - Math.pow((list.length - count) / list.length, numRaffleEthWinner ?? 1),
          NFTProbability:
            1 - Math.pow((list.length - count) / list.length, numRaffleNFTWinner ?? 1),
        }))
        .sort((a, b) => b.count - a.count);

      const userIndex = sortedResults.findIndex((item) => item.userAddr === account);
      if (userIndex !== -1) {
        const userItem = sortedResults.splice(userIndex, 1)[0];
        if (userItem) sortedResults.unshift(userItem);
      }

      return sortedResults;
    };

    if (numRaffleEthWinner && numRaffleNFTWinner) {
      const holders = groupAndCountByParticipantAddr();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHolderList(holders);
    }
  }, [list, numRaffleEthWinner, numRaffleNFTWinner, account]);

  if (list.length === 0) {
    return <p>{t('empty.holders')}</p>;
  }

  return (
    <>
      {holderList === null ? (
        <p className="text-lg font-semibold">{t('status.loading')}</p>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              <TablePrimaryHead>
                <tr>
                  <TablePrimaryHeadCell align="left">{t('columns.holder')}</TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    {t('columns.numberOfStellarEntries')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    {t('columns.ethSelectionProbability')}
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    {t('columns.nftSelectionProbability')}
                  </TablePrimaryHeadCell>
                </tr>
              </TablePrimaryHead>
              <TablePrimaryBody>
                {holderList.slice((page - 1) * perPage, page * perPage).map((holder) => (
                  <HolderRow key={holder.userAddr} holder={holder} />
                ))}
              </TablePrimaryBody>
            </TablePrimary>
          </TablePrimaryContainer>
          <CustomPagination
            page={page}
            setPage={setPage}
            totalLength={holderList.length}
            perPage={perPage}
          />
        </>
      )}
    </>
  );
};

export default StellarSelectionHolderTable;
