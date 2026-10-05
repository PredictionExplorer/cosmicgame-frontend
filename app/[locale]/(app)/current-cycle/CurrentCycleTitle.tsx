'use client';

import { useTranslations } from 'next-intl';

import { useDashboardInfo } from '@/hooks/useApiQuery';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * The /current-cycle H1: the live cycle's name ("Cycle 2"). It reads the
 * same polled dashboard as the page body, starting from the server's read
 * (`seed`), so the server HTML names the cycle and the title follows a new
 * cycle without a reload. Until a cycle number is known it says `fallback`.
 */
export function CurrentCycleTitle({
  seed,
  fallback,
}: {
  seed: number | null | undefined;
  fallback: string;
}) {
  const t = useTranslations('currentCycle');
  const { data } = useDashboardInfo();
  const cycle = data ? toFiniteNumber(data.CurRoundNum) : seed;
  return <>{typeof cycle === 'number' && cycle >= 0 ? t('hero.title', { n: cycle }) : fallback}</>;
}
