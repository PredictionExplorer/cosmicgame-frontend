import { useCallback, useEffect, useRef, useState } from 'react';

import { useClipboard } from '@/hooks/useClipboard';

/** How long a copy button shows its check before the copy icon returns. */
export const COPIED_FEEDBACK_MS = 2_000;

/**
 * A copy action with its confirmation: `copy(text)` writes to the clipboard
 * and, only when the write succeeded, sets `copied` for `durationMs`, so a
 * button can swap its icon for a check and a status region can announce it.
 * A later copy restarts the timer; unmounting clears it.
 *
 * ```tsx
 * const { copied, copy } = useCopyFeedback();
 * <button onClick={() => void copy(value)}>{copied ? <Check /> : <Copy />}</button>
 * ```
 */
export function useCopyFeedback(durationMs: number = COPIED_FEEDBACK_MS) {
  const { copy: writeClipboard } = useClipboard();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      const ok = await writeClipboard(text);
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      setCopied(ok);
      if (ok) timer.current = setTimeout(() => setCopied(false), durationMs);
      return ok;
    },
    [writeClipboard, durationMs],
  );

  return { copied, copy };
}
