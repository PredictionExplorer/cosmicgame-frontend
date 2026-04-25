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

interface GestureHistory {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  GestureType: number;
  BidderAddr: string;
  Message?: string;
}

interface HistoryRowProps {
  history: GestureHistory;
  isBanned: boolean;
  updateBannedList: () => Promise<void> | void;
}

interface HistoryTableProps {
  gestureHistory: GestureHistory[];
  perPage: number;
  curPage: number;
}

interface BanGestureTableProps {
  gestureHistory: GestureHistory[];
}

const gestureTypeBg: Record<number, string> = {
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
        text: 'Gesture was banned successfully!',
      });
    } catch (e) {
      reportError(e, 'ban gesture');
      const rawMsg = getEthErrorMessage(e, 'An error occurred');
      if (rawMsg) {
        const msg = getErrorMessage(rawMsg) || rawMsg;
        setNotification({ visible: true, text: msg, type: 'error' });
      }
    }
  };

  const handleUnban = async () => {
    try {
      await api.unban_gesture(history.EvtLogId);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: 'Gesture was unbanned successfully!',
      });
    } catch (e) {
      reportError(e, 'unban gesture');
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
    <TablePrimaryRow className={cn(gestureTypeBg[history.GestureType] || 'bg-black/10')}>
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
        {history.GestureType === 2
          ? 'CST Gesture'
          : history.GestureType === 1
            ? 'RWLK Token Gesture'
            : 'ETH Gesture'}
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

const HistoryTable = ({ gestureHistory, perPage, curPage }: HistoryTableProps) => {
  const [bannedList, setBannedList] = useState<number[]>([]);

  const getBannedList = useCallback(async () => {
    const gestures = await api.get_banned_bids();
    setBannedList(gestures.map((x: { bid_id: number }) => x.bid_id));
  }, []);

  useEffect(() => {
    getBannedList(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [getBannedList]);

  const displayedGestures = gestureHistory.slice((curPage - 1) * perPage, curPage * perPage);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Participant</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Gesture Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>
              <span className="sr-only">Actions</span>
            </TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <tbody>
          {displayedGestures.map((history) => (
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

const BanGestureTable = ({ gestureHistory }: BanGestureTableProps) => {
  const perPage = 200;
  const [curPage, setCurrentPage] = useState(1);

  return (
    <div className="mt-4">
      {gestureHistory.length > 0 ? (
        <>
          <HistoryTable gestureHistory={gestureHistory} perPage={perPage} curPage={curPage} />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={gestureHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <p>No gesture history yet.</p>
      )}
    </div>
  );
};

export default BanGestureTable;
