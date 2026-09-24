'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { OctagonAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils/format';
import { isTxBusy, type TxStage } from '@/lib/txStage';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog';
import { TxStatus } from '@/components/ui/tx-status';

import { TokenPlate } from './TokenPlate';
import type { AnchorCollection } from './anchorLinks';

/** How many thumbnails the dialog lists before summarising the rest as "and N more". */
const LISTED_TOKENS = 6;

/** One NFT the release covers. */
export interface ReleaseToken {
  tokenId: number;
  /** A Cosmic Signature's seed, when known (saves a lookup for its thumbnail). */
  seed?: string | number | null;
}

export interface ReleaseConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: AnchorCollection;
  /** How many anchors the release ends. */
  count: number;
  /** The NFTs being released, when the caller knows them. */
  tokens?: readonly ReleaseToken[];
  /**
   * The ETH Anchor Distributions the release retrieves (Cosmic Signature only),
   * as the indexer reports it. `null` when unknown; omit for Random Walk.
   */
  retrievableEth?: number | null;
  /** Starts the release. The dialog stays open, showing progress, until the caller closes it. */
  onConfirm: () => void;
  /** The transaction stage of the release, shown under the actions while it runs. */
  stage: TxStage;
  /** Whether `stage` belongs to this dialog's release (another flow may own the wallet). */
  showStage?: boolean;
}

/**
 * The confirmation every release goes through. Releasing an anchor returns
 * the NFT (and, for a Cosmic Signature, its accumulated ETH), and it is
 * permanent: an NFT can be anchored only once. The dialog names the NFTs,
 * estimates the ETH, states the permanence in a critical callout, puts the
 * count on the destructive button, and focuses "Keep anchored" first.
 */
export function ReleaseConfirmDialog({
  open,
  onOpenChange,
  collection,
  count,
  tokens,
  retrievableEth,
  onConfirm,
  stage,
  showStage = true,
}: ReleaseConfirmDialogProps) {
  const t = useTranslations('anchoring');
  const busy = showStage && isTxBusy(stage);
  const listed = tokens?.slice(0, LISTED_TOKENS) ?? [];
  const hidden = (tokens?.length ?? 0) - listed.length;
  const isSignature = collection === 'cosmicSignature';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md gap-5 rounded-surface border-rule bg-surface-raised p-5 shadow-float sm:p-6"
        data-testid="release-confirm-dialog"
      >
        <DialogHeader className="space-y-2 pr-8 text-left">
          <DialogPrimitive.Title className="type-heading-3 text-foreground">
            {t('release.title', { count })}
          </DialogPrimitive.Title>
          <DialogDescription className="type-body-sm text-muted-foreground">
            {isSignature
              ? t('release.description.cosmicSignature', { count })
              : t('release.description.randomWalk', { count })}
          </DialogDescription>
        </DialogHeader>

        {listed.length > 0 ? (
          <ul className="flex flex-wrap items-end gap-3" aria-label={t('release.tokensLabel')}>
            {listed.map((token) => (
              <li key={token.tokenId} className="w-16 space-y-1">
                <TokenPlate
                  collection={collection}
                  tokenId={token.tokenId}
                  seed={token.seed}
                  alt=""
                  sizes="64px"
                />
                <span className="block type-caption font-mono tabular-nums text-subtle">
                  {formatId(token.tokenId)}
                </span>
              </li>
            ))}
            {hidden > 0 ? (
              <li className="pb-5 type-caption text-subtle">
                {t('release.more', { count: hidden })}
              </li>
            ) : null}
          </ul>
        ) : null}

        {isSignature && retrievableEth !== undefined ? (
          <dl className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-rule-faint py-3">
            <dt className="type-label text-subtle">{t('release.eth.label')}</dt>
            <dd className="type-figure-md text-foreground">
              {retrievableEth === null ? (
                t('release.eth.unknown')
              ) : (
                <>
                  <span aria-hidden>≈{' '}</span>
                  <span className="sr-only">{t('release.eth.approximately')} </span>
                  <Amount value={retrievableEth} unit="ETH" context="card" />
                </>
              )}
            </dd>
            <dd className="basis-full type-caption text-subtle">{t('release.eth.note')}</dd>
          </dl>
        ) : null}

        <div className="flex gap-3 rounded-control border-s-2 border-critical bg-critical-surface px-3.5 py-3">
          <OctagonAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-critical" />
          <p className="type-body-sm text-foreground">
            <strong className="font-semibold">{t('release.warning.title')}</strong>{' '}
            {t('release.warning.body')}
          </p>
        </div>

        {showStage && stage.status !== 'idle' ? <TxStatus stage={stage} /> : null}

        <DialogFooter className="gap-2 sm:space-x-0">
          <DialogClose asChild>
            <Button variant="outline">{t('release.keep')}</Button>
          </DialogClose>
          <Button variant="destructive" loading={busy} onClick={onConfirm}>
            {t('release.confirm', { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
