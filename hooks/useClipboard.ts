import { useCallback } from 'react';

function copyViaExecCommand(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

/**
 * Lightweight clipboard hook that uses the native Clipboard API when available.
 * Falls back to `document.execCommand('copy')` for older browsers, non-HTTPS
 * origins, or when `navigator.clipboard` is undefined.
 */
export function useClipboard() {
  const copy = useCallback(async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      /* use fallback */
    }
    copyViaExecCommand(text);
  }, []);

  return { copy };
}
