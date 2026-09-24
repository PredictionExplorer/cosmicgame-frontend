'use client';

import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils/urls';
import { formatAddress, formatCount, formatNumber } from '@/utils/format';
import { toFiniteNumber } from '@/utils/finiteNumber';
import type { DonatedERC20Token } from '@/services/api/types';
import { getDonatedErc20RawClaimAmount } from '@/utils/donatedErc20';
import { Button } from '@/components/ui/button';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { UnknownValue } from '@/components/ui/unknown-value';

import { useAttachedErc20Metadata } from './useAttachedErc20Metadata';

export type { DonatedERC20Token };

interface DonatedERC20TableProps {
  list: DonatedERC20Token[];
  /** Retrieves one token; shows a Retrieve action on rows not yet retrieved. */
  handleClaim: ((roundNum: number, tokenAddr: string, amount: string) => void) | null;
  /** Table heading level when the table stands under a section heading. */
  headingLevel?: 2 | 3 | 4;
}

/** Up to four decimals: ERC-20 amounts are arbitrary tokens, not ETH or CST. */
const TOKEN_AMOUNT: Intl.NumberFormatOptions = { maximumFractionDigits: 4 };

/** The token's symbol (read from its contract) linked to the contract on the explorer. */
function TokenCell({ address }: { address: string }) {
  const { data: metadata } = useAttachedErc20Metadata(address);
  const symbol = metadata?.symbol?.trim();
  return (
    <span className="flex min-w-0 flex-col">
      <ExternalTableLink
        href={getExplorerUrl('address', address)}
        className={symbol ? 'font-medium text-foreground' : 'type-mono'}
      >
        {symbol || formatAddress(address)}
      </ExternalTableLink>
      {symbol ? <span className="type-mono text-subtle">{formatAddress(address)}</span> : null}
    </span>
  );
}

/**
 * The ERC-20 tokens attached to gestures, as a ledger: when, which cycle,
 * the token, how much was attached and retrieved, and by whom. With
 * `handleClaim` (the Recipient's own allocations) a row not yet retrieved
 * offers Retrieve.
 */
