import { useEffect, useCallback, useRef, type MutableRefObject } from 'react';

import { reportError } from '@/utils/errors';

interface UseAllocationNotificationOptions {
  allocationTime: number;
}

const NOTIFICATION_SRC = '/audio/notification.wav';

/** Ultra-short silent WAV so we can unlock playback even if `NOTIFICATION_SRC` is missing or blocked. */
const SILENT_WAV_URI =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAAAAA==';

/** Browsers only allow audio after a user gesture; `play()` from timers/effects gets NotAllowedError. */
function isAutoplayPolicyError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'NotAllowedError';
}

/**
 * Runs inside a click/key handler: satisfies autoplay policy so later `play()` calls from
 * React effects (e.g. another user's bid refreshing the dashboard) can sound.
 */
async function unlockPlayback(notificationSoundRef: MutableRefObject<HTMLAudioElement | null>) {
  try {
    const el = new Audio(NOTIFICATION_SRC);
    el.preload = 'auto';
    el.volume = 0.001;
    await el.play();
    el.pause();
    el.currentTime = 0;
    el.volume = 1;
    notificationSoundRef.current = el;
    return;
  } catch {
    /* fall through — try silent clip / AudioContext */
  }

  try {
    const silent = new Audio(SILENT_WAV_URI);
    silent.volume = 0;
    await silent.play();
  } catch {
    /* ignore */
  }

  try {
    const AC =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    await ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.001);
  } catch {
    /* ignore */
  }

  try {
    if (!notificationSoundRef.current) {
      notificationSoundRef.current = new Audio(NOTIFICATION_SRC);
    }
  } catch {
    /* ignore */
  }
}

export function useAllocationNotification({ allocationTime }: UseAllocationNotificationOptions) {
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const unlockOnceRef = useRef(false);

  const primeBidSoundOnUserGesture = useCallback(async () => {
    if (unlockOnceRef.current) return;
    unlockOnceRef.current = true;
    await unlockPlayback(notificationSoundRef);
  }, []);

  const playAudio = useCallback(async () => {
    try {
      const el =
        notificationSoundRef.current ??
        (notificationSoundRef.current = new Audio(NOTIFICATION_SRC));
      el.currentTime = 0;
      await el.play();
    } catch (error) {
      if (isAutoplayPolicyError(error)) return;
      reportError(error, 'notification audio error');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onGesture = () => {
      void primeBidSoundOnUserGesture();
    };
    window.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
    window.addEventListener('keydown', onGesture, { capture: true });
    return () => {
      window.removeEventListener('pointerdown', onGesture, { capture: true });
      window.removeEventListener('keydown', onGesture, { capture: true });
    };
  }, [primeBidSoundOnUserGesture]);

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
