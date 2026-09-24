'use client';

import { useMemo, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { buttonVariants } from '@/components/ui/button';
import { useRoundList } from '@/hooks/useApiQuery';

/**
 * Why a cycle has no record: it is the cycle open now, it has not started, or
 * the page cannot tell (the cycle list is still loading, or the indexer has
 * not caught up with a cycle it lists).
 */
export type MissingCycleState = 'open' | 'notStarted' | 'unknown';

export function missingCycleState(cycle: number, liveCycle: number | null): MissingCycleState {
  if (liveCycle === null) return 'unknown';
  if (cycle === liveCycle) return 'open';
  return cycle > liveCycle ? 'notStarted' : 'unknown';
}

/**
 * The cycle open now: the one after the newest finalized cycle (`0` before
 * any is finalized), or `null` while the cycle list has not been read.
 */
export function useLiveCycle(): number | null {
  const { data } = useRoundList();
  return useMemo(() => {
    if (!data) return null;
    return data.reduce((last, cycle) => Math.max(last, cycle.RoundNum ?? -1), -1) + 1;
  }, [data]);
}

export interface MissingCycle {
  state: MissingCycleState;
  title: string;
  body: string;
  /** The way to the live cycle, for a cycle at or beyond it (or when that is unknown). */
  currentCycleLink: ReactNode;
}

/**
 * What a page says for a cycle the API holds no record of (it answers 400):
 * never an error, since retrying cannot help. A cycle at or beyond the live
 * one points to the current cycle, where it can be followed.
 */
export function useMissingCycle(cycle: number): MissingCycle {
  const t = useTranslations('allocation');
  const liveCycle = useLiveCycle();
  const state = missingCycleState(cycle, liveCycle);
  const showCurrentCycle = state !== 'unknown' || liveCycle === null;
  return {
    state,
    title: t(`missingCycle.${state}.title`, { cycle }),
    body: t(`missingCycle.${state}.body`, { cycle, live: liveCycle ?? 0 }),
    currentCycleLink: showCurrentCycle ? (
      <Link
        href="/current-cycle"
        className={buttonVariants({ variant: 'outline', size: 'sm' })}
        data-testid="current-cycle-link"
      >
        {t('missingCycle.currentCycle')}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    ) : null,
  };
}
