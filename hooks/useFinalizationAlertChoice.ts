'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';

import {
  ALERT_MINUTE_CHOICES,
  useAttentionPreferences,
  type AlertMinutes,
} from '@/hooks/useAttentionPreferences';
import { useNotify } from '@/hooks/useNotify';

export interface FinalizationAlertChoice {
  /** The active threshold, or undefined while the alert is off. */
  thresholdMinutes: AlertMinutes | undefined;
  /**
   * For the clock's 5m / 30m / 60m chips: picking a threshold turns the alert
   * on (asking for notification permission in that click), picking the active
   * one turns it off. When the browser blocks or lacks notifications the
   * chip cannot switch on, and a short notice says why instead of nothing
   * happening.
   */
  onThresholdChange: (minutes: number) => void;
}

/** The "alert me before finalization" chips, shared by both home layouts. */
export function useFinalizationAlertChoice(): FinalizationAlertChoice {
  const t = useTranslations('common');
  const { notify } = useNotify();
  const { preferences, setFinalizationAlert } = useAttentionPreferences();
  const thresholdMinutes = preferences.finalizationAlert ? preferences.alertMinutes : undefined;

  const onThresholdChange = useCallback(
    (minutes: number) => {
      const choice = ALERT_MINUTE_CHOICES.find((value) => value === minutes);
      if (choice === undefined) return;
      if (thresholdMinutes === choice) {
        void setFinalizationAlert(null);
        return;
      }
      void setFinalizationAlert(choice).then((permission) => {
        if (permission === 'denied') notify('info', t('attention.alert.blocked'));
        else if (permission === 'unsupported') notify('info', t('attention.alert.unsupported'));
      });
    },
    [notify, setFinalizationAlert, t, thresholdMinutes],
  );

  return { thresholdMinutes, onThresholdChange };
}
