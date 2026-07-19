'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

import { GalleryNFTCard, type GalleryNFTData } from './GalleryNFTCard';
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
}

export function GalleryGrid({
  items,
  totalItems,
  loading,
  viewMode,
  currentPage,
  perPage,
  onPageChange,
  onPerPageChange,
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
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'space-y-2',
          )}
        >
          {items.map((nft, i) => (
            <GalleryNFTCard key={nft.TokenId} nft={nft} index={i} variant={viewMode} />
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
