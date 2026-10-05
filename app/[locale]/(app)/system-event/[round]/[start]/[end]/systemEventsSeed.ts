import { get_system_events } from '@/services/api/system';

import { seedsDisabled, type QuerySeedEntry } from '../../../../QuerySeed';

import {
  historyRange,
  isValidWindow,
  windowRange,
  type SystemEventWindow,
} from './systemEventWindow';

/**
 * The window's first reads on the server, keyed as `useSystemEvents` is, so
 * the page arrives with its changes (or its empty state) in the HTML instead
 * of skeleton figures and rows that the answer then resizes: the window's
 * changes, and every change before it, from which each row says what the
 * parameter was before. An invalid window, the e2e harness or a failed read
 * seeds nothing for that read. Server-only.
 */
export async function readSystemEventsSeed(window: SystemEventWindow): Promise<QuerySeedEntry[]> {
  if (seedsDisabled() || !isValidWindow(window)) return [];
  const ranges = [windowRange(window), historyRange(window)].filter(
    (range): range is { start: number; end: number } => range !== null,
  );
  const reads = await Promise.all(
    ranges.map(async ({ start, end }): Promise<QuerySeedEntry | null> => {
      try {
        const data = await get_system_events(start, end);
        return { queryKey: ['systemEvents', start, end], data, at: Date.now() };
      } catch {
        return null;
      }
    }),
  );
  return reads.filter((entry): entry is QuerySeedEntry => entry !== null);
}
