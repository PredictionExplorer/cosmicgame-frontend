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
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          /* permission granted, nothing else to do */
        }
      });
    }
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
