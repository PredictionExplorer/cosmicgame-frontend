import { useCallback, useEffect, useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import api from '@/services/api';
import { useActiveWeb3React } from '@/hooks/web3';
import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { reportError, getEthErrorMessage } from '@/utils/errors';
import { cn } from '@/lib/utils';

interface BidHistory {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  BidType: number;
  BidderAddr: string;
  Message?: string;
}

interface HistoryRowProps {
  history: BidHistory;
  isBanned: boolean;
  updateBannedList: () => Promise<void> | void;
}

interface HistoryTableProps {
  biddingHistory: BidHistory[];
  perPage: number;
  curPage: number;
}

interface BanBidTableProps {
  biddingHistory: BidHistory[];
}

const bidTypeBg: Record<number, string> = {
  2: 'bg-teal-500/10',
  1: 'bg-gray-500/10',
  0: 'bg-black/10',
};

const HistoryRow = ({ history, isBanned, updateBannedList }: HistoryRowProps) => {
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  const handleBan = async () => {
    try {
      await api.ban_bid(history.EvtLogId, account as string);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: 'Bid was banned successfully!',
      });
    } catch (e) {
      reportError(e, 'ban bid');
      const rawMsg = getEthErrorMessage(e, 'An error occurred');
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ visible: true, text: msg, type: 'error' });
      }
    }
  };

  const handleUnban = async () => {
    try {
      await api.unban_bid(history.EvtLogId);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: 'Bid was unbanned successfully!',
      });
    } catch (e) {
      reportError(e, 'unban bid');
      const rawMsg = getEthErrorMessage(e, 'An error occurred');
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ visible: true, text: msg, type: 'error' });
      }
    }
  };

  if (!history) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow className={cn(bidTypeBg[history.BidType] || 'bg-black/10')}>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', history.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(history.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={history.BidderAddr} url={`/user/${history.BidderAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <a
          className="text-inherit"
          href={`/allocation/${history.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {history.RoundNum}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.BidType === 2 ? 'CST Bid' : history.BidType === 1 ? 'RWLK Token Bid' : 'ETH Bid'}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="max-w-[180px] overflow-hidden whitespace-nowrap inline-block text-ellipsis leading-none">
                {history.Message}
              </span>
            </TooltipTrigger>
            <TooltipContent>{history.Message || ''}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {isBanned ? (
          <Button variant="ghost" size="sm" onClick={handleUnban}>
            Unban
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleBan}>
            Ban
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ biddingHistory, perPage, curPage }: HistoryTableProps) => {
  const [bannedList, setBannedList] = useState<number[]>([]);

  const getBannedList = useCallback(async () => {
    const bids = await api.get_banned_bids();
    setBannedList(bids.map((x: { bid_id: number }) => x.bid_id));
  }, []);

  useEffect(() => {
    getBannedList(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [getBannedList]);

  const displayedBids = biddingHistory.slice((curPage - 1) * perPage, curPage * perPage);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bidder</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Round</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Bid Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>
              <span className="sr-only">Actions</span>
            </TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <tbody>
          {displayedBids.map((history) => (
            <HistoryRow
              key={history.EvtLogId}
              history={history}
              isBanned={bannedList.includes(history.EvtLogId)}
              updateBannedList={getBannedList}
            />
          ))}
        </tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const BanBidTable = ({ biddingHistory }: BanBidTableProps) => {
  const perPage = 200;
  const [curPage, setCurrentPage] = useState(1);

  return (
    <div className="mt-4">
      {biddingHistory.length > 0 ? (
        <>
          <HistoryTable biddingHistory={biddingHistory} perPage={perPage} curPage={curPage} />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={biddingHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <p>No gesture history yet.</p>
      )}
    </div>
  );
};

export default BanBidTable;
