import { get_system_events } from '@/services/api/system';

import { seedsDisabled, type QuerySeedEntry } from '../../../../QuerySeed';

import { isValidWindow, type SystemEventWindow } from './systemEventWindow';

/**
 * The window's first read on the server, keyed as `useSystemEvents` is, so
 * the page arrives with its changes (or its empty state) in the HTML instead
 * of skeleton figures and rows that the answer then resizes. An invalid
 * window, the e2e harness or a failed read seeds nothing. Server-only.
 */
export async function readSystemEventsSeed(window: SystemEventWindow): Promise<QuerySeedEntry[]> {
  if (seedsDisabled() || !isValidWindow(window)) return [];
  const { start, end } = window;
  try {
    const data = await get_system_events(start, end);
    return [{ queryKey: ['systemEvents', start, end], data, at: Date.now() }];
  } catch {
    return [];
  }
}
