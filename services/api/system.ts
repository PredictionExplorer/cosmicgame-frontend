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
