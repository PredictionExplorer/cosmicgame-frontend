'use client';

import type { ReactNode } from 'react';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import { cn } from '@/lib/utils';

import { PagedWall } from './PagedWall';
import { SignatureCard, type SignatureCardSelect } from './SignatureCard';
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
  /** Caption lines after the card's link, for facts with links of their own. */
  after?: ReactNode;
}

export interface SignatureWallProps {
  items: readonly SignatureWallItem[];
  /** The collection trait index: `undefined` while it loads, `null` when unavailable. */
  collectionTraits: CollectionTraits | null | undefined;
  /** Plates while the list loads, instead of the items. */
  loading?: boolean;
  /** Signatures per page. Default 12. */
  pageSize?: number;
  /** The page in the URL (`useWallPage`); without it the wall keeps its own. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** Shown instead of the wall (a read that failed with nothing loaded). */
  error?: ReactNode;
  /** Shown when there is nothing to hang. */
  empty?: ReactNode;
  /** Select mode: each card's checkbox and state, by token id. */
  select?: (item: SignatureWallItem) => SignatureCardSelect;
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
 * wallet's collection), on the shared `PagedWall`. Give it `page` and
 * `onPageChange` from `useWallPage` so the page is a place in the URL and
 * Back from a Signature returns to it.
 */
export function SignatureWall({
  items,
  collectionTraits,
  loading = false,
  pageSize = 12,
  page,
  onPageChange,
  error,
  empty,
  select,
  ariaLabel,
  columnsClassName = 'md:grid-cols-3',
  sizes = DEFAULT_SIZES,
  className,
}: SignatureWallProps) {
  return (
    <PagedWall
      items={items}
      itemKey={(item) => item.tokenId}
      renderItem={(item, { eager }) => (
        <SignatureCard
          tokenId={item.tokenId}
          seed={item.seed}
          name={item.name}
          anchored={item.anchored}
          imprintedAt={item.imprintedAt}
          extraMeta={item.extraMeta}
          after={item.after}
          select={select?.(item)}
          entry={
            collectionTraits === undefined
              ? undefined
              : (collectionTraits?.byId.get(item.tokenId) ?? null)
          }
          sizes={sizes}
          priority={eager}
        />
      )}
      pageSize={pageSize}
      page={page}
      onPageChange={onPageChange}
      gridClassName={cn(SIGNATURE_GRID_CLASS, columnsClassName)}
      ariaLabel={ariaLabel}
      eagerCount={EAGER_CARDS}
      loading={loading}
      loadingState={
        <SignatureGridSkeleton
          count={Math.min(pageSize, 6)}
          className={cn(columnsClassName, className)}
        />
      }
      error={error}
      empty={empty}
      className={className}
    />
  );
}
