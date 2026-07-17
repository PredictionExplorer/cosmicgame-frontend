import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { isEthProviderError, isUserRejection, reportError } from '@/utils/errors';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

export function useNotify() {
  const t = useTranslations('toasts');
  const { setNotification } = useNotification();

  const notify = useCallback(
    (type: NotificationType, text: string) => setNotification({ visible: true, type, text }),
    [setNotification],
  );

  const notifyErrorFromEthers = useCallback(
    (err: unknown) => {
      if (isUserRejection(err)) {
        notify('info', t('walletTransactionCancelled'));
        return;
      }
      if (isEthProviderError(err) && err.data?.message) {
        reportError(err, 'ethers provider error');
        const msg = getErrorMessage(err.data.message);
        notify('error', msg || t('unexpectedError'));
      } else if (err instanceof Error) {
        reportError(err, 'ethers provider error');
        notify('error', err.message);
      } else {
        reportError(err, 'ethers provider error');
        notify('error', t('unexpectedError'));
      }
    },
    [notify, t],
  );

  return { notify, notifyErrorFromEthers } as const;
}
