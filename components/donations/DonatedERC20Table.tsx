import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tr } from 'react-super-responsive-table';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds, shortenHex } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import api from '@/services/api';
import type { DonatedERC20Token } from '@/services/api/types';

export type { DonatedERC20Token };

interface TokenRowProps {
  currentTime: number;
  token: DonatedERC20Token;
  handleClaim: ((roundNum: number, tokenAddr: string, amount: string) => void) | null;
}

const TokenRow = ({ currentTime, token, handleClaim }: TokenRowProps) => {
  const [roundTimeoutTimesToWithdrawPrizes, setRoundTimeoutTimesToWithdrawPrizes] = useState(0);
  const raffleWalletContract = useRaffleWalletContract();

  useEffect(() => {
    if (!raffleWalletContract) return;
    const fetchRoundTimeoutTimesToWithdrawPrizes = async () => {
      const roundTimeoutTimesToWithdrawPrizes =
        await raffleWalletContract.read.roundTimeoutTimesToWithdrawPrizes?.([token.RoundNum]);
      setRoundTimeoutTimesToWithdrawPrizes(Number(roundTimeoutTimesToWithdrawPrizes ?? 0));
    };
    fetchRoundTimeoutTimesToWithdrawPrizes();
  }, [raffleWalletContract, token.RoundNum]);

  if (!token) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', token.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(token.TimeStamp)}
        </a>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <Link
          href={`/allocation/${token.RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {token.RoundNum}
        </Link>
      </TablePrimaryCell>

      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={getExplorerUrl('address', token.TokenAddr)}
                className="text-inherit text-[inherit] font-mono"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenHex(token.TokenAddr, 6)}
              </a>
            </TooltipTrigger>
            <TooltipContent>{token.TokenAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{token.AmountDonatedEth.toFixed(2)}</TablePrimaryCell>

      <TablePrimaryCell align="center">{token.AmountClaimedEth.toFixed(2)}</TablePrimaryCell>

      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/user/${token.WinnerAddr}`}
                className="text-inherit text-[inherit] font-mono"
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortenHex(token.WinnerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{token.WinnerAddr}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{token.Claimed ? 'Yes' : 'No'}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(roundTimeoutTimesToWithdrawPrizes)}{' '}
        {roundTimeoutTimesToWithdrawPrizes < currentTime
          ? '(Expired)'
          : `(${formatSeconds(roundTimeoutTimesToWithdrawPrizes - currentTime)} left)`}
      </TablePrimaryCell>

      {handleClaim && roundTimeoutTimesToWithdrawPrizes < currentTime && (
        <TablePrimaryCell>
          {!token.Claimed && (
            <Button
              onClick={() =>
                handleClaim(token.RoundNum, token.TokenAddr, token.DonateClaimDiffEth ?? '0')
              }
              data-testid="Claim Button"
            >
              Claim
            </Button>
          )}
        </TablePrimaryCell>
      )}
    </TablePrimaryRow>
  );
};

interface DonatedERC20TableProps {
  list: DonatedERC20Token[];
  handleClaim: ((roundNum: number, tokenAddr: string, amount: string) => void) | null;
}

const DonatedERC20Table = ({ list, handleClaim }: DonatedERC20TableProps) => {
  const perPage = 5;
  const [page, setPage] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTime = await api.get_current_time();
      setCurrentTime(currentTime);
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!list || list.length === 0) {
    return <p>No donated ERC20 tokens yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Cycle #</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">Token Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Attached Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Retrieved Amount</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Recipient</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Retrieved</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
              {handleClaim && (
                <TablePrimaryHeadCell>
                  <span className="sr-only">Actions</span>
                </TablePrimaryHeadCell>
              )}
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((token, i) => (
              <TokenRow
                key={page * perPage + i}
                currentTime={currentTime}
                token={token}
                handleClaim={handleClaim}
              />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default DonatedERC20Table;
