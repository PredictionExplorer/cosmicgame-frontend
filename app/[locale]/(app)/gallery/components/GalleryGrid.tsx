'use client';

import { SearchX } from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonTable } from '@/components/ui/skeleton';
import {
  SIGNATURE_GRID_CLASS,
  SignatureCard,
  SignatureGridSkeleton,
} from '@/components/nft/SignatureCard';

import type { ViewMode } from '../galleryQuery';

import { GalleryList } from './GalleryList';
import type { GalleryNFTData } from './galleryTypes';

/** Columns of the grid: three across once the plates can be ~300px wide. */
export function gridColumnsClass(railOpen: boolean): string {
  return railOpen ? 'xl:grid-cols-3' : 'md:grid-cols-3';
}

/** The plate's rendered width at each breakpoint, for the srcset choice. */
function gridSizes(railOpen: boolean): string {
  return railOpen
    ? '(min-width: 1280px) 20rem, (min-width: 1024px) 22rem, 50vw'
    : '(min-width: 1280px) 26rem, (min-width: 768px) 33vw, 50vw';
}

/** How many plates the first viewport shows, which load eagerly. */
const EAGER_CARDS = 3;

interface GalleryGridProps {
  items: readonly GalleryNFTData[];
  loading: boolean;
  viewMode: ViewMode;
  /** Skeleton plates while loading (the page size). */
  skeletonCount: number;
  railOpen: boolean;
  /** Collection trait index; `undefined` while it loads, `null` when unavailable. */
  collectionTraits?: CollectionTraits | null;
  /** A filter narrows the view: the empty state offers to clear it. */
  filtered: boolean;
  onClearFilters: () => void;
  onQuickView?: (tokenId: number) => void;
}

/** The page of Signatures as a wall of plates or a ledger, with its loading and empty states. */
export function GalleryGrid({
  items,
  loading,
  viewMode,
  skeletonCount,
  railOpen,
  collectionTraits,
  filtered,
  onClearFilters,
  onQuickView,
}: GalleryGridProps) {
  const t = useTranslations('gallery');
  const tTraits = useTranslations('traits');

  if (loading) {
    return viewMode === 'list' ? (
      <SkeletonTable rows={Math.min(skeletonCount, 8)} columns={6} />
    ) : (
      <SignatureGridSkeleton count={skeletonCount} className={gridColumnsClass(railOpen)} />
    );
  }

  if (items.length === 0) {
    return filtered ? (
      <EmptyState
        icon={<SearchX aria-hidden />}
        title={t('empty.title')}
        description={t('empty.description')}
        action={
          <Button variant="outline" onClick={onClearFilters}>
            {tTraits('facets.clearAll')}
          </Button>
        }
        headingLevel={2}
        className="rounded-surface border border-rule-faint"
      />
    ) : (
      <EmptyState
        title={t('empty.collectionTitle')}
        description={t('empty.collectionDescription')}
        headingLevel={2}
        className="rounded-surface border border-rule-faint"
      />
    );
  }

  if (viewMode === 'list') {
    return (
      <GalleryList items={items} collectionTraits={collectionTraits} onQuickView={onQuickView} />
    );
  }

  return (
    <ul className={cn(SIGNATURE_GRID_CLASS, gridColumnsClass(railOpen))} data-testid="gallery-grid">
      {items.map((nft, index) => (
        <li key={nft.TokenId} className="min-w-0">
          <SignatureCard
            tokenId={nft.TokenId}
            seed={nft.Seed}
            name={nft.TokenName}
            entry={
              collectionTraits === undefined
                ? undefined
                : (collectionTraits?.byId.get(nft.TokenId) ?? null)
            }
            anchored={Boolean(nft.Staked)}
            sizes={gridSizes(railOpen)}
            priority={index < EAGER_CARDS}
            onQuickView={onQuickView}
          />
        </li>
      ))}
    </ul>
  );
}
