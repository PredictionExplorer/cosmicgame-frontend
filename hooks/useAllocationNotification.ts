import { useEffect, useCallback } from 'react';

import { reportError } from '@/utils/errors';

interface UseAllocationNotificationOptions {
  allocationTime: number;
}

export function useAllocationNotification({ allocationTime }: UseAllocationNotificationOptions) {
  const playAudio = useCallback(async () => {
    try {
      const audioElement = new Audio('/audio/notification.wav');
      await audioElement.play();
    } catch (error) {
      reportError(error, 'notification audio error');
    }
  }, []);

  const requestNotificationPermission = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    // Only prompt in the default state. Calling requestPermission when denied
    // spams the console ("permission has been blocked…") and has no effect.
    if (Notification.permission !== 'default') return;
    void Notification.requestPermission()
      .then(() => {
        /* granted / denied / dismissed — browser owns the outcome */
      })
      .catch(() => {
        /* ignore: secure contexts / policy / user gesture requirements */
      });
  }, []);

  const sendNotification = useCallback((title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (allocationTime && now >= allocationTime - 5 * 60 * 1000 && now <= allocationTime) {
        sendNotification('Gesture now or the cycle closes', {
          body: 'The Performance Cycle closes in 5 minutes. Make a gesture now to take part in the final allocations.',
        });
        clearInterval(interval);
      }
      if (now > allocationTime) {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [allocationTime, sendNotification]);

  return { playAudio, requestNotificationPermission, sendNotification } as const;
}
