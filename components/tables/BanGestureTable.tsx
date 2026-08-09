import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  TablePrimaryContainer,
  TablePrimaryBody,
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
import { Link } from '@/i18n/navigation';
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
  const t = useTranslations('tables');
  const tToast = useTranslations('toasts');
  const locale = useLocale();
  const { account } = useActiveWeb3React();
  const { setNotification } = useNotification();

  const handleBan = async () => {
    try {
      await api.ban_bid(history.EvtLogId, account as string);
      updateBannedList();
      setNotification({
        visible: true,
        type: 'success',
        text: tToast('admin.gestureBan.banned'),
      });
    } catch (e) {
      reportError(e, 'ban gesture');
      const rawMsg = getEthErrorMessage(e, tToast('admin.gestureBan.failed'), { locale });
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
        text: tToast('admin.gestureBan.unbanned'),
      });
    } catch (e) {
      reportError(e, 'unban gesture');
      const rawMsg = getEthErrorMessage(e, tToast('admin.gestureBan.failed'), { locale });
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
      <TablePrimaryCell label={t('columns.date')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', history.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={history.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.participant')} align="center">
        <AddressLink address={history.BidderAddr} url={`/user/${history.BidderAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.cycle')} align="center">
        <Link
          className="text-inherit"
          href={`/allocation/${history.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {history.RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.gestureType')} align="center">
        {history.GestureType === 2 ? 'CST' : history.GestureType === 1 ? 'RWLK' : 'ETH'}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.message')}>
        <Tooltip>
          <TooltipTrigger asChild>
            {/*
             * The desktop ellipsis hid the message behind a hover tooltip that
             * touch users cannot open, so on a phone it wraps in full instead.
             */}
            <span className="block break-words sm:max-w-[18rem] sm:truncate">
              {history.Message}
            </span>
          </TooltipTrigger>
          <TooltipContent>{history.Message || ''}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.actions')} align="center">
        {isBanned ? (
          <Button variant="ghost" size="sm" onClick={handleUnban}>
            {t('banGesture.unban')}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={handleBan}>
            {t('banGesture.ban')}
          </Button>
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ gestureHistory, perPage, curPage }: HistoryTableProps) => {
  const t = useTranslations('tables');
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
          <tr>
            <TablePrimaryHeadCell align="left">{t('columns.date')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.participant')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.gestureType')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.message')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>
              <span className="sr-only">{t('columns.actions')}</span>
            </TablePrimaryHeadCell>
          </tr>
        </TablePrimaryHead>
        <TablePrimaryBody>
          {displayedGestures.map((history) => (
            <HistoryRow
              key={history.EvtLogId}
              history={history}
              isBanned={bannedList.includes(history.EvtLogId)}
              updateBannedList={getBannedList}
            />
          ))}
        </TablePrimaryBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const BanGestureTable = ({ gestureHistory }: BanGestureTableProps) => {
  const t = useTranslations('tables');
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
        <p>{t('empty.gestureHistory')}</p>
      )}
    </div>
  );
};

export default BanGestureTable;
