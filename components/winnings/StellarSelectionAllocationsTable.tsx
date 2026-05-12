import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tr, Tbody } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import useStellarSelectionWalletContract from '@/hooks/useStellarSelectionWalletContract';

/** A single stellarSelection ETH winning entry. */
export interface StellarSelectionAllocation {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  RoundNum: number;
  Amount: number;
  WinnerAddr: string;
  Claimed: boolean;
}

/** A single row displaying one stellarSelection ETH winning. */
function StellarSelectionAllocationRow({
  winning,
  roundTimeout,
}: {
  winning: StellarSelectionAllocation;
  roundTimeout: number;
}) {
  const { TxHash, TimeStamp, RoundNum, Amount, WinnerAddr, Claimed } = winning;

  if (!winning) return <TablePrimaryRow />;

  /* eslint-disable react-hooks/purity */
  const isExpired = roundTimeout > 0 && roundTimeout < Date.now() / 1000;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Link
          href={`/allocation/${RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${WinnerAddr}`} className="text-inherit text-[inherit]">
              {shortenHex(WinnerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {roundTimeout ? (
          <>
            {convertTimestampToDateTime(roundTimeout)}{' '}
            {isExpired
              ? '(Expired)'
              : `(${formatSeconds(roundTimeout - Math.ceil(Date.now() / 1000))})`}
          </>
        ) : (
          ' '
        )}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{Amount.toFixed(7)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{Claimed ? 'Yes' : 'No'}</TablePrimaryCell>
    </TablePrimaryRow>
  );
  /* eslint-enable react-hooks/purity */
}

/** Table of stellarSelection ETH winnings with expiration countdown. */
export function StellarSelectionAllocationsTable({ list }: { list: StellarSelectionAllocation[] }) {
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();
  const [roundTimeouts, setRoundTimeouts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!stellarSelectionWalletContract || list.length === 0) return;

    const uniqueRounds = Array.from(new Set(list.map((w) => w.RoundNum)));

    const fetchTimeouts = async () => {
      const results = await Promise.allSettled(
        uniqueRounds.map((r) =>
          stellarSelectionWalletContract.read.roundTimeoutTimesToWithdrawPrizes([BigInt(r)]),
        ),
      );
      const map: Record<number, number> = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          map[uniqueRounds[i]!] = Number(res.value);
        }
      });
      setRoundTimeouts(map);
    };

    fetchTimeouts();
  }, [stellarSelectionWalletContract, list]);

  return (
    <TablePrimaryContainer>
      <TablePrimary>
        <TablePrimaryHead>
          <Tr>
            <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Cycle</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Recipient</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Expiration Date</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Amount (ETH)</TablePrimaryHeadCell>
            <TablePrimaryHeadCell>Retrieved</TablePrimaryHeadCell>
          </Tr>
        </TablePrimaryHead>
        <Tbody>
          {list.map((winning) => (
            <StellarSelectionAllocationRow
              key={winning.EvtLogId}
              winning={winning}
              roundTimeout={roundTimeouts[winning.RoundNum] ?? 0}
            />
          ))}
        </Tbody>
      </TablePrimary>
    </TablePrimaryContainer>
  );
}
