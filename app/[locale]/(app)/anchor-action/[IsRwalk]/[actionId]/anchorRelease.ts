import type { AnchorAction } from '@/services/api/types';

/**
 * Whether an anchor has been released: a release record exists once the
 * indexer has seen its event. Shared by the page, which says so under the
 * title, and its server read, which keeps a released record's render longer.
 */
export function isReleased(release: AnchorAction | null | undefined): release is AnchorAction {
  return Boolean(release?.EvtLogId);
}
