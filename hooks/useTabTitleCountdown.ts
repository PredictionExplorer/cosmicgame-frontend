import { useEffect, useRef } from 'react';

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Mirrors the finalization countdown into the browser tab title during the
 * final window, so a player who tabbed away can see the clock closing from
 * anywhere. Captures the original title on activation and restores it on
 * deactivation (phase change, navigation, unmount).
 */
export function useTabTitleCountdown({
  enabled,
  targetMs,
}: {
  enabled: boolean;
  targetMs: number;
}): void {
  const baseTitleRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return undefined;

    if (baseTitleRef.current === null) {
      baseTitleRef.current = document.title;
    }

    const update = () => {
      const base = baseTitleRef.current ?? '';
      document.title = `${formatRemaining(targetMs - Date.now())} \u00b7 ${base}`;
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
  }, [enabled, targetMs]);
}
