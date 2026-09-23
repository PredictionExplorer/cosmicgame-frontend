'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { EXPLORER_NAME, REQUIRED_CHAIN_NAME } from '@/lib/chainGuard';
import type { TxErrorInfo } from '@/lib/txErrors';

/**
 * Localized, cause-plus-next-step sentence for a classified wallet or
 * transaction failure. `fallback` is the action-specific sentence used when
 * the classifier cannot name the cause (and for a contract revert without a
 * known custom error). Never returns provider text.
 *
 *   const describe = useTxErrorMessage();
 *   describe(classifyTxError(err), t('claim.failed'));
 */
export function useTxErrorMessage(): (info: TxErrorInfo, fallback?: string) => string {
  const t = useTranslations('toasts');
  return useCallback(
    (info: TxErrorInfo, fallback?: string) => {
      switch (info.kind) {
        case 'rejected':
          return t('walletTransactionCancelled');
        case 'insufficient-funds':
          return t('tx.error.insufficientFunds', { network: REQUIRED_CHAIN_NAME });
        case 'wrong-network':
          return t('tx.error.wrongNetwork', { network: REQUIRED_CHAIN_NAME });
        case 'wallet-not-connected':
          return t('tx.error.walletNotConnected');
        case 'wallet-busy':
          return t('tx.error.walletBusy');
        case 'would-revert':
          return fallback ?? t('tx.error.wouldRevert');
        case 'reverted':
          return t('tx.error.reverted');
        case 'timeout':
          return t('tx.error.timeout', { explorer: EXPLORER_NAME });
        case 'network':
          return t('tx.error.network');
        default:
          return fallback ?? t('generic.rpcFailure');
      }
    },
    [t],
  );
}
