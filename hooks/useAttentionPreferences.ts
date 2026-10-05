'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/** Minutes-before-finalization choices for the browser alert. */
export const ALERT_MINUTE_CHOICES = [5, 30, 60] as const;
export type AlertMinutes = (typeof ALERT_MINUTE_CHOICES)[number];

/**
 * What the viewer allowed the page to do to get their attention. Every
 * setting is OFF until the viewer turns it on: the protocol never plays sound,
 * sends a notification or rewrites the tab title uninvited.
 */
export interface AttentionPreferences {
  /** Chime when another participant's Gesture follows the viewer's latest one. */
  sound: boolean;
  /** Browser notification before the Cycle Finalization Time. */
  finalizationAlert: boolean;
  /** How long before finalization the alert fires. */
  alertMinutes: AlertMinutes;
  /** Countdown in the tab title during the final hour. */
  tabTitle: boolean;
}

export const DEFAULT_ATTENTION_PREFERENCES: AttentionPreferences = Object.freeze({
  sound: false,
  finalizationAlert: false,
  alertMinutes: 5,
  tabTitle: false,
});

/** Per-viewer storage (this browser only). */
export const ATTENTION_STORAGE_KEY = 'cosmic-attention-preferences';
/** Threshold persisted by the previous "alert me" chips; migrated once. */
const LEGACY_THRESHOLD_KEY = 'cosmic-notify-threshold-min';

function isAlertMinutes(value: unknown): value is AlertMinutes {
  return ALERT_MINUTE_CHOICES.includes(value as AlertMinutes);
}

function nearestAlertMinutes(value: number): AlertMinutes {
  return ALERT_MINUTE_CHOICES.reduce((best, choice) =>
    Math.abs(choice - value) < Math.abs(best - value) ? choice : best,
  );
}

function notificationsGranted(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

function sanitize(raw: unknown): AttentionPreferences {
  if (!raw || typeof raw !== 'object') return DEFAULT_ATTENTION_PREFERENCES;
  const value = raw as Record<string, unknown>;
  return {
    sound: value.sound === true,
    finalizationAlert: value.finalizationAlert === true,
    alertMinutes: isAlertMinutes(value.alertMinutes)
      ? value.alertMinutes
      : DEFAULT_ATTENTION_PREFERENCES.alertMinutes,
    tabTitle: value.tabTitle === true,
  };
}

/**
 * Reads the stored preferences. A viewer who picked a threshold with the old
 * chips AND granted notifications keeps their alert; everyone else starts
 * with everything off.
 */
function readStoredPreferences(): AttentionPreferences {
  try {
    const stored = window.localStorage.getItem(ATTENTION_STORAGE_KEY);
    if (stored) return sanitize(JSON.parse(stored));

    const legacy = Number(window.localStorage.getItem(LEGACY_THRESHOLD_KEY));
    if (Number.isFinite(legacy) && legacy > 0) {
      const migrated: AttentionPreferences = {
        ...DEFAULT_ATTENTION_PREFERENCES,
        alertMinutes: nearestAlertMinutes(legacy),
        finalizationAlert: notificationsGranted(),
      };
      window.localStorage.setItem(ATTENTION_STORAGE_KEY, JSON.stringify(migrated));
      window.localStorage.removeItem(LEGACY_THRESHOLD_KEY);
      return migrated;
    }
  } catch {
    /* Storage unavailable (private mode, blocked site data): defaults. */
  }
  return DEFAULT_ATTENTION_PREFERENCES;
}

let cachedPreferences: AttentionPreferences | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== ATTENTION_STORAGE_KEY) return;
  cachedPreferences = null;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): AttentionPreferences {
  cachedPreferences ??= readStoredPreferences();
  return cachedPreferences;
}

function getServerSnapshot(): AttentionPreferences {
  return DEFAULT_ATTENTION_PREFERENCES;
}

