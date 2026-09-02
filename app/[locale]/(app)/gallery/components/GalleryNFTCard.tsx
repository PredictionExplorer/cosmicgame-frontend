'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Lock, Maximize2, Tag } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatId, getAssetsUrl, getThumbUrl } from '@/utils';

import type { NftTraitEntry, RarityInfo } from '@/lib/nftMetadata';
import { Link } from '@/i18n/navigation';
import {
  useHydrationSafeDateTime,
  useHydrationSafeNowSeconds,
} from '@/components/common/HydrationSafeDateTime';
import { cn } from '@/lib/utils';
import NFTImage from '@/components/nft/NFTImage';
import {
  AllocationPill,
  ChaosMeter,
  FateGlyph,
  HueStrip,
  RarityRankChip,
  SpectralClassBadge,
  dominantHue,
  useTraitLabels,
} from '@/components/nft/traits';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { ViewMode } from './GalleryViewToggle';

/** The indexer fields a gallery card renders. */
export interface GalleryNFTData {
  TokenId: number;
  Seed?: string | number;
  TokenName?: string;
  RoundNum?: number;
  Staked?: boolean;
  MintTimeStamp?: number;
  /** Imprint transaction time; the list API ships this rather than `MintTimeStamp`. */
  TimeStamp?: number;
}

/** Imprint time in unix seconds, from whichever field the record carries. */
function imprintTime(nft: GalleryNFTData): number | undefined {
  return nft.MintTimeStamp ?? nft.TimeStamp;
}

/** Trait context for one card, sliced from the collection index by the page. */
export interface GalleryCardTraits {
  /** `undefined` while the index loads; `null` when the token is not in it. */
  entry?: NftTraitEntry | null;
  rarity?: RarityInfo | null;
  /** Number of ranked tokens (denominator for the rank chip). */
  rarityTotal: number;
}

interface GalleryNFTCardProps {
  nft: GalleryNFTData;
  index: number;
  variant: ViewMode;
  traits?: GalleryCardTraits;
  onQuickView?: (tokenId: number) => void;
}

type AgeTranslator = (key: string, values?: Record<string, number>) => string;

/**
 * Compact relative imprint age, rendered from the `gallery.card.age` catalog
 * ("just now", "5m ago" / "刚刚", "5 分钟前").
 */
