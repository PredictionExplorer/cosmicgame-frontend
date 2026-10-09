import { useEffect, useRef } from 'react';

import { useAttentionPreferences } from '@/hooks/useAttentionPreferences';

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Mirrors the finalization countdown into the browser tab title during the
 * final window, so a participant who tabbed away can see the clock closing
 * from anywhere — only when they turned "Countdown in the tab title" on in
 * their attention preferences (off by default). Captures the original title
 * on activation and restores it on deactivation (phase change, preference
 * change, navigation, unmount). While the deadline is stale the title reads
 * "… · {title}" rather than count toward a time that may have moved.
 */
export function useTabTitleCountdown({
  enabled,
  targetMs,
  stale = false,
}: {
  enabled: boolean;
  targetMs: number;
  /**
   * The deadline has not been confirmed recently (polls failed or paused in
   * a hidden tab). Gestures only move the deadline later, so counting toward
   * a stale one would show false urgency: the title shows an ellipsis
   * instead until fresh data arrives.
   */
  stale?: boolean;
}): void {
  const baseTitleRef = useRef<string | null>(null);
  const { preferences } = useAttentionPreferences();
  const active = enabled && preferences.tabTitle;

  useEffect(() => {
    if (!active || typeof document === 'undefined') return undefined;

    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title;
    }

    const update = () => {
      const base = baseTitleRef.current ?? '';
      const lead = stale ? '\u2026' : formatRemaining(targetMs - Date.now());
      document.title = `${lead} \u00b7 ${base}`;
    };
    update();
    const interval = setInterval(update, 1000);

    return () => {
      clearInterval(interval);
      if (baseTitleRef.current !== null) {
        document.title = baseTitleRef.current;
        baseTitleRef.current = null;
      }
    };
  }, [active, stale, targetMs]);
}
