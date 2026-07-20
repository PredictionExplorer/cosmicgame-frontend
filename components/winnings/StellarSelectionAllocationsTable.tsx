import { useState, useEffect } from 'react';
import { Tr, Tbody } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, convertTimestampToDateTime, formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
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
import { useNow } from '@/hooks/useNow';

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
  const t = useTranslations('myPages');
  const locale = useLocale();
  const { TxHash, TimeStamp, RoundNum, Amount, WinnerAddr, Claimed } = winning;
  const nowSec = Math.ceil(useNow(1000) / 1000);

  if (!winning) return <TablePrimaryRow />;

  const isExpired = roundTimeout > 0 && roundTimeout < nowSec;
  const expirationLabel = roundTimeout
    ? isExpired
      ? t('stellarSelectionAllocations.expired', {
          date: convertTimestampToDateTime(roundTimeout, false, locale),
        })
      : t('stellarSelectionAllocations.remaining', {
          date: convertTimestampToDateTime(roundTimeout, false, locale),
          remaining: formatSeconds(roundTimeout - nowSec, locale),
        })
    : ' ';

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(TimeStamp, false, locale)}
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
      <TablePrimaryCell align="center">{expirationLabel}</TablePrimaryCell>
      <TablePrimaryCell align="center">{Amount.toFixed(7)}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {Claimed ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/**
 * Chrome’s Skia PDF pipeline often drops `react-super-responsive-table` output even when the
 * on-screen layout looks fine. Plain HTML + `hidden print:block` mirrors
 * {@link SpecialAllocationRecipients}’s print fallback.
 */
function StellarSelectionAllocationsPrintFallback({
  list,
  roundTimeouts,
}: {
  list: StellarSelectionAllocation[];
  roundTimeouts: Record<number, number>;
}) {
  const t = useTranslations('myPages');
  const locale = useLocale();
  const [nowSec] = useState(() => Math.ceil(Date.now() / 1000));
  if (list.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden rounded-md border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-stellar-selection-allocations-print
    >
      <table className="w-full border-collapse border border-foreground/25 text-xs">
        <thead>
          <tr>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('stellarSelectionAllocations.datetime')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('stellarSelectionAllocations.cycle')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('stellarSelectionAllocations.recipient')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('stellarSelectionAllocations.expirationDate')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('stellarSelectionAllocations.amount')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('stellarSelectionAllocations.retrieved')}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((w) => {
            const rt = roundTimeouts[w.RoundNum] ?? 0;
            const isExpired = rt > 0 && rt < nowSec;
            const expirationLabel =
              rt > 0
                ? isExpired
                  ? t('stellarSelectionAllocations.expired', {
                      date: convertTimestampToDateTime(rt, false, locale),
                    })
                  : t('stellarSelectionAllocations.remaining', {
                      date: convertTimestampToDateTime(rt, false, locale),
                      remaining: formatSeconds(rt - nowSec, locale),
                    })
                : '—';

            return (
              <tr key={w.EvtLogId}>
                <td className="border border-foreground/15 p-2">
                  {convertTimestampToDateTime(w.TimeStamp, false, locale)}
                </td>
                <td className="border border-foreground/15 p-2 text-center">{w.RoundNum}</td>
                <td className="border border-foreground/15 p-2 font-mono">
                  {shortenHex(w.WinnerAddr, 6)}
                </td>
                <td className="border border-foreground/15 p-2 text-center">{expirationLabel}</td>
                <td className="border border-foreground/15 p-2 text-center">
                  {w.Amount.toFixed(7)}
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  {w.Claimed ? t('shared.yes') : t('shared.no')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Table of stellarSelection ETH winnings with expiration countdown. */
export function StellarSelectionAllocationsTable({ list }: { list: StellarSelectionAllocation[] }) {
  const t = useTranslations('myPages');
  const stellarSelectionWalletContract = useStellarSelectionWalletContract();
  const [roundTimeouts, setRoundTimeouts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!stellarSelectionWalletContract || list.length === 0) return;

    const uniqueRounds = Array.from(new Set(list.map((w) => w.RoundNum)));

    const fetchTimeouts = async () => {
      const results = await Promise.allSettled(
        uniqueRounds.map(
          (r) =>
            stellarSelectionWalletContract.read.roundTimeoutTimesToWithdrawPrizes?.([BigInt(r)]) ??
            Promise.resolve(0n),
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
    <>
      <div className="print:hidden">
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <Tr>
                <TablePrimaryHeadCell align="left">
                  {t('stellarSelectionAllocations.datetime')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('stellarSelectionAllocations.cycle')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('stellarSelectionAllocations.recipient')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('stellarSelectionAllocations.expirationDate')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('stellarSelectionAllocations.amount')}
                </TablePrimaryHeadCell>
                <TablePrimaryHeadCell>
                  {t('stellarSelectionAllocations.retrieved')}
                </TablePrimaryHeadCell>
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
      </div>
      <StellarSelectionAllocationsPrintFallback list={list} roundTimeouts={roundTimeouts} />
    </>
  );
}
