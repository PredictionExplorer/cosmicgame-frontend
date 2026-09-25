'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { formatId } from '@/utils';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

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

const linkClass = cn(
  'inline-flex h-11 items-center gap-1.5 rounded-control px-2.5 text-muted-foreground no-underline',
  'transition-colors duration-[var(--duration-fast)] hover:bg-surface hover:text-foreground sm:h-9',
  '[&_svg]:size-4 [&_svg]:shrink-0',
);

/**
 * NFTNeighbourNav — labelled text links to the previous and next Signatures
 * ("← #000024", "#000026 →"). They are real links, so they prefetch, open in
 * a new tab and show their target, and the next one waits (reserving its
 * space) until the collection size is known rather than guessing.
 */
export function NFTNeighbourNav({ tokenId, total, className }: NFTNeighbourNavProps) {
  const t = useTranslations('detail');
  const tTraits = useTranslations('traits');
  const { previous, next } = neighbourIds(tokenId, total);
  const nextPending = total === null && next === null;

  return (
    <nav
      aria-label={t('navigation.label')}
      className={cn('flex w-full items-center gap-1 sm:w-auto', className)}
      data-testid="neighbour-nav"
    >
      {previous !== null ? (
        <Link href={`/detail/${previous}`} className={linkClass} data-testid="neighbour-previous">
          <ArrowLeft aria-hidden />
          <span className="sr-only">{tTraits('quickView.previous')}</span>
          <span className="font-mono whitespace-nowrap">{formatId(previous)}</span>
        </Link>
      ) : null}
      {next !== null ? (
        <Link
          href={`/detail/${next}`}
          // On a phone the pair spans the row: previous left, next right.
          className={cn(linkClass, 'ml-auto')}
          data-testid="neighbour-next"
        >
          <span className="sr-only">{tTraits('quickView.next')}</span>
          <span className="font-mono whitespace-nowrap">{formatId(next)}</span>
          <ArrowRight aria-hidden />
        </Link>
      ) : nextPending ? (
        <span aria-hidden className={cn(linkClass, 'invisible ml-auto')}>
          <span className="font-mono whitespace-nowrap">{formatId(tokenId + 1)}</span>
          <ArrowRight />
        </span>
      ) : null}
    </nav>
  );
}
