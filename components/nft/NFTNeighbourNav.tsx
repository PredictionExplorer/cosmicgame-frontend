'use client';

import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { cn } from '@/lib/utils';
import { RecordPager } from '@/components/ui/record-pager';

/** The tokens either side of `tokenId`; `next` is null while the collection size is unknown. */
export interface NeighbourIds {
  previous: number | null;
  next: number | null;
}

/**
 * The neighbouring token ids. Token ids run from 0 to `total - 1`, where
 * `total` is the number of Signatures imprinted so far (the dashboard count
 * the page already has), so stepping never costs a contract read.
 */
export function neighbourIds(tokenId: number, total: number | null | undefined): NeighbourIds {
  return {
    previous: tokenId > 0 ? tokenId - 1 : null,
    next: typeof total === 'number' && tokenId < total - 1 ? tokenId + 1 : null,
  };
}

export interface NFTNeighbourNavProps {
  tokenId: number;
  /** Number of imprinted Signatures; `null` while unknown. */
  total: number | null;
  className?: string;
}

/** A token number in a pager label: the identifier face, never broken. */
function TokenNumber({ id }: { id: number }) {
  return <span className="font-mono whitespace-nowrap">{formatId(id)}</span>;
}

/**
 * NFTNeighbourNav — the previous and next Signatures ("← #000024",
 * "#000026 →") through the one RecordPager every record page uses: real
 * links named by direction and number, and the next one waits (reserving its
 * space) until the collection size is known rather than guessing.
 */
export function NFTNeighbourNav({ tokenId, total, className }: NFTNeighbourNavProps) {
  const t = useTranslations('detail');
  const tTraits = useTranslations('traits');
  const { previous, next } = neighbourIds(tokenId, total);
  const nextPending = total === null && next === null;

  return (
    <RecordPager
      data-testid="neighbour-nav"
      label={t('navigation.label')}
      previousLabel={tTraits('quickView.previous')}
      nextLabel={tTraits('quickView.next')}
      previous={
        previous !== null
          ? { href: `/detail/${previous}`, label: <TokenNumber id={previous} /> }
          : null
      }
      next={next !== null ? { href: `/detail/${next}`, label: <TokenNumber id={next} /> } : null}
      nextPending={nextPending ? <TokenNumber id={tokenId + 1} /> : undefined}
      className={cn('w-full sm:w-auto', className)}
    />
  );
}
