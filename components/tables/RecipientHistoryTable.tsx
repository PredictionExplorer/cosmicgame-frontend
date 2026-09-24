'use client';

import { useMemo, type ReactNode } from 'react';
import { isAddress } from 'viem';
import { useLocale, useTranslations } from 'next-intl';

import { formatAddress, formatCount, formatNumber } from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';
import {
  allocationAmountUnit,
  sumAllocatedEth,
  CST_RECORD_TYPES,
  NFT_RECORD_TYPES,
} from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import {
  DataTable,
  ExternalTableLink,
  TableLink,
  TableTag,
  TxProofLink,
  type DataTableColumn,
} from '@/components/ui/data-table';
import { DateTime } from '@/components/ui/date-time';
import { UnknownValue } from '@/components/ui/unknown-value';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { WinningHistoryEntry } from '@/services/api/types';

export type { WinningHistoryEntry };

/** The allocation a record belongs to, by its backend `RecordType` (`cg_prize.ptype`). */
export type AllocationSource =
  | 'signature'
  | 'finalCstGesture'
  | 'enduranceChampion'
  | 'chronoWarrior'
  | 'stellarSelection'
  | 'anchoredStellarSelection'
  | 'anchorDistribution'
  | 'attachedNftTimeout'
  | 'attachedErc20Timeout'
  | 'stellarEthTimeout';

export const ALLOCATION_SOURCE_BY_RECORD_TYPE: Readonly<Record<number, AllocationSource>> = {
  0: 'signature',
  1: 'signature',
  2: 'signature',
  3: 'finalCstGesture',
  4: 'finalCstGesture',
  5: 'enduranceChampion',
  6: 'enduranceChampion',
  7: 'chronoWarrior',
  8: 'chronoWarrior',
  9: 'chronoWarrior',
  10: 'stellarSelection',
  11: 'stellarSelection',
  12: 'stellarSelection',
  13: 'anchoredStellarSelection',
  14: 'anchoredStellarSelection',
  15: 'anchorDistribution',
  16: 'attachedNftTimeout',
  17: 'attachedErc20Timeout',
  18: 'stellarEthTimeout',
};

/** Anchor Distribution ETH: retrieved with the anchors, not the other ETH. */
const ANCHOR_DISTRIBUTION_TYPE = 15;
/** An attached NFT from any collection, not a Cosmic Signature NFT. */
const ATTACHED_NFT_TYPE = 16;

/** The My Allocations section where a record is retrieved. */
export function retrievalSection(recordType: number): 'eth' | 'anchors' | 'nfts' | 'erc20' {
  if (recordType === ANCHOR_DISTRIBUTION_TYPE) return 'anchors';
  const unit = allocationAmountUnit(recordType);
  if (unit === 'nft') return 'nfts';
  if (unit === 'erc20') return 'erc20';
  return 'eth';
}

const isWallet = (value: string | undefined): value is string =>
  typeof value === 'string' && isAddress(value, { strict: false });

/** What a record allocated: an amount in its unit, or the NFT it refers to. */
function AllocationAsset({ record }: { record: WinningHistoryEntry }) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const tokenId = toFiniteNumber(record.TokenId);

  switch (allocationAmountUnit(record.RecordType)) {
    case 'eth':
      return (
        <Amount value={record.AmountEth} unit="ETH" context="table" unitClassName="text-subtle" />
      );
    case 'cst':
      return (
        <Amount value={record.AmountEth} unit="CST" context="card" unitClassName="text-subtle" />
      );
    case 'nft': {
      if (tokenId === null || tokenId < 0) return <span>NFT</span>;
      const label = t('recipientHistory.nft', { id: tokenId });
      if (record.RecordType === ATTACHED_NFT_TYPE && record.TokenAddress) {
        return (
          <ExternalTableLink href={getExplorerUrl('token', record.TokenAddress)}>
            {label}
          </ExternalTableLink>
        );
      }
      return <TableLink href={`/detail/${tokenId}`}>{label}</TableLink>;
    }
    case 'erc20':
      return (
        <span className="whitespace-nowrap">
          {formatNumber(toFiniteNumber(record.AmountEth), locale, { maximumFractionDigits: 4 })}{' '}
          {record.TokenAddress ? (
            <ExternalTableLink href={getExplorerUrl('token', record.TokenAddress)}>
              {formatAddress(record.TokenAddress)}
            </ExternalTableLink>
          ) : null}
        </span>
      );
    case 'unknown':
      return <UnknownValue label={t('status.unavailable')} />;
  }
}

