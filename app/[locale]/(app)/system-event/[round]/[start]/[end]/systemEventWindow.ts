/** A configuration window as its link names it. Shared by the page and its server read. */
export interface SystemEventWindow {
  /** The cycle the window opened before; 0 is the protocol's first setup. */
  round: number;
  /**
   * The first and last event log ids of the window (from the mode change
   * list). The first setup's window starts at -1, the list's own "from the
   * beginning".
   */
  start: number;
  end: number;
}

/** A window the link can actually name: whole numbers in order, from -1 (the first setup) up. */
export function isValidWindow({ round, start, end }: SystemEventWindow): boolean {
  return (
    [round, end].every((n) => Number.isSafeInteger(n) && n >= 0) &&
    Number.isSafeInteger(start) &&
    start >= -1 &&
    start <= end
  );
}

/** The event log range to read: the first setup's -1 reads from the first event. */
export function windowRange({ start, end }: SystemEventWindow): { start: number; end: number } {
  return { start: Math.max(0, start), end };
}

/**
 * The range of every change before the window, which the page reads to say
 * what each parameter was before it changed; `null` when nothing comes before.
 */
export function historyRange({ start }: SystemEventWindow): { start: number; end: number } | null {
  return start > 0 ? { start: 0, end: start - 1 } : null;
}

/** A window as the mode change list names it: its cycle and its first and next event log ids. */
export interface CanonicalWindowSource {
  RoundNum: number;
  EvtLogId: string | number;
  NextEvtLogId?: string | number;
}

/**
 * The canonical window of a cycle from the mode change list, or `null` when
 * the list has none for it. A link names a window by its cycle and its ids;
 * only the list decides which ids belong to which cycle.
 */
export function canonicalWindow(
  modes: readonly CanonicalWindowSource[],
  round: number,
): SystemEventWindow | null {
  const mode = modes.find((entry) => Number(entry.RoundNum) === round);
  if (!mode || mode.NextEvtLogId === undefined) return null;
  const start = Number(mode.EvtLogId);
  const end = Number(mode.NextEvtLogId);
  const window = { round, start, end };
  return isValidWindow(window) ? window : null;
}
