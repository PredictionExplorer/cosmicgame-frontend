'use client';

import { cn } from '@/lib/utils';

interface GalleryNFTCardSkeletonProps {
  variant?: 'grid' | 'list';
}

export function GalleryNFTCardSkeleton({ variant = 'grid' }: GalleryNFTCardSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 animate-pulse">
        <div className="h-14 w-24 shrink-0 rounded-lg bg-white/[0.06]" />
        <div className="flex flex-1 items-center gap-6">
          <div className="h-4 w-20 rounded bg-white/[0.06]" />
          <div className="h-4 w-32 rounded bg-white/[0.06]" />
          <div className="hidden sm:block h-4 w-16 rounded bg-white/[0.06]" />
          <div className="hidden md:block h-4 w-20 rounded bg-white/[0.06]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-pulse">
      <div className="aspect-video bg-white/[0.06]" />
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-white/[0.06]" />
          <div className="h-4 w-14 rounded bg-white/[0.06]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-24 rounded bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  variant?: 'grid' | 'list';
}

export function SkeletonGrid({ count = 12, variant = 'grid' }: SkeletonGridProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }, (_, i) => (
          <GalleryNFTCardSkeleton key={i} variant="list" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4')}>
      {Array.from({ length: count }, (_, i) => (
        <GalleryNFTCardSkeleton key={i} variant="grid" />
      ))}
    </div>
  );
}
