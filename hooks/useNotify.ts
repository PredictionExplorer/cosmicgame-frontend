import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { useNotification } from '@/contexts/NotificationContext';
import { useTxErrorMessage } from '@/hooks/useTxErrorMessage';
import { classifyTxError } from '@/lib/txErrors';
import { reportError } from '@/utils/errors';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

export function useNotify() {
  const t = useTranslations('toasts');
  const { setNotification } = useNotification();
  const describeFailure = useTxErrorMessage();

  const notify = useCallback(
    (type: NotificationType, text: string) => setNotification({ visible: true, type, text }),
    [setNotification],
  );

  /**
   * Explains a failed wallet or RPC read in one localized sentence — the
   * classified cause when there is one (wrong network, wallet busy,
   * offline…), otherwise `fallback` — and offers the technical details
   * behind "Copy details". Raw provider text is never shown, in any locale.
   * The toast keeps the normal duration, and a repeat of the same failure
   * replaces it instead of stacking. A wallet rejection is a neutral
   * "cancelled" notice.
   *
   * Transactions use `useTxFlow`, whose failures stay until dismissed.
   */
  const notifyErrorFromEthers = useCallback(
    (err: unknown, fallback?: string) => {
      const info = classifyTxError(err);
      if (info.kind === 'rejected') {
        notify('info', t('walletTransactionCancelled'));
        return;
      }
      reportError(err, 'ethers provider error');
      setNotification({
        visible: true,
        type: 'error',
        text: describeFailure(info, fallback ?? t('generic.rpcFailure')),
        details: info.details,
      });
    },
    [describeFailure, notify, setNotification, t],
  );

  return { notify, notifyErrorFromEthers } as const;
}
