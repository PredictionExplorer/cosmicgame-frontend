'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, ImageIcon, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { getSpectralSweepUrl } from '@/utils/urls';
import { formatCount } from '@/utils/format';
import { formatId } from '@/utils/format/ids';
import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey } from '@/lib/nftMetadata';
import { AnchoringIcon } from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { ArtFrame, WallLabelMeta } from '@/components/ui/art-frame';
import { signatureMedia, useSignatureAlt } from '@/components/nft/signatureArt';
import { TraitSheet } from '@/components/nft/traits';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

/** The list fields the quick view needs for one token. */
export interface NftQuickViewItem {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
  /** Anchored right now: a quiet tag in the label. */
  Staked?: boolean;
}

/** Props for {@link NftQuickView}. */
export interface NftQuickViewProps {
  /** Token to show; `null` keeps the dialog closed. */
  tokenId: number | null;
  /** Tokens reachable with the previous / next controls (usually the visible page). */
  items: readonly NftQuickViewItem[];
  onOpenChange: (open: boolean) => void;
  onNavigate: (tokenId: number) => void;
  /** `undefined` while the trait index loads, `null` when unavailable. */
  collectionTraits: CollectionTraits | null | undefined;
  /** Filter the gallery by a trait value (the dialog closes itself first). */
  onSelectTrait?: (key: CategoricalTraitKey, value: string) => void;
}

/**
 * NftQuickView — a Signature in focus without leaving the gallery. From `lg`
 * the art hangs centred on the black ground of its own column (the plate
 * never scrolls away), with the still / spectral sweep switch and previous /
 * next beneath it; the label column scrolls on its own: the name, a caption
 * (number, rarity, anchored), the way to the full page, and the same trait
 * sheet the detail page shows. Below `lg` (where the trait tiles would be
 * cramped beside the art) the two stack and the dialog scrolls. Arrow keys move through the current page; the sweep video is
 * opt-in.
 */
