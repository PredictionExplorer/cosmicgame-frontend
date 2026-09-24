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

/** Upper event-log bound for {@link get_coordination_events}: every event up to the latest. */
export const COORDINATION_EVENTS_END_ID = 9_999_999_999;

/**
 * Fetches the coordination (parameter) changes the /coordination-changes table lists: the admin
 * events from the latest system-mode change onward, or every event when no mode change is
 * indexed. The server summary counts this same list, so its headline always matches the table.
 */
export async function get_coordination_events(opts?: ApiRequestOptions): Promise<AdminEventRow[]> {
  const modes = await get_system_modelist(opts);
  const latestModeChangeId = Number(modes[0]?.EvtLogId);
  const startId = Number.isFinite(latestModeChangeId) ? latestModeChangeId : 0;
  return get_system_events(startId, COORDINATION_EVENTS_END_ID, opts);
}
