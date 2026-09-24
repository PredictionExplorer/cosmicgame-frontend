'use client';

import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Flame, type LucideProps } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { ImprintIcon } from '@/lib/conceptIcons';
import { formatAmount, formatCount, formatId } from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';
import { useCSTTransfers, useCTTransfers } from '@/hooks/useApiQuery';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, PageHeaderTabs, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { DataTable, TableLink, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { tabsListVariants, tabsTriggerVariants } from '@/components/ui/tabs';

import {
  ACTIVITY_DIRECTION,
  classifyTransfer,
  countByActivity,
  movesInDirection,
  sumCstTransfers,
  transferWei,
  type TransferActivity,
  type TransferDirection,
} from './transferActivity';

/** Which history: the CST token's transfers, or the Cosmic Signature NFTs'. */
export type TransferAsset = 'cst' | 'nft';

type Filter = 'all' | TransferDirection;

/** One row of either history, classified from the page address's side. */
interface TransferEntry {
  key: number;
  timestamp: number;
  txHash: string;
  activity: TransferActivity;
  counterparty: string | null;
  /** A transfer from the address to itself. */
  self: boolean;
  /** CST in base units. */
  wei: bigint | null;
  /** The NFT moved. */
  tokenId: number | null;
}

/** +1 for what came into the address, -1 for what left it. */
const signOf = (activity: TransferActivity): 1 | -1 =>
  ACTIVITY_DIRECTION[activity] === 'in' ? 1 : -1;

const ACTIVITY_ICONS: Record<TransferActivity, ComponentType<LucideProps>> = {
  imprinted: ImprintIcon,
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  consumed: Flame,
};

const HISTORY_PATH: Record<TransferAsset, string> = {
  cst: '/cosmic-token-transfer',
  nft: '/cosmic-signature-transfer',
};

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * The activity word with its glyph: the direction reads before the amount
 * does. On a phone, where the counterparty column is dropped to keep each
 * record short, a transfer's other side follows under the word (the
 * protocol's own imprints and consumptions need no second line).
 */
function ActivityCell({
  activity,
  counterparty,
}: {
  activity: TransferActivity;
  counterparty?: ReactNode;
}) {
  const t = useTranslations('myPages.transferHistory');
  const Icon = ACTIVITY_ICONS[activity];
  return (
    <span className="inline-flex flex-col items-end gap-0.5 sm:items-start">
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <Icon aria-hidden className="size-4 shrink-0 text-subtle" />
        {t(`activity.${activity}`)}
      </span>
      {counterparty ? <span className="type-caption sm:hidden">{counterparty}</span> : null}
    </span>
  );
}

function FilterGroup({ value, onChange }: { value: Filter; onChange: (next: Filter) => void }) {
  const t = useTranslations('myPages.transferHistory.filter');
  const options: Filter[] = ['all', 'in', 'out'];
  return (
    <div role="group" aria-label={t('label')} className={tabsListVariants()}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          data-state={value === option ? 'active' : 'inactive'}
          onClick={() => onChange(option)}
          className={tabsTriggerVariants()}
        >
          {t(option)}
        </button>
      ))}
    </div>
  );
}

/**
 * One address's CST or NFT transfer history: an identity header (the full
 * address to copy, its explorer page, the totals), a switch to the other
 * asset's history, and a ledger that says what each row meant for this
 * address — imprinted, received, sent or consumed — with signed CST amounts
 * and the counterparty, never a raw zero address.
 */
