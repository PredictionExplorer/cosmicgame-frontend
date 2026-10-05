'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import type { TxStage } from '@/lib/txStage';

/**
 * Localized trigger label for a busy transaction stage, or null when the
 * trigger should show its normal label. The verb stays visible:
 * "Approve 1 of 2 in wallet…", "Confirm in wallet…", "Pending…".
 *
 *   const label = useTxStageLabel();
 *   <Button disabled={tx.isBusy}>{label(tx.stage) ?? t('retrieve')}</Button>
 */
export function useTxStageLabel(): (stage: TxStage) => string | null {
  const t = useTranslations('toasts');
  return useCallback(
    (stage: TxStage) => {
      switch (stage.status) {
        case 'preparing':
          return t('tx.button.preparing');
        case 'switching-network':
          return t('tx.button.switchNetwork');
        case 'approving':
          return stage.phase === 'signature'
            ? t('tx.button.approve', { step: stage.step, total: stage.total })
            : t('tx.button.approvalPending', { step: stage.step, total: stage.total });
        case 'awaiting-signature':
          return stage.total > 1
            ? t('tx.button.confirmStep', { step: stage.step, total: stage.total })
            : t('tx.button.confirm');
        case 'pending':
          return t('tx.button.pending');
        default:
          return null;
      }
    },
    [t],
  );
}
