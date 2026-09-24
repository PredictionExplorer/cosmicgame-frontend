import { apiGet, getAPIUrl, apiCall, flattenTxArray, pagedPath } from './client';
import type { ApiListRequestOptions, ApiRequestOptions } from './client';
import { SystemModeChangeEventSchema, safeValidateListSample } from './schemas';
import type { SystemModeChangeEvent, AdminEventRow } from './types';

/** Fetches the current server timestamp (Unix seconds). */
export function get_current_time(opts?: ApiRequestOptions): Promise<number> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('time/current'), opts);
    return data.CurrentTimeStamp;
  }, 0);
}

/** Fetches the history of system-mode changes, optionally paged (maintenance, runtime, etc.). */
export function get_system_modelist(
  opts?: ApiListRequestOptions,
): Promise<SystemModeChangeEvent[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`system/modelist/${pagedPath(opts)}`), opts);
    return safeValidateListSample(
      SystemModeChangeEventSchema,
      flattenTxArray<SystemModeChangeEvent>(data.SystemModeChanges),
      'systemModelist',
    ) as SystemModeChangeEvent[];
  }, []);
}

/** Fetches admin events (deployments, config changes) within a time range. */
export function get_system_events(
  start: number,
  end: number,
  opts?: ApiRequestOptions,
): Promise<AdminEventRow[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`system/admin_events/${start}/${end}`), opts);
    return flattenTxArray<AdminEventRow>(data.AdminEvents);
  }, []);
}

/** Upper event-log bound of the coordination list: every event up to the latest. */
export const COORDINATION_EVENTS_END_ID = 9_999_999_999;

/**
 * The first event-log id of the coordination (parameter) changes the
 * /coordination-changes page lists: the latest system-mode change (the list
 * is newest first), or 0 when none is indexed, so every admin event shows.
 * The one rule behind the page's table, its server-read header figures and
 * the query seed that joins them, so all three request the same range.
 */
export function coordinationStartId(
  modes: readonly Pick<SystemModeChangeEvent, 'EvtLogId'>[] | null | undefined,
): number {
  const latestModeChangeId = Number(modes?.[0]?.EvtLogId);
  return Number.isFinite(latestModeChangeId) ? latestModeChangeId : 0;
}
