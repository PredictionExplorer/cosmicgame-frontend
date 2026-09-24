'use client';

import { formatId } from '@/utils/format';
import { ExternalTableLink, TableLink } from '@/components/ui/data-table';

import { TokenPlate } from './TokenPlate';
import { anchorTokenHref, type AnchorCollection } from './anchorLinks';

export interface TokenCellProps {
  collection: AnchorCollection;
  tokenId: number;
  /** A Cosmic Signature's seed, when the row carries it (saves a lookup). */
  seed?: string | number | null;
  /** Show the artwork beside the number: for ledgers whose rows are artworks. */
  thumbnail?: boolean;
}

/**
 * A token in a ledger cell: its number in mono, linking to the artwork's
 * page (the gallery detail, or randomwalknft.com in a new tab), with an
 * optional 56px plate beside it. The plate is decorative; the number names
 * the token.
 */
export function TokenCell({ collection, tokenId, seed, thumbnail = false }: TokenCellProps) {
  const href = anchorTokenHref(collection, tokenId);
  const number = <span className="font-mono tabular-nums">{formatId(tokenId)}</span>;
  const link =
    collection === 'randomWalk' ? (
      <ExternalTableLink href={href}>{number}</ExternalTableLink>
    ) : (
      <TableLink href={href}>{number}</TableLink>
    );

  if (!thumbnail) return link;
  return (
    <span className="inline-flex items-center gap-3 align-middle">
      <TokenPlate
        collection={collection}
        tokenId={tokenId}
        seed={seed}
        alt=""
        sizes="56px"
        className="w-14 shrink-0"
      />
      {link}
    </span>
  );
}
