import { useCallback } from 'react';

import { useNotification } from '@/contexts/NotificationContext';
import getErrorMessage from '@/utils/alert';
import { isEthProviderError, reportError } from '@/utils/errors';

type NotificationType = 'error' | 'warning' | 'success' | 'info';

export function useNotify() {
  const { setNotification } = useNotification();

  const notify = useCallback(
    (type: NotificationType, text: string) => setNotification({ visible: true, type, text }),
    [setNotification],
  );

  const notifyErrorFromEthers = useCallback(
    (err: unknown) => {
      if (isEthProviderError(err) && err.data?.message) {
        reportError(err, 'ethers provider error');
        const msg = getErrorMessage(err.data.message);
        notify('error', msg || 'Unexpected error. Please try again.');
      } else if (err instanceof Error) {
        reportError(err, 'ethers provider error');
        notify('error', err.message);
      } else {
        reportError(err, 'ethers provider error');
        notify('error', 'Unexpected error. Please try again.');
      }
    },
    [notify],
  );

  return { notify, notifyErrorFromEthers } as const;
}
