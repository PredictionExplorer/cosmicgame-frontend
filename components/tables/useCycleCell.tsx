'use client';

import { useCallback, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { TableLink } from '@/components/ui/data-table';

import { useCycleHref } from './useCycleHref';

/**
 * A cycle in a ledger cell, the one way every ledger writes it: "Cycle 12"
 * (`tables.allocation.cycle`, never a bare "12" or "#12", which reads as a
 * token number), leading where `useCycleHref` says: the live cycle to
 * /current-cycle, a finalized one to its allocation record. Call it once per
 * table and use the returned renderer in the column's `cell`:
 *
 *   const cycleCell = useCycleCell();
 *   { id: 'cycle', kind: 'link', value: (row) => row.RoundNum, cell: (row) => cycleCell(row.RoundNum) }
 *
 * The page must load the `tables` namespace (every ledger page does).
 */
export function useCycleCell(): (cycle: number, className?: string) => ReactNode {
  const t = useTranslations('tables');
  const cycleHref = useCycleHref();
  return useCallback(
    (cycle: number, className?: string) => (
      <TableLink href={cycleHref(cycle)} className={className}>
        {t('allocation.cycle', { cycle })}
      </TableLink>
    ),
    [cycleHref, t],
  );
}