function formatImprintAge(timestamp: number, nowSeconds: number, t: AgeTranslator): string {
  const seconds = nowSeconds - timestamp;
  if (seconds < 60) return t('card.age.justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t('card.age.minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('card.age.hours', { count: hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t('card.age.days', { count: days });
  const months = Math.floor(days / 30);
  if (months < 12) return t('card.age.months', { count: months });
  return t('card.age.years', { count: Math.floor(days / 365) });
}

/** Gallery card for one Cosmic Signature: artwork, identity, status, and traits. */
export function GalleryNFTCard({ nft, index, variant, traits, onQuickView }: GalleryNFTCardProps) {
  const seed = nft.Seed ?? '';
  const fullImage = getAssetsUrl(`cosmicsignature/0x${seed}.png`);
  const hasName = Boolean(nft.TokenName && nft.TokenName !== '');
  const inner: CardInnerProps = { nft, seed, fullImage, hasName, index, traits, onQuickView };

  if (variant === 'list') {
    return <ListRow {...inner} />;
  }
  return <GridCard {...inner} />;
}

interface CardInnerProps {
  nft: GalleryNFTData;
  seed: string | number;
  fullImage: string;
  hasName: boolean;
  index: number;
  traits?: GalleryCardTraits;
  onQuickView?: (tokenId: number) => void;
}

/** Cycle chip shared by both layouts. */
function CycleChip({ cycle, className }: { cycle: number; className?: string }) {
  const t = useTranslations('traits');
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          className={cn(
            'inline-flex items-center rounded-md border border-white/[0.08] bg-black/60 px-2 py-0.5 font-mono text-[10px] font-medium text-white/80 backdrop-blur-sm cursor-help',
            className,
          )}
          aria-label={t('card.cycleLong', { n: cycle })}
        >
          <span aria-hidden>{t('card.cycleShort', { n: cycle })}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{t('card.cycleTooltip', { n: cycle })}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function StatusIcons({ nft, hasName }: { nft: GalleryNFTData; hasName: boolean }) {
  const t = useTranslations('gallery');
  return (
    <>
      {nft.Staked && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center rounded-md border border-[#9C37FD]/30 bg-[#9C37FD]/20 px-1.5 py-0.5 backdrop-blur-sm">
              <Lock className="h-3 w-3 text-[#C77DFF]" aria-hidden />
              <span className="sr-only">{t('card.tooltips.anchored')}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t('card.tooltips.anchored')}</p>
          </TooltipContent>
        </Tooltip>
      )}
      {hasName && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center rounded-md border border-[#06AEEC]/30 bg-[#06AEEC]/20 px-1.5 py-0.5 backdrop-blur-sm">
              <Tag className="h-3 w-3 text-[#35C9FF]" aria-hidden />
              <span className="sr-only">{t('card.tooltips.customName')}</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{t('card.tooltips.customName')}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </>
  );
}

/** "Structure · Palette" line, or a pending / loading state. */
function TraitSummary({ traits, className }: { traits?: GalleryCardTraits; className?: string }) {
  const t = useTranslations('traits');
  const { valueLabel } = useTraitLabels();
  if (traits?.entry === undefined) {
    return <Skeleton className={cn('h-3 w-2/3', className)} data-testid="trait-skeleton" />;
  }
  const entry = traits.entry;
  if (!entry?.hasArtTraits) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn('text-[11px] italic text-muted-foreground/50 cursor-help', className)}
            data-testid="traits-pending"
          >
            {t('card.traitsPending')}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{t('card.traitsPendingTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span
      className={cn('truncate text-xs text-muted-foreground', className)}
      data-testid="trait-summary"
    >
      {entry.structure ? valueLabel('structure', entry.structure) : null}
      {entry.structure && entry.palette ? <span className="mx-1 text-white/25">·</span> : null}
      {entry.palette ? valueLabel('palette', entry.palette) : null}
    </span>
  );
}

function GridCard({ nft, seed, fullImage, hasName, index, traits, onQuickView }: CardInnerProps) {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');
  const locale = useLocale();
  const imprinted = imprintTime(nft);
  const imprintedDate = useHydrationSafeDateTime(imprinted ?? 0, false, locale);
  const nowSeconds = useHydrationSafeNowSeconds(imprinted ?? 0);
  const entry = traits?.entry ?? null;
  const hue = dominantHue(entry?.hues);
  const glowStyle = (hue === null ? {} : { '--nft-hue': String(hue) }) as CSSProperties;
  const cycle = nft.RoundNum ?? entry?.cycle;
  const id = formatId(nft.TokenId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
      style={glowStyle}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300',
        hue === null
          ? 'hover:border-primary/30 hover:shadow-[0_0_24px_rgba(21,191,253,0.08)]'
          : 'hover:border-[hsl(var(--nft-hue)_80%_60%_/_0.4)] hover:shadow-[0_0_28px_hsl(var(--nft-hue)_80%_60%_/_0.18)]',
      )}
      data-testid="gallery-card"
    >
      <Link href={`/detail/${nft.TokenId}`} className="block">
        <div className="relative overflow-hidden">
          <div className="transition-transform duration-500 ease-out group-hover:scale-[1.03]">
            <NFTImage
              src={getThumbUrl(seed, 'card')}
              fallbackSrc={fullImage}
              alt={t('card.alt', { id })}
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent"
          />
          <div className="absolute left-2 top-2 flex items-center gap-1">
            {cycle !== undefined && cycle !== null ? <CycleChip cycle={cycle} /> : null}
          </div>
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <StatusIcons nft={nft} hasName={hasName} />
          </div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
            <SpectralClassBadge value={entry?.spectralClass} size="sm" />
            <RarityRankChip rarity={traits?.rarity} total={traits?.rarityTotal ?? 0} size="sm" />
          </div>
        </div>
        <HueStrip hues={entry?.hues} size="xs" className="rounded-none" />
        <div className="space-y-1.5 p-3">
          <div className="flex items-center justify-between gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help font-mono text-xs text-muted-foreground">{id}</span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t('card.tooltips.identifier')}</p>
              </TooltipContent>
            </Tooltip>
            {imprinted ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help text-[10px] text-muted-foreground/60">
                    {formatImprintAge(imprinted, nowSeconds, t)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{t('card.tooltips.mintedOn', { date: imprintedDate })}</p>
                </TooltipContent>
              </Tooltip>
            ) : null}
          </div>
          {hasName ? (
            <p className="truncate text-sm font-medium text-white">{nft.TokenName}</p>
          ) : null}
          <TraitSummary traits={traits} className="block" />
          {entry?.hasArtTraits ? (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 pt-0.5">
              <FateGlyph value={entry.fate} size="sm" />
              <ChaosMeter value={entry.chaos} max={entry.chaosMax} size="sm" />
              {typeof entry.syzygies === 'number' ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="img"
                      className="cursor-help font-mono text-[10px] tabular-nums text-muted-foreground"
                      aria-label={tTraits('card.syzygiesAria', { count: entry.syzygies })}
                    >
                      <span aria-hidden>⋮{entry.syzygies}</span>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="font-medium">
                      {tTraits('card.syzygiesShort', { count: entry.syzygies })}
                    </p>
                    <p className="text-muted-foreground">{tTraits('hints.syzygies')}</p>
                  </TooltipContent>
                </Tooltip>
              ) : null}
              <AllocationPill value={entry.allocation} size="sm" className="ml-auto" iconless />
            </div>
          ) : null}
        </div>
      </Link>
      {onQuickView ? (
        <button
          type="button"
          onClick={() => onQuickView(nft.TokenId)}
          aria-label={tTraits('card.quickViewAria', { id })}
          className={cn(
            'absolute right-2 top-11 inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/60 text-white/80 backdrop-blur-sm transition-all duration-200',
            'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100',
            'hover:bg-black/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          data-testid="quick-view-button"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </motion.div>
  );
}

function ListRow({ nft, seed, fullImage, hasName, index, traits, onQuickView }: CardInnerProps) {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');
  const locale = useLocale();
  const { valueLabel } = useTraitLabels();
  const imprinted = imprintTime(nft);
  const imprintedDate = useHydrationSafeDateTime(imprinted ?? 0, false, locale);
  const nowSeconds = useHydrationSafeNowSeconds(imprinted ?? 0);
  const entry = traits?.entry ?? null;
  const cycle = nft.RoundNum ?? entry?.cycle;
  const id = formatId(nft.TokenId);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: 'easeOut' }}
      className="group relative"
      data-testid="gallery-row"
    >
      <Link
        href={`/detail/${nft.TokenId}`}
        className={cn(
          'grid items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 pr-12',
          'grid-cols-[6rem_minmax(0,1fr)_auto] md:grid-cols-[6rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] lg:grid-cols-[6rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto_auto_auto]',
          'transition-all duration-200 hover:border-primary/30 hover:bg-white/[0.04]',
        )}
      >
        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg">
          <NFTImage
            src={getThumbUrl(seed, 'micro')}
            fallbackSrc={fullImage}
            alt={t('card.alt', { id })}
            className="h-full w-full object-cover"
          />
          <HueStrip
            hues={entry?.hues}
            size="xs"
            className="absolute inset-x-0 bottom-0 rounded-none"
          />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="shrink-0 cursor-help font-mono text-xs text-muted-foreground">
                  {id}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t('card.tooltips.identifier')}</p>
              </TooltipContent>
            </Tooltip>
            {hasName ? (
              <span className="truncate text-sm font-medium text-white">{nft.TokenName}</span>
            ) : (
              <span className="truncate text-sm italic text-muted-foreground/50">
                {t('card.unnamed')}
              </span>
            )}
          </div>
          <TraitSummary traits={traits} className="mt-0.5 block md:hidden" />
        </div>

        <div className="hidden min-w-0 md:block">
          {traits?.entry === undefined ? (
            <Skeleton className="h-3 w-24" />
          ) : entry?.structure ? (
            <span className="block truncate text-xs text-foreground/90">
              {valueLabel('structure', entry.structure)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </div>

        <div className="hidden min-w-0 md:block">
          {entry?.palette ? (
            <span className="flex flex-col gap-1">
              <span className="truncate text-xs text-foreground/90">
                {valueLabel('palette', entry.palette)}
              </span>
              <HueStrip hues={entry.hues} size="xs" className="max-w-[6rem]" />
            </span>
          ) : traits?.entry === undefined ? (
            <Skeleton className="h-3 w-20" />
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <SpectralClassBadge value={entry?.spectralClass} size="sm" />
          <FateGlyph value={entry?.fate} size="sm" />
        </div>

        <div className="hidden lg:block">
          <ChaosMeter value={entry?.chaos} max={entry?.chaosMax} size="sm" />
        </div>

        <div className="hidden lg:block">
          <AllocationPill value={entry?.allocation} size="sm" iconless />
        </div>

        <div className="flex items-center justify-end gap-1.5">
          <RarityRankChip rarity={traits?.rarity} total={traits?.rarityTotal ?? 0} size="sm" />
          {cycle !== undefined && cycle !== null ? (
            <CycleChip cycle={cycle} className="bg-white/[0.04] text-muted-foreground" />
          ) : null}
          <span className="hidden items-center gap-1 sm:flex">
            <StatusIcons nft={nft} hasName={hasName} />
          </span>
        </div>

        <div className="hidden md:block">
          {imprinted ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help whitespace-nowrap text-[10px] text-muted-foreground/60">
                  {formatImprintAge(imprinted, nowSeconds, t)}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{t('card.tooltips.mintedOn', { date: imprintedDate })}</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </Link>
      {onQuickView ? (
        <button
          type="button"
          onClick={() => onQuickView(nft.TokenId)}
          aria-label={tTraits('card.quickViewAria', { id })}
          className={cn(
            'absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors',
            'hover:bg-white/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          data-testid="quick-view-button"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      ) : null}
    </motion.div>
  );
}
