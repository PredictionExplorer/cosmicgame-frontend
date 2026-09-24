'use client';

import { useId, useState, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { formatId } from '@/utils/format';
import { isTxBusy, type TxStage } from '@/lib/txStage';
import type { TxResult } from '@/hooks/useTxFlow';
import { Link } from '@/i18n/navigation';
import { WallLabelMeta } from '@/components/ui/art-frame';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { TablePagination } from '@/components/ui/pagination';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonArtPlate, Skeleton } from '@/components/ui/skeleton';
import { TxStatus } from '@/components/ui/tx-status';
import { ChainGuard } from '@/components/wallet/NetworkGuard';

import { ReleaseConfirmDialog } from './ReleaseConfirmDialog';
import { TokenPlate } from './TokenPlate';
import { anchorTokenHref, type AnchorCollection } from './anchorLinks';

/**
 * The ETH a release of these anchors retrieves, as the indexer reports it:
 * `null` when any of them has no reading, so the dialog never shows a
 * partial sum as the whole.
 */
export function sumAccruedEth(items: readonly Pick<AnchorGridItem, 'accruedEth'>[]): number | null {
  let total = 0;
  for (const item of items) {
    if (item.accruedEth === null || item.accruedEth === undefined) return null;
    total += item.accruedEth;
  }
  return total;
}

/** Plates per page: fills whole rows of two, three and four columns. */
export const ANCHOR_GRID_PAGE_SIZE = 12;

/** One NFT in an anchoring grid. */
export interface AnchorGridItem {
  /**
   * What the action takes: the token id when anchoring, the anchor action id
   * when releasing (the contract releases by action).
   */
  key: number;
  tokenId: number;
  /** A Cosmic Signature's seed; `undefined` looks it up by token id. */
  seed?: string | number | null;
  /** The token's name, when it has one. */
  name?: string | null;
  /** Facts for the caption line after the token number (cycle, anchored date). */
  meta?: readonly ReactNode[];
  /** One more line under the caption: the figure that matters for this NFT (accrued ETH). */
  detail?: ReactNode;
  /** ETH the anchor has accrued (Cosmic Signature releases), for the release estimate. */
  accruedEth?: number | null;
}

export interface AnchorTokenGridProps {
  /** Stable id for the section heading (`aria-labelledby`). */
  id: string;
  collection: AnchorCollection;
  /** `anchor`: NFTs in the wallet. `release`: NFTs the wallet has anchored. */
  mode: 'anchor' | 'release';
  items: readonly AnchorGridItem[];
  title: string;
  description?: ReactNode;
  emptyTitle: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;
  /** Anchors or releases the selected keys; resolves with the transaction's outcome. */
  onCommit: (keys: number[]) => Promise<TxResult>;
  /** The stage of this grid's own transaction: idle while another flow holds the wallet. */
  stage: TxStage;
  /** A wallet flow is running anywhere on the page: selection and actions wait for it. */
  walletBusy: boolean;
  loading?: boolean;
}

/**
 * Choosing what to anchor, or what to release, by the artwork itself: a grid
 * of plates at the art's native ratio with the checkbox in the caption row,
 * never over the art. Selecting anything raises a sticky selection bar with
 * the count, Clear and the one action. Anchoring explains the wallet's
 * approval prompt before it appears; releasing always goes through
 * ReleaseConfirmDialog because it is permanent. After a confirmed
 * transaction the affected cards read "Updating" until the indexer's
 * refreshed list replaces them.
 */
