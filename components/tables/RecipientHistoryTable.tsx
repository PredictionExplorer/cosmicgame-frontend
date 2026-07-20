import { useState, type ReactNode } from 'react';
import { Trophy, Ticket, Heart, Layers, Coins, AlertTriangle } from 'lucide-react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
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

/** Stellar Selection rows in `AllPrizes` / `cg_prize.ptype`. */
export const STELLAR_SELECTION_RECORD_TYPES = new Set([10, 11, 12, 13, 14, 18]);

/** Backend `cg_prize.ptype` / API `RecordType` — must match black-site prize history labels. */
const RECORD_TYPE_MAP: Record<number, { icon: ReactNode; textKey: string }> = {
  0: { icon: <Ticket className="h-5 w-5" />, textKey: 'recipientHistory.types.mainEth' },
  1: { icon: <Coins className="h-5 w-5" />, textKey: 'recipientHistory.types.mainCst' },
  2: { icon: <Heart className="h-5 w-5" />, textKey: 'recipientHistory.types.mainNft' },
  3: { icon: <Ticket className="h-5 w-5" />, textKey: 'recipientHistory.types.finalCstNft' },
  4: {
    icon: <Coins className="h-5 w-5" />,
    textKey: 'recipientHistory.types.finalCstRecognition',
  },
  5: { icon: <Trophy className="h-5 w-5" />, textKey: 'recipientHistory.types.enduranceNft' },
  6: {
    icon: <Coins className="h-5 w-5" />,
    textKey: 'recipientHistory.types.enduranceRecognition',
  },
  7: { icon: <Trophy className="h-5 w-5" />, textKey: 'recipientHistory.types.chronoEth' },
  8: { icon: <Coins className="h-5 w-5" />, textKey: 'recipientHistory.types.chronoCst' },
  9: { icon: <Ticket className="h-5 w-5" />, textKey: 'recipientHistory.types.chronoNft' },
  10: {
    icon: <Trophy className="h-5 w-5" />,
    textKey: 'recipientHistory.types.participantStellarEth',
  },
  11: {
    icon: <Coins className="h-5 w-5" />,
    textKey: 'recipientHistory.types.participantStellarCst',
  },
  12: {
    icon: <Layers className="h-5 w-5" />,
    textKey: 'recipientHistory.types.participantStellarNft',
  },
  13: {
    icon: <Coins className="h-5 w-5" />,
    textKey: 'recipientHistory.types.anchorStellarCst',
  },
  14: {
    icon: <Layers className="h-5 w-5" />,
    textKey: 'recipientHistory.types.anchorStellarNft',
  },
  15: {
    icon: <Ticket className="h-5 w-5" />,
    textKey: 'recipientHistory.types.anchorDistributionEth',
  },
  16: {
    icon: <Heart className="h-5 w-5" />,
    textKey: 'recipientHistory.types.attachedNftRetrieval',
  },
  17: {
    icon: <Coins className="h-5 w-5" />,
    textKey: 'recipientHistory.types.attachedErc20Retrieval',
  },
  18: {
    icon: <Trophy className="h-5 w-5" />,
    textKey: 'recipientHistory.types.stellarEthRetrieval',
  },
};

const ETH_RECORD_TYPES = new Set([0, 7, 10, 15, 18]);
const CST_RECORD_TYPES = new Set([1, 4, 6, 8, 11, 13]);
const NFT_RECORD_TYPES = new Set([2, 3, 5, 9, 12, 14, 16]);

function formatAllocationAmount(
  recordType: number,
  amountEth: number | undefined,
  notApplicable: string,
): string {
  if (NFT_RECORD_TYPES.has(recordType)) {
    return notApplicable;
  }
  if (ETH_RECORD_TYPES.has(recordType)) {
    return `${(amountEth ?? 0).toFixed(4)} ETH`;
  }
  if (recordType === 17) {
    return `${(amountEth ?? 0).toFixed(4)} (ERC-20)`;
  }
  if (CST_RECORD_TYPES.has(recordType)) {
    return `${Math.round(amountEth ?? 0)} CST`;
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
  const t = useTranslations('tables');
  const locale = useLocale();
  const { cosmicToken } = useContractAddresses();
  if (!history) return <TablePrimaryRow />;

  const recordType = RECORD_TYPE_MAP[history.RecordType] || {
    icon: null,
    textKey: null,
  };

  return (
    <TablePrimaryRow className={cn(!history.Claimed && showClaimedStatus && 'bg-white/[0.06]')}>
      <TablePrimaryCell>
        <div className="flex items-center">
          {recordType.icon}&nbsp;
          <span>{recordType.textKey ? t(recordType.textKey) : ' '}</span>&nbsp;
          {!history.Claimed && showClaimedStatus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-white/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('recipientHistory.unretrievedHelp')}</TooltipContent>
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
          {convertTimestampToDateTime(history.TimeStamp, false, locale)}
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
        {formatAllocationAmount(
          history.RecordType,
          history.AmountEth,
          t('recipientHistory.notApplicable'),
        )}
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
  const t = useTranslations('tables');

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
            <TablePrimaryHeadCell align="left">{t('columns.recordType')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
            {showWinnerAddr && (
              <TablePrimaryHeadCell>{t('columns.recipient')}</TablePrimaryHeadCell>
            )}
            {showRoundColumn && <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.tokenAddress')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.tokenId')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right">{t('columns.position')}</TablePrimaryHeadCell>
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
  const t = useTranslations('tables');
  const [currentPage, setCurrentPage] = useState(1);

  if (!winningHistory || winningHistory.length === 0) {
    return <p>{t('empty.history')}</p>;
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
