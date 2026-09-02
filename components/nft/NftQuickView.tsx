'use client';

import { useMemo, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, ImageIcon, Play } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId, getAssetsUrl, getSpectralSweepUrl, getWebImageUrl } from '@/utils';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey } from '@/lib/nftMetadata';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import NFTImage from '@/components/nft/NFTImage';
import {
  AllocationPill,
  HueStrip,
  RarityRankChip,
  SpectralClassBadge,
  TraitSheet,
} from '@/components/nft/traits';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

/** The list fields the quick view needs for one token. */
export interface NftQuickViewItem {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
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
 * NftQuickView — a dialog that shows a Signature's full-resolution artwork
 * next to its trait sheet without leaving the gallery. Arrow keys move
 * through the current page; the spectral sweep video is opt-in.
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
  const seed = item?.Seed ?? '';
  const entry = collectionTraits?.byId.get(item?.TokenId ?? -1) ?? null;
  const rarity = collectionTraits?.rarity.byId.get(item?.TokenId ?? -1) ?? null;
  const rarityTotal = collectionTraits?.rarity.total ?? 0;

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
        className="max-h-[92vh] w-[calc(100vw-1.5rem)] max-w-5xl gap-0 overflow-y-auto border-white/[0.10] bg-[rgb(var(--cosmic-indigo-deep-rgb))] p-0 sm:rounded-2xl"
        data-testid="nft-quick-view"
      >
        {item ? (
          <div className="grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col bg-black/40 md:sticky md:top-0 md:self-start">
              <div className="relative aspect-[3456/2234] w-full overflow-hidden bg-black">
                {showSweep ? (
                  <video
                    key={String(seed)}
                    src={getSpectralSweepUrl(seed)}
                    controls
                    autoPlay
                    playsInline
                    loop
                    className="h-full w-full object-contain"
                    data-testid="spectral-sweep-video"
                  />
                ) : (
                  <NFTImage
                    src={getWebImageUrl(seed)}
                    fallbackSrc={getAssetsUrl(`cosmicsignature/0x${seed}.png`)}
                    terminalFallbackSrc={null}
                    alt={t('quickView.imageAlt', { id })}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="h-full w-full object-contain"
                    priority
                  />
                )}
                <HueStrip
                  hues={entry?.hues}
                  size="sm"
                  className="absolute inset-x-0 bottom-0 rounded-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 p-3">
                {seed ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setSweepTokenId(showSweep ? null : tokenId)}
                    title={t('quickView.sweepNote')}
                  >
                    {showSweep ? (
                      <ImageIcon className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    ) : (
                      <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                    )}
                    {showSweep ? t('quickView.hideSweep') : t('quickView.playSweep')}
                  </Button>
                ) : null}
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!previous}
                    onClick={() => previous && onNavigate(previous.TokenId)}
                    aria-label={t('quickView.previous')}
                    className="max-sm:min-w-11"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!next}
                    onClick={() => next && onNavigate(next.TokenId)}
                    aria-label={t('quickView.next')}
                    className="max-sm:min-w-11"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:p-6">
              <DialogHeader className="space-y-2 pr-8 text-left">
                <p className="font-mono text-xs text-muted-foreground">{id}</p>
                <DialogTitle className="font-display text-2xl tracking-tight">
                  {item.TokenName && item.TokenName !== ''
                    ? item.TokenName
                    : t('quickView.title', { id })}
                </DialogTitle>
                <DialogDescription>{t('quickView.description')}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2">
                <SpectralClassBadge value={entry?.spectralClass} size="md" withLabel />
                <RarityRankChip rarity={rarity} total={rarityTotal} size="md" verbose />
                <AllocationPill value={entry?.allocation} size="md" />
              </div>

              {collectionTraits === undefined ? (
                <div className="space-y-3" aria-busy="true" aria-label={t('quickView.loading')}>
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
                <p className="text-sm text-muted-foreground">{t('panel.unavailable')}</p>
              )}

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                <Button asChild size="sm" className={cn('text-xs')}>
                  <Link href={`/detail/${item.TokenId}`}>
                    {t('quickView.openDetail')}
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
