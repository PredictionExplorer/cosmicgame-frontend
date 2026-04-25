import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Tr } from 'react-super-responsive-table';
import { usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import {
  shortenHex,
  convertTimestampToDateTime,
  formatSeconds,
  getRWLKImageUrl,
  getExplorerUrl,
} from '@/utils';
import ERC20_ABI from '@/contracts/CosmicToken.json';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  2: 'CST Gesture',
  1: 'RWLK Token Gesture',
  0: 'ETH Gesture',
};

const HistoryRow = ({ history, isBanned, showRound, gestureDuration }: HistoryRowProps) => {
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

  const backgroundStyle = gestureTypeStyles[history.GestureType] || 'rgba(0,0,0,0.1)';
  const gestureTypeLabel = gestureTypeLabels[history.GestureType] || 'Unknown Gesture';

  const price =
    history.GestureType === 2
      ? `${
          (history.CstPriceEth || 0) < 1
            ? (history.CstPriceEth || 0).toFixed(7)
            : (history.CstPriceEth || 0).toFixed(4)
        } CST`
      : `${
          (history.EthPriceEth || 0) < 1
            ? (history.EthPriceEth || 0).toFixed(7)
            : (history.EthPriceEth || 0).toFixed(4)
        } ETH`;

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono">{shortenHex(history.BidderAddr, 6)}</span>
            </TooltipTrigger>
            <TooltipContent>{history.BidderAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{price}</TablePrimaryCell>
      {showRound && <TablePrimaryCell align="center">{history.RoundNum}</TablePrimaryCell>}
      <TablePrimaryCell align="center">{gestureTypeLabel}</TablePrimaryCell>
      <TablePrimaryCell align="center">{formatSeconds(gestureDuration)}</TablePrimaryCell>
      <TablePrimaryCell>
        <span className="break-all">
          {history.GestureType === 1 && history.RWalkNFTId && (
            <>
              {`Gesture was made using RandomWalk Token (ID = ${history.RWalkNFTId})`}
              <Image
                src={getRWLKImageUrl(history.RWalkNFTId.toString().padStart(6, '0'))}
                width={32}
                height={32}
                className="align-middle inline"
                alt="RWLK Token"
                unoptimized
              />
            </>
          )}
          {(!!history.NFTDonationTokenAddr || !!history.DonatedERC20TokenAddr) && (
            <>
              {history.GestureType === 2 && 'Gesture was made using Cosmic Signature Tokens'}
              {history.GestureType === 0 && 'Gesture was made using ETH'}
              {!!history.NFTDonationTokenAddr &&
                ` and a token (${shortenHex(
                  history.NFTDonationTokenAddr,
                  6,
                )}) with ID ${history.NFTDonationTokenId} was attached`}
              {!!history.DonatedERC20TokenAddr && (
                <>
                  {` and ${formatUnits(BigInt(history.DonatedERC20TokenAmount || '0'), decimals)}`}{' '}
                  <a
                    href={getExplorerUrl('token', history.DonatedERC20TokenAddr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-inherit"
                  >
                    {symbol}
                  </a>
                  {' was attached'}
                </>
              )}
            </>
          )}{' '}
        </span>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {!isBanned && history.Message && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="max-w-[180px] overflow-hidden whitespace-nowrap inline-block text-ellipsis leading-none">
                  {history.Message}
                </span>
              </TooltipTrigger>
              <TooltipContent>{history.Message}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}{' '}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const HistoryTable = ({ gestureHistory, perPage, curPage, showRound }: HistoryTableProps) => {
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
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Participant</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Cost</TablePrimaryHeadCell>
            {showRound && <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell>Gesture Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="center">Gesture Duration</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Gesture Info</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Message</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        {/* eslint-disable react-hooks/purity */}
        <tbody>
          {displayedGestures.map((history, index) => {
            const gestureDuration =
              (curPage - 1) * perPage + index === 0
                ? Date.now() / 1000 - history.TimeStamp
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
        {/* eslint-enable react-hooks/purity */}
      </TablePrimary>
    </TablePrimaryContainer>
  );
};

const GestureHistoryTable = ({ gestureHistory, showRound = true }: GestureHistoryTableProps) => {
  const perPage = 5;
  const [curPage, setCurrentPage] = useState(1);

  return (
    <div className="mt-4">
      {gestureHistory.length > 0 ? (
        <>
          <HistoryTable
            gestureHistory={gestureHistory}
            perPage={perPage}
            curPage={curPage}
            showRound={showRound}
          />
          <CustomPagination
            page={curPage}
            setPage={setCurrentPage}
            totalLength={gestureHistory.length}
            perPage={perPage}
          />
        </>
      ) : (
        <p>No gestures yet.</p>
      )}
    </div>
  );
};

export default GestureHistoryTable;
