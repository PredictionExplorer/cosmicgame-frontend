import { axios, getAPIUrl, apiCall, flattenTxArray } from './client';
import type { SystemModeChangeEvent, AdminEventRow } from './types';

/** Fetches the current server timestamp (Unix seconds). */
export function get_current_time(): Promise<number> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('time/current'));
    return data.CurrentTimeStamp;
  }, 0);
}

/** Fetches the history of system-mode changes (maintenance, runtime, etc.). */
export function get_system_modelist(): Promise<SystemModeChangeEvent[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('system/modelist/-1/1000000'));
    return flattenTxArray<SystemModeChangeEvent>(data.SystemModeChanges);
  }, []);
}

/** Fetches admin events (deployments, config changes) within a time range. */
export function get_system_events(start: number, end: number): Promise<AdminEventRow[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`system/admin_events/${start}/${end}`));
    return flattenTxArray<AdminEventRow>(data.AdminEvents);
  }, []);
}
