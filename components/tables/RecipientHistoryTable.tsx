import { useState, type ReactNode } from 'react';
import { Trophy, Ticket, Heart, Layers, Coins, AlertTriangle } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/CustomPagination';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
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

/** Backend `cg_prize.ptype` / API `RecordType` — must match black-site prize history labels. */
const RECORD_TYPE_MAP: Record<number, { icon: ReactNode; text: string }> = {
  0: { icon: <Ticket className="h-5 w-5" />, text: 'Main ETH Allocation' },
  1: { icon: <Coins className="h-5 w-5" />, text: 'Main Signature Allocation CST' },
  2: { icon: <Heart className="h-5 w-5" />, text: 'Main Signature Allocation CS NFT' },
  3: { icon: <Ticket className="h-5 w-5" />, text: 'Final CST Gesture CS NFT' },
  4: { icon: <Coins className="h-5 w-5" />, text: 'Final CST Gesture Recognition CST' },
  5: { icon: <Trophy className="h-5 w-5" />, text: 'Endurance Champion CS NFT' },
  6: { icon: <Coins className="h-5 w-5" />, text: 'Endurance Champion Recognition CST' },
  7: { icon: <Trophy className="h-5 w-5" />, text: 'Chrono-Warrior ETH' },
  8: { icon: <Coins className="h-5 w-5" />, text: 'Chrono-Warrior CST' },
  9: { icon: <Ticket className="h-5 w-5" />, text: 'Chrono-Warrior CS NFT' },
  10: { icon: <Trophy className="h-5 w-5" />, text: 'ETH Stellar Selection (for participants)' },
  11: {
    icon: <Coins className="h-5 w-5" />,
    text: 'Recognition CST from Stellar Selection (for participants)',
  },
  12: {
    icon: <Layers className="h-5 w-5" />,
    text: 'CS NFT Stellar Selection (for participants)',
  },
  13: {
    icon: <Coins className="h-5 w-5" />,
    text: 'Recognition CST from Anchored-NFT Stellar Selection (for RandomWalk anchor-holders)',
  },
  14: {
    icon: <Layers className="h-5 w-5" />,
    text: 'CS NFT Stellar Selection (for RandomWalk anchor-holders)',
  },
  15: {
    icon: <Ticket className="h-5 w-5" />,
    text: 'Anchor Distribution ETH (for Cosmic Signature NFT anchor-holders)',
  },
  16: { icon: <Heart className="h-5 w-5" />, text: 'Attached NFT (timeout retrieval)' },
  17: { icon: <Coins className="h-5 w-5" />, text: 'Attached ERC-20 (timeout retrieval)' },
  18: { icon: <Trophy className="h-5 w-5" />, text: 'ETH Stellar Selection (timeout retrieval)' },
};

const ETH_RECORD_TYPES = new Set([0, 7, 10, 15, 18]);
const CST_RECORD_TYPES = new Set([1, 4, 6, 8, 11, 13]);
const NFT_RECORD_TYPES = new Set([2, 3, 5, 9, 12, 14, 16]);

function formatAllocationAmount(recordType: number, amountEth: number | undefined): string {
  if (NFT_RECORD_TYPES.has(recordType)) {
    return 'N/A';
  }
  if (ETH_RECORD_TYPES.has(recordType)) {
    return `${(amountEth ?? 0).toFixed(4)} ETH`;
  }
  if (recordType === 17) {
    return `${(amountEth ?? 0).toFixed(4)} (ERC-20)`;
  }
  if (CST_RECORD_TYPES.has(recordType)) {
    return `${(amountEth ?? 0).toFixed(2)} CST`;
  }
  return ' ';
}

const WinningHistoryRow = ({
  history,
  showClaimedStatus,
  showWinnerAddr,
  showRoundColumn,
}: {
  history: WinningHistoryEntry;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
  showRoundColumn: boolean;
}) => {
  const { cosmicToken } = useContractAddresses();
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
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-white/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Unclaimed, go to Pending Winnings to claim.</TooltipContent>
            </Tooltip>
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
          ) : (
            ' '
          )}
        </TablePrimaryCell>
      )}
      {showRoundColumn && (
        <TablePrimaryCell align="center">
          <a
            href={`/allocation/${history.RoundNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            {history.RoundNum}
          </a>
        </TablePrimaryCell>
      )}
      <TablePrimaryCell align="right">
        {formatAllocationAmount(history.RecordType, history.AmountEth)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {history.RecordType === 1 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getExplorerUrl('address', cosmicToken)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit"
              >
                {shortenHex(cosmicToken, 6)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{cosmicToken}</TooltipContent>
          </Tooltip>
        ) : history.TokenAddress ? (
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
  showRoundColumn,
}: {
  winningHistory: WinningHistoryEntry[];
  perPage: number;
  curPage: number;
  showClaimedStatus: boolean;
  showWinnerAddr: boolean;
  showRoundColumn: boolean;
}) {
  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <colgroup>
          <col width="20%" />
          <col width="14%" />
          {showWinnerAddr && <col width="17%" />}
          {showRoundColumn && <col width="7%" />}
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
            {showRoundColumn && <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>}
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
                key={`${curPage}-${index}-${history.TxHash ?? history.RecordType}-${history.WinnerIndex ?? index}`}
                history={history}
                showClaimedStatus={showClaimedStatus}
                showWinnerAddr={showWinnerAddr}
                showRoundColumn={showRoundColumn}
              />
            ))}
        </tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}

export default function RecipientHistoryTable({
  winningHistory,
  showClaimedStatus = false,
  showWinnerAddr = true,
  showRoundColumn = true,
  perPage = 5,
}: {
  winningHistory: WinningHistoryEntry[];
  showClaimedStatus?: boolean;
  showWinnerAddr?: boolean;
  showRoundColumn?: boolean;
  perPage?: number;
}) {
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
        showRoundColumn={showRoundColumn}
        perPage={perPage}
        curPage={currentPage}
      />
      <CustomPagination
        page={currentPage}
        setPage={setCurrentPage}
        totalLength={winningHistory.length}
        perPage={perPage}
      />
    </div>
  );
}