/** Whether a record is still waiting on the recipient, with the way to retrieve it. */
function RetrievalStatus({ record }: { record: WinningHistoryEntry }) {
  const t = useTranslations('tables');
  if (record.Claimed) return <span className="text-subtle">{t('recipientHistory.retrieved')}</span>;
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      <TableTag tone="accent">{t('recipientHistory.readyToRetrieve')}</TableTag>
      <TableLink href={`/my-allocations#${retrievalSection(record.RecordType)}`}>
        {t('recipientHistory.retrieve')}
      </TableLink>
    </span>
  );
}

function Recipient({ address }: { address: string | undefined }) {
  const t = useTranslations('tables');
  if (isWallet(address)) return <AddressChip address={address} variant="plain" showCopy={false} />;
  // Anchor Distribution rows name every anchor-holder at once instead of a wallet.
  return address ? <span>{t('recipientHistory.allAnchorHolders')}</span> : null;
}

/** One recipient's allocations in a cycle, summarised. */
interface RecipientGroup {
  address: string;
  records: WinningHistoryEntry[];
  sources: AllocationSource[];
  eth: number;
  cst: number;
  nfts: WinningHistoryEntry[];
}

function groupByRecipient(records: readonly WinningHistoryEntry[]): RecipientGroup[] {
  const groups = new Map<string, RecipientGroup>();
  for (const record of records) {
    const address = record.WinnerAddr ?? '';
    const key = address.toLowerCase();
    let group = groups.get(key);
    if (!group) {
      group = { address, records: [], sources: [], eth: 0, cst: 0, nfts: [] };
      groups.set(key, group);
    }
    group.records.push(record);
    const source = ALLOCATION_SOURCE_BY_RECORD_TYPE[record.RecordType];
    if (source && !group.sources.includes(source)) group.sources.push(source);
    if (CST_RECORD_TYPES.has(record.RecordType)) {
      group.cst += toFiniteNumber(record.AmountEth) ?? 0;
    }
    if (NFT_RECORD_TYPES.has(record.RecordType)) group.nfts.push(record);
  }
  for (const group of groups.values()) group.eth = sumAllocatedEth(group.records);
  // The largest ETH allocation leads, which puts the Signature Allocation first.
  return [...groups.values()].sort((a, b) => b.eth - a.eth || b.cst - a.cst);
}

/**
 * "11.0616 ETH  1,000 CST  NFT #24": what a recipient received in the cycle.
 * The items are spaced rather than joined by separators, so a long list
 * wraps cleanly without a line that starts on a dot.
 */
function GroupSummary({ group }: { group: RecipientGroup }) {
  const parts: { key: string; node: ReactNode }[] = [];
  if (group.eth > 0) {
    parts.push({
      key: 'eth',
      node: <Amount value={group.eth} unit="ETH" context="table" unitClassName="text-subtle" />,
    });
  }
  if (group.cst > 0) {
    parts.push({
      key: 'cst',
      node: <Amount value={group.cst} unit="CST" context="card" unitClassName="text-subtle" />,
    });
  }
  for (const record of group.nfts) {
    parts.push({
      key: `nft-${record.TokenId}-${record.RecordType}`,
      node: <AllocationAsset record={record} />,
    });
  }
  return (
    <span className="inline-flex flex-wrap items-baseline justify-end gap-x-3 gap-y-1">
      {parts.map((part) => (
        <span key={part.key} className="whitespace-nowrap">
          {part.node}
        </span>
      ))}
    </span>
  );
}

