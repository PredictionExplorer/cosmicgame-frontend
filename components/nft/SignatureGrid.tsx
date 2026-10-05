'use client';

import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { SkeletonNFTCard } from '@/components/ui/skeleton';

/**
 * The wall's grid: two across on phones, with gaps that keep each label with
 * its plate. Shared by every wall of works (the gallery, named NFTs, a
 * wallet's collection, the used RandomWalk NFTs); callers add the columns
 * above two. It lives apart from SignatureCard so a wall of other art does not
 * load the traits catalog.
 */
export const SIGNATURE_GRID_CLASS =
  'grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8 lg:gap-y-12';

export interface SignatureGridSkeletonProps {
  count: number;
  /** The grid's column classes (the same as the loaded grid's). */
  className?: string;
}

/** The loading grid: plates at the art's own ratio with two label lines, announced once. */
export function SignatureGridSkeleton({ count, className }: SignatureGridSkeletonProps) {
  const t = useTranslations('tables');
  return (
    <div
      role="status"
      aria-label={t('skeleton.loadingNft')}
      className={cn(SIGNATURE_GRID_CLASS, className)}
      data-testid="signature-grid-skeleton"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonNFTCard key={index} announce={false} className="rounded-none" />
      ))}
    </div>
  );
}
