'use client';

import { useRef, useState, type ReactNode } from 'react';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import { cn } from '@/lib/utils';
import { TablePagination } from '@/components/ui/pagination';

import { SignatureCard } from './SignatureCard';
import { SIGNATURE_GRID_CLASS, SignatureGridSkeleton } from './SignatureGrid';

/** One Signature on a wall. */
export interface SignatureWallItem {
  tokenId: number;
  seed?: string | number | null;
  name?: string | null;
  anchored?: boolean;
  /** When the token was imprinted (unix seconds), for the "Rendering" state. */
  imprintedAt?: number | null;
  /** Caption facts after the traits (how the token was received…). */
  extraMeta?: readonly ReactNode[];
}

export interface SignatureWallProps {
  items: readonly SignatureWallItem[];
  /** The collection trait index: `undefined` while it loads, `null` when unavailable. */
  collectionTraits: CollectionTraits | null | undefined;
  /** Plates while the list loads, instead of the items. */
  loading?: boolean;
  /** Signatures per page. Default 12. */
  pageSize?: number;
  /** Names the wall (a list of artworks). */
  ariaLabel: string;
  /** Column classes above two across. Default three from `md`. */
  columnsClassName?: string;
  /** The plate's rendered width at each breakpoint. */
  sizes?: string;
  className?: string;
}

const DEFAULT_SIZES = '(min-width: 1280px) 26rem, (min-width: 768px) 33vw, 50vw';

/** Signatures that load eagerly: the first row in the first viewport. */
const EAGER_CARDS = 3;

/**
 * SignatureWall — a paged wall of Signatures on their plates with wall
 * labels, for the collection pages that list artworks (named Signatures, a
 * wallet's collection). Pages are local: the list is short and the URL stays
 * the page's own.
 */
export function SignatureWall({
  items,
  collectionTraits,
  loading = false,
  pageSize = 12,
  ariaLabel,
  columnsClassName = 'md:grid-cols-3',
  sizes = DEFAULT_SIZES,
  className,
}: SignatureWallProps) {
  const [page, setPage] = useState(1);
  const wallRef = useRef<HTMLDivElement>(null);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, pageCount);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);

  if (loading) {
    return (
      <SignatureGridSkeleton
        count={Math.min(pageSize, 6)}
        className={cn(columnsClassName, className)}
      />
    );
  }

  const onPageChange = (next: number) => {
    setPage(next);
    wallRef.current?.scrollIntoView?.({ block: 'start' });
  };

  return (
    <div ref={wallRef} className={cn('scroll-mt-[var(--sticky-offset)]', className)}>
      <ul className={cn(SIGNATURE_GRID_CLASS, columnsClassName)} aria-label={ariaLabel}>
        {visible.map((item, index) => (
          <li key={item.tokenId} className="min-w-0">
            <SignatureCard
              tokenId={item.tokenId}
              seed={item.seed}
              name={item.name}
              anchored={item.anchored}
              imprintedAt={item.imprintedAt}
              extraMeta={item.extraMeta}
              entry={
                collectionTraits === undefined
                  ? undefined
                  : (collectionTraits?.byId.get(item.tokenId) ?? null)
              }
              sizes={sizes}
              priority={current === 1 && index < EAGER_CARDS}
            />
          </li>
        ))}
      </ul>
      <TablePagination
        page={current}
        pageSize={pageSize}
        total={items.length}
        onPageChange={onPageChange}
        className="mt-10 border-t border-rule-faint pt-5 sm:pl-0"
      />
    </div>
  );
}