export function NftQuickView({
  tokenId,
  items,
  onOpenChange,
  onNavigate,
  collectionTraits,
  onSelectTrait,
}: NftQuickViewProps) {
  const t = useTranslations('traits');
  const tDetail = useTranslations('detail');
  const locale = useLocale();
  const signatureAlt = useSignatureAlt();
  // The sweep is remembered per token, so moving to another Signature
  // naturally falls back to its artwork without an effect.
  const [sweepTokenId, setSweepTokenId] = useState<number | null>(null);
  const showSweep = sweepTokenId !== null && sweepTokenId === tokenId;

  const index = useMemo(
    () => items.findIndex((item) => item.TokenId === tokenId),
    [items, tokenId],
  );
  const item = index >= 0 ? items[index] : undefined;
  const previous = index > 0 ? items[index - 1] : undefined;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : undefined;

  const open = tokenId !== null && item !== undefined;
  const id = item ? formatId(item.TokenId) : '';
  const name = item?.TokenName?.trim() || null;
  const seed = item?.Seed ?? '';
  const entry = collectionTraits?.byId.get(item?.TokenId ?? -1) ?? null;
  const rarity = collectionTraits?.rarity.byId.get(item?.TokenId ?? -1) ?? null;
  const rarityTotal = collectionTraits?.rarity.total ?? 0;
  const media = signatureMedia(seed);
  const alt = signatureAlt({ id, name, entry });

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft' && previous) {
      event.preventDefault();
      onNavigate(previous.TokenId);
    } else if (event.key === 'ArrowRight' && next) {
      event.preventDefault();
      onNavigate(next.TokenId);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onKeyDown={handleKeyDown}
        className="flex max-h-[92dvh] w-[calc(100vw-1.5rem)] max-w-5xl flex-col gap-0 overflow-y-auto overscroll-contain border-rule bg-surface-raised p-0 shadow-float sm:rounded-surface lg:grid lg:h-[min(92dvh,46rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:overflow-hidden"
        data-testid="nft-quick-view"
      >
        {item ? (
          <>
            <div className="flex shrink-0 flex-col bg-art-ground">
              <div className="flex items-center lg:min-h-0 lg:flex-1">
                {showSweep ? (
                  <video
                    key={String(seed)}
                    src={getSpectralSweepUrl(seed)}
                    controls
                    autoPlay
                    playsInline
                    loop
                    className="aspect-art w-full bg-art-ground object-contain"
                    data-testid="spectral-sweep-video"
                  />
                ) : (
                  <ArtFrame
                    sources={media ? [media.webImage, media.sourceImage] : []}
                    alt={alt}
                    unavailableLabel={tDetail('image.artworkUnavailable')}
                    unavailableDetail={id}
                    sizes="(max-width: 1023px) 100vw, 36rem"
                    // The plate sits on its own black ground: no print edge.
                    className="rounded-none shadow-none after:hidden hover:shadow-none"
                    priority
                  />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 p-3">
                {seed ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSweepTokenId(showSweep ? null : tokenId)}
                    title={t('quickView.sweepNote')}
                  >
                    {showSweep ? <ImageIcon aria-hidden /> : <Play aria-hidden />}
                    {showSweep ? t('quickView.hideSweep') : t('quickView.playSweep')}
                  </Button>
                ) : null}
                <div className="ms-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!previous}
                    onClick={() => previous && onNavigate(previous.TokenId)}
                    aria-label={t('quickView.previous')}
                  >
                    <ArrowLeft aria-hidden className="rtl:-scale-x-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!next}
                    onClick={() => next && onNavigate(next.TokenId)}
                    aria-label={t('quickView.next')}
                  >
                    <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 p-5 sm:p-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
              <div className="pe-10">
                {/* The Radix title itself: the shadcn wrapper's text-lg / font-semibold
                    defaults would outrank the display type (Clash at 24px, never bold). */}
                <DialogPrimitive.Title className="type-heading-2 text-foreground [overflow-wrap:anywhere]">
                  {name ?? t('quickView.title', { id })}
                </DialogPrimitive.Title>
                <DialogDescription className="sr-only">
                  {t('quickView.description')}
                </DialogDescription>
                <WallLabelMeta
                  className="mt-2"
                  items={[
                    // An unnamed Signature already carries its number in the title.
                    name ? <span className="type-mono">{id}</span> : null,
                    rarity && rarityTotal > 0 ? (
                      <span className="tabular-nums" data-testid="quick-view-rank">
                        {t('rarity.rankOf', {
                          rank: formatCount(rarity.rank, locale),
                          total: formatCount(rarityTotal, locale),
                        })}
                      </span>
                    ) : null,
                    item.Staked ? (
                      <span className="inline-flex items-center gap-1">
                        <AnchoringIcon aria-hidden className="size-3.5" />
                        {t('card.anchoredState')}
                      </span>
                    ) : null,
                  ]}
                />
                <Link
                  href={`/detail/${item.TokenId}`}
                  className={buttonVariants({ variant: 'outline', size: 'sm', className: 'mt-4' })}
                >
                  {t('quickView.openDetail')}
                  <ArrowRight aria-hidden className="rtl:-scale-x-100" />
                </Link>
              </div>

              {collectionTraits === undefined ? (
                <div
                  role="status"
                  className="space-y-3"
                  aria-busy="true"
                  aria-label={t('quickView.loading')}
                >
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : entry?.hasArtTraits ? (
                <TraitSheet
                  entry={entry}
                  facets={collectionTraits?.facets ?? null}
                  total={rarityTotal}
                  dense
                  onSelectTrait={
                    onSelectTrait
                      ? (key, value) => {
                          onOpenChange(false);
                          onSelectTrait(key, value);
                        }
                      : undefined
                  }
                />
              ) : (
                <p className="type-body-sm text-muted-foreground">{t('panel.unavailable')}</p>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
