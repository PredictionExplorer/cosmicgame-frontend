import { useCallback } from 'react';

/** Copies with the legacy command; `false` when the browser refuses it. */
function copyViaExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  try {
    textarea.select();
    return document.execCommand('copy') === true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/**
 * Lightweight clipboard hook that uses the native Clipboard API when available.
 * Falls back to `document.execCommand('copy')` for older browsers, non-HTTPS
 * origins, or when `navigator.clipboard` is undefined. `copy` resolves `true`
 * once the text is on the clipboard and `false` when both ways were refused,
 * so a "Copied" confirmation is only shown for a copy that happened.
 */
export function useClipboard() {
  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* use fallback */
    }
    return copyViaExecCommand(text);
  }, []);

  return { copy };
}
