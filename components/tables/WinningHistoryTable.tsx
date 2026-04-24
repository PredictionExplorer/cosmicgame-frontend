import { useState, type ReactNode } from 'react';
import { Trophy, Ticket, Heart, Layers, Coins, AlertTriangle } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/CustomPagination';
import { COSMIC_SIGNATURE_TOKEN_ADDRESS } from '@/config/networks';
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimaryHeadCell,
  TablePrimary,
} from '@/components/styled';
import { cn } from '@/lib/utils';
import type { WinningHistoryEntry } from '@/services/api/types';
export type { WinningHistoryEntry };

const RECORD_TYPE_MAP: Record<number, { icon: ReactNode; text: string }> = {
  0: { icon: <Ticket className="h-5 w-5" />, text: 'Signature Allocation ETH' },
  1: { icon: <Coins className="h-5 w-5" />, text: 'Signature Allocation CST (ERC-20)' },
  2: { icon: <Heart className="h-5 w-5" />, text: 'Signature Allocation Cosmic Signature NFT' },
  3: { icon: <Trophy className="h-5 w-5" />, text: 'ETH Stellar Selection (for participants)' },
  4: { icon: <Ticket className="h-5 w-5" />, text: 'CST Stellar Selection (for participants)' },
  5: {
    icon: <Layers className="h-5 w-5" />,
    text: 'Cosmic Signature NFT Stellar Selection (for participants)',
  },
  6: {
    icon: <Layers className="h-5 w-5" />,
    text: 'CST Stellar Selection (for RandomWalk anchor-holders)',
  },
  7: {
    icon: <Trophy className="h-5 w-5" />,
    text: 'Cosmic Signature NFT Stellar Selection (for RandomWalk anchor-holders)',
  },
  8: { icon: <Trophy className="h-5 w-5" />, text: 'Endurance Champion Cosmic Signature NFT' },
  9: { icon: <Trophy className="h-5 w-5" />, text: 'Endurance Champion Recognition CST (ERC-20)' },
  10: { icon: <Trophy className="h-5 w-5" />, text: 'Chrono-Warrior ETH' },
  11: { icon: <Trophy className="h-5 w-5" />, text: 'Chrono-Warrior CST (ERC-20)' },
  12: { icon: <Ticket className="h-5 w-5" />, text: 'Chrono-Warrior Cosmic Signature NFT' },
  13: {
    icon: <Ticket className="h-5 w-5" />,
    text: 'Anchor Distribution ETH (for Cosmic Signature NFT anchor-holders)',
  },
  14: {
    icon: <Ticket className="h-5 w-5" />,
    text: 'Final CST Gesture Cosmic Signature NFT (ERC-721)',
  },
  15: { icon: <Ticket className="h-5 w-5" />, text: 'Final CST Gesture Recognition CST (ERC-20)' },
};

const WinningHistoryRow = ({
  history,
  showClaimedStatus,
  showWinnerAddr,
}: {
  history: WinningHistoryEntry;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
}) => {
  if (!history) return <TablePrimaryRow />;

  const recordType = RECORD_TYPE_MAP[history.RecordType] || {
    icon: null,
    text: ' ',
  };

  return (
    <TablePrimaryRow className={cn(!history.Claimed && showClaimedStatus && 'bg-white/[0.06]')}>
      <TablePrimaryCell>
        <div className="flex items-center">
          {recordType.icon}&nbsp;<span>{recordType.text}</span>&nbsp;
          {!history.Claimed && showClaimedStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-white/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Unclaimed, go to Pending Winnings to claim.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <a
          href={getExplorerUrl('tx', history.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          {convertTimestampToDateTime(history.TimeStamp)}
        </a>
      </TablePrimaryCell>
      {showWinnerAddr && (
        <TablePrimaryCell align="center">
          {history.WinnerAddr ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`/user/${history.WinnerAddr}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-inherit"
                  >
                    {shortenHex(history.WinnerAddr, 6)}
                  </a>
                </TooltipTrigger>
                <TooltipContent>{history.WinnerAddr}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            ' '
          )}
        </TablePrimaryCell>
      )}
      <TablePrimaryCell align="center">
        <a
          href={`/prize/${history.RoundNum}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          {history.RoundNum}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {[0, 3, 10, 13].includes(history.RecordType)
          ? `${(history.AmountEth ?? 0).toFixed(4)} ETH`
          : [2, 5, 7, 8, 12, 15].includes(history.RecordType)
            ? 'N/A'
            : `${(history.AmountEth ?? 0).toFixed(2)} CST`}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.RecordType === 1 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={getExplorerUrl('address', COSMIC_SIGNATURE_TOKEN_ADDRESS)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inherit"
                >
                  {shortenHex(COSMIC_SIGNATURE_TOKEN_ADDRESS, 6)}
                </a>
              </TooltipTrigger>
              <TooltipContent>{COSMIC_SIGNATURE_TOKEN_ADDRESS}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : history.TokenAddress ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={getExplorerUrl('address', history.TokenAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inherit"
                >
                  {shortenHex(history.TokenAddress, 6)}
                </a>
              </TooltipTrigger>
              <TooltipContent>{history.TokenAddress}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {(history.TokenId ?? -1) >= 0 ? (
          <a
            href={`/detail/${history.TokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            {history.TokenId}
          </a>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">
        {(history.WinnerIndex ?? -1) >= 0 ? history.WinnerIndex : ' '}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

function WinningHistorySubTable({
  winningHistory,
  perPage,
  curPage,
  showClaimedStatus,
  showWinnerAddr,
}: {
  winningHistory: WinningHistoryEntry[];
  perPage: number;
  curPage: number;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
}) {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <colgroup>
          <col width="20%" />
          <col width="14%" />
          {showWinnerAddr && <col width="17%" />}
          <col width="7%" />
          <col width="11%" />
          <col width="17%" />
          <col width="8%" />
          <col width="7%" />
        </colgroup>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Record Type</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            {showWinnerAddr && <TablePrimaryHeadCell>Recipient</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token Address</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">Position</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <tbody>
          {winningHistory
            .slice((curPage - 1) * perPage, curPage * perPage)
            .map((history, index) => (
              <WinningHistoryRow
                key={`${curPage}-${index}-${history.TxHash}`}
                history={history}
                showClaimedStatus={showClaimedStatus}
                showWinnerAddr={showWinnerAddr}
              />
            ))}
        </tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}

export default function WinningHistoryTable({
  winningHistory,
  showClaimedStatus = false,
  showWinnerAddr = true,
}: {
  winningHistory: WinningHistoryEntry[];
  showClaimedStatus?: boolean;
  showWinnerAddr?: boolean;
}) {
  const PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  if (!winningHistory || winningHistory.length === 0) {
    return <p>No history yet.</p>;
  }

  return (
    <div className="mt-4">
      <WinningHistorySubTable
        winningHistory={winningHistory}
        showClaimedStatus={showClaimedStatus}
        showWinnerAddr={showWinnerAddr}
        perPage={PER_PAGE}
        curPage={currentPage}
      />
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={winningHistory.length}
        perPage={PER_PAGE}
      />
    </div>
  );
}
