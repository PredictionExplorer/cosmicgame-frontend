'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { formatAmount } from '@/utils/format';
import { SMALL_ALLOCATION_CST } from '@/components/marketing/outreachTotals';
import { isDustAmount } from '@/components/ui/data-table/kind-value';
import type { MarketingReward } from '@/services/api/types';

/**
 * The note an outreach ledger shows beside its row range when it holds an
 * allocation too small for its precision ("<0.01 CST", muted), or `undefined`
 * when it holds none. A true zero is not dust, and is not muted.
 */
export function useOutreachDustNote(
  list: readonly MarketingReward[],
  locale: string,
): string | undefined {
  const t = useTranslations('tables');
  const hasDust = useMemo(
    () => list.some((row) => isDustAmount(row.AmountEth, 'CST', locale)),
    [list, locale],
  );
  if (!hasDust) return undefined;
  return t('outreach.dustNote', {
    amount: formatAmount(SMALL_ALLOCATION_CST, { unit: 'CST', locale, context: 'table' }),
  });
}