const DonatedERC20Table = ({ list, handleClaim, headingLevel = 3 }: DonatedERC20TableProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const amount = toFiniteNumber;

  const columns: DataTableColumn<DonatedERC20Token>[] = [
    {
      id: 'date',
      header: t('attachedAssets.erc20.columns.datetime'),
      kind: 'datetime',
      value: (row) => row.TimeStamp,
      txHash: (row) => row.TxHash,
    },
    {
      id: 'cycle',
      header: t('attachedAssets.erc20.columns.cycle'),
      kind: 'count',
      value: (row) => row.RoundNum,
      cell: (row) => (
        <TableLink href={`/allocation/${row.RoundNum}`}>
          {formatCount(row.RoundNum, locale)}
        </TableLink>
      ),
    },
    {
      id: 'token',
      header: t('attachedAssets.erc20.columns.tokenAddress'),
      value: (row) => row.TokenAddr,
      cell: (row) => <TokenCell address={row.TokenAddr} />,
    },
    {
      id: 'attached',
      header: t('attachedAssets.erc20.columns.attachedAmount'),
      kind: 'count',
      value: (row) => amount(row.AmountDonatedEth),
      cell: (row) => {
        const value = amount(row.AmountDonatedEth);
        return value === null ? (
          <UnknownValue label={t('status.unavailable')} />
        ) : (
          formatNumber(value, locale, TOKEN_AMOUNT)
        );
      },
    },
    {
      id: 'retrievedAmount',
      header: t('attachedAssets.erc20.columns.retrievedAmount'),
      kind: 'count',
      value: (row) => amount(row.AmountClaimedEth),
      priority: 'secondary',
      cell: (row) => {
        const value = amount(row.AmountClaimedEth);
        return value === null ? (
          <UnknownValue label={t('status.unavailable')} />
        ) : (
          formatNumber(value, locale, TOKEN_AMOUNT)
        );
      },
    },
    {
      id: 'recipient',
      header: t('attachedAssets.erc20.columns.recipient'),
      kind: 'address',
      value: (row) => row.WinnerAddr || null,
      whenBlank: 'empty',
      priority: 'secondary',
    },
    {
      id: 'retrieved',
      header: t('attachedAssets.erc20.columns.retrieved'),
      kind: 'status',
      value: (row) => (row.Claimed ? 1 : 0),
      cell: (row) =>
        row.Claimed ? (
          <span className="inline-flex items-center gap-1.5 text-positive">
            <Check aria-hidden className="size-4" />
            {t('attachedAssets.status.yes')}
          </span>
        ) : (
          <span className="text-muted-foreground">{t('attachedAssets.status.no')}</span>
        ),
    },
  ];

  if (handleClaim) {
    columns.push({
      id: 'retrieve',
      header: <span className="sr-only">{t('attachedAssets.aria.actions')}</span>,
      label: '',
      align: 'end',
      cell: (row) =>
        row.Claimed ? null : (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleClaim(row.RoundNum, row.TokenAddr, getDonatedErc20RawClaimAmount(row))
            }
            data-testid="Claim Button"
          >
            {t('attachedAssets.actions.claim')}
          </Button>
        ),
    });
  }

  return (
    <>
      <div className="print:hidden">
        <DataTable
          data={list}
          columns={columns}
          ariaLabel={t('attachedAssets.erc20.ariaLabel')}
          getRowKey={(row, index) => `${row.EvtLogId}-${row.TxHash}-${row.TokenAddr}-${index}`}
          emptyTitle={t('attachedAssets.erc20.empty')}
          headingLevel={headingLevel}
        />
      </div>
      <AttachedERC20PrintFallback list={list} />
    </>
  );
};

/** Plain table for Save as PDF (Skia often drops responsive-table output). */
function AttachedERC20PrintFallback({ list }: { list: DonatedERC20Token[] }) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const printAmount = (value: unknown) => {
    const numeric = toFiniteNumber(value);
    return numeric === null ? '—' : formatNumber(numeric, locale, TOKEN_AMOUNT);
  };

  return (
    <div
      aria-hidden="true"
      className="hidden rounded-control border-2 border-foreground/40 bg-background p-4 text-sm text-foreground shadow-none [print-color-adjust:exact] print:block"
      data-attached-erc20-print
    >
      <table className="w-full border-collapse border border-foreground/25 type-caption">
        <thead>
          <tr>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.datetime')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.cycle')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.tokenAddress')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.attachedAmount')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.retrievedAmount')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-left font-semibold">
              {t('attachedAssets.erc20.columns.recipient')}
            </th>
            <th scope="col" className="border border-foreground/20 p-2 text-center font-semibold">
              {t('attachedAssets.erc20.columns.retrieved')}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.map((token) => (
            <tr key={`${token.EvtLogId}-${token.TxHash}-${token.TokenAddr}`}>
              <td className="border border-foreground/15 p-2">
                <DateTime timestamp={token.TimeStamp} variant="full" />
              </td>
              <td className="border border-foreground/15 p-2 text-center">{token.RoundNum}</td>
              <td className="border border-foreground/15 p-2 font-mono break-all">
                {token.TokenAddr}
              </td>
              <td className="border border-foreground/15 p-2 text-center">
                {printAmount(token.AmountDonatedEth)}
              </td>
              <td className="border border-foreground/15 p-2 text-center">
                {printAmount(token.AmountClaimedEth)}
              </td>
              <td className="border border-foreground/15 p-2 font-mono break-all">
                {token.WinnerAddr || '—'}
              </td>
              <td className="border border-foreground/15 p-2 text-center">
                {token.Claimed ? t('attachedAssets.status.yes') : t('attachedAssets.status.no')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DonatedERC20Table;
