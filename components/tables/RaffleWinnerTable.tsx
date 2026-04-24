import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimaryContainer,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import type { RaffleETHDeposit, RaffleNFTWinner } from '@/services/api';

type RaffleWinnerEntry = (RaffleETHDeposit | RaffleNFTWinner) & {
  IsStaker?: boolean;
  IsRwalk?: boolean;
  Amount?: number;
  TokenId?: number | null;
  Tx?: { EvtLogId: number };
};

const WinnerRow = ({ winner }: { winner: RaffleWinnerEntry }) => {
  const {
    TxHash = '',
    TimeStamp = 0,
    WinnerAddr = '',
    RoundNum = 0,
    Amount = 0,
    IsStaker = false,
    IsRwalk = false,
    TokenId = null,
  } = winner;
  const [roundTimeoutTimesToWithdrawPrizes, setRoundTimeoutTimesToWithdrawPrizes] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes =
        await raffleWalletContract!.read.roundTimeoutTimesToWithdrawPrizes?.([RoundNum]);
      setRoundTimeoutTimesToWithdrawPrizes(Number(roundTimeoutTimesToWithdrawPrizes ?? 0));
    };

    if (raffleWalletContract) {
      fetchRoundTimeoutTimesToWithdrawPrizes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raffleWalletContract]);

  if (!winner) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${WinnerAddr}`} className="text-inherit font-mono">
                {shortenHex(WinnerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{WinnerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link href={`/prize/${RoundNum}`} className="text-inherit">
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell>
        {Amount
          ? 'ETH Deposit'
          : IsStaker && IsRwalk
            ? 'Random Walk Anchor Stellar Selection Token'
            : IsStaker && !IsRwalk
              ? 'Cosmic Signature Anchor Stellar Selection Token'
              : 'Cosmic Signature Token'}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{Amount ? `${Amount.toFixed(4)} ETH` : ' '}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {TokenId ? (
          <Link href={`/detail/${TokenId}`} className="text-inherit">
            {TokenId}
          </Link>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const RaffleWinnerTable = ({
  RaffleETHDeposits,
  RaffleNFTWinners,
}: {
  RaffleETHDeposits: RaffleWinnerEntry[];
  RaffleNFTWinners: RaffleWinnerEntry[];
}) => {
  const depositsExcludingLast = RaffleETHDeposits.slice(0, -1);
  const list = [...depositsExcludingLast, ...RaffleNFTWinners];

  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No recipients yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="12%" />
            <col width="15%" />
            <col width="9%" />
            <col width="16%" />
            <col width="15%" />
            <col width="13%" />
            <col width="10%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Winner</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Round #</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Expiration Date</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Token ID</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((winner) => (
              <WinnerRow key={winner.Tx?.EvtLogId ?? winner.EvtLogId} winner={winner} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default RaffleWinnerTable;