export function AnchorTokenGrid({
  id,
  collection,
  mode,
  items,
  title,
  description,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onCommit,
  stage,
  walletBusy,
  loading = false,
}: AnchorTokenGridProps) {
  const t = useTranslations('anchoring');
  const tTables = useTranslations('tables');
  const headingId = `${id}-heading`;
  const [selection, setSelection] = useState<readonly number[]>([]);
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // Keys a confirmed transaction moved, until a refreshed list arrives.
  const listKey = items.map((item) => item.key).join(',');
  const [settled, setSettled] = useState<{ listKey: string; keys: readonly number[] }>({
    listKey,
    keys: [],
  });
  const settledKeys = settled.listKey === listKey ? settled.keys : [];

  const available = new Set(
    items.map((item) => item.key).filter((key) => !settledKeys.includes(key)),
  );
  // Selection survives a refresh only for NFTs that are still here.
  const selected = selection.filter((key) => available.has(key));
  const selectedItems = items.filter((item) => selected.includes(item.key));
  // This grid's own transaction is running (the bar stays up until it settles).
  const running = isTxBusy(stage);
  const pageCount = Math.max(1, Math.ceil(items.length / ANCHOR_GRID_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = items.slice(
    (currentPage - 1) * ANCHOR_GRID_PAGE_SIZE,
    currentPage * ANCHOR_GRID_PAGE_SIZE,
  );
  const allSelected = available.size > 0 && selected.length === available.size;

  const toggle = (key: number) =>
    setSelection((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  const clear = () => setSelection([]);
  const selectAll = () => setSelection([...available]);

  const commit = async () => {
    const keys = [...selected];
    const result = await onCommit(keys);
    if (result.status === 'confirmed') {
      setSettled({ listKey, keys });
      setSelection([]);
      setConfirmOpen(false);
    }
  };

  const retrievableEth =
    collection === 'cosmicSignature' ? sumAccruedEth(selectedItems) : undefined;

  const commitLabel =
    mode === 'anchor'
      ? t('picker.anchorSelected', { count: selected.length })
      : t('picker.releaseSelected', { count: selected.length });

  return (
    <section aria-labelledby={headingId} className="scroll-mt-28">
      <SectionHeader
        headingId={headingId}
        title={title}
        description={description}
        actions={
          items.length > 1 && !loading ? (
            <Button
              variant="quiet"
              size="sm"
              onClick={allSelected ? clear : selectAll}
              disabled={walletBusy}
            >
              {allSelected
                ? t('picker.clearSelection')
                : t('picker.selectAll', { count: available.size })}
            </Button>
          ) : null
        }
      />

      {loading ? (
        <AnchorGridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          variant="panel"
          headingLevel={3}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          className="rounded-surface border border-dashed border-rule"
        />
      ) : (
        <>
          <ul
            className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4"
            data-testid={`${id}-grid`}
          >
            {pageItems.map((item) => (
              <AnchorTokenCard
                key={item.key}
                collection={collection}
                item={item}
                selected={selected.includes(item.key)}
                settled={settledKeys.includes(item.key) ? mode : null}
                disabled={walletBusy}
                onToggle={toggle}
              />
            ))}
          </ul>

          <TablePagination
            page={currentPage}
            pageSize={ANCHOR_GRID_PAGE_SIZE}
            total={items.length}
            onPageChange={setPage}
            label={tTables('pagination.labelFor', { table: title })}
            className="mt-6"
          />
        </>
      )}

      {selected.length > 0 || running ? (
        <SelectionBar
          label={t('picker.selectionLabel', { title })}
          count={selected.length}
          note={mode === 'anchor' ? t('picker.approvalNote') : t('picker.releaseNote')}
          onClear={clear}
          clearDisabled={walletBusy}
          stage={confirmOpen ? null : stage}
          action={
            <ChainGuard explain={false}>
              <Button
                variant={mode === 'anchor' ? 'commit' : 'destructive'}
                loading={running && !confirmOpen}
                disabled={selected.length === 0 || (walletBusy && !running)}
                onClick={mode === 'anchor' ? commit : () => setConfirmOpen(true)}
              >
                {commitLabel}
              </Button>
            </ChainGuard>
          }
        />
      ) : null}

      {mode === 'release' ? (
        <ReleaseConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          collection={collection}
          count={selected.length}
          tokens={selectedItems.map((item) => ({ tokenId: item.tokenId, seed: item.seed }))}
          retrievableEth={retrievableEth}
          onConfirm={commit}
          stage={stage}
        />
      ) : null}
    </section>
  );
}

interface AnchorTokenCardProps {
  collection: AnchorCollection;
  item: AnchorGridItem;
  selected: boolean;
  /** The confirmed action this card is waiting for the indexer to reflect. */
  settled: 'anchor' | 'release' | null;
  disabled: boolean;
  onToggle: (key: number) => void;
}

/**
 * One NFT: its plate and wall label, both labels for the checkbox beside
 * the title, and an arrow to the artwork's own page. An unnamed token's
 * title already carries its number, so the caption line does not repeat it.
 */
function AnchorTokenCard({
  collection,
  item,
  selected,
  settled,
  disabled,
  onToggle,
}: AnchorTokenCardProps) {
  const t = useTranslations('anchoring');
  const checkboxId = useId();
  const number = formatId(item.tokenId);
  const name = item.name?.trim() || null;
  const numberedTitle =
    collection === 'randomWalk'
      ? t('art.randomWalkTitle', { id: number })
      : t('art.signatureTitle', { id: number });
  const title = name ?? numberedTitle;
  const href = anchorTokenHref(collection, item.tokenId);
  const external = collection === 'randomWalk';
  const locked = disabled || settled !== null;
  const openLabel = t('picker.open', { title: numberedTitle });
  const openClass = cn(
    'inline-flex size-6 shrink-0 items-center justify-center rounded-control text-subtle',
    'transition-colors duration-[var(--duration-fast)] hover:text-foreground',
    TOUCH_TARGET_EXTENDED_CLASS,
  );

  const openLink = external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={openClass}
      data-touch-target="extended"
      aria-label={`${openLabel} ${t('picker.opensNewTab')}`}
    >
      <ArrowUpRight aria-hidden className="size-4" />
    </a>
  ) : (
    <Link href={href} className={openClass} data-touch-target="extended" aria-label={openLabel}>
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );

  return (
    <li
      data-selected={selected || undefined}
      data-settled={settled ?? undefined}
      className="group/card min-w-0"
    >
      <label
        htmlFor={checkboxId}
        className={cn(
          'block rounded-edge outline outline-2 outline-offset-[3px] outline-transparent',
          'transition-[outline-color,opacity] duration-[var(--duration-fast)]',
          'group-data-[selected]/card:outline-primary group-has-[input:focus-visible]/card:outline-ring',
          locked ? 'cursor-default' : 'cursor-pointer',
          settled && 'opacity-60',
        )}
      >
        <TokenPlate
          collection={collection}
          tokenId={item.tokenId}
          seed={item.seed}
          alt=""
          sizes="(min-width: 1024px) 18rem, (min-width: 640px) 30vw, 45vw"
        />
      </label>
      <div className="mt-3 flex items-start gap-2.5">
        <Checkbox
          id={checkboxId}
          checked={selected}
          disabled={locked}
          onChange={() => onToggle(item.key)}
          className="mt-[3px]"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <label
              htmlFor={checkboxId}
              className={cn(
                'min-w-0 type-body-sm font-medium text-foreground [overflow-wrap:anywhere] sm:type-body-md',
                locked ? 'cursor-default' : 'cursor-pointer',
              )}
            >
              {/* A phone's two-column card has no room for the collection's
                  name, which the tab already gives: the number stands alone. */}
              <span className={cn('sm:hidden', !name && 'font-mono tabular-nums')}>
                {name ?? number}
              </span>
              <span className="max-sm:hidden">{title}</span>
            </label>
            {openLink}
          </div>
          <WallLabelMeta
            items={[
              name ? (
                <span key="number" className="font-mono">
                  {number}
                </span>
              ) : null,
              ...(item.meta ?? []),
            ]}
          />
          {item.detail ? (
            <p className="type-caption tabular-nums text-muted-foreground">{item.detail}</p>
          ) : null}
          {settled ? (
            <Badge tone="positive" size="sm" dot className="mt-1 self-start">
              {settled === 'anchor' ? t('picker.settled.anchored') : t('picker.settled.released')}
            </Badge>
          ) : null}
        </div>
      </div>
    </li>
  );
}

interface SelectionBarProps {
  /** Names the bar as a region ("Selection: Available to anchor"). */
  label: string;
  count: number;
  /** One sentence on what happens next (the approval prompt, the permanence). */
  note: string;
  onClear: () => void;
  clearDisabled: boolean;
  /** The running transaction, when this bar started it. */
  stage: TxStage | null;
  action: ReactNode;
}

/**
 * The floating bar of a selection: it sticks to the bottom of the viewport
 * while its section is on screen and rides along with the section otherwise,
 * so two grids on one page never stack two bars.
 */
function SelectionBar({
  label,
  count,
  note,
  onClear,
  clearDisabled,
  stage,
  action,
}: SelectionBarProps) {
  const t = useTranslations('anchoring');
  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        'sticky bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-20 mt-8',
        'motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2',
      )}
    >
      <div className="glass rounded-surface border border-rule bg-surface-raised px-4 py-3 shadow-float sm:px-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <p className="type-body-sm font-medium tabular-nums text-foreground" aria-live="polite">
            {t('picker.selected', { count })}
          </p>
          <Button variant="quiet" size="sm" onClick={onClear} disabled={clearDisabled}>
            {t('picker.clear')}
          </Button>
          <div className="ms-auto flex max-sm:w-full max-sm:[&>*]:w-full [&_button]:max-sm:w-full">
            {action}
          </div>
        </div>
        {stage && stage.status !== 'idle' ? (
          <TxStatus stage={stage} className="mt-3 border-t border-rule-faint pt-3" />
        ) : (
          <p className="mt-2 max-w-[var(--measure-lede)] type-caption text-subtle">{note}</p>
        )}
      </div>
    </div>
  );
}

/** Loading plates at the grid's own shape, so nothing moves when the NFTs arrive. */
function AnchorGridSkeleton() {
  const t = useTranslations('common');
  return (
    <div role="status" aria-label={t('status.loading')}>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <li key={index} aria-hidden className={cn(index >= 2 && 'max-sm:hidden')}>
            <SkeletonArtPlate />
            <Skeleton className="mt-3 h-4 w-2/3" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </li>
        ))}
      </ul>
    </div>
  );
}
