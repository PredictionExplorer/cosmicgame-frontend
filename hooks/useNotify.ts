import { useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { isEthProviderError, isUserRejection, reportError } from '@/utils/errors';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

export function useNotify() {
  const t = useTranslations('toasts');
  const locale = useLocale();
  const { setNotification } = useNotification();

  const notify = useCallback(
    (type: NotificationType, text: string) => setNotification({ visible: true, type, text }),
    [setNotification],
  );

  const notifyErrorFromEthers = useCallback(
    (err: unknown, fallback?: string) => {
      if (isUserRejection(err)) {
        notify('info', t('walletTransactionCancelled'));
        return;
      }
      reportError(err, 'ethers provider error');
      const localizedFallback = fallback ?? t('generic.rpcFailure');

      if (locale.toLowerCase().startsWith('zh')) {
        notify('error', localizedFallback);
        return;
      }

      if (isEthProviderError(err) && err.data?.message) {
        const msg = getErrorMessage(err.data.message);
        notify('error', msg || localizedFallback);
      } else if (err instanceof Error) {
        notify('error', err.message);
      } else {
        notify('error', localizedFallback);
      }
    },
    [locale, notify, t],
  );

  return { notify, notifyErrorFromEthers } as const;
}
