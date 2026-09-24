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
  /**
   * Reads the time actually left from the chain just before the alert fires
   * (milliseconds, or null when the read failed). The page's deadline can
   * lag behind the chain while the tab is hidden, and Gestures only ever
   * move the deadline later, so an unverified alert could fire early. When
   * given, the alert fires only on a verified reading inside the window.
   */
  verifyRemainingMs?: () => Promise<number | null>;
}

const CHECK_INTERVAL_MS = 1_000;
/** After a failed chain read, the next attempt waits this long. */
const VERIFY_RETRY_MS = 15_000;

/**
 * The opt-in "alert before finalization" browser notification.
 *
 * Fires only when the viewer turned the alert on in their attention
 * preferences (off by default) and the browser granted permission, once per
 * approach to the deadline: `alertMinutes` before the Cycle Finalization
 * Time, reporting the minutes actually left. A later gesture that pushes the
 * deadline back out of the window re-arms it. Notifications for the same
 * cycle replace each other instead of stacking, and a click focuses the tab.
 * With `verifyRemainingMs`, the time left is re-read from the chain before
 * the alert fires, so a deadline that moved while the tab was hidden never
 * produces an early alert.
 */
export function useAllocationNotification({
  allocationTime,
  cycleNumber = null,
  notificationTitle,
  notificationBody,
  verifyRemainingMs,
}: UseAllocationNotificationOptions) {
  const { preferences } = useAttentionPreferences();
  const enabled = preferences.finalizationAlert;
  const thresholdMs = preferences.alertMinutes * 60 * 1000;
  const firedRef = useRef(false);
  // Copy changes with the locale and the per-second page tick; read it at send
  // time instead of re-arming the interval on every render.
  const copyRef = useRef({ notificationTitle, notificationBody, verifyRemainingMs });
  useEffect(() => {
    copyRef.current = { notificationTitle, notificationBody, verifyRemainingMs };
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

    let disposed = false;
    let verifying = false;
    let retryAtMs = 0;

    const send = (remainingMs: number) => {
      firedRef.current = true;
      const { notificationTitle: title, notificationBody: body } = copyRef.current;
      if (!title || !body) return;
      const minutesLeft = Math.max(1, Math.ceil(remainingMs / 60_000));
      sendNotification(title, {
        body: typeof body === 'function' ? body(minutesLeft) : body,
        tag: `cosmic-cycle-${cycleNumber ?? 'current'}-finalize`,
      });
    };

    const check = () => {
      const remainingMs = allocationTime - Date.now();
      if (remainingMs > thresholdMs) {
        // Outside the window (or pushed back out by a new gesture): re-arm.
        firedRef.current = false;
        return;
      }
      if (remainingMs <= 0 || firedRef.current || verifying || Date.now() < retryAtMs) return;
      const verify = copyRef.current.verifyRemainingMs;
      if (!verify) {
        send(remainingMs);
        return;
      }
      verifying = true;
      verify()
        .catch(() => null)
        .then((verifiedMs) => {
          verifying = false;
          if (disposed || firedRef.current) return;
          if (verifiedMs == null) {
            // Unread: try again shortly rather than alert on a stale deadline.
            retryAtMs = Date.now() + VERIFY_RETRY_MS;
            return;
          }
          // Outside the window, the deadline moved; past zero, nothing to warn about.
          if (verifiedMs > thresholdMs || verifiedMs <= 0) return;
          send(verifiedMs);
        });
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => {
      disposed = true;
      clearInterval(interval);
    };
  }, [allocationTime, cycleNumber, enabled, hasCopy, sendNotification, thresholdMs]);

  return { sendNotification, alertEnabled: enabled, alertMinutes: preferences.alertMinutes };
}
