'use client';

import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { formatId } from '@/utils/format';
import { ExternalTableLink, TableLink } from '@/components/ui/data-table';

import { TokenPlate } from './TokenPlate';
import { anchorTokenHref, type AnchorCollection } from './anchorLinks';

export interface TokenCellProps {
  collection: AnchorCollection;
  tokenId: number;
  /** A Cosmic Signature's seed, when the row carries it (saves a lookup). */
  seed?: string | number | null;
  /** The table is still reading its seeds in one batch: the plate waits instead of looking up. */
  seedPending?: boolean;
  /** Show the artwork beside the number: for ledgers whose rows are artworks. */
  thumbnail?: boolean;
  /**
   * A line under the number, beside the artwork, on a phone only: the facts the record's
   * other columns hold on a wide screen ("Cycle #1 · Aug 11"), so a phone record reads as one
   * media object instead of a stack of label rows. Only with `thumbnail`; the columns it
   * repeats are `priority: 'secondary'`.
   */
  phoneCaption?: ReactNode;
}

/**
 * A token in a ledger cell: its number in mono, linking to the artwork's
 * page (the gallery detail, or randomwalknft.com in a new tab). With
 * `thumbnail`, the plate leads to the same page: a pointer shortcut out of
 * the tab order and hidden from screen readers (as on a SignatureCard), so
 * the number stays the one named link. The plate is 56px, and 96px in a
 * phone record, where it heads the record at the start edge.
 */
export function TokenCell({
  collection,
  tokenId,
  seed,
  seedPending,
  thumbnail = false,
  phoneCaption,
}: TokenCellProps) {
  const href = anchorTokenHref(collection, tokenId);
  const number = <span className="font-mono tabular-nums">{formatId(tokenId)}</span>;
  const link =
    collection === 'randomWalk' ? (
      <ExternalTableLink href={href} className={TOUCH_TARGET_TEXT_LINK_CLASS}>
        {number}
      </ExternalTableLink>
    ) : (
      <TableLink href={href} className={TOUCH_TARGET_TEXT_LINK_CLASS}>
        {number}
      </TableLink>
    );

  if (!thumbnail) return link;

  const plate = (
    <TokenPlate
      collection={collection}
      tokenId={tokenId}
      seed={seed}
      seedPending={seedPending}
      alt=""
      sizes="(max-width: 639px) 96px, 56px"
      className="w-24 sm:w-14"
    />
  );

  return (
    <span className="inline-flex items-center gap-3 text-start align-middle">
      {collection === 'randomWalk' ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          aria-hidden
          className="block shrink-0"
        >
          {plate}
        </a>
      ) : (
        <Link href={href} tabIndex={-1} aria-hidden className="block shrink-0">
          {plate}
        </Link>
      )}
      <span className="flex min-w-0 flex-col items-start gap-0.5">
        {link}
        {phoneCaption ? (
          <span className="type-caption text-subtle sm:hidden">{phoneCaption}</span>
        ) : null}
      </span>
    </span>
  );
}
