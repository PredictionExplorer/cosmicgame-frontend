'use client';

import { useTranslations } from 'next-intl';

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

function HeaderCount({ count }: { count: number | null | undefined }) {
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
  return <>{format.count(count)}</>;
}

function ActionsCount() {
  const cst = useCSTAnchorActions();
  const rwlk = useRWLKAnchorActions();
  return <HeaderCount count={countOfLists([cst, rwlk])} />;
}

function DepositsCount() {
  return <HeaderCount count={countOfLists([useCSTAnchorDistributions()])} />;
}

function ImprintsCount() {
  return <HeaderCount count={countOfLists([useGlobalRWLKAnchorImprints()])} />;
}

/**
 * One count of the anchoring hub's header, read from the same queries as the
 * page's ledgers. The route seeds them from its server reads, so the count is
 * in the first HTML. When a server read failed (a rate limit while the page
 * was rendered, say), the browser reads the list itself, instead of the
 * header keeping a dash for the life of the cached page. It shows a skeleton
 * while the read is on its way, and says "Unavailable" only when the
 * browser's read failed too.
 */
export function AnchoringHeaderCount({ metric }: { metric: AnchoringHeaderMetric }) {
  switch (metric) {
    case 'actions':
      return <ActionsCount />;
    case 'ethDeposits':
      return <DepositsCount />;
    case 'stellarImprints':
      return <ImprintsCount />;
  }
}
