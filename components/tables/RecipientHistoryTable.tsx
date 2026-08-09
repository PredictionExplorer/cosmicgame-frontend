import { useState, type ReactNode } from 'react';
import { Trophy, Ticket, Heart, Layers, Coins, AlertTriangle } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, shortenHex } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Link } from '@/i18n/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CustomPagination } from '@/components/common/CustomPagination';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import {
  TablePrimaryContainer,
  TablePrimaryBody,
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
      <TablePrimaryCell label={t('columns.recordType')}>
        <div className="flex items-center">
          {recordType.icon}&nbsp;
          <span className="break-words">{recordType.textKey ? t(recordType.textKey) : ' '}</span>
          &nbsp;
          {!history.Claimed && showClaimedStatus && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label={t('recipientHistory.unretrievedAria')}
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full hover:bg-white/10"
                >
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('recipientHistory.unretrievedHelp')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a
          href={getExplorerUrl('tx', history.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit"
        >
          <HydrationSafeDateTime timestamp={history.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      {showWinnerAddr && (
        <TablePrimaryCell label={t('columns.recipient')} align="center">
          {history.WinnerAddr ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/user/${history.WinnerAddr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-inherit break-all"
                >
                  {shortenHex(history.WinnerAddr, 6)}
                </Link>
              </TooltipTrigger>
              <TooltipContent>{history.WinnerAddr}</TooltipContent>
            </Tooltip>
          ) : (
            ' '
          )}
        </TablePrimaryCell>
      )}
      {showRoundColumn && (
        <TablePrimaryCell label={t('columns.cycle')} align="center">
          <Link
            href={`/allocation/${history.RoundNum}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            {history.RoundNum}
          </Link>
        </TablePrimaryCell>
      )}
      <TablePrimaryCell label={t('columns.amount')} align="right">
        {formatAllocationAmount(
          history.RecordType,
          history.AmountEth,
          t('recipientHistory.notApplicable'),
        )}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.tokenAddress')} align="center">
        {history.RecordType === 1 ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getExplorerUrl('address', cosmicToken)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-inherit break-all"
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
                className="text-inherit break-all"
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
      <TablePrimaryCell label={t('columns.tokenId')} align="center">
        {(history.TokenId ?? -1) >= 0 ? (
          <Link
            href={`/detail/${history.TokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            {history.TokenId}
          </Link>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
      {/* An ordering index within the cycle; the card layout drops it to stay scannable. */}
      <TablePrimaryCell label={t('columns.position')} align="right" priority="secondary">
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
        <TablePrimaryHead>
          <tr>
            <TablePrimaryHeadCell align="left">{t('columns.recordType')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
            {showWinnerAddr && (
              <TablePrimaryHeadCell>{t('columns.recipient')}</TablePrimaryHeadCell>
            )}
            {showRoundColumn && <TablePrimaryHeadCell>{t('columns.cycle')}</TablePrimaryHeadCell>}
            <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.tokenAddress')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>{t('columns.tokenId')}</TablePrimaryHeadCell>
            <TablePrimaryHeadCell align="right" priority="secondary">
              {t('columns.position')}
            </TablePrimaryHeadCell>
          </tr>
        </TablePrimaryHead>
        <TablePrimaryBody>
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
        </TablePrimaryBody>
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
