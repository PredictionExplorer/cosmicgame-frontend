'use client';

import { useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { ArrowDownLeft, ArrowRight, ArrowUpRight, Flame, type LucideProps } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { getAddress, isAddress } from 'viem';

import { Link } from '@/i18n/navigation';
import { EXPLORER_NAME } from '@/lib/chainGuard';
import { AnchoringIcon, ImprintIcon } from '@/lib/conceptIcons';
import { formatAmount, formatCount } from '@/utils/format';
import { getExplorerUrl } from '@/utils/urls';
import { useContractAddresses } from '@/contexts/ContractAddressesContext';
import { useCSTTransfers, useCTTransfers } from '@/hooks/useApiQuery';
import { TokenCell } from '@/components/anchoring/TokenCell';
import { useSignatureSeeds } from '@/components/anchoring/useSignatureSeeds';
import { LedgerPage } from '@/components/ledger/LedgerPage';
import { PageHeader, PageHeaderTabs, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { useParticipantTrail } from '@/components/layout/participantTrail';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import { DataTable, useTablePageSize, type DataTableColumn } from '@/components/ui/data-table';
import { EmptyState } from '@/components/ui/empty-state';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Skeleton } from '@/components/ui/skeleton';

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

const FILTERS: readonly Filter[] = ['all', 'in', 'out'];

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

/**
 * +1 for what came into the address, -1 for what left it, 0 for what moved
 * without changing hands (a transfer to itself, anchoring and release).
 */
function signOf(entry: Pick<TransferEntry, 'activity' | 'self'>): 1 | -1 | 0 {
  if (entry.self) return 0;
  const direction = ACTIVITY_DIRECTION[entry.activity];
  if (direction === null) return 0;
  return direction === 'in' ? 1 : -1;
}

const ACTIVITY_ICONS: Record<TransferActivity, ComponentType<LucideProps>> = {
  imprinted: ImprintIcon,
  received: ArrowDownLeft,
  sent: ArrowUpRight,
  consumed: Flame,
  anchored: AnchoringIcon,
  released: AnchoringIcon,
};

const HISTORY_PATH: Record<TransferAsset, string> = {
  cst: '/cosmic-token-transfer',
  nft: '/cosmic-signature-transfer',
};

/**
 * The phone counterparty line under the activity word: a real ledger link
 * (foreground ink, the quiet underline, a 24px row), not muted caption text.
 */
const PHONE_COUNTERPARTY_CLASS =
  'type-body-sm text-muted-foreground sm:hidden [&_a]:min-h-6 [&_a]:text-foreground [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-[0.2em] [&_a]:decoration-[color-mix(in_oklab,currentColor_30%,transparent)] [&_a:hover]:text-primary [&_a:hover]:decoration-current';

function numberOrZero(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

/**
 * The activity word with its glyph: the direction reads before the amount
 * does. The word sits on the row's baseline and the glyph is centred on it.
 * On a phone, where the counterparty column is dropped to keep each record
 * short, a transfer's other side follows under the word (the protocol's own
 * imprints and consumptions need no second line).
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
      <span className="inline-flex items-baseline gap-2 whitespace-nowrap">
        <Icon aria-hidden className="size-4 shrink-0 self-center text-subtle" />
        {t(`activity.${activity}`)}
      </span>
      {counterparty ? <span className={PHONE_COUNTERPARTY_CLASS}>{counterparty}</span> : null}
    </span>
  );
}

/**
 * One address's CST or NFT transfer history: an identity header (the full
 * address to copy and its explorer page directly under the title, then the
 * totals), a switch to the other asset's history, and a ledger that says what
 * each row meant for this address — imprinted, received, sent, consumed,
 * anchored or released — with signed CST amounts and the counterparty, never
 * a raw zero address.
 *
 * While the history loads, every block that the data fills keeps its final
 * shape (the figure captions, the filter bar with its count, a page of rows),
 * so nothing below the header moves when it arrives. The route seeds the
 * first read on the server, so a fresh page arrives with its ledger.
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
  const pageSize = useTablePageSize();
  const { stakingCst, stakingRwalk } = useContractAddresses();

  const cst = useCTTransfers(asset === 'cst' ? address : null);
  const nft = useCSTTransfers(asset === 'nft' ? address : null);
  const query = asset === 'cst' ? cst : nft;
  // The NFT rows are artworks but carry no seed: one collection read (the
  // gallery's) draws every row's plate.
  const { pending: seedsPending, seedFor } = useSignatureSeeds(
    asset === 'nft' && (nft.data?.length ?? 0) > 0,
  );

  const entries = useMemo<TransferEntry[]>(() => {
    if (!address) return [];
    const anchorWallets = [stakingCst, stakingRwalk];
    return (query.data ?? []).map((row) => {
      const record = row as Record<string, unknown>;
      const { activity, counterparty, self } = classifyTransfer(
        stringOrEmpty(record.FromAddr),
        stringOrEmpty(record.ToAddr),
        address,
        anchorWallets,
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
  }, [address, asset, query.data, stakingCst, stakingRwalk]);

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
      width: '12rem',
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
      width: '11rem',
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
          width: '10rem',
          // Signed from this address's side, so a column of changes adds up;
          // a transfer that changes no hands carries no sign.
          value: (entry) => (entry.wei === null ? null : Number(entry.wei) * signOf(entry)),
          cell: (entry) => {
            if (entry.wei === null) return null;
            const sign = signOf(entry);
            return (
              <Amount
                value={sign === 0 ? entry.wei : BigInt(sign) * entry.wei}
                unit="CST"
                context="table"
                showUnit={false}
                signDisplay={sign === 0 ? 'never' : 'exceptZero'}
              />
            );
          },
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
        // The artwork's plate beside its number: the rows are Signatures.
        cell: (entry) =>
          entry.tokenId === null ? null : (
            <TokenCell
              collection="cosmicSignature"
              tokenId={entry.tokenId}
              seed={seedFor(entry.tokenId)}
              seedPending={seedsPending}
              thumbnail
            />
          ),
        sortable: true,
        width: '12rem',
      },
      counterparty,
    ];
  }, [address, asset, seedFor, seedsPending, t, tFormats, tTables]);

  // While the history loads a figure is a skeleton, with its caption line
  // held open; when it fails, the header's unavailable dash (`null`). Totals
  // are exact: sums of base units.
  const loading = query.isLoading;
  const ready = !loading && !query.isError;
  const pending = loading ? <Skeleton className="h-7 w-24" /> : null;
  const pendingCaption = loading ? <Skeleton className="mt-1 h-3.5 w-28" /> : undefined;
  let figures: PageHeaderFigure[];
  if (asset === 'cst') {
    const totals = sumCstTransfers(entries);
    const cst = (wei: bigint) => formatAmount(wei, { unit: 'CST', locale });
    const caption = (amount: bigint, key: 'imprintedCaption' | 'consumedCaption') => {
      if (!ready) return pendingCaption;
      return amount > 0n ? t(`cst.figures.${key}`, { amount: cst(amount) }) : undefined;
    };
    figures = [
      {
        id: 'received',
        label: t('cst.figures.received'),
        value: ready ? <Amount value={totals.received} unit="CST" /> : pending,
        caption: caption(totals.imprinted, 'imprintedCaption'),
      },
      {
        id: 'sent',
        label: t('cst.figures.sent'),
        value: ready ? <Amount value={totals.sent} unit="CST" /> : pending,
        caption: caption(totals.consumed, 'consumedCaption'),
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
      identity={
        address ? (
          // Whose history this is, before any of its figures.
          <>
            <AddressChip
              address={address}
              variant="plain"
              display="responsive"
              label={false}
              href={false}
              className="text-foreground"
            />
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
      subtitle={t(`${asset}.lede`)}
      figures={address ? figures : undefined}
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
              className="link inline-flex min-h-11 items-center gap-1.5 type-body-sm sm:min-h-6"
            >
              {t('invalidAddress.action')}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          }
        />
      </LedgerPage>
    );
  }

  // The filter bar stands from the first paint (its count a skeleton while
  // loading); only a history that turns out empty drops it.
  const showToolbar = loading || entries.length > 0;

  return (
    <LedgerPage header={header}>
      <DataTable
        data={shown}
        columns={columns}
        ariaLabel={t(`${asset}.title`)}
        getRowKey={(entry) => entry.key}
        loading={loading}
        skeletonRows={pageSize}
        error={query.isError ? t('error') : undefined}
        onRetry={() => void query.refetch()}
        emptyTitle={t(filter === 'all' ? `${asset}.empty` : 'filter.empty')}
        emptyDescription={filter === 'all' ? t(`${asset}.emptyDescription`) : undefined}
        resetPageKey={filter}
        // Short values: the ledger keeps to a readable width instead of
        // spreading four columns across the whole screen.
        className="max-w-5xl"
        toolbar={
          showToolbar ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <SegmentedControl
                label={t('filter.label')}
                hideLabel
                options={FILTERS.map((option) => ({ value: option, label: t(`filter.${option}`) }))}
                value={filter}
                onValueChange={setFilter}
              />
              {loading ? (
                <Skeleton className="h-4 w-20" />
              ) : (
                <p className="type-caption text-subtle tabular-nums">
                  {t('count', { count: shown.length })}
                </p>
              )}
            </div>
          ) : null
        }
      />
    </LedgerPage>
  );
}
