import { useCallback, useEffect, useRef } from 'react';

import { useAttentionPreferences } from '@/hooks/useAttentionPreferences';

interface UseAllocationNotificationOptions {
  /** Cycle Finalization Time (epoch ms); 0 while unknown. */
  allocationTime: number;
  /** Cycle the alert is about; keys the notification so repeats replace it. */
  cycleNumber?: number | null;
  notificationTitle?: string;
  /** Body copy, given the whole minutes left when the alert fires. */
  notificationBody?: string | ((minutesLeft: number) => string);
}

const CHECK_INTERVAL_MS = 1_000;

/**
 * The opt-in "alert before finalization" browser notification.
 *
 * Fires only when the viewer turned the alert on in their attention
 * preferences (off by default) and the browser granted permission, once per
 * approach to the deadline: `alertMinutes` before the Cycle Finalization
 * Time, reporting the minutes actually left. A later gesture that pushes the
 * deadline back out of the window re-arms it. Notifications for the same
 * cycle replace each other instead of stacking, and a click focuses the tab.
 */
export function useAllocationNotification({
  allocationTime,
  cycleNumber = null,
  notificationTitle,
  notificationBody,
}: UseAllocationNotificationOptions) {
  const { preferences } = useAttentionPreferences();
  const enabled = preferences.finalizationAlert;
  const thresholdMs = preferences.alertMinutes * 60 * 1000;
  const firedRef = useRef(false);
  // Copy changes with the locale and the per-second page tick; read it at send
  // time instead of re-arming the interval on every render.
  const copyRef = useRef({ notificationTitle, notificationBody });
  useEffect(() => {
    copyRef.current = { notificationTitle, notificationBody };
  });
  const hasCopy = Boolean(notificationTitle && notificationBody);

  const sendNotification = useCallback((title: string, options: NotificationOptions) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const notification = new Notification(title, options);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }, []);

  useEffect(() => {
    if (!enabled || !hasCopy || !allocationTime) return undefined;

    const check = () => {
      const remainingMs = allocationTime - Date.now();
      if (remainingMs > thresholdMs) {
        // Outside the window (or pushed back out by a new gesture): re-arm.
        firedRef.current = false;
        return;
      }
      if (remainingMs <= 0 || firedRef.current) return;
      firedRef.current = true;
      const { notificationTitle: title, notificationBody: body } = copyRef.current;
      if (!title || !body) return;
      const minutesLeft = Math.max(1, Math.ceil(remainingMs / 60_000));
      sendNotification(title, {
        body: typeof body === 'function' ? body(minutesLeft) : body,
        tag: `cosmic-cycle-${cycleNumber ?? 'current'}-finalize`,
      });
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [allocationTime, cycleNumber, enabled, hasCopy, sendNotification, thresholdMs]);

  return { sendNotification, alertEnabled: enabled, alertMinutes: preferences.alertMinutes };
}
