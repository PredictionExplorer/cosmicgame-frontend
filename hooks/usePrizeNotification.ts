import { useEffect, useCallback } from 'react';

import { reportError } from '@/utils/errors';

interface UsePrizeNotificationOptions {
  prizeTime: number;
}

export function usePrizeNotification({ prizeTime }: UsePrizeNotificationOptions) {
  const playAudio = useCallback(async () => {
    try {
      const audioElement = new Audio('/audio/notification.wav');
      await audioElement.play();
    } catch (error) {
      reportError(error, 'play notification sound');
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
      if (prizeTime && now >= prizeTime - 5 * 60 * 1000 && now <= prizeTime) {
        sendNotification('Bid Now or Miss Out!', {
          body: 'Time is running out! You have 5 minutes to place your bids and win amazing prizes.',
        });
        clearInterval(interval);
      }
      if (now > prizeTime) {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [prizeTime, sendNotification]);

  return { playAudio, requestNotificationPermission, sendNotification } as const;
}