export function AddressTransferHistory({
  asset,
  address: rawAddress,
}: {
  asset: TransferAsset;
  address: string;
}) {
  const t = useTranslations('myPages.transferHistory');
  const tTables = useTranslations('tables');
  const tFormats = useTranslations('formats');
  const locale = useLocale();
  const address = isAddress(rawAddress, { strict: false }) ? getAddress(rawAddress) : null;
  const participantTrail = useParticipantTrail(address);
  const [filter, setFilter] = useState<Filter>('all');

  const cst = useCTTransfers(asset === 'cst' ? address : null);
  const nft = useCSTTransfers(asset === 'nft' ? address : null);
  const query = asset === 'cst' ? cst : nft;

  const entries = useMemo<TransferEntry[]>(() => {
    if (!address) return [];
    return (query.data ?? []).map((row) => {
      const record = row as Record<string, unknown>;
      const { activity, counterparty, self } = classifyTransfer(
        stringOrEmpty(record.FromAddr),
        stringOrEmpty(record.ToAddr),
        address,
      );
      return {
        key: numberOrZero(record.EvtLogId),
        timestamp: numberOrZero(record.TimeStamp),
        txHash: stringOrEmpty(record.TxHash),
        activity,
        counterparty,
        self,
        wei: asset === 'cst' ? transferWei(record.Value, record.ValueFloat) : null,
        tokenId: asset === 'nft' ? numberOrZero(record.TokenId) : null,
      };
    });
  }, [address, asset, query.data]);

  const shown = useMemo(
    () => (filter === 'all' ? entries : entries.filter((entry) => movesInDirection(entry, filter))),
    [entries, filter],
  );

  const columns = useMemo<DataTableColumn<TransferEntry>[]>(() => {
    const date: DataTableColumn<TransferEntry> = {
      id: 'date',
      kind: 'datetime',
      header: tTables('columns.date'),
      value: (entry) => entry.timestamp,
      txHash: (entry) => entry.txHash,
      year: 'auto',
      sortable: true,
    };
    const counterpartyChip = (other: string) => (
      <AddressChip address={other} variant="plain" showCopy={false} currentAddress={address} />
    );
    const activity: DataTableColumn<TransferEntry> = {
      id: 'activity',
      kind: 'text',
      header: t('columns.activity'),
      value: (entry) => t(`activity.${entry.activity}`),
      cell: (entry) => (
        <ActivityCell
          activity={entry.activity}
          counterparty={entry.counterparty ? counterpartyChip(entry.counterparty) : null}
        />
      ),
    };
    // The protocol imprints and consumes: those rows name it rather than
    // print the zero address, and a transfer's other side is its address.
    const protocolName = tFormats('address.known.protocol');
    const counterparty: DataTableColumn<TransferEntry> = {
      id: 'counterparty',
      kind: 'address',
      header: t('columns.counterparty'),
      // On a phone the activity cell carries it instead.
      priority: 'secondary',
      value: (entry) => entry.counterparty ?? protocolName,
      cell: (entry) =>
        entry.counterparty ? (
          counterpartyChip(entry.counterparty)
        ) : (
          <span className="text-subtle">{protocolName}</span>
        ),
    };
    if (asset === 'cst') {
      return [
        date,
        activity,
        counterparty,
        {
          id: 'amount',
          kind: 'amount',
          header: tTables('columns.amountCst'),
          unit: 'CST',
          // Signed from this address's side, so a column of changes adds up;
          // a transfer to itself changes nothing, so it carries no sign.
          value: (entry) =>
            entry.wei === null
              ? null
              : Number(entry.wei) * (entry.self ? 0 : signOf(entry.activity)),
          cell: (entry) =>
            entry.wei === null ? null : (
              <Amount
                value={entry.self ? entry.wei : BigInt(signOf(entry.activity)) * entry.wei}
                unit="CST"
                context="table"
                showUnit={false}
                signDisplay={entry.self ? 'never' : 'exceptZero'}
              />
            ),
          sortable: true,
        },
      ];
    }
    return [
      date,
      activity,
      {
        id: 'token',
        kind: 'link',
        header: tTables('columns.tokenId'),
        value: (entry) => entry.tokenId,
        cell: (entry) =>
          entry.tokenId === null ? null : (
            <TableLink href={`/detail/${entry.tokenId}`} className="type-mono">
              {formatId(entry.tokenId)}
            </TableLink>
          ),
        sortable: true,
      },
      counterparty,
    ];
  }, [address, asset, t, tFormats, tTables]);

  // While the history loads a figure is a skeleton; when it fails, the
  // header's unavailable dash (`null`). Totals are exact: sums of base units.
  const ready = !query.isLoading && !query.isError;
  const pending = query.isLoading ? <Skeleton className="h-7 w-24" /> : null;
  let figures: PageHeaderFigure[];
  if (asset === 'cst') {
    const totals = sumCstTransfers(entries);
    const cst = (wei: bigint) => formatAmount(wei, { unit: 'CST', locale });
    figures = [
      {
        id: 'received',
        label: t('cst.figures.received'),
        value: ready ? <Amount value={totals.received} unit="CST" /> : pending,
        caption:
          ready && totals.imprinted > 0n
            ? t('cst.figures.imprintedCaption', { amount: cst(totals.imprinted) })
            : undefined,
      },
      {
        id: 'sent',
        label: t('cst.figures.sent'),
        value: ready ? <Amount value={totals.sent} unit="CST" /> : pending,
        caption:
          ready && totals.consumed > 0n
            ? t('cst.figures.consumedCaption', { amount: cst(totals.consumed) })
            : undefined,
      },
      {
        id: 'net',
        label: t('cst.figures.net'),
        value: ready ? <Amount value={totals.net} unit="CST" signDisplay="exceptZero" /> : pending,
      },
    ];
  } else {
    const counts = countByActivity(entries);
    const count = (value: number) => (ready ? formatCount(value, locale) : pending);
    figures = [
      { id: 'imprinted', label: t('nft.figures.imprinted'), value: count(counts.imprinted) },
      { id: 'received', label: t('nft.figures.received'), value: count(counts.received) },
      { id: 'sent', label: t('nft.figures.sent'), value: count(counts.sent) },
    ];
  }

  const header = (
    <PageHeader
      section="explore"
      breadcrumbs={participantTrail}
      title={t(`${asset}.title`)}
      subtitle={t(`${asset}.lede`)}
      figures={address ? figures : undefined}
      meta={
        address ? (
          <>
            <AddressChip address={address} display="responsive" label={false} href={false} />
            <a
              href={getExplorerUrl('address', address)}
              target="_blank"
              rel="noopener noreferrer"
              className="link-quiet inline-flex min-h-6 items-center gap-1 text-muted-foreground"
            >
              {t('viewOnExplorer', { explorer: EXPLORER_NAME })}
              <ArrowUpRight aria-hidden className="size-3.5 text-subtle" />
              <span className="sr-only">{tTables('links.newTab')}</span>
            </a>
          </>
        ) : undefined
      }
      tabs={
        address ? (
          // The address's other ledger, one tab away on the header's rule.
          <PageHeaderTabs
            label={t('switcherLabel')}
            items={(['cst', 'nft'] as const).map((id) => ({
              href: `${HISTORY_PATH[id]}/${address}`,
              label: t(`${id}.title`),
              current: asset === id,
            }))}
          />
        ) : undefined
      }
    />
  );

  if (!address) {
    return (
      <LedgerPage header={header}>
        <EmptyState
          variant="page"
          headingLevel={2}
          title={t('invalidAddress.title')}
          description={t('invalidAddress.description')}
          action={
            <Link
              href="/statistics/participation"
              className="link inline-flex items-center gap-1.5 type-body-sm"
            >
              {t('invalidAddress.action')}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
      </LedgerPage>
    );
  }

  return (
    <LedgerPage header={header}>
      <DataTable
        data={shown}
        columns={columns}
        ariaLabel={t(`${asset}.title`)}
        getRowKey={(entry) => entry.key}
        initialSort={{ id: 'date', direction: 'desc' }}
        loading={query.isLoading}
        error={query.isError ? t('error') : undefined}
        onRetry={() => void query.refetch()}
        emptyTitle={t(filter === 'all' ? `${asset}.empty` : 'filter.empty')}
        emptyDescription={filter === 'all' ? t(`${asset}.emptyDescription`) : undefined}
        resetPageKey={filter}
        toolbar={
          entries.length > 0 ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <FilterGroup value={filter} onChange={setFilter} />
              <p className="type-caption text-subtle tabular-nums">
                {t('count', { count: shown.length })}
              </p>
            </div>
          ) : null
        }
      />
    </LedgerPage>
  );
}
