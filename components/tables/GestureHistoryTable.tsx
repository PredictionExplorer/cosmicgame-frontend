import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { shortenHex, formatSeconds, getRWLKImageUrl, getExplorerUrl } from '@/utils';
import ERC20_ABI from '@/contracts/CosmicToken.json';

import { Link, useRouter } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { TABLE_ROW_LINK_CLASS } from '@/components/ui/responsive-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { useBannedGestures } from '@/hooks/useApiQuery';
import { useNow } from '@/hooks/useNow';

interface GestureHistory {
  EvtLogId: number;
  TimeStamp: number;
  BidderAddr: string;
  EthPriceEth?: number;
  CstPriceEth?: number;
  GestureType: number;
  RoundNum?: number;
  RWalkNFTId?: number;
  NFTDonationTokenAddr?: string;
  NFTDonationTokenId?: number;
  DonatedERC20TokenAddr?: string;
  DonatedERC20TokenAmount?: string;
  Message?: string;
}

interface HistoryRowProps {
  history: GestureHistory;
  isBanned: boolean;
  showRound: boolean;
  gestureDuration: number;
}

interface HistoryTableProps {
  gestureHistory: GestureHistory[];
  perPage: number;
  curPage: number;
  showRound: boolean;
  nowSec: number;
}

interface GestureHistoryTableProps {
  gestureHistory: GestureHistory[];
  showRound?: boolean;
}

const gestureTypeStyles: Record<number, string> = {
  2: 'rgba(0,128,128, 0.1)',
  1: 'rgba(128,128,128, 0.1)',
  0: 'rgba(0,0,0, 0.1)',
};

const gestureTypeLabels: Record<number, string> = {
  2: 'CST',
  1: 'RWLK',
  0: 'ETH',
};

function resolveGestureType(history: GestureHistory): number | undefined {
  if (typeof history.GestureType === 'number') return history.GestureType;
  const backendGestureType = (history as GestureHistory & { BidType?: number }).BidType;
  return typeof backendGestureType === 'number' ? backendGestureType : undefined;
}

function formatGestureCostAmount(amount: number | undefined): string {
  if (amount == null || amount < 0) return '—';
  return amount < 1 ? amount.toFixed(7) : amount.toFixed(4);
}

