'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCSTAnchorActions,
  useCSTAnchorDistributions,
  useGlobalRWLKAnchorImprints,
  useRWLKAnchorActions,
} from '@/hooks/useApiQuery';
import { useFormat } from '@/hooks/useFormat';

/** The anchoring hub's header counts, each the length of one or two public ledgers. */
export type AnchoringHeaderMetric = 'actions' | 'ethDeposits' | 'stellarImprints';

interface ListRead {
  data: readonly unknown[] | undefined;
  isLoading: boolean;
}

/**
 * The count of one or more list reads: `undefined` while any of them is on its way, `null`
 * when one failed with nothing to show, else the rows of all of them.
 */
export function countOfLists(reads: readonly ListRead[]): number | null | undefined {
  if (reads.every((read) => read.data !== undefined)) {
    return reads.reduce((total, read) => total + (read.data?.length ?? 0), 0);
  }
  return reads.some((read) => read.isLoading) ? undefined : null;
}

function HeaderCount({ count, href }: { count: number | null | undefined; href?: string }) {
  const t = useTranslations('common');
  const format = useFormat();
  if (count === undefined) {
    return <Skeleton as="span" className="inline-block h-[1em] w-16 align-middle" />;
  }
  if (count === null) {
    // The dash for the eye, and the reason in words for everyone (read once).
    return (
      <span className="text-muted-foreground">
        <span aria-hidden="true">—</span>
        <span className="block type-caption text-subtle">{t('status.unavailable')}</span>
      </span>
    );
  }
  // A count whose ledger lives on another page links to it, as a record value does.
  return href ? (
    <Link href={href} className="link-entity">
      {format.count(count)}
    </Link>
  ) : (
    <>{format.count(count)}</>
  );
}

function ActionsCount({ href }: { href?: string }) {
  const cst = useCSTAnchorActions();
  const rwlk = useRWLKAnchorActions();
  return <HeaderCount count={countOfLists([cst, rwlk])} href={href} />;
}

function DepositsCount({ href }: { href?: string }) {
  return <HeaderCount count={countOfLists([useCSTAnchorDistributions()])} href={href} />;
}

function ImprintsCount({ href }: { href?: string }) {
  return <HeaderCount count={countOfLists([useGlobalRWLKAnchorImprints()])} href={href} />;
}

interface AnchoringHeaderCountProps {
  metric: AnchoringHeaderMetric;
  /**
   * The count the server read, when its read succeeded: shown as is, with
   * nothing read in the browser (and no list seeded into the page just to be
   * counted). `null` when the server's read failed.
   */
  serverCount?: number | null;
  /** Where the counted records are listed, when not on this page. */
  href?: string;
}

/**
 * One count of the anchoring hub's header. The server counts the list and
 * passes the number, so the count is in the first HTML without sending the
 * list. When the server's read failed (a rate limit while the page was
 * rendered, say), the browser reads the list itself, instead of the header
 * keeping a dash for the life of the cached page: a skeleton while the read
 * is on its way, "Unavailable" only when the browser's read failed too.
 */
export function AnchoringHeaderCount({ metric, serverCount, href }: AnchoringHeaderCountProps) {
  if (typeof serverCount === 'number') return <HeaderCount count={serverCount} href={href} />;
  switch (metric) {
    case 'actions':
      return <ActionsCount href={href} />;
    case 'ethDeposits':
      return <DepositsCount href={href} />;
    case 'stellarImprints':
      return <ImprintsCount href={href} />;
  }
}
