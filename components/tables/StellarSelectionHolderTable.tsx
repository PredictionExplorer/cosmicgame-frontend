import { useEffect, useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import type { GestureInfo } from '@/services/api';
import {
  TablePrimaryContainer,
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
  const { account } = useActiveWeb3React();

  if (!holder) {
    return <TablePrimaryRow />;
  }

  const isCurrentUser = holder && account === holder.userAddr;

  return (
    <TablePrimaryRow className={isCurrentUser ? 'bg-white/[0.06]' : undefined}>
      <TablePrimaryCell align="left">
        <AddressLink address={holder?.userAddr ?? ''} url={`/user/${holder?.userAddr ?? ''}`} />
        &nbsp;
        {isCurrentUser && '(You)'}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{holder?.count ?? 0}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {((holder?.ethProbability ?? 0) * 100).toFixed(2)}%
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
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
    return <p>No holders yet.</p>;
  }

  return (
    <>
      {holderList === null ? (
        <p className="text-lg font-semibold">Loading...</p>
      ) : (
        <>
          <TablePrimaryContainer>
            <TablePrimary>
              <colgroup>
                <col width="40%" />
                <col width="20%" />
                <col width="20%" />
                <col width="20%" />
              </colgroup>
              <TablePrimaryHead>
                <Tr>
                  <TablePrimaryHeadCell align="left">Holder</TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Number of Stellar Selection Entries
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Probability of Winning ETH
                  </TablePrimaryHeadCell>
                  <TablePrimaryHeadCell align="center">
                    Probability of Winning NFT
                  </TablePrimaryHeadCell>
                </Tr>
              </TablePrimaryHead>
              <tbody>
                {holderList.slice((page - 1) * perPage, page * perPage).map((holder) => (
                  <HolderRow key={holder.userAddr} holder={holder} />
                ))}
              </tbody>
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