/** Totals across the history: ETH, CST and NFTs received, and the cycles they came from. */
function HistorySummary({ records }: { records: readonly WinningHistoryEntry[] }) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const cst = records
    .filter((record) => CST_RECORD_TYPES.has(record.RecordType))
    .reduce((total, record) => total + (toFiniteNumber(record.AmountEth) ?? 0), 0);
  const figures: { label: string; value: ReactNode }[] = [
    {
      label: t('recipientHistory.totals.eth'),
      value: <Amount value={sumAllocatedEth(records)} unit="ETH" showUnit={false} />,
    },
    {
      label: t('recipientHistory.totals.cst'),
      value: <Amount value={cst} unit="CST" showUnit={false} />,
    },
    {
      label: t('recipientHistory.totals.nfts'),
      value: formatCount(
        records.filter((record) => NFT_RECORD_TYPES.has(record.RecordType)).length,
        locale,
      ),
    },
    {
      label: t('recipientHistory.totals.cycles'),
      value: formatCount(new Set(records.map((record) => record.RoundNum)).size, locale),
    },
  ];

  return (
    <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-rule">
      {figures.map((figure) => (
        <div key={figure.label} className="min-w-0 sm:px-6 sm:first:pl-0">
          <dt className="type-label text-subtle">{figure.label}</dt>
          <dd className="mt-1 type-figure-md text-foreground">{figure.value}</dd>
        </div>
      ))}
    </dl>
  );
}

interface RecipientHistoryTableProps extends LedgerStateProps {
  winningHistory: WinningHistoryEntry[];
  /** Mark each record retrieved or ready to retrieve, with a Retrieve link (your own history). */
  showClaimedStatus?: boolean;
  /** Show the recipient of each record. Default `true`. */
  showWinnerAddr?: boolean;
  /** Show each record's cycle. Default `true`. */
  showRoundColumn?: boolean;
  /** Rows per page. Default: the table default (20, or 10 as phone records). */
  perPage?: number;
  /**
   * `recipient`: one row per recipient with what they received and from
   * which allocations, expanding to the individual records (a cycle's ledger).
   */
  groupBy?: 'recipient';
  /** Totals above the table: ETH, CST and NFTs received, and cycles. */
  showSummary?: boolean;
}

/**
 * Allocation records: which allocation each came from, what it was (an
 * amount, or the NFT it refers to), when (linked to its transaction), and,
 * for your own history, whether it is retrieved yet.
 */
