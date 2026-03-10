import { useEffect, useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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

interface BidEvent {
  BidderAddr: string;
  EthPriceEth: number;
}

interface SpenderInfo {
  bidderAddr: string;
  amount: number;
}

interface ETHSpentRowProps {
  row: SpenderInfo;
}

const ETHSpentRow: FC<ETHSpentRowProps> = ({ row }) => {
  const { account } = useActiveWeb3React();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const isCurrentUser = account === row.bidderAddr;

  return (
    <TablePrimaryRow className={isCurrentUser ? 'bg-white/[0.06]' : undefined}>
      <TablePrimaryCell align="left">
        <AddressLink address={row.bidderAddr} url={`/user/${row.bidderAddr}`} />
        &nbsp;
        {isCurrentUser && '(You)'}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{(row.amount || 0).toFixed(4)} ETH</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface ETHSpentTableProps {
  list: BidEvent[];
}

const ETHSpentTable: FC<ETHSpentTableProps> = ({ list }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);
  const [spenderList, setSpenderList] = useState<SpenderInfo[] | null>(null);
  const { account } = useActiveWeb3React();

  useEffect(() => {
    const groupAndCountByBidderAddr = (): SpenderInfo[] => {
      const result: Record<string, number> = {};

      list.forEach((event) => {
        const ethPrice = event.EthPriceEth || 0;
        result[event.BidderAddr] = (result[event.BidderAddr] ?? 0) + ethPrice;
      });

      const sortedResults: SpenderInfo[] = Object.entries(result)
        .map(([bidderAddr, amount]) => ({ bidderAddr, amount }))
        .sort((a, b) => b.amount - a.amount);

      if (account) {
        const userIndex = sortedResults.findIndex((item) => item.bidderAddr === account);
        if (userIndex !== -1) {
          const [userItem] = sortedResults.splice(userIndex, 1);
          if (userItem) sortedResults.unshift(userItem);
        }
      }

      return sortedResults;
    };

    const spender = groupAndCountByBidderAddr();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSpenderList(spender);
  }, [list, account]);

  if (list.length === 0) {
    return <p>No spenders yet.</p>;
  }

  if (spenderList === null) {
    return <p className="text-lg font-semibold">Loading...</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = spenderList.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="50%" />
            <col width="50%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">User Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Spent Amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {visibleRows.map((row) => (
              <ETHSpentRow key={row.bidderAddr} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={spenderList.length}
        perPage={perPage}
      />
    </>
  );
};

export default ETHSpentTable;