const HistoryRow = ({ history, isBanned, showRound, gestureDuration }: HistoryRowProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const router = useRouter();
  const publicClient = usePublicClient();
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(18);

  const tokenAddr = history.DonatedERC20TokenAddr;

  useEffect(() => {
    if (!tokenAddr || !publicClient) return;

    let cancelled = false;
    const read = { address: tokenAddr as `0x${string}`, abi: ERC20_ABI } as const;

    Promise.all([
      publicClient.readContract({ ...read, functionName: 'symbol' }),
      publicClient.readContract({ ...read, functionName: 'decimals' }),
    ])
      .then(([sym, dec]) => {
        if (cancelled) return;
        setSymbol(String(sym));
        const parsed = Number(dec);
        setDecimals(Number.isFinite(parsed) ? parsed : 18);
      })
      .catch(() => {
        // A missing or non-standard ERC-20 leaves the amount unlabelled rather
        // than breaking the row.
      });

    return () => {
      cancelled = true;
    };
  }, [tokenAddr, publicClient]);

  const handleRowClick = () => {
    router.push(`/gesture/${history.EvtLogId}`);
  };

  if (!history) return <TablePrimaryRow />;

  const gestureType = resolveGestureType(history);
  const backgroundStyle =
    (gestureType !== undefined && gestureTypeStyles[gestureType]) || 'rgba(0,0,0,0.1)';
  const gestureTypeLabel =
    (gestureType !== undefined && gestureTypeLabels[gestureType]) || t('status.unknown');

  const price =
    gestureType === 2
      ? `${formatGestureCostAmount(history.CstPriceEth)} CST`
      : `${formatGestureCostAmount(history.EthPriceEth)} ETH`;

  return (
    <TablePrimaryRow style={{ background: backgroundStyle }} onActivate={handleRowClick}>
      <TablePrimaryCell label={t('columns.datetime')}>
        <Link
          href={`/gesture/${history.EvtLogId}`}
          className={TABLE_ROW_LINK_CLASS}
          aria-label={t('gestureHistory.viewGesture', { id: history.EvtLogId })}
        >
          <HydrationSafeDateTime timestamp={history.TimeStamp} showSecond locale={locale} />
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.participant')}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono break-all">{shortenHex(history.BidderAddr, 6)}</span>
          </TooltipTrigger>
          <TooltipContent>{history.BidderAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.gestureCost')} align="right">
        {price}
      </TablePrimaryCell>
      {showRound && (
        <TablePrimaryCell label={t('columns.cycle')} align="center">
          {history.RoundNum}
        </TablePrimaryCell>
      )}
      <TablePrimaryCell label={t('columns.gestureType')} align="center">
        {gestureTypeLabel}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.gestureDuration')} align="center">
        {formatSeconds(gestureDuration, locale)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.gestureInfo')}>
        <span className="break-words">
          {gestureType === 1 && history.RWalkNFTId && (
            <>
              {t('gestureHistory.randomWalkGesture', { id: history.RWalkNFTId })}
              <Image
                src={getRWLKImageUrl(history.RWalkNFTId.toString().padStart(6, '0'))}
                width={32}
                height={32}
                className="align-middle inline"
                alt={t('gestureHistory.randomWalkImageAlt')}
                unoptimized
              />
            </>
          )}
          {(!!history.NFTDonationTokenAddr || !!history.DonatedERC20TokenAddr) && (
            <>
              {gestureType === 2 && t('gestureHistory.cstGesture')}
              {gestureType === 0 && t('gestureHistory.ethGesture')}
              {!!history.NFTDonationTokenAddr &&
                t('gestureHistory.nftAttached', {
                  address: shortenHex(history.NFTDonationTokenAddr, 6),
                  id: String(history.NFTDonationTokenId),
                })}
              {!!history.DonatedERC20TokenAddr && (
                <>
                  {t('gestureHistory.erc20AttachedPrefix', {
                    amount: formatUnits(BigInt(history.DonatedERC20TokenAmount || '0'), decimals),
                  })}{' '}
                  <a
                    href={getExplorerUrl('token', history.DonatedERC20TokenAddr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-inherit"
                  >
                    {symbol}
                  </a>
                  {t('gestureHistory.attachedSuffix')}
                </>
              )}
            </>
          )}{' '}
        </span>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.message')}>
        {!isBanned && history.Message ? (
          <Tooltip>
            <TooltipTrigger asChild>
              {/*
               * On a phone the message wraps in full: the desktop ellipsis hid
               * it behind a hover tooltip that touch users can never open,
               * because tapping the row navigates to the gesture instead.
               */}
              <span className="block break-words sm:max-w-[18rem] sm:truncate">
                {history.Message}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[min(20rem,90vw)] break-words">
              {history.Message}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({
  gestureHistory,
  perPage,
  curPage,
  showRound,
  nowSec,
}: HistoryTableProps) => {
  const t = useTranslations('tables');
  const { data: bannedBids } = useBannedGestures();
  const bannedList = bannedBids?.map((x: { bid_id: number }) => x.bid_id) ?? [];

  const displayedGestures = gestureHistory.slice((curPage - 1) * perPage, curPage * perPage);

  return (
    <TablePrimaryContainer label={t('gestureHistory.tableLabel')}>
      <TablePrimary>
        <TablePrimaryHead>
          <tr>
            <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.participant')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">{t('columns.gestureCost')}</TablePrimaryHeadCell>
            {showRound && (
              <TablePrimaryHeadCell align="center">{t('columns.cycle')}</TablePrimaryHeadCell>
            )}
            <TablePrimaryHeadCell align="center">{t('columns.gestureType')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="center">
              {t('columns.gestureDuration')}
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.gestureInfo')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.message')}</TablePrimaryHeadCell>
          </tr>
        </TablePrimaryHead>
        <TablePrimaryBody>
          {displayedGestures.map((history, index) => {
            const gestureDuration =
              (curPage - 1) * perPage + index === 0
                ? nowSec - history.TimeStamp
                : (gestureHistory[(curPage - 1) * perPage + index - 1]?.TimeStamp ??
                    history.TimeStamp) - history.TimeStamp;

            return (
              <HistoryRow
                history={history}
                key={history.EvtLogId}
                isBanned={bannedList.includes(history.EvtLogId)}
                showRound={showRound}
                gestureDuration={gestureDuration}
              />
            );
          })}
        </TablePrimaryBody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const GestureHistoryTable = ({ gestureHistory, showRound = true }: GestureHistoryTableProps) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [curPage, setCurrentPage] = useState(1);
  const nowSec = Math.floor(useNow(1000) / 1000);

  return (
    <div className="mt-4">
      {gestureHistory.length > 0 ? (
        <>
          <HistoryTable
            gestureHistory={gestureHistory}
            perPage={perPage}
            curPage={curPage}
            showRound={showRound}
            nowSec={nowSec}
          />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={gestureHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <p>{t('empty.gestures')}</p>
      )}
    </div>
  );
};

export default GestureHistoryTable;
