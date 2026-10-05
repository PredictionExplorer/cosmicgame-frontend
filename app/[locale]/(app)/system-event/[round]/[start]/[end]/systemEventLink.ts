import { cache } from 'react';

import { readSystemModes } from '../../../../publicDataReads';
import { seedsDisabled } from '../../../../QuerySeed';

import { canonicalWindow, type SystemEventWindow } from './systemEventWindow';

/** What the mode change list says of the window a link names. */
export type WindowCheck =
  /** The link names its cycle's own window. */
  | { status: 'canonical' }
  /** The cycle has a window, under other event log ids. */
  | { status: 'moved'; window: SystemEventWindow }
  /** The list has no window for the cycle. */
  | { status: 'missing' }
  /** The list could not be read (or the e2e harness mocks it in the browser). */
  | { status: 'unchecked' };

/**
 * Checks a configuration window's link against the mode change list, once
 * per render (the layout and the page share it; React `cache` keys it by the
 * three numbers). The page states what the contract owner changed before a
 * cycle, so its event range must be that cycle's: a link with other ids is
 * `moved` to the canonical window, and a cycle the list has no window for is
 * `missing`. When the list cannot be read the link is taken as it is, and
 * the page's own range check applies.
 */
export const checkSystemEventWindow = cache(
  async (round: number, start: number, end: number): Promise<WindowCheck> => {
    if (seedsDisabled()) return { status: 'unchecked' };
    const modes = await readSystemModes();
    if (modes.data === null) return { status: 'unchecked' };
    const canonical = Number.isSafeInteger(round) ? canonicalWindow(modes.data, round) : null;
    if (!canonical) {
      // The list (as the app reads it) has no entry for the first setup, which
      // always starts at the first event; only its end cannot be checked here.
      return round === 0 && start === -1 ? { status: 'canonical' } : { status: 'missing' };
    }
    return canonical.start === start && canonical.end === end
      ? { status: 'canonical' }
      : { status: 'moved', window: canonical };
  },
);