export default function RecipientHistoryTable({
  winningHistory,
  showClaimedStatus = false,
  showWinnerAddr = true,
  showRoundColumn = true,
  perPage,
  groupBy,
  showSummary = false,
  ...state
}: RecipientHistoryTableProps) {
  const t = useTranslations('tables');
  const records = useMemo(() => winningHistory ?? [], [winningHistory]);
  const sourceLabel = (recordType: number) => {
    const source = ALLOCATION_SOURCE_BY_RECORD_TYPE[recordType];
    return source ? t(`recipientHistory.sources.${source}`) : t('status.unknown');
  };

  const recordColumns = useMemo<DataTableColumn<WinningHistoryEntry>[]>(() => {
    const label = (recordType: number) => {
      const source = ALLOCATION_SOURCE_BY_RECORD_TYPE[recordType];
      return source ? t(`recipientHistory.sources.${source}`) : t('status.unknown');
    };
    const all: (DataTableColumn<WinningHistoryEntry> | false)[] = [
      {
        id: 'source',
        kind: 'text',
        header: t('columns.source'),
        value: (record) => label(record.RecordType),
        cell: (record) => <span className="text-foreground">{label(record.RecordType)}</span>,
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (record) => record.TimeStamp,
        txHash: (record) => record.TxHash,
        sortable: true,
      },
      showWinnerAddr && {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipient'),
        value: (record) => record.WinnerAddr,
        cell: (record) => <Recipient address={record.WinnerAddr} />,
      },
      showRoundColumn && {
        id: 'cycle',
        kind: 'link',
        header: t('columns.cycle'),
        value: (record) => record.RoundNum,
        href: (record) => `/allocation/${record.RoundNum}`,
        sortable: true,
      },
      {
        id: 'received',
        kind: 'amount',
        header: t('columns.received'),
        // Amounts sort by value; an NFT has no amount to compare.
        value: (record) => {
          const unit = allocationAmountUnit(record.RecordType);
          return unit === 'eth' || unit === 'cst' ? toFiniteNumber(record.AmountEth) : null;
        },
        whenBlank: 'empty',
        cell: (record) => <AllocationAsset record={record} />,
      },
      {
        id: 'position',
        kind: 'count',
        header: t('columns.position'),
        value: (record) =>
          typeof record.WinnerIndex === 'number' && record.WinnerIndex >= 0
            ? record.WinnerIndex
            : null,
        whenBlank: 'empty',
        hideWhenEmpty: true,
        // An ordering index within the cycle; phone records drop it.
        priority: 'secondary',
      },
      showClaimedStatus && {
        id: 'status',
        kind: 'text',
        header: t('columns.status'),
        align: 'end',
        value: (record) => (record.Claimed ? 1 : 0),
        cell: (record) => <RetrievalStatus record={record} />,
      },
    ];
    return all.filter((column): column is DataTableColumn<WinningHistoryEntry> => Boolean(column));
  }, [t, showWinnerAddr, showRoundColumn, showClaimedStatus]);

  const groups = useMemo(
    () => (groupBy === 'recipient' ? groupByRecipient(records) : []),
    [groupBy, records],
  );

  const groupColumns = useMemo<DataTableColumn<RecipientGroup>[]>(
    () => [
      {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipient'),
        value: (group) => group.address,
        cell: (group) => <Recipient address={group.address} />,
      },
      {
        id: 'sources',
        kind: 'text',
        header: t('columns.source'),
        value: (group) => group.sources.length,
        cell: (group) => (
          <span className="inline-flex flex-wrap justify-end gap-1 sm:justify-start">
            {group.sources.map((source) => (
              <TableTag key={source}>{t(`recipientHistory.sources.${source}`)}</TableTag>
            ))}
          </span>
        ),
      },
      {
        id: 'received',
        kind: 'amount',
        header: t('columns.received'),
        value: (group) => group.eth,
        cell: (group) => <GroupSummary group={group} />,
        sortable: true,
      },
    ],
    [t],
  );

  const summary = showSummary && records.length > 0 ? <HistorySummary records={records} /> : null;

  if (groupBy === 'recipient') {
    return (
      <div className={state.className}>
        {summary}
        <DataTable
          data={groups}
          columns={groupColumns}
          ariaLabel={t('names.allocationsByRecipient')}
          getRowKey={(group) => group.address.toLowerCase() || 'unknown'}
          emptyTitle={t('empty.history')}
          pageSize={perPage}
          layout="cards"
          renderDetails={(group) => (
            <ul className="divide-y divide-rule-faint">
              {group.records.map((record, index) => (
                <li
                  key={`${record.TxHash}-${record.RecordType}-${index}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2 type-body-sm"
                >
                  <span className="text-muted-foreground">{sourceLabel(record.RecordType)}</span>
                  <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-foreground">
                    <AllocationAsset record={record} />
                    {record.TxHash ? (
                      <TxProofLink hash={record.TxHash} className="text-muted-foreground">
                        <DateTime timestamp={record.TimeStamp} />
                      </TxProofLink>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
          detailsLabel={(group, expanded) =>
            expanded
              ? t('recipientHistory.hideRecords')
              : t('recipientHistory.showRecords', { count: group.records.length })
          }
          {...state}
          className={undefined}
        />
      </div>
    );
  }

  return (
    <div className={state.className}>
      {summary}
      <DataTable
        data={records}
        columns={recordColumns}
        ariaLabel={t('names.allocationRecords')}
        getRowKey={(record, index) =>
          `${record.TxHash ?? record.RecordType}-${record.RecordType}-${record.WinnerIndex ?? index}-${index}`
        }
        emptyTitle={t('empty.history')}
        pageSize={perPage}
        layout="cards"
        {...state}
        className={undefined}
      />
    </div>
  );
}
