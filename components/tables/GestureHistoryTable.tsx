import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Tr } from 'react-super-responsive-table';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import { useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import {
  shortenHex,
  convertTimestampToDateTime,
  formatSeconds,
  getRWLKImageUrl,
  getExplorerUrl,
} from '@/utils';
import ERC20_ABI from '@/contracts/CosmicToken.json';

import { useRouter } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimaryContainer,
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
  const router = useRouter();
  const publicClient = usePublicClient();
  const [symbol, setSymbol] = useState('');
  const [decimals, setDecimals] = useState(18);

  useEffect(() => {
    const getSymbol = async () => {
      if (!publicClient) return;
      const tokenAddr = history.DonatedERC20TokenAddr! as `0x${string}`;
      const [sym, dec] = await Promise.all([
        publicClient.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: 'symbol',
        }),
        publicClient.readContract({
          address: tokenAddr,
          abi: ERC20_ABI,
          functionName: 'decimals',
        }),
      ]);
      setSymbol(sym as string);
      setDecimals(Number(dec));
    };

    if (!!history.DonatedERC20TokenAddr && publicClient) {
      getSymbol();
    }
  }, [history.DonatedERC20TokenAddr, publicClient]);

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
    <TablePrimaryRow
      className="cursor-pointer"
      style={{ background: backgroundStyle }}
      onClick={handleRowClick}
    >
      <TablePrimaryCell className="whitespace-nowrap">
        {convertTimestampToDateTime(history.TimeStamp, true)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono">{shortenHex(history.BidderAddr, 6)}</span>
          </TooltipTrigger>
          <TooltipContent>{history.BidderAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{price}</TablePrimaryCell>
      {showRound && <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>}
      <TablePrimaryCell align="center">{gestureTypeLabel}</TablePrimaryCell>
      <TablePrimaryCell align="center">{formatSeconds(gestureDuration)}</TablePrimaryCell>
      <TablePrimaryCell>
        <span className="break-all">
          {gestureType === 1 && history.RWalkNFTId && (
            <>
              {t('gestureHistory.randomWalkGesture', { id: history.RWalkNFTId })}
              <Image
                src={getRWLKImageUrl(history.RWalkNFTId.toString().padStart(6, '0'))}
                width={32}
                height={32}
                className="align-middle inline"
                alt="RWLK NFT"
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
      <TablePrimaryCell>
        {!isBanned && history.Message && (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="max-w-[180px] overflow-hidden whitespace-nowrap inline-block text-ellipsis leading-none">
                {history.Message}
              </span>
            </TooltipTrigger>
            <TooltipContent>{history.Message}</TooltipContent>
          </Tooltip>
        )}{' '}
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
    <TablePrimaryContainer>
      <TablePrimary>
        <colgroup>
          <col width="10%" />
          <col width="15%" />
          <col width="14%" />
          {showRound && <col width="8%" />}
          <col width="9%" />
          <col width="15%" />
          <col width="15%" />
          <col width="20%" />
        </colgroup>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.participant')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">{t('columns.gestureCost')}</TablePrimaryHeadCell>
            {showRound && <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell>{t('columns.gestureType')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="center">
              {t('columns.gestureDuration')}
            </TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.gestureInfo')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.message')}</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <tbody>
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
        </tbody>
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