/** Merges and persists a change; every subscriber (and other tabs) follows. */
export function updateAttentionPreferences(patch: Partial<AttentionPreferences>): void {
  const next = sanitize({ ...getSnapshot(), ...patch });
  cachedPreferences = next;
  try {
    window.localStorage.setItem(ATTENTION_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* Kept for this page view only. */
  }
  emit();
}

/** Current preferences outside React (event handlers, effects). */
export function readAttentionPreferences(): AttentionPreferences {
  return typeof window === 'undefined' ? DEFAULT_ATTENTION_PREFERENCES : getSnapshot();
}

/** Test-only: forget the cached snapshot. */
export function resetAttentionPreferencesForTest(): void {
  cachedPreferences = null;
  notificationConstructorFailed = false;
  listeners.clear();
}

export type NotificationPermissionState = NotificationPermission | 'unsupported';

/** Set once `new Notification()` threw in this page: the browser cannot show one. */
let notificationConstructorFailed = false;

/**
 * Whether this browser exposes `Notification` but refuses to construct one
 * outside a service worker: Chrome, Samsung Internet and Firefox on Android
 * all throw "Illegal constructor. Use ServiceWorkerRegistration
 * .showNotification()". The app registers no service worker, so the alert
 * cannot work there and is not offered.
 */
function constructorUnavailable(): boolean {
  if (notificationConstructorFailed) return true;
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const mobileHint = (nav as (Navigator & { userAgentData?: { mobile?: boolean } }) | undefined)
    ?.userAgentData?.mobile;
  return mobileHint === true || /Android/i.test(nav?.userAgent ?? '');
}

/** The browser's notification permission, or `unsupported` where no notification can be shown. */
export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return 'unsupported';
  if (constructorUnavailable()) return 'unsupported';
  return Notification.permission;
}

/**
 * Records that constructing a notification threw (a browser the checks above
 * did not recognise): the alert turns off, and the menu reads `unsupported`
 * from then on instead of offering it again.
 */
export function markNotificationsUnsupported(): void {
  notificationConstructorFailed = true;
  updateAttentionPreferences({ finalizationAlert: false });
}

export interface UseAttentionPreferencesResult {
  preferences: AttentionPreferences;
  setSound: (enabled: boolean) => void;
  setTabTitle: (enabled: boolean) => void;
  /**
   * Turns the finalization alert on for `minutes` (asking the browser for
   * notification permission when it has not been asked) or off with `null`.
   * Call from a click handler. Resolves to the permission afterwards; the
   * alert only turns on when it is `granted`.
   */
  setFinalizationAlert: (minutes: AlertMinutes | null) => Promise<NotificationPermissionState>;
}

/**
 * The viewer's attention preferences — sound, finalization alert, tab-title
 * countdown — in one store persisted in this browser, all off by default.
 * Every consumer re-renders together, across components and tabs. The server
 * render and hydration use the defaults, so nothing flips during hydration.
 */
export function useAttentionPreferences(): UseAttentionPreferencesResult {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSound = useCallback((enabled: boolean) => {
    updateAttentionPreferences({ sound: enabled });
  }, []);

  const setTabTitle = useCallback((enabled: boolean) => {
    updateAttentionPreferences({ tabTitle: enabled });
  }, []);

  const setFinalizationAlert = useCallback(
    async (minutes: AlertMinutes | null): Promise<NotificationPermissionState> => {
      let permission = getNotificationPermission();
      if (minutes === null) {
        updateAttentionPreferences({ finalizationAlert: false });
        return permission;
      }
      if (permission === 'default') {
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = getNotificationPermission();
        }
      }
      updateAttentionPreferences({
        alertMinutes: minutes,
        finalizationAlert: permission === 'granted',
      });
      return permission;
    },
    [],
  );

  return useMemo(
    () => ({ preferences, setSound, setTabTitle, setFinalizationAlert }),
    [preferences, setFinalizationAlert, setSound, setTabTitle],
  );
}
