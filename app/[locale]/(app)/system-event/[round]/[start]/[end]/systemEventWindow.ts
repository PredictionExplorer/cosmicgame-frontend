/** A configuration window as its link names it. Shared by the page and its server read. */
export interface SystemEventWindow {
  /** The cycle the window opened before; 0 is the protocol's first setup. */
  round: number;
  /** The first and last event log ids of the window (from the mode change list). */
  start: number;
  end: number;
}

/** A window the link can actually name: whole, non-negative, in order. */
export function isValidWindow({ round, start, end }: SystemEventWindow): boolean {
  return [round, start, end].every((n) => Number.isSafeInteger(n) && n >= 0) && start <= end;
}
