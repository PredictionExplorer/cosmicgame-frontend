import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl, formatSeconds, shortenHex } from '@/utils';

import { Link } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  TablePrimary,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { useStellarSelectionWalletContractFactory } from '@/hooks/useStellarSelectionWalletContract';
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
  /** Stellar-selection wallet contract holding this allocation (retrieval must target it). */
  WalletAddr?: string;
}

/** The indexer can omit an allocation amount; a missing one must not crash the row. */
function formatAllocationEth(amount: number | undefined): string {
  return typeof amount === 'number' && Number.isFinite(amount) ? amount.toFixed(7) : '—';
}

function ExpirationDateTime({
  timestamp,
  nowSec,
  empty,
}: {
  timestamp: number;
  nowSec: number;
  empty: string;
}) {
  const t = useTranslations('myPages');
  const locale = useLocale();
  if (timestamp <= 0) return empty;

  return (
    <HydrationSafeDateTime timestamp={timestamp} locale={locale}>
      {(date) =>
        timestamp < nowSec
          ? t('stellarSelectionAllocations.expired', { date })
          : t('stellarSelectionAllocations.remaining', {
              date,
              remaining: formatSeconds(timestamp - nowSec, locale),
            })
      }
    </HydrationSafeDateTime>
  );
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

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('stellarSelectionAllocations.datetime')}>
        <a
          className="text-inherit text-[inherit]"
          href={getExplorerUrl('tx', TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('stellarSelectionAllocations.cycle')} align="center">
        <Link
          href={`/allocation/${RoundNum}`}
          className="text-inherit text-[inherit]"
          target="_blank"
          rel="noopener noreferrer"
        >
          {RoundNum}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('stellarSelectionAllocations.recipient')} align="center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/user/${WinnerAddr}`} className="text-inherit text-[inherit] break-all">
              {shortenHex(WinnerAddr, 6)}
            </Link>
          </TooltipTrigger>
          <TooltipContent>{WinnerAddr}</TooltipContent>
        </Tooltip>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('stellarSelectionAllocations.expirationDate')} align="center">
        <ExpirationDateTime timestamp={roundTimeout} nowSec={nowSec} empty=" " />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('stellarSelectionAllocations.amount')} align="center">
        {formatAllocationEth(Amount)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('stellarSelectionAllocations.retrieved')} align="center">
        {Claimed ? t('shared.yes') : t('shared.no')}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
}

/**
 * Chrome’s Skia PDF pipeline often drops the responsive table's output even when the
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

            return (
              <tr key={w.EvtLogId}>
                <td className="border border-foreground/15 p-2">
                  <HydrationSafeDateTime timestamp={w.TimeStamp} locale={locale} />
                </td>
                <td className="border border-foreground/15 p-2 text-center">{w.RoundNum}</td>
                <td className="border border-foreground/15 p-2 font-mono">
                  {shortenHex(w.WinnerAddr, 6)}
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  <ExpirationDateTime timestamp={rt} nowSec={nowSec} empty="—" />
                </td>
                <td className="border border-foreground/15 p-2 text-center">
                  {formatAllocationEth(w.Amount)}
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
  const getWalletContract = useStellarSelectionWalletContractFactory();
  const [roundTimeouts, setRoundTimeouts] = useState<Record<number, number>>({});

  useEffect(() => {
    if (list.length === 0) return;

    // A cycle's timeout lives in the wallet that holds its allocations
    // (allocations deposited before a wallet switch stay in the superseded
    // wallet). A cycle only ever uses one wallet, so keying by cycle is safe.
    const uniqueRounds = new Map<number, string | undefined>();
    for (const w of list) {
      if (!uniqueRounds.has(w.RoundNum)) uniqueRounds.set(w.RoundNum, w.WalletAddr);
    }
    const entries = Array.from(uniqueRounds.entries());

    const fetchTimeouts = async () => {
      const results = await Promise.allSettled(
        entries.map(([r, walletAddr]) => {
          const contract = getWalletContract(walletAddr);
          return (
            contract?.read.roundTimeoutTimesToWithdrawPrizes?.([BigInt(r)]) ?? Promise.resolve(0n)
          );
        }),
      );
      const map: Record<number, number> = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          map[entries[i]![0]] = Number(res.value);
        }
      });
      setRoundTimeouts(map);
    };

    fetchTimeouts();
  }, [getWalletContract, list]);

  return (
    <>
      <div className="print:hidden">
        <TablePrimaryContainer>
          <TablePrimary>
            <TablePrimaryHead>
              <tr>
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
              </tr>
            </TablePrimaryHead>
            <TablePrimaryBody>
              {list.map((winning) => (
                <StellarSelectionAllocationRow
                  key={winning.EvtLogId}
                  winning={winning}
                  roundTimeout={roundTimeouts[winning.RoundNum] ?? 0}
                />
              ))}
            </TablePrimaryBody>
          </TablePrimary>
        </TablePrimaryContainer>
      </div>
      <StellarSelectionAllocationsPrintFallback list={list} roundTimeouts={roundTimeouts} />
    </>
  );
}
