'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

import { GalleryNFTCard, type GalleryCardTraits, type GalleryNFTData } from './GalleryNFTCard';
import { SkeletonGrid } from './GalleryNFTCardSkeleton';
import { GalleryPagination } from './GalleryPagination';
import type { ViewMode } from './GalleryViewToggle';

interface GalleryGridProps {
  items: GalleryNFTData[];
  totalItems: number;
  loading: boolean;
  viewMode: ViewMode;
  currentPage: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  /** Collection trait index; `undefined` while it loads, `null` when unavailable. */
  collectionTraits?: CollectionTraits | null;
  onQuickView?: (tokenId: number) => void;
}

/** Slices the collection index down to what one card needs. */
export function cardTraitsFor(
  collectionTraits: CollectionTraits | null | undefined,
  tokenId: number,
): GalleryCardTraits | undefined {
  if (collectionTraits === undefined) return undefined;
  if (collectionTraits === null) return { entry: null, rarity: null, rarityTotal: 0 };
  return {
    entry: collectionTraits.byId.get(tokenId) ?? null,
    rarity: collectionTraits.rarity.byId.get(tokenId) ?? null,
    rarityTotal: collectionTraits.rarity.total,
  };
}

/** Column headings for the list layout; mirrors the row grid template. */
function GalleryListHeader() {
  const t = useTranslations('gallery');
  return (
    <div
      role="presentation"
      className={cn(
        'hidden md:grid items-center gap-3 px-2.5 pr-12 pb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/60',
        'md:grid-cols-[6rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto] lg:grid-cols-[6rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto_auto_auto]',
      )}
    >
      <span>{t('list.headers.artwork')}</span>
      <span>{t('list.headers.token')}</span>
      <span>{t('list.headers.structure')}</span>
      <span>{t('list.headers.palette')}</span>
      <span>
        {t('list.headers.spectral')} · {t('list.headers.fate')}
      </span>
      <span className="hidden lg:block">{t('list.headers.chaos')}</span>
      <span className="hidden lg:block">{t('list.headers.allocation')}</span>
      <span className="text-right">{t('list.headers.cycle')}</span>
      <span>{t('list.headers.age')}</span>
    </div>
  );
}

/** Paginated grid or list of gallery cards with loading and empty states. */
export function GalleryGrid({
  items,
  totalItems,
  loading,
  viewMode,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
  collectionTraits,
  onQuickView,
}: GalleryGridProps) {
  const t = useTranslations('gallery');
  const totalPages = Math.ceil(totalItems / perPage);

  if (loading) {
    return <SkeletonGrid count={perPage} variant={viewMode} />;
  }

  if (items.length === 0) {
    return <EmptyState title={t('empty.title')} description={t('empty.description')} />;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${currentPage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
              : 'space-y-2',
          )}
        >
          {viewMode === 'list' ? <GalleryListHeader /> : null}
          {items.map((nft, i) => (
            <GalleryNFTCard
              key={nft.TokenId}
              nft={nft}
              index={i}
              variant={viewMode}
              traits={cardTraitsFor(collectionTraits, nft.TokenId)}
              onQuickView={onQuickView}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      <GalleryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        perPage={perPage}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
      />
    </>
  );
}
